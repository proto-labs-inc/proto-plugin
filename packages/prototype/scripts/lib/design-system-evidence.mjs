import fs from "node:fs";
import path from "node:path";

/**
 * Evidence gatherer for Phase 1 (design-system scoping).
 *
 * This module GATHERS FACTS and never draws conclusions. It does not decide
 * which package is "primitives", what the import style is, or which components
 * are composites — the agent reasons about that from the raw facts and writes
 * the profile (`design-system-profile.json`). Deleting the old "deciders"
 * (`detectDesignSystemPackages`, primitive/composite path regexes) is the whole
 * point of the hybrid design; this file is the allowed, conclusion-free half.
 */

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".turbo",
  ".next",
  "dist",
  "build",
  "coverage",
  "__tests__",
]);

const CONTEXT_TOKENS = [
  "useLocale",
  "useTranslation",
  "useForm",
  "useFormContext",
  "useRouter",
  "usePathname",
  "useSearchParams",
  "useTheme",
  "useSession",
  "trpc",
  "cmdk",
];

function safeReadJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function safeReadDir(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

/** Real path of the linked source app, or null. */
export function resolveSourceRoot(hostRoot) {
  const link = path.join(hostRoot, "source");
  try {
    const stat = fs.lstatSync(link);
    if (stat.isSymbolicLink() || stat.isDirectory()) {
      return fs.realpathSync(link);
    }
  } catch {
    // no source link
  }
  return null;
}

/** Collect candidate package roots: host packages/*, source packages/*, host src. */
function collectPackageDirs(hostRoot) {
  const dirs = [];
  const sourceRoot = resolveSourceRoot(hostRoot);

  const packagesParents = [
    path.join(hostRoot, "packages"),
    sourceRoot ? path.join(sourceRoot, "packages") : null,
  ].filter(Boolean);

  for (const parent of packagesParents) {
    for (const entry of safeReadDir(parent)) {
      if (!entry.isDirectory() || IGNORE_DIRS.has(entry.name)) continue;
      const dir = path.join(parent, entry.name);
      if (fs.existsSync(path.join(dir, "package.json"))) dirs.push(dir);
    }
  }

  // Plain-app shape: host src/components/ui without a package boundary.
  const srcComponents = path.join(hostRoot, "src", "components");
  if (fs.existsSync(srcComponents)) dirs.push(srcComponents);

  return { dirs, sourceRoot };
}

/** Directories under a package that look like they hold component source files. */
function findComponentDirs(pkgDir) {
  const candidates = [];
  const roots = [
    "src/components",
    "src/shared",
    "src/patterns",
    "components",
    "shared",
    "patterns",
    "src",
    "ui",
    "src/ui",
  ];
  for (const rel of roots) {
    const abs = path.join(pkgDir, rel);
    const entries = safeReadDir(abs);
    if (entries.length === 0) continue;
    const tsxFiles = entries.filter(
      (e) => e.isFile() && /\.(tsx|jsx)$/.test(e.name) && !/\.(test|spec|stories)\./.test(e.name),
    ).length;
    const dirEntries = entries.filter(
      (e) => e.isDirectory() && !/^[_.]/.test(e.name) && !IGNORE_DIRS.has(e.name),
    ).length;
    if (tsxFiles + dirEntries === 0) continue;
    candidates.push({
      rel,
      topLevelFiles: tsxFiles,
      topLevelDirs: dirEntries,
      sample: entries
        .filter(
          (e) =>
            !/^[_.]/.test(e.name) &&
            !IGNORE_DIRS.has(e.name) &&
            (e.isDirectory() || /\.(tsx|jsx)$/.test(e.name)),
        )
        .slice(0, 40)
        .map((e) => (e.isDirectory() ? `${e.name}/` : e.name)),
    });
  }
  return candidates;
}

function countStoriesAndContext(pkgDir) {
  let stories = 0;
  const contextHits = {};
  const walk = (dir, depth) => {
    if (depth > 5) return;
    for (const entry of safeReadDir(dir)) {
      if (IGNORE_DIRS.has(entry.name) || /^\./.test(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, depth + 1);
      } else if (/\.stories\.(tsx|jsx|ts|js|mdx)$/.test(entry.name)) {
        stories += 1;
      } else if (/\.(tsx|jsx)$/.test(entry.name)) {
        let text = "";
        try {
          text = fs.readFileSync(full, "utf8");
        } catch {
          continue;
        }
        for (const token of CONTEXT_TOKENS) {
          if (text.includes(token)) {
            contextHits[token] = (contextHits[token] ?? 0) + 1;
          }
        }
      }
    }
  };
  walk(pkgDir, 0);
  return { stories, contextHits };
}

/** Normalize an exports map entry to its representative target string. */
function normalizeExportTarget(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    return (
      value.types ??
      value.import ??
      value.default ??
      value.require ??
      Object.values(value).find((v) => typeof v === "string") ??
      null
    );
  }
  return null;
}

function summarizeExports(pkgJson) {
  const exp = pkgJson?.exports;
  if (!exp) return null;
  if (typeof exp === "string") return [{ key: ".", target: exp }];
  return Object.entries(exp)
    .map(([key, value]) => ({ key, target: normalizeExportTarget(value) }))
    .filter((e) => e.target);
}

/**
 * Gather the full evidence bundle. Returns a plain object safe to serialize to
 * `.proto/design-system-evidence.json`.
 */
export function gatherDesignSystemEvidence(hostRoot) {
  const { dirs, sourceRoot } = collectPackageDirs(hostRoot);
  const packages = [];

  for (const dir of dirs) {
    const pkgJson = safeReadJson(path.join(dir, "package.json"));
    const rel = path.relative(hostRoot, dir);
    const withinSource =
      sourceRoot && dir.startsWith(sourceRoot)
        ? path.relative(sourceRoot, dir)
        : null;
    const { stories, contextHits } = countStoriesAndContext(dir);

    packages.push({
      dir: rel,
      sourceRelative: withinSource,
      name: pkgJson?.name ?? null,
      main: pkgJson?.main ?? null,
      module: pkgJson?.module ?? null,
      types: pkgJson?.types ?? null,
      exports: pkgJson ? summarizeExports(pkgJson) : null,
      componentDirs: findComponentDirs(dir),
      stories,
      contextHits,
    });
  }

  // Only surface packages that actually contain component-looking dirs.
  const withComponents = packages.filter(
    (p) => p.componentDirs.length > 0,
  );

  return {
    hostRoot,
    sourceRoot,
    gatheredAt: new Date().toISOString(),
    contextTokensScanned: CONTEXT_TOKENS,
    packages: withComponents.length > 0 ? withComponents : packages,
  };
}
