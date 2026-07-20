import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import {
  coverageRootsFromProfile,
  loadProfile,
} from "./design-system-profile.mjs";

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

/**
 * Resolve the primitive + composite coverage roots.
 *
 * PRIMARY SOURCE: the agent-authored `design-system-profile.json` (Phase 1).
 * The old path-regex deciders (`looksLikePrimitive` / `looksLikeComposite` over
 * SYNC_DIRS) have been DELETED — the plugin no longer guesses which dir is a
 * primitive vs composite root. A legacy `COMPONENT_LIBRARY_*_ROOTS` config
 * override is still honored as a fallback for hosts without a profile yet.
 * Returns roots that exist on disk.
 */
export function resolveCoverageRoots(hostRoot) {
  const profile = loadProfile(hostRoot);
  if (profile) {
    const roots = coverageRootsFromProfile(hostRoot, profile);
    return { ...roots, source: "profile" };
  }

  // Fallback: explicit override arrays only (no regex guessing).
  const arrays = readHostConfigArrays(hostRoot, [
    "COMPONENT_LIBRARY_PRIMITIVE_ROOTS",
    "COMPONENT_LIBRARY_COMPOSITE_ROOTS",
  ]);

  const toRoots = (list) =>
    list
      .map((rel) => ({ rel, abs: path.join(hostRoot, rel) }))
      .filter((r) => fs.existsSync(r.abs));

  return {
    primitive: toRoots(arrays.COMPONENT_LIBRARY_PRIMITIVE_ROOTS),
    composite: toRoots(arrays.COMPONENT_LIBRARY_COMPOSITE_ROOTS),
    source: "config",
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

/**
 * Strip JS/JSX comments so a component NAME mentioned only inside a comment
 * (a `// skip:` line or a JSX block comment) is not miscounted as a rendered
 * preview. This is the crux of the coverage oracle: "rendered" must mean real
 * code references the component, not that its name appears in prose.
 */
function stripCodeComments(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "") // /* */ and JSX {/* */} blocks
    .replace(/(^|[^:])\/\/.*$/gm, "$1"); // // line comments (keep http://)
}

/**
 * Returns { text, skipLines } where:
 *  - `text` is the concatenated library source with comments removed (used to
 *    detect RENDERED components), and
 *  - `skipLines` is the raw `// skip:` lines (used to detect + validate skips).
 */
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
    text += `\n${stripCodeComments(content)}`;
    for (const line of content.split("\n")) {
      // Match both line-comment and JSX-block-comment skip styles.
      if (/skip:/i.test(line) && /\/\/|\/\*/.test(line)) {
        skipLines.push(line.toLowerCase());
      }
    }
  }
  return { text, skipLines };
}

/**
 * A `// skip:` is only valid coverage when it names a machine-checkable reason
 * from this allowlist. Without this, an agent under pressure can skip every
 * export ("skip: X - not needed") and the gate passes on an empty library —
 * the exact failure this oracle exists to prevent. Coverage is measured by
 * RENDERED previews; skips are the narrow, justified exception.
 */
export const VALID_SKIP_CATEGORIES = [
  "server-only",
  "type-only",
  "hook-only",
  "non-visual",
  "infra-bound",
  "deprecated",
];

/** Max fraction of a section's exports that may be skipped rather than rendered. */
export const MAX_SKIP_RATIO = 0.4;

/** Rendered = the component name appears in real (non-skip) library source text. */
function isRendered(record, librarySources) {
  const nameRe = new RegExp(`\\b${record.name}\\b`);
  return nameRe.test(librarySources.text);
}

/** The skip line (if any) that references this component. */
function skipLineFor(record, librarySources) {
  const kebab = record.kebab.toLowerCase();
  const nameLower = record.name.toLowerCase();
  return librarySources.skipLines.find(
    (line) => line.includes(kebab) || line.includes(nameLower),
  );
}

function skipReasonValid(skipLine) {
  return VALID_SKIP_CATEGORIES.some((cat) => skipLine.includes(cat));
}

/**
 * Classify one export as rendered | skipped | missing. A skip only counts when
 * its reason cites an allowlisted category; otherwise it is an `invalidSkip`
 * (treated as not-covered so it cannot pass silently).
 */
function classifyCoverage(record, librarySources) {
  if (isRendered(record, librarySources)) return { status: "rendered" };
  const skipLine = skipLineFor(record, librarySources);
  if (skipLine) {
    if (skipReasonValid(skipLine)) return { status: "skipped" };
    return { status: "invalid-skip" };
  }
  return { status: "missing" };
}

/**
 * Coverage report for a set of roots. Coverage is measured by RENDERED previews;
 * `missing` = not rendered and not validly skipped. `invalidSkips` = skip comments
 * whose reason is not an allowlisted category. `skipRatioExceeded` flags sections
 * that lean on skips past MAX_SKIP_RATIO.
 */
export function checkCoverage(hostRoot, roots, librarySources) {
  const perRoot = [];
  const missing = [];
  const invalidSkips = [];
  let expectedTotal = 0;
  let renderedTotal = 0;
  let skippedTotal = 0;

  for (const root of roots) {
    const records = enumerateComponents(root.abs);
    expectedTotal += records.length;

    const rootMissing = [];
    const rootInvalidSkips = [];
    let rendered = 0;
    let skipped = 0;

    for (const record of records) {
      const { status } = classifyCoverage(record, librarySources);
      if (status === "rendered") rendered += 1;
      else if (status === "skipped") skipped += 1;
      else if (status === "invalid-skip") {
        rootInvalidSkips.push(record.name);
        rootMissing.push(record.name);
      } else rootMissing.push(record.name);
    }

    renderedTotal += rendered;
    skippedTotal += skipped;
    missing.push(...rootMissing);
    invalidSkips.push(...rootInvalidSkips);
    perRoot.push({
      rel: root.rel,
      expected: records.length,
      rendered,
      skipped,
      missing: rootMissing,
    });
  }

  const skipRatio = expectedTotal > 0 ? skippedTotal / expectedTotal : 0;

  return {
    perRoot,
    missing,
    invalidSkips,
    expectedTotal,
    renderedTotal,
    skippedTotal,
    skipRatio,
    skipRatioExceeded: skipRatio > MAX_SKIP_RATIO,
  };
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
