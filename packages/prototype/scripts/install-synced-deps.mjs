#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import {
  classifySpecifier,
  extractSpecifiers,
  loadTsconfigPaths,
  packageResolves,
} from "./lib/design-system-imports.mjs";
import { resolveCoverageRoots } from "./lib/component-library-coverage.mjs";

/**
 * Sync-time dependency reconciliation.
 *
 * `sync-from-source` copies design-system files into the host but historically
 * did NOT install the third-party packages those files import (radix-ui, cmdk,
 * vaul, sonner, react-hook-form, …). Copying the files without their deps
 * guarantees a client-side throw on ANY source app — the component compiles,
 * the route returns 200, then the section throws on the client when it mounts.
 *
 * This walks every file under the host's synced dirs/files, collects the bare
 * package specifiers they import, drops the ones that already resolve from the
 * host, pins the rest to the versions the SOURCE app actually has installed,
 * writes them into the host package.json, and installs with the host's package
 * manager. Fully generic: import graph -> package names -> install.
 *
 * Skip with PROTOTYPE_SKIP_DEP_INSTALL=1 (writes package.json but does not run
 * the installer).
 */

// Provided by the framework/bundler runtime — never installed directly.
const RUNTIME_PACKAGES = new Set([
  "react",
  "react-dom",
  "next",
  "react/jsx-runtime",
]);

function walkFiles(root, acc) {
  let entries;
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".turbo") continue;
      walkFiles(full, acc);
    } else if (/\.(tsx?|jsx?|mjs|cjs)$/.test(entry.name)) {
      if (/\.(test|spec|stories)\./.test(entry.name)) continue;
      acc.push(full);
    }
  }
}

/** Directories in a (pnpm/npm) monorepo that may hold an installed copy of pkg. */
function candidateNodeModules(sourceRoot) {
  const dirs = [path.join(sourceRoot, "node_modules")];
  for (const sub of ["apps", "packages"]) {
    const base = path.join(sourceRoot, sub);
    try {
      for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          dirs.push(path.join(base, entry.name, "node_modules"));
        }
      }
    } catch {
      // ignore
    }
  }
  return dirs;
}

/** Names of the source's own workspace packages — never installable as npm deps. */
function workspacePackageNames(sourceRoot) {
  const names = new Set();
  for (const sub of ["apps", "packages"]) {
    const base = path.join(sourceRoot, sub);
    let entries;
    try {
      entries = fs.readdirSync(base, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      try {
        const json = JSON.parse(
          fs.readFileSync(path.join(base, entry.name, "package.json"), "utf8"),
        );
        if (typeof json.name === "string") names.add(json.name);
      } catch {
        // ignore
      }
    }
  }
  return names;
}

/** Collect bare package names imported by files under the given roots. */
function collectPackagesUnder(hostRoot, rootAbsPaths, tsPaths) {
  const files = [];
  for (const abs of rootAbsPaths) {
    let stat;
    try {
      stat = fs.statSync(abs);
    } catch {
      continue;
    }
    if (stat.isDirectory()) walkFiles(abs, files);
    else if (/\.(tsx?|jsx?|mjs|cjs)$/.test(abs)) files.push(abs);
  }

  const packages = new Map(); // pkg -> Set(relative importer)
  for (const file of files) {
    let code;
    try {
      code = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const spec of extractSpecifiers(code)) {
      const cls = classifySpecifier(file, spec, hostRoot, tsPaths);
      if (cls.kind !== "package") continue;
      if (RUNTIME_PACKAGES.has(cls.pkg)) continue;
      if (!packages.has(cls.pkg)) packages.set(cls.pkg, new Set());
      packages.get(cls.pkg).add(path.relative(hostRoot, file));
    }
  }
  return packages;
}

/** True for a concrete/installable version or range (not catalog:/workspace:/link:). */
function isInstallableSpec(spec) {
  return (
    typeof spec === "string" &&
    spec.length > 0 &&
    !spec.startsWith("catalog:") &&
    !spec.startsWith("workspace:") &&
    !spec.startsWith("link:") &&
    !spec.startsWith("file:")
  );
}

/**
 * The version to pin for pkg. Prefer the version the source ACTUALLY installed
 * (resolves catalog:/workspace: to a concrete number); fall back to a concrete
 * declared range; else the pnpm catalog; else null (skip — never pin a protocol
 * spec the host can't resolve).
 */
function resolveVersion(sourceRoot, pkg, catalog) {
  for (const nm of candidateNodeModules(sourceRoot)) {
    try {
      const json = JSON.parse(
        fs.readFileSync(path.join(nm, pkg, "package.json"), "utf8"),
      );
      if (typeof json.version === "string") return json.version;
    } catch {
      // not here — keep looking
    }
  }
  const declared = sourceDeclaredRange(sourceRoot, pkg);
  if (declared && isInstallableSpec(declared)) return declared;
  if (catalog.has(pkg)) return catalog.get(pkg);
  return null;
}

/** A concrete declared range for pkg in any source package.json, or null. */
function sourceDeclaredRange(sourceRoot, pkg) {
  const roots = [sourceRoot];
  for (const sub of ["apps", "packages"]) {
    const dir = path.join(sourceRoot, sub);
    try {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) roots.push(path.join(dir, entry.name));
      }
    } catch {
      // ignore
    }
  }
  for (const root of roots) {
    try {
      const json = JSON.parse(
        fs.readFileSync(path.join(root, "package.json"), "utf8"),
      );
      for (const field of [
        "dependencies",
        "devDependencies",
        "peerDependencies",
      ]) {
        const range = json[field]?.[pkg];
        if (isInstallableSpec(range)) return range;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

/** Parse pnpm-workspace.yaml catalog + catalogs into a flat pkg->version map. */
function loadPnpmCatalog(sourceRoot) {
  const map = new Map();
  let text;
  try {
    text = fs.readFileSync(path.join(sourceRoot, "pnpm-workspace.yaml"), "utf8");
  } catch {
    return map;
  }
  // Collect `pkg: version` entries under any `catalog:`/`catalogs:` block.
  // Simple indentation-aware scan (dependency-free).
  const lines = text.split("\n");
  let inCatalog = false;
  for (const line of lines) {
    if (/^\s*catalogs?\s*:/.test(line)) {
      inCatalog = true;
      continue;
    }
    // A new top-level key ends the catalog block.
    if (inCatalog && /^\S/.test(line) && !/^\s*catalogs?\s*:/.test(line)) {
      inCatalog = false;
    }
    if (!inCatalog) continue;
    const m = line.match(/^\s+["']?([@\w./-]+)["']?\s*:\s*["']?([^"'#]+?)["']?\s*$/);
    if (m && isInstallableSpec(m[2].trim())) {
      map.set(m[1], m[2].trim());
    }
  }
  return map;
}

function detectPackageManager(hostRoot) {
  if (fs.existsSync(path.join(hostRoot, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(hostRoot, "yarn.lock"))) return "yarn";
  if (fs.existsSync(path.join(hostRoot, "package-lock.json"))) return "npm";
  return "pnpm";
}

function main() {
  const hostRoot = process.argv[2];
  const sourceRoot = process.argv[3];
  if (!hostRoot || !sourceRoot) {
    console.error(
      "install-synced-deps: expected <hostRoot> <sourceRoot> arguments",
    );
    process.exit(0); // non-fatal: never break the sync
  }

  const pkgJsonPath = path.join(hostRoot, "package.json");
  let hostPkg;
  try {
    hostPkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
  } catch {
    console.error("install-synced-deps: host package.json unreadable — skipping");
    process.exit(0);
  }

  // Scope auto-install to the PRIMITIVE layer — those previews are always
  // rendered, so their deps (radix-ui, cmdk, vaul, react-hook-form, …) are
  // always needed. Composite deps are situational (many composites are legit
  // `infra-bound` skips: openai, monaco, mermaid), so those are left for the
  // import-resolution gate to surface per-component as the agent renders them —
  // we don't pull heavy infra for composites that won't be previewed.
  const roots = resolveCoverageRoots(hostRoot);
  const primitiveAbs = roots.primitive.map((r) => r.abs);
  if (primitiveAbs.length === 0) {
    console.log(
      "Dependency check: no primitive roots resolved yet — skipping auto-install (the verify gate will surface any missing deps).",
    );
    process.exit(0);
  }

  const tsPaths = loadTsconfigPaths(hostRoot);
  const packages = collectPackagesUnder(hostRoot, primitiveAbs, tsPaths);
  const workspaceNames = workspacePackageNames(sourceRoot);
  const catalog = loadPnpmCatalog(sourceRoot);

  const declared = new Set([
    ...Object.keys(hostPkg.dependencies ?? {}),
    ...Object.keys(hostPkg.devDependencies ?? {}),
  ]);

  const toAdd = []; // { pkg, version }
  const unresolved = []; // pkgs we couldn't pin a real version for
  for (const [pkg, importers] of packages.entries()) {
    if (declared.has(pkg)) continue;
    if (workspaceNames.has(pkg)) continue; // source-internal package, not npm
    if (packageResolves(pkg, hostRoot)) continue; // already available
    const version = resolveVersion(sourceRoot, pkg, catalog);
    if (!version) {
      unresolved.push(pkg);
      continue;
    }
    toAdd.push({ pkg, version, importer: [...importers][0] });
  }

  if (unresolved.length > 0) {
    console.log(
      `Dependency check: could not pin a version for ${unresolved.length} package(s) (skipped — install manually if a preview needs them): ${unresolved.join(", ")}`,
    );
  }

  if (toAdd.length === 0) {
    console.log("Dependency check: all primitive-layer imports already resolve.");
    process.exit(0);
  }

  const dryRun = process.argv.includes("--dry-run");
  console.log(
    `Dependency check: ${toAdd.length} primitive-layer package(s) missing from the host${dryRun ? " (dry run — not writing)" : " — adding"}:`,
  );
  for (const { pkg, version, importer } of toAdd) {
    console.log(`  + ${pkg}@${version}  (e.g. imported by ${importer})`);
  }
  if (dryRun) process.exit(0);

  hostPkg.dependencies = hostPkg.dependencies ?? {};
  for (const { pkg, version } of toAdd) {
    hostPkg.dependencies[pkg] = version;
  }

  // Keep dependencies sorted for a stable diff.
  hostPkg.dependencies = Object.fromEntries(
    Object.entries(hostPkg.dependencies).sort(([a], [b]) => a.localeCompare(b)),
  );
  fs.writeFileSync(pkgJsonPath, `${JSON.stringify(hostPkg, null, 2)}\n`);

  if (process.env.PROTOTYPE_SKIP_DEP_INSTALL === "1") {
    console.log(
      "PROTOTYPE_SKIP_DEP_INSTALL=1 — package.json updated; run install manually.",
    );
    process.exit(0);
  }

  const pm = detectPackageManager(hostRoot);
  console.log(`Installing with ${pm} …`);
  try {
    execFileSync(pm, ["install"], { cwd: hostRoot, stdio: "inherit" });
    console.log("Dependency install complete.");
  } catch (err) {
    console.error(
      `install-synced-deps: \`${pm} install\` failed (${err.message}). ` +
        "package.json was updated — install manually before building previews.",
    );
    // Non-fatal: the verify gate will still flag anything unresolved.
  }
  process.exit(0);
}

main();
