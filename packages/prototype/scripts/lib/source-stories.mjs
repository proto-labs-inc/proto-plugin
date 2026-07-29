import fs from "node:fs";
import path from "node:path";

/**
 * Static Storybook (CSF) scanner for the linked source app.
 *
 * Same contract as `design-system-evidence.mjs`: this module GATHERS FACTS and
 * never draws conclusions. It does not decide which story is a primitive vs a
 * composite, which package is "the design system", or how a component should be
 * previewed — the agent reasons about that from the raw facts.
 *
 * Text-only parsing: no Storybook install, no `storybook build`, no module
 * resolution inside the source's node_modules. The source is read-only.
 *
 * Only `*.stories.*` files and `.storybook/` config dirs count as Storybook.
 * Helper modules like `_storybookData.ts` (left behind after a Storybook
 * removal) must NOT register as a detection — that is the false positive this
 * scanner is written to avoid.
 */

export const STORY_FILE_RE = /\.stories\.(tsx|jsx|ts|js|mjs|mdx)$/;

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".turbo",
  ".next",
  "dist",
  "build",
  "out",
  "coverage",
  "storybook-static",
  "__tests__",
  "__snapshots__",
]);

const MAX_DEPTH = 8;
const MAX_STORY_FILES = 500;
const MAX_INITIALIZER = 4000;
const MAX_FIXTURE_SNIPPET = 2000;

/* ------------------------------------------------------------------ *
 * Text scanning primitives
 * ------------------------------------------------------------------ */

/** Index just past the string/template literal starting at `i`. */
function skipString(text, i) {
  const quote = text[i];
  i += 1;
  if (quote === "`") {
    let exprDepth = 0;
    while (i < text.length) {
      const ch = text[i];
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === "$" && text[i + 1] === "{") {
        exprDepth += 1;
        i += 2;
        continue;
      }
      if (ch === "}" && exprDepth > 0) {
        exprDepth -= 1;
        i += 1;
        continue;
      }
      if (ch === "`" && exprDepth === 0) return i + 1;
      i += 1;
    }
    return i;
  }
  while (i < text.length) {
    const ch = text[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === quote) return i + 1;
    i += 1;
  }
  return i;
}

/**
 * Replace comments with spaces, preserving overall length and newlines so
 * offsets stay comparable to the original text. String and template literals
 * are copied verbatim so `"// not a comment"` survives.
 */
export function stripComments(code) {
  let out = "";
  let i = 0;
  const n = code.length;
  while (i < n) {
    const ch = code[i];
    const next = code[i + 1];
    if (ch === "/" && next === "/") {
      while (i < n && code[i] !== "\n") {
        out += " ";
        i += 1;
      }
      continue;
    }
    if (ch === "/" && next === "*") {
      out += "  ";
      i += 2;
      while (i < n && !(code[i] === "*" && code[i + 1] === "/")) {
        out += code[i] === "\n" ? "\n" : " ";
        i += 1;
      }
      if (i < n) {
        out += "  ";
        i += 2;
      }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      const end = skipString(code, i);
      out += code.slice(i, end);
      i = end;
      continue;
    }
    out += ch;
    i += 1;
  }
  return out;
}

/**
 * Match the bracket pair opening at `startIndex`. Returns
 * `{ start, end, text }` where `end` is exclusive, or null when unbalanced.
 */
export function findBalanced(text, startIndex) {
  const open = text[startIndex];
  const close = open === "{" ? "}" : open === "(" ? ")" : open === "[" ? "]" : null;
  if (!close) return null;

  let depth = 0;
  let i = startIndex;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      i = skipString(text, i);
      continue;
    }
    if (ch === open) {
      depth += 1;
    } else if (ch === close) {
      depth -= 1;
      if (depth === 0) {
        return { start: startIndex, end: i + 1, text: text.slice(startIndex, i + 1) };
      }
    }
    i += 1;
  }
  return null;
}

const JSX_EXPRESSION_PREFIXES = new Set([
  "(",
  "{",
  "[",
  ",",
  ":",
  "=",
  ">",
  "&",
  "|",
  "?",
  ";",
  "",
]);

function prevMeaningfulChar(text, i) {
  let j = i - 1;
  while (j >= 0 && /\s/.test(text[j])) j -= 1;
  return j >= 0 ? text[j] : "";
}

/**
 * Index just past the JSX element starting at `i`. Handles nested elements,
 * fragments, self-closing tags, and `{expression}` children. Without this,
 * plain text commas inside a story `render:` body ("Hello, world") would look
 * like the end of the property value.
 */
function skipJsxElement(text, i) {
  const n = text.length;
  let openTags = 0;

  while (i < n) {
    const ch = text[i];

    if (ch === "{") {
      const balanced = findBalanced(text, i);
      i = balanced ? balanced.end : i + 1;
      continue;
    }

    if (ch !== "<") {
      i += 1;
      continue;
    }

    let j = i + 1;
    const isClosing = text[j] === "/";
    if (isClosing) j += 1;
    while (j < n && /[A-Za-z0-9_$.:-]/.test(text[j])) j += 1;

    let selfClosing = false;
    let braceDepth = 0;
    while (j < n) {
      const c = text[j];
      if (c === '"' || c === "'" || c === "`") {
        j = skipString(text, j);
        continue;
      }
      if (c === "{") {
        braceDepth += 1;
        j += 1;
        continue;
      }
      if (c === "}") {
        braceDepth -= 1;
        j += 1;
        continue;
      }
      if (braceDepth === 0 && c === "/" && text[j + 1] === ">") {
        selfClosing = true;
        j += 2;
        break;
      }
      if (braceDepth === 0 && c === ">") {
        j += 1;
        break;
      }
      j += 1;
    }

    if (isClosing) openTags -= 1;
    else if (!selfClosing) openTags += 1;

    i = j;
    if (openTags <= 0) return i;
  }
  return i;
}

/** Index of the end of the value starting at `i` (a top-level `,` or closer). */
function consumeValue(text, i) {
  const n = text.length;
  let depth = 0;

  while (i < n) {
    const ch = text[i];

    if (ch === '"' || ch === "'" || ch === "`") {
      i = skipString(text, i);
      continue;
    }
    if (
      ch === "<" &&
      /[A-Za-z/>]/.test(text[i + 1] ?? "") &&
      JSX_EXPRESSION_PREFIXES.has(prevMeaningfulChar(text, i))
    ) {
      i = skipJsxElement(text, i);
      continue;
    }
    if (ch === "{" || ch === "(" || ch === "[") {
      depth += 1;
      i += 1;
      continue;
    }
    if (ch === "}" || ch === ")" || ch === "]") {
      if (depth === 0) return i;
      depth -= 1;
      i += 1;
      continue;
    }
    if (ch === "," && depth === 0) return i;
    i += 1;
  }
  return i;
}

/**
 * Top-level entries of an object literal as `{ key, value }` pairs, where
 * `value` is the raw source text of the property value.
 */
export function extractObjectEntries(objText) {
  const entries = [];
  if (typeof objText !== "string" || objText[0] !== "{") return entries;

  let i = 1;
  const n = objText.length;

  while (i < n) {
    while (i < n && /[\s,;]/.test(objText[i])) i += 1;
    if (i >= n || objText[i] === "}") break;

    let key = null;
    if (objText[i] === '"' || objText[i] === "'") {
      const end = skipString(objText, i);
      key = objText.slice(i + 1, end - 1);
      i = end;
    } else if (objText[i] === "[") {
      const balanced = findBalanced(objText, i);
      i = balanced ? balanced.end : i + 1;
    } else if (objText[i] === "." && objText.slice(i, i + 3) === "...") {
      i += 3;
    } else {
      const start = i;
      while (i < n && /[A-Za-z0-9_$]/.test(objText[i])) i += 1;
      key = objText.slice(start, i) || null;
      if (i === start) i += 1;
    }

    while (i < n && /\s/.test(objText[i])) i += 1;
    if (objText[i] === ":") {
      i += 1;
      while (i < n && /\s/.test(objText[i])) i += 1;
    }

    const valueStart = i;
    i = consumeValue(objText, i);
    if (key) {
      entries.push({ key, value: objText.slice(valueStart, i).trim() });
    }
  }

  return entries;
}

function entryValue(entries, key) {
  return entries.find((entry) => entry.key === key)?.value ?? null;
}

function unquote(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith("`") && trimmed.endsWith("`"))
  ) {
    return trimmed.slice(1, -1);
  }
  return null;
}

/** String literals in an array literal — `["a", "b"]` → `["a", "b"]`. */
function parseStringArray(value) {
  if (typeof value !== "string") return [];
  const out = [];
  for (const match of value.matchAll(/["'`]([^"'`]*)["'`]/g)) {
    out.push(match[1]);
  }
  return out;
}

function truncate(value, max) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}\n/* … truncated, read the story file */`;
}

/* ------------------------------------------------------------------ *
 * Story file parsing
 * ------------------------------------------------------------------ */

/** Map local identifier -> raw import specifier for a module's imports. */
export function parseImports(text) {
  const bindings = new Map();
  const importRe = /import\s+([^;]*?)\s+from\s*["']([^"']+)["']/g;

  for (const match of text.matchAll(importRe)) {
    const clause = match[1].replace(/^type\s+/, "");
    const specifier = match[2];

    const braceStart = clause.indexOf("{");
    if (braceStart !== -1) {
      const braceEnd = clause.lastIndexOf("}");
      const named = clause.slice(braceStart + 1, braceEnd);
      for (const part of named.split(",")) {
        const cleaned = part.replace(/^\s*type\s+/, "").trim();
        if (!cleaned) continue;
        const [, local] = cleaned.split(/\s+as\s+/);
        const name = (local ?? cleaned).trim();
        if (name) bindings.set(name, specifier);
      }
    }

    const head = (braceStart === -1 ? clause : clause.slice(0, braceStart))
      .replace(/,\s*$/, "")
      .trim();
    if (head && !head.startsWith("*")) {
      bindings.set(head, specifier);
    }
    const namespace = head.match(/^\*\s+as\s+(\w+)$/);
    if (namespace) bindings.set(namespace[1], specifier);
  }

  return bindings;
}

const RESOLVE_SUFFIXES = [
  "",
  ".tsx",
  ".ts",
  ".jsx",
  ".js",
  "/index.tsx",
  "/index.ts",
  "/index.jsx",
  "/index.js",
];

/** Resolve a relative import to a source-relative file path, or null. */
export function resolveRelativeImport(specifier, storyFileAbs, sourceRoot) {
  if (typeof specifier !== "string" || !specifier.startsWith(".")) return null;
  const base = path.resolve(path.dirname(storyFileAbs), specifier);
  for (const suffix of RESOLVE_SUFFIXES) {
    const candidate = `${base}${suffix}`;
    try {
      if (fs.statSync(candidate).isFile()) {
        return path.relative(sourceRoot, candidate);
      }
    } catch {
      // try next suffix
    }
  }
  return null;
}

/** Locate the `const <name> = {…}` object literal for a declared identifier. */
function findDeclaredObject(text, identifier) {
  const declRe = new RegExp(
    `(?:const|let|var)\\s+${identifier}\\b[^=;]*=\\s*`,
    "g",
  );
  for (const match of text.matchAll(declRe)) {
    const valueStart = (match.index ?? 0) + match[0].length;
    if (text[valueStart] !== "{") continue;
    const balanced = findBalanced(text, valueStart);
    if (balanced) return balanced.text;
  }
  return null;
}

/** Identifier used as the default export (the CSF `meta` object). */
function findDefaultExportIdentifier(text) {
  const named = text.match(/export\s+default\s+([A-Za-z_$][\w$]*)\s*;/);
  if (named) return named[1];
  return null;
}

/** `argTypes` entries that enumerate options — the real variant lists. */
function parseControls(argTypesText) {
  if (!argTypesText) return [];
  const controls = [];
  for (const { key, value } of extractObjectEntries(argTypesText)) {
    const inner = extractObjectEntries(value);
    const options = parseStringArray(entryValue(inner, "options") ?? "");
    const control = unquote(entryValue(inner, "control") ?? "");
    if (options.length || control) {
      controls.push({ prop: key, control: control ?? null, options });
    }
  }
  return controls;
}

/** Named story exports with their raw initializers. */
function parseStoryExports(text) {
  const stories = [];
  const exportRe = /export\s+const\s+([A-Za-z_$][\w$]*)\s*(?::[^=]*)?=\s*/g;

  for (const match of text.matchAll(exportRe)) {
    const exportName = match[1];
    const valueStart = (match.index ?? 0) + match[0].length;
    const first = text[valueStart];

    let initializer;
    if (first === "{" || first === "(") {
      const balanced = findBalanced(text, valueStart);
      initializer = balanced
        ? balanced.text
        : text.slice(valueStart, valueStart + MAX_INITIALIZER);
    } else {
      const end = text.indexOf(";", valueStart);
      initializer = text.slice(
        valueStart,
        end === -1 ? valueStart + MAX_INITIALIZER : end,
      );
    }

    const objectEntries = initializer.startsWith("{")
      ? extractObjectEntries(initializer)
      : [];
    const args = entryValue(objectEntries, "args");
    const name = unquote(entryValue(objectEntries, "name") ?? "");

    stories.push({
      exportName,
      name: name ?? null,
      args: truncate(args, MAX_INITIALIZER),
      initializer: truncate(initializer, MAX_INITIALIZER),
      hasRender: /(^|[\s{,])render\s*:/.test(initializer),
      viaFactory: !initializer.startsWith("{"),
    });
  }

  return stories;
}

/**
 * Top-level `const` declarations (excluding meta and story exports) whose name
 * is referenced by the parsed story bodies — the mock data an agent needs to
 * lift alongside a preview.
 */
function parseFixtures(text, referenceText, excluded) {
  const fixtures = [];
  const declRe = /(?:^|\n)(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*(?::[^=]*)?=\s*/g;

  for (const match of text.matchAll(declRe)) {
    const name = match[1];
    if (excluded.has(name)) continue;
    if (!new RegExp(`\\b${name}\\b`).test(referenceText)) continue;

    const valueStart = (match.index ?? 0) + match[0].length;
    const first = text[valueStart];
    let snippet;
    if (first === "{" || first === "(" || first === "[") {
      const balanced = findBalanced(text, valueStart);
      snippet = balanced
        ? balanced.text
        : text.slice(valueStart, valueStart + MAX_FIXTURE_SNIPPET);
    } else {
      const end = text.indexOf(";", valueStart);
      snippet = text.slice(
        valueStart,
        end === -1 ? valueStart + MAX_FIXTURE_SNIPPET : end,
      );
    }

    fixtures.push({
      name,
      snippet: truncate(snippet, MAX_FIXTURE_SNIPPET),
    });
  }

  return fixtures;
}

/**
 * Parse one story file into a facts record. Returns null only when the file is
 * unreadable.
 */
export function parseStoryFile({ absPath, sourceRoot }) {
  let raw;
  try {
    raw = fs.readFileSync(absPath, "utf8");
  } catch {
    return null;
  }

  const text = stripComments(raw);
  const warnings = [];

  const metaIdentifier = findDefaultExportIdentifier(text);
  let metaText = metaIdentifier ? findDeclaredObject(text, metaIdentifier) : null;
  if (!metaText) {
    const inlineDefault = text.match(/export\s+default\s*\{/);
    if (inlineDefault) {
      const balanced = findBalanced(
        text,
        (inlineDefault.index ?? 0) + inlineDefault[0].length - 1,
      );
      metaText = balanced?.text ?? null;
    }
  }
  if (!metaText) warnings.push("no CSF meta object found");

  const metaEntries = metaText ? extractObjectEntries(metaText) : [];
  const title = unquote(entryValue(metaEntries, "title") ?? "");
  const componentIdentifier = (entryValue(metaEntries, "component") ?? "")
    .trim()
    .replace(/[^\w$.]/g, "");

  const imports = parseImports(text);
  const componentSpecifier = componentIdentifier
    ? (imports.get(componentIdentifier.split(".")[0]) ?? null)
    : null;

  const stories = parseStoryExports(text);
  const excluded = new Set([
    metaIdentifier ?? "meta",
    ...stories.map((story) => story.exportName),
  ]);
  const referenceText = [
    entryValue(metaEntries, "args") ?? "",
    ...stories.map((story) => story.initializer ?? ""),
  ].join("\n");

  if (!stories.length) warnings.push("no named story exports found");

  return {
    storyFile: path.relative(sourceRoot, absPath),
    title: title ?? null,
    titleSegments: title ? title.split("/").filter(Boolean) : [],
    tags: parseStringArray(entryValue(metaEntries, "tags") ?? ""),
    component: componentIdentifier
      ? {
          name: componentIdentifier,
          importSpecifier: componentSpecifier,
          resolvedFile: resolveRelativeImport(
            componentSpecifier,
            absPath,
            sourceRoot,
          ),
        }
      : null,
    metaArgs: truncate(entryValue(metaEntries, "args"), MAX_INITIALIZER),
    controls: parseControls(entryValue(metaEntries, "argTypes")),
    stories,
    fixtures: parseFixtures(text, referenceText, excluded),
    warnings,
  };
}

/* ------------------------------------------------------------------ *
 * Filesystem walking
 * ------------------------------------------------------------------ */

function safeReadDir(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function safeReadJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function isSkippedDir(name) {
  if (IGNORE_DIRS.has(name)) return true;
  return name.startsWith(".") && name !== ".storybook";
}

/** Collect `*.stories.*` files and `.storybook/` dirs in one walk. */
function walkSource(rootAbs) {
  const storyFiles = [];
  const configDirs = [];

  const walk = (dir, depth) => {
    if (depth > MAX_DEPTH) return;
    for (const entry of safeReadDir(dir)) {
      if (entry.isDirectory()) {
        if (isSkippedDir(entry.name)) continue;
        const abs = path.join(dir, entry.name);
        if (entry.name === ".storybook") {
          configDirs.push(abs);
          continue;
        }
        walk(abs, depth + 1);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!STORY_FILE_RE.test(entry.name)) continue;
      if (storyFiles.length >= MAX_STORY_FILES) continue;
      storyFiles.push(path.join(dir, entry.name));
    }
  };

  walk(rootAbs, 0);
  return { storyFiles, configDirs };
}

/** Nearest package.json above `fromAbs`, as `{ name, dir }` or null. */
function findOwningPackage(fromAbs, sourceRoot) {
  let dir = fs.statSync(fromAbs).isDirectory() ? fromAbs : path.dirname(fromAbs);
  const stop = path.dirname(sourceRoot);

  while (dir !== stop && dir !== path.dirname(dir)) {
    const pkgPath = path.join(dir, "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = safeReadJson(pkgPath);
      return {
        name: pkg?.name ?? null,
        dir: path.relative(sourceRoot, dir) || ".",
        storybookScripts: Object.entries(pkg?.scripts ?? {})
          .filter(([key, value]) => /storybook/i.test(`${key}${value}`))
          .map(([key, value]) => `${key}: ${value}`),
      };
    }
    dir = path.dirname(dir);
  }
  return null;
}

function parseStorybookConfig(configDirAbs, sourceRoot) {
  const mainFile = ["main.ts", "main.js", "main.mjs", "main.cjs"]
    .map((name) => path.join(configDirAbs, name))
    .find((abs) => fs.existsSync(abs));

  let framework = null;
  let storiesGlobs = [];

  if (mainFile) {
    const text = stripComments(fs.readFileSync(mainFile, "utf8"));
    const frameworkIndex = text.indexOf("framework:");
    if (frameworkIndex !== -1) {
      const tail = text.slice(frameworkIndex, frameworkIndex + 400);
      framework = tail.match(/["']([^"']*storybook[^"']*)["']/i)?.[1] ?? null;
    }
    const storiesIndex = text.indexOf("stories:");
    if (storiesIndex !== -1) {
      const bracket = text.indexOf("[", storiesIndex);
      const balanced = bracket === -1 ? null : findBalanced(text, bracket);
      storiesGlobs = parseStringArray(balanced?.text ?? "");
    }
  }

  return {
    dir: path.relative(sourceRoot, configDirAbs),
    mainFile: mainFile ? path.relative(sourceRoot, mainFile) : null,
    framework,
    storiesGlobs,
    package: findOwningPackage(configDirAbs, sourceRoot),
  };
}

/**
 * Scan a source root for Storybook facts.
 *
 * `detected` is true only when at least one `*.stories.*` file parsed with a
 * named story export, or a `.storybook/` config dir exists.
 */
export function scanSourceStories(sourceRoot) {
  const { storyFiles, configDirs } = walkSource(sourceRoot);

  const configs = configDirs.map((dir) => parseStorybookConfig(dir, sourceRoot));

  const packagesByDir = new Map();
  const records = [];

  for (const absPath of storyFiles) {
    const record = parseStoryFile({ absPath, sourceRoot });
    if (!record) continue;

    const owner = findOwningPackage(absPath, sourceRoot);
    record.package = owner;
    records.push(record);

    const key = owner?.dir ?? ".";
    if (!packagesByDir.has(key)) {
      packagesByDir.set(key, {
        name: owner?.name ?? null,
        dir: key,
        storybookScripts: owner?.storybookScripts ?? [],
        storyFiles: 0,
        stories: 0,
      });
    }
    const bucket = packagesByDir.get(key);
    bucket.storyFiles += 1;
    bucket.stories += record.stories.length;
  }

  records.sort((a, b) => a.storyFile.localeCompare(b.storyFile));

  const totalStories = records.reduce(
    (sum, record) => sum + record.stories.length,
    0,
  );

  return {
    sourceRoot,
    scannedAt: new Date().toISOString(),
    detected:
      configs.length > 0 || records.some((record) => record.stories.length > 0),
    truncated: storyFiles.length >= MAX_STORY_FILES,
    configs,
    packages: [...packagesByDir.values()].sort((a, b) =>
      a.dir.localeCompare(b.dir),
    ),
    storyFiles: records,
    totals: {
      storyFiles: records.length,
      stories: totalStories,
      packages: packagesByDir.size,
      configs: configs.length,
    },
  };
}

/** Single machine-checkable verdict line for the setup prompt route. */
export function formatStoryScanVerdict(scan) {
  if (!scan.detected) return "STORYBOOK: none";
  const { storyFiles, stories, packages } = scan.totals;
  return `STORYBOOK: detected (${storyFiles} story files, ${stories} stories across ${packages} packages)`;
}
