import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * Ground-truth helpers for the component-library coverage + token oracle.
 *
 * The expected set of primitives/composites is derived from the directories the
 * host already declared in `prototype.sync.config.sh` (the same list the sync
 * step copied from source), not from any hardcoded count. Design tokens use a
 * fixed canonical semantic-role list because the raw palette scale is noise.
 */

const DEFAULT_SYNC_CONFIG = "prototype.sync.config.sh";

/** Semantic token roles a real library must swatch. Palette shades are ignored. */
export const CORE_TOKEN_ROLES = [
  "background",
  "foreground",
  "primary",
  "secondary",
  "border",
  "destructive",
  "muted",
  "accent",
];

export const EXTENDED_TOKEN_ROLES = [
  "card",
  "popover",
  "tertiary",
  "warning",
  "info",
  "input",
  "ring",
];

/**
 * Read named bash array values out of the host sync config by sourcing it in a
 * subshell. Returns a map of arrayName -> string[]. Missing arrays -> [].
 */
export function readHostConfigArrays(hostRoot, arrayNames) {
  const configPath =
    process.env.PROTOTYPE_SYNC_CONFIG ?? path.join(hostRoot, DEFAULT_SYNC_CONFIG);

  const result = Object.fromEntries(arrayNames.map((name) => [name, []]));
  if (!fs.existsSync(configPath)) return result;

  // Emit each array on its own line as `NAME\t<tab-joined values>` so values
  // with spaces stay grouped per element.
  const printer = arrayNames
    .map(
      (name) =>
        `printf '%s\\t' '${name}'; printf '%s\\n' "\${${name}[*]+\${${name}[@]}}" | tr '\\n' '\\v'; printf '\\n'`,
    )
    .join("; ");

  let stdout = "";
  try {
    stdout = execFileSync(
      "bash",
      ["-c", `source "${configPath}" >/dev/null 2>&1; ${printer}`],
      { encoding: "utf8" },
    );
  } catch {
    return result;
  }

  for (const line of stdout.split("\n")) {
    const tab = line.indexOf("\t");
    if (tab === -1) continue;
    const name = line.slice(0, tab);
    if (!(name in result)) continue;
    const rest = line.slice(tab + 1);
    result[name] = rest
      .split("\v")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  return result;
}

// Dirs that live under a components path but never hold visual components.
const EXCLUDED_ROOT_BASENAMES = new Set([
  "lib",
  "utils",
  "util",
  "hooks",
  "styles",
  "test",
  "tests",
  "__tests__",
  "constants",
  "types",
]);

function isExcludedRoot(rel) {
  return EXCLUDED_ROOT_BASENAMES.has(path.basename(rel));
}

function looksLikeComposite(rel) {
  return /pattern/i.test(rel) && !isExcludedRoot(rel);
}

function looksLikePrimitive(rel) {
  if (isExcludedRoot(rel) || looksLikeComposite(rel)) return false;
  return /(^|\/)ui($|\/)|shadcn/i.test(rel);
}

/**
 * Resolve the primitive + composite coverage roots. Explicit override arrays win;
 * otherwise derive from the component-looking entries in SYNC_DIRS. Returns roots
 * that exist on disk in the host, adjusting `.../shadcn` -> `.../shadcn/ui` when
 * the primitives live one level down.
 */
export function resolveCoverageRoots(hostRoot) {
  const arrays = readHostConfigArrays(hostRoot, [
    "SYNC_DIRS",
    "COMPONENT_LIBRARY_PRIMITIVE_ROOTS",
    "COMPONENT_LIBRARY_COMPOSITE_ROOTS",
  ]);

  const overridePrimitive = arrays.COMPONENT_LIBRARY_PRIMITIVE_ROOTS;
  const overrideComposite = arrays.COMPONENT_LIBRARY_COMPOSITE_ROOTS;

  let primitiveRoots = overridePrimitive.length
    ? overridePrimitive
    : arrays.SYNC_DIRS.filter(looksLikePrimitive);
  let compositeRoots = overrideComposite.length
    ? overrideComposite
    : arrays.SYNC_DIRS.filter(looksLikeComposite);

  const normalize = (rel) => {
    const abs = path.join(hostRoot, rel);
    // Primitives frequently live in `<root>/ui` (shadcn convention).
    const nested = path.join(abs, "ui");
    if (fs.existsSync(nested) && fs.statSync(nested).isDirectory()) {
      const directTsx = fs
        .readdirSync(abs, { withFileTypes: true })
        .some((e) => e.isFile() && /\.(tsx|jsx)$/.test(e.name));
      if (!directTsx) return { rel: path.join(rel, "ui"), abs: nested };
    }
    return { rel, abs };
  };

  return {
    primitive: primitiveRoots.map(normalize).filter((r) => fs.existsSync(r.abs)),
    composite: compositeRoots.map(normalize).filter((r) => fs.existsSync(r.abs)),
    usedOverride: {
      primitive: overridePrimitive.length > 0,
      composite: overrideComposite.length > 0,
    },
  };
}

function isVisualFile(name) {
  if (!/\.(tsx|jsx)$/.test(name)) return false;
  if (/\.(test|spec|stories)\./.test(name)) return false;
  if (/^index\./.test(name)) return false;
  if (/^use-/.test(name)) return false;
  return true;
}

function kebabToPascal(base) {
  return base
    .replace(/\.(tsx|jsx|ts|js)$/, "")
    .split(/[-_.]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Enumerate the top-level (depth-1) component entries under a root. Top-level
 * `.tsx` files and directories both count as one entry each — matching the
 * "one export per composite" model. Returns { name, kebab } records.
 */
export function enumerateComponents(rootAbs) {
  let entries;
  try {
    entries = fs.readdirSync(rootAbs, { withFileTypes: true });
  } catch {
    return [];
  }

  const records = [];
  for (const entry of entries) {
    if (entry.isFile()) {
      if (!isVisualFile(entry.name)) continue;
      const kebab = entry.name.replace(/\.(tsx|jsx)$/, "");
      records.push({ name: kebabToPascal(kebab), kebab });
    } else if (entry.isDirectory()) {
      if (/^_|^\./.test(entry.name)) continue;
      records.push({ name: kebabToPascal(entry.name), kebab: entry.name });
    }
  }
  return records;
}

function collectFiles(dir, acc) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectFiles(full, acc);
    else if (/\.(tsx|jsx|ts)$/.test(entry.name)) acc.push(full);
  }
}

/** Concatenated text of the component-library page + skip-comment lines. */
export function readLibrarySources(hostRoot) {
  const dir = path.join(hostRoot, "src", "app", "component-library");
  const files = [];
  collectFiles(dir, files);

  let text = "";
  const skipLines = [];
  for (const file of files) {
    let content;
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    text += `\n${content}`;
    for (const line of content.split("\n")) {
      if (/\/\/\s*skip:/i.test(line)) skipLines.push(line.toLowerCase());
    }
  }
  return { text, skipLines };
}

function isCovered(record, librarySources) {
  const nameRe = new RegExp(`\\b${record.name}\\b`);
  if (nameRe.test(librarySources.text)) return true;
  const kebab = record.kebab.toLowerCase();
  const nameLower = record.name.toLowerCase();
  return librarySources.skipLines.some(
    (line) => line.includes(kebab) || line.includes(nameLower),
  );
}

/** Coverage report for a set of roots. missing = expected minus (rendered|skipped). */
export function checkCoverage(hostRoot, roots, librarySources) {
  const perRoot = [];
  const missing = [];
  let expectedTotal = 0;

  for (const root of roots) {
    const records = enumerateComponents(root.abs);
    expectedTotal += records.length;
    const rootMissing = records
      .filter((record) => !isCovered(record, librarySources))
      .map((record) => record.name);
    perRoot.push({ rel: root.rel, expected: records.length, missing: rootMissing });
    missing.push(...rootMissing);
  }

  return { perRoot, missing, expectedTotal };
}

/** Scan globals.css for the token-layer bug that renders previews unstyled. */
export function checkTokenLayer(hostRoot) {
  const globalsPath = path.join(hostRoot, "src", "app", "globals.css");
  let css = "";
  try {
    css = fs.readFileSync(globalsPath, "utf8");
  } catch {
    return { globalsFound: false, circularVars: [], hasTokenImport: false };
  }

  const circularVars = [];
  const selfRefRe = /(--[\w-]+)\s*:\s*var\(\s*(--[\w-]+)\s*\)\s*;?/g;
  let match;
  while ((match = selfRefRe.exec(css)) !== null) {
    if (match[1] === match[2]) circularVars.push(match[1]);
  }

  const hasTokenImport = /@import\s+["'][^"']+\.css["']/.test(css);

  return { globalsFound: true, circularVars, hasTokenImport };
}

/** Which canonical semantic roles have a swatch in the library. */
export function checkTokenRoles(librarySources) {
  const present = (role) =>
    new RegExp(`--(?:color-)?${role}\\b`).test(librarySources.text);
  return {
    missingCore: CORE_TOKEN_ROLES.filter((role) => !present(role)),
    missingExtended: EXTENDED_TOKEN_ROLES.filter((role) => !present(role)),
  };
}
