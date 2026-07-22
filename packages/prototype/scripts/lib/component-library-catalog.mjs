import fs from "node:fs";
import path from "node:path";

import {
  findComponentSourceFile,
  resolveImportInfoFromProfile,
} from "./design-system-packages.mjs";
import { deriveAliasPrefix, findPackage } from "./design-system-profile.mjs";

const CONTEXT_PROPS = [
  "router",
  "auth",
  "session",
  "formcontext",
  "useform",
  "theme",
  "cmdk",
];

const STATEFUL_PROP_PAIRS = [
  ["open", "onOpenChange"],
  ["visible", "onVisibleChange"],
  ["value", "onValueChange"],
  ["checked", "onCheckedChange"],
];

/** Parse `cva(..., { variants: { variant: { primary: ... } } })` variant keys. */
export function parseCvaVariants(sourceText) {
  const variants = {};
  const cvaMatches = [...sourceText.matchAll(/const\s+(\w+)\s*=\s*cva\s*\(/g)];
  for (const match of cvaMatches) {
    const start = match.index ?? 0;
    const chunk = sourceText.slice(start, start + 12000);
    for (const groupMatch of chunk.matchAll(
      /(\w+)\s*:\s*\{([\s\S]*?)\n\s*\},?\s*(?=\n\s*\w+\s*:|defaultVariants|\}\s*\))/g,
    )) {
      const groupName = groupMatch[1];
      if (groupName === "variants") continue;
      const inner = groupMatch[2];
      const keys = [...inner.matchAll(/^\s+(\w+)\s*:/gm)].map((m) => m[1]);
      if (keys.length) variants[groupName] = keys;
    }
  }
  return variants;
}

/** Lightweight prop extraction when react-docgen-typescript is unavailable. */
export function parsePropsFallback(sourceText, componentName) {
  const props = [];
  const typeMatch = sourceText.match(
    new RegExp(
      `(?:type|interface)\\s+${componentName}Props\\s*=\\s*\\{([\\s\\S]*?)\\}`,
    ),
  );
  if (!typeMatch) return props;

  const body = typeMatch[1];
  for (const line of body.split("\n")) {
    const m = line.match(/^\s*(\w+)(\?)?:\s*([^;]+)/);
    if (!m) continue;
    props.push({
      name: m[1],
      required: !m[2],
      type: { name: m[3].trim() },
    });
  }
  return props;
}

export async function parsePropsWithDocgen(sourceFile, componentName) {
  try {
    const { createRequire } = await import("node:module");
    const req = createRequire(import.meta.url);
    const docgen = req("react-docgen-typescript");
    const ts = req("typescript");
    const options = {
      savePropValueAsString: true,
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent?.fileName.includes("node_modules") === false,
    };
    const parser = docgen.withCustomConfig(
      path.join(path.dirname(sourceFile), "..", "..", "..", "tsconfig.json"),
      options,
    );
    const docs = parser.parse(sourceFile);
    const doc =
      docs.find((d) => d.displayName === componentName) ?? docs[0];
    if (!doc?.props) return parsePropsFallback(fs.readFileSync(sourceFile, "utf8"), componentName);

    return Object.entries(doc.props).map(([name, prop]) => ({
      name,
      required: prop.required ?? false,
      type: { name: prop.type?.name ?? "unknown" },
      enumValues: prop.type?.value?.map((v) => v.value?.replace(/'/g, "")),
    }));
  } catch {
    if (!sourceFile || !fs.existsSync(sourceFile)) return [];
    return parsePropsFallback(
      fs.readFileSync(sourceFile, "utf8"),
      componentName,
    );
  }
}

function collectSearchFiles(dir, acc, depth = 0) {
  if (depth > 6) return;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectSearchFiles(full, acc, depth + 1);
    else if (/\.(tsx|jsx|stories\.tsx|stories\.jsx)$/.test(entry.name)) {
      acc.push(full);
    }
  }
}

/** Lift a JSX snippet using `<ComponentName` from stories or app code. */
export function mineComponentUsage(componentName, searchRoots) {
  const openRe = new RegExp(`<${componentName}\\b`, "m");
  const files = [];
  for (const root of searchRoots) {
    if (!root || !fs.existsSync(root)) continue;
    collectSearchFiles(root, files);
  }

  files.sort((a, b) => {
    const aStory = a.includes(".stories.") ? -1 : 1;
    const bStory = b.includes(".stories.") ? -1 : 1;
    return aStory - bStory;
  });

  for (const file of files.slice(0, 500)) {
    const text = fs.readFileSync(file, "utf8");
    const openMatch = text.match(openRe);
    if (!openMatch) continue;
    const start = openMatch.index ?? 0;
    const snippet = extractBalancedJsx(text, start, componentName);
    if (!snippet) continue;
    if (!isScaffoldSafeSnippet(snippet)) continue;
    return {
      snippet: snippet.slice(0, 800),
      source: path.relative(searchRoots[0] ?? "", file),
      kind: file.includes(".stories.") ? "story" : "usage",
    };
  }
  return null;
}

function extractBalancedJsx(text, start, componentName) {
  const selfClose = new RegExp(`<${componentName}\\b[^>]*\\/\\>`, "s");
  const slice = text.slice(start, start + 2000);
  const selfMatch = slice.match(selfClose);
  if (selfMatch) return selfMatch[0];

  const closeTag = `</${componentName}>`;
  const end = slice.indexOf(closeTag);
  if (end === -1) return null;
  return slice.slice(0, end + closeTag.length);
}

function isScaffoldSafeSnippet(snippet) {
  if (/\{/.test(snippet)) return false;
  if (/\bon[A-Z]\w*\s*=/.test(snippet)) return false;
  return true;
}

function detectContextNeeds(sourceText, props) {
  const lower = sourceText.toLowerCase();
  if (CONTEXT_PROPS.some((token) => lower.includes(token))) return true;
  return props.some((p) =>
    /form|router|auth|theme|cmdk/i.test(p.name + (p.type?.name ?? "")),
  );
}

function detectStatefulProps(props) {
  const names = new Set(props.map((p) => p.name));
  return STATEFUL_PROP_PAIRS.filter(
    ([a, b]) => names.has(a) && names.has(b),
  );
}

/**
 * Classify how the HYBRID engine handles an entry:
 *   "authored" — agent must write the preview body in component-library-overrides.tsx
 *                (context-bound, needs composition, or profile-declared authored).
 *   "engine"   — the deterministic engine can emit a safe preview (cva variants,
 *                enum props, a mined story snippet, or no unsatisfied required props).
 *   "skip"     — profile-declared non-visual export.
 *
 * The old quality buckets (good/degenerate/needs-override/throws) are gone: the
 * engine either renders a component safely or hands it to the agent. There is no
 * "engine fakes a degenerate preview" path — that was the silent-failure hazard.
 */
export function classifyCatalogEntry(entry) {
  if (entry.profileSkip) return "skip";
  if (entry.profileAuthored) return "authored";
  if (entry.contextBound) return "authored";
  if (entry.minedUsage?.kind === "story") return "engine";
  if (entry.cvaVariants && Object.keys(entry.cvaVariants).length > 0) {
    return "engine";
  }
  // Enum-only previews are safe for the engine.
  if ((entry.props ?? []).some((p) => p.enumValues?.length)) return "engine";
  const requiredUnsatisfied = (entry.requiredProps ?? []).length > 0;
  if (requiredUnsatisfied) return "authored";
  // No required props + no context → a bare <Component/> is safe enough.
  return "engine";
}

function aliasPrefixFor(profile, packageName) {
  if (!packageName) return null;
  const pkg = findPackage(profile, packageName);
  return pkg?.aliasPrefix ?? deriveAliasPrefix(packageName);
}

/**
 * Compute de-collision aliases: any export name present in >1 distinct package
 * gets a per-package alias (`CossButton` / `CalcomButton`). Returns a Map keyed
 * by `${packageName}::${name}` -> alias string.
 */
function computeCollisionAliases(profile, enumerated) {
  const packagesByName = new Map(); // name -> Set(packageName)
  for (const item of enumerated) {
    if (!item.package) continue;
    if (!packagesByName.has(item.name)) packagesByName.set(item.name, new Set());
    packagesByName.get(item.name).add(item.package);
  }

  const aliases = new Map();
  for (const item of enumerated) {
    const packages = packagesByName.get(item.name);
    if (!packages || packages.size < 2 || !item.package) continue;
    const prefix = aliasPrefixFor(profile, item.package);
    if (!prefix) continue;
    aliases.set(`${item.package}::${item.name}`, `${prefix}${item.name}`);
  }
  return aliases;
}

export async function buildCatalogEntry({
  hostRoot,
  profile,
  section,
  record,
  root,
  searchRoots,
  aliasName,
  profileAuthored,
  profileSkip,
}) {
  const sourceFile = findComponentSourceFile(root.abs, record);
  const sourceText = sourceFile ? fs.readFileSync(sourceFile, "utf8") : "";
  const props = sourceFile
    ? await parsePropsWithDocgen(sourceFile, record.name)
    : [];
  const cvaVariants = parseCvaVariants(sourceText);
  const minedUsage = mineComponentUsage(record.name, searchRoots);
  const importInfo = resolveImportInfoFromProfile({
    profile,
    section,
    rootRel: root.rel,
    record,
    aliasName,
  });
  const requiredProps = props.filter((p) => p.required);
  const statefulPairs = detectStatefulProps(props);
  const contextBound = detectContextNeeds(sourceText, props);

  const entry = {
    name: record.name,
    kebab: record.kebab,
    section,
    root: root.rel,
    package: root.package ?? null,
    importInfo,
    sourceFile: sourceFile ? path.relative(hostRoot, sourceFile) : null,
    props,
    cvaVariants,
    minedUsage,
    requiredProps: requiredProps.map((p) => p.name),
    statefulPairs,
    contextBound,
    profileAuthored: Boolean(profileAuthored),
    profileSkip: profileSkip ?? null,
  };
  entry.classification = classifyCatalogEntry(entry);
  return entry;
}

export async function buildCatalog(hostRoot, primitiveRoots, compositeRoots, profile) {
  const { enumerateComponents } = await import(
    "./component-library-coverage.mjs"
  );

  const sourceLink = path.join(hostRoot, "source");
  const searchRoots = [
    sourceLink,
    hostRoot,
    ...primitiveRoots.map((r) => r.abs),
    ...compositeRoots.map((r) => r.abs),
  ].filter((p) => fs.existsSync(p));

  const authoredSet = new Set(profile?.authored ?? []);
  const skipMap = new Map(
    (profile?.skips ?? []).map((s) => [s.name, s]),
  );

  // Enumerate everything first so we can detect cross-package name collisions.
  const enumerated = [];
  for (const [sectionRoots, section] of [
    [primitiveRoots, "primitive"],
    [compositeRoots, "composite"],
  ]) {
    for (const root of sectionRoots) {
      for (const record of enumerateComponents(root.abs)) {
        enumerated.push({ section, root, record, name: record.name, package: root.package ?? null });
      }
    }
  }

  const aliases = computeCollisionAliases(profile, enumerated);

  const entries = [];
  for (const item of enumerated) {
    entries.push(
      await buildCatalogEntry({
        hostRoot,
        profile,
        section: item.section,
        record: item.record,
        root: item.root,
        searchRoots,
        aliasName: aliases.get(`${item.package}::${item.name}`) ?? null,
        profileAuthored: authoredSet.has(item.name),
        profileSkip: skipMap.get(item.name) ?? null,
      }),
    );
  }

  return entries;
}
