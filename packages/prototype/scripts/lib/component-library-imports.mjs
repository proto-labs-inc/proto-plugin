import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

/**
 * Import-resolution oracle for the design system (CHECKPOINT 4).
 *
 * The coverage gate only proves a component is *mentioned* in the library page.
 * It does not prove the component can actually load. The #1 real-world failure
 * is a synced component that imports a package the host does not have installed
 * (e.g. the source uses the unified `radix-ui` package but the host only has
 * individual `@radix-ui/*` deps, or none at all). That compiles server-side,
 * returns HTTP 200, and then throws on the client — so the accordion section
 * "doesn't open" and no static text check catches it.
 *
 * This module walks the module graph reachable from the component-library page,
 * following local/aliased imports to the synced component files, and asserts
 * every *bare package* specifier they import resolves from the host root. It is
 * static, dependency-free, and browser-free.
 */

const SOURCE_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", ".mjs", ".cjs"];
const ASSET_RE = /\.(css|scss|sass|less|svg|png|jpe?g|gif|webp|avif|woff2?|ttf|otf|json)$/i;

/** Strip // line and /* *​/ block comments so tsconfig JSON parses. */
function stripJsonComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/**
 * Read compilerOptions.baseUrl + paths from the host tsconfig so we can resolve
 * `@/...` and other alias imports the same way Next/TS does.
 */
export function loadTsconfigPaths(hostRoot) {
  const tsconfigPath = path.join(hostRoot, "tsconfig.json");
  let baseUrl = ".";
  let paths = {};
  try {
    const raw = fs.readFileSync(tsconfigPath, "utf8");
    const json = JSON.parse(stripJsonComments(raw));
    const co = json.compilerOptions ?? {};
    if (typeof co.baseUrl === "string") baseUrl = co.baseUrl;
    if (co.paths && typeof co.paths === "object") paths = co.paths;
  } catch {
    // No tsconfig / unparseable — fall back to default `@/* -> ./src/*`.
    paths = { "@/*": ["./src/*"] };
  }
  return { baseAbs: path.resolve(hostRoot, baseUrl), paths };
}

/** Extract every static/dynamic import + re-export specifier from source text. */
export function extractSpecifiers(code) {
  const specs = new Set();
  const patterns = [
    // import ... from "x"  /  export ... from "x"  /  import "x"
    /(?:import|export)\s+(?:[\s\S]*?\sfrom\s*)?["']([^"']+)["']/g,
    // dynamic import("x")
    /import\(\s*["']([^"']+)["']\s*\)/g,
    // require("x")
    /require\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(code)) !== null) specs.add(m[1]);
  }
  return [...specs];
}

/** The importable package name from a specifier (handles @scope/name/sub). */
export function packageNameOf(spec) {
  if (spec.startsWith("@")) {
    const parts = spec.split("/");
    return parts.slice(0, 2).join("/");
  }
  return spec.split("/")[0];
}

function tryResolveFile(absNoExt) {
  // Exact file (already has extension).
  if (fs.existsSync(absNoExt) && fs.statSync(absNoExt).isFile()) return absNoExt;
  for (const ext of SOURCE_EXTENSIONS) {
    const withExt = absNoExt + ext;
    if (fs.existsSync(withExt) && fs.statSync(withExt).isFile()) return withExt;
  }
  // Directory index.
  if (fs.existsSync(absNoExt) && fs.statSync(absNoExt).isDirectory()) {
    for (const ext of SOURCE_EXTENSIONS) {
      const idx = path.join(absNoExt, "index" + ext);
      if (fs.existsSync(idx)) return idx;
    }
  }
  return null;
}

/** Resolve an alias specifier against tsconfig paths. Returns abs path or null. */
function resolveAlias(spec, tsPaths) {
  for (const [pattern, targets] of Object.entries(tsPaths.paths)) {
    const hasStar = pattern.includes("*");
    if (hasStar) {
      const [prefix, suffix = ""] = pattern.split("*");
      if (spec.startsWith(prefix) && spec.endsWith(suffix)) {
        const middle = spec.slice(prefix.length, spec.length - suffix.length);
        for (const target of targets) {
          const candidate = path.resolve(
            tsPaths.baseAbs,
            target.replace("*", middle),
          );
          const resolved = tryResolveFile(candidate);
          if (resolved) return resolved;
        }
      }
    } else if (spec === pattern) {
      for (const target of targets) {
        const candidate = path.resolve(tsPaths.baseAbs, target);
        const resolved = tryResolveFile(candidate);
        if (resolved) return resolved;
      }
    }
  }
  return null;
}

/**
 * Classify a specifier reached from `fromFile`.
 *  - { kind: "local", file } — a source file in the host tree (follow it)
 *  - { kind: "package", pkg } — a bare npm package (resolution-checked)
 *  - { kind: "asset" } — css/image/etc (bundler-handled; ignored)
 *  - { kind: "unresolved-local", spec } — relative/alias that hit nothing
 */
export function classifySpecifier(fromFile, spec, hostRoot, tsPaths) {
  if (ASSET_RE.test(spec) && (spec.startsWith(".") || spec.startsWith("/"))) {
    return { kind: "asset" };
  }
  if (spec.startsWith("node:")) return { kind: "asset" };

  if (spec.startsWith(".")) {
    const abs = path.resolve(path.dirname(fromFile), spec);
    const file = tryResolveFile(abs);
    return file
      ? { kind: "local", file }
      : { kind: "unresolved-local", spec };
  }

  // Alias (matches a tsconfig path pattern) → local file.
  const aliasFile = resolveAlias(spec, tsPaths);
  if (aliasFile) return { kind: "local", file: aliasFile };

  // If it matches an alias pattern prefix but did not resolve, it's a broken
  // local path (e.g. `@/components/ui/does-not-exist`), not a package.
  for (const pattern of Object.keys(tsPaths.paths)) {
    const prefix = pattern.split("*")[0];
    if (prefix && spec.startsWith(prefix)) {
      return { kind: "unresolved-local", spec };
    }
  }

  if (ASSET_RE.test(spec)) return { kind: "asset" };
  return { kind: "package", pkg: packageNameOf(spec) };
}

/** True if a bare package resolves from the host root. */
export function packageResolves(pkg, hostRoot) {
  const req = createRequire(path.join(hostRoot, "__resolver__.js"));
  try {
    req.resolve(pkg);
    return true;
  } catch {
    // Some packages block package.json in exports; fall back to disk + main.
  }
  try {
    req.resolve(`${pkg}/package.json`);
    return true;
  } catch {
    // ignore
  }
  const onDisk = path.join(hostRoot, "node_modules", pkg);
  return fs.existsSync(onDisk);
}

/**
 * Walk the module graph from the component-library page, following local/alias
 * imports, and collect the bare packages the reachable files import.
 */
export function collectReachable(hostRoot, entryFiles, tsPaths) {
  const visited = new Set();
  const packages = new Map(); // pkg -> Set(files that import it)
  const unresolvedLocal = []; // { from, spec }

  const stack = [...entryFiles];
  while (stack.length > 0) {
    const file = stack.pop();
    if (visited.has(file)) continue;
    visited.add(file);

    let code;
    try {
      code = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }

    for (const spec of extractSpecifiers(code)) {
      const cls = classifySpecifier(file, spec, hostRoot, tsPaths);
      if (cls.kind === "local") {
        if (!visited.has(cls.file)) stack.push(cls.file);
      } else if (cls.kind === "package") {
        if (!packages.has(cls.pkg)) packages.set(cls.pkg, new Set());
        packages.get(cls.pkg).add(path.relative(hostRoot, file));
      } else if (cls.kind === "unresolved-local") {
        unresolvedLocal.push({ from: path.relative(hostRoot, file), spec: cls.spec });
      }
    }
  }

  return { visited, packages, unresolvedLocal };
}

/** Entry files: everything under src/app/design-system. */
function componentLibraryEntryFiles(hostRoot) {
  const dir = path.join(hostRoot, "src", "app", "component-library");
  const files = [];
  const walk = (d) => {
    let entries;
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.(tsx|jsx|ts)$/.test(e.name)) files.push(full);
    }
  };
  walk(dir);
  return files;
}

// Packages we never expect the host to install directly (provided by the
// framework/bundler runtime). Resolution is skipped for these.
const RUNTIME_PACKAGES = new Set(["react", "react-dom", "next", "react/jsx-runtime"]);

/**
 * The import-resolution gate. Returns { ok, missingPackages, unresolvedLocal,
 * checkedFileCount, packageCount }.
 */
export function checkImportResolution(hostRoot) {
  const tsPaths = loadTsconfigPaths(hostRoot);
  const entryFiles = componentLibraryEntryFiles(hostRoot);
  const { visited, packages, unresolvedLocal } = collectReachable(
    hostRoot,
    entryFiles,
    tsPaths,
  );

  const missingPackages = [];
  for (const [pkg, importers] of packages.entries()) {
    if (RUNTIME_PACKAGES.has(pkg)) continue;
    if (!packageResolves(pkg, hostRoot)) {
      missingPackages.push({ pkg, importers: [...importers].slice(0, 3) });
    }
  }

  return {
    ok: missingPackages.length === 0 && unresolvedLocal.length === 0,
    missingPackages,
    unresolvedLocal,
    checkedFileCount: visited.size,
    packageCount: packages.size,
  };
}
