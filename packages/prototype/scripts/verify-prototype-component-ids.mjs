#!/usr/bin/env node
/**
 * Ensures every UI component under src/prototypes/{slug}/ is registered in
 * component-ids.ts and wraps its root JSX with PrototypeTarget/PrototypeComponent/PrototypeControl.
 */
import fs from "node:fs";
import path from "node:path";
import {
  resolveHostRoot,
  resolveToolRoot,
} from "./lib/resolve-host-root.mjs";

const toolRoot = resolveToolRoot(import.meta.url);
const repoRoot = resolveHostRoot(toolRoot);
const prototypesDir = path.join(repoRoot, "src/prototypes");

function kebabCase(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}

function listPrototypeSlugs() {
  return fs
    .readdirSync(prototypesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name);
}

function readRegistryIds(slug) {
  const registryPath = path.join(prototypesDir, slug, "component-ids.ts");
  if (!fs.existsSync(registryPath)) {
    return null;
  }
  const source = fs.readFileSync(registryPath, "utf8");
  const match = source.match(
    /(?:COMPONENT_IDS|\w+_COMPONENT_IDS)\s*=\s*\[([\s\S]*?)\]\s*as\s*const/,
  );
  if (!match) return null;
  const ids = [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  const prefixMatch = source.match(
    /DYNAMIC_TARGET_PREFIXES\s*=\s*\[([\s\S]*?)\]\s*as\s*const/,
  );
  const prefixes = prefixMatch
    ? [...prefixMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1])
    : [];
  return { ids: new Set(ids), prefixes };
}

function collectTsxFiles(slug) {
  const root = path.join(prototypesDir, slug);
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".tsx")) files.push(full);
    }
  }
  walk(root);
  return files;
}

function fileBaseId(filePath, slug) {
  const rel = path.relative(path.join(prototypesDir, slug), filePath);
  const base = path.basename(rel, ".tsx");
  if (base === "index") return "page";
  return kebabCase(base);
}

function findRenderableComponents(source, fileBase) {
  const components = [];
  const fnRegex =
    /export\s+function\s+([A-Z][A-Za-z0-9]*)\s*\([^)]*\)\s*\{/g;
  let m;
  while ((m = fnRegex.exec(source)) !== null) {
    const name = m[1];
    const segment =
      name === fileBase.replace(/-/g, "") ||
      kebabCase(name) === fileBase
        ? fileBase
        : `${fileBase}.${kebabCase(name)}`;
    components.push({ name, expectedId: segment });
  }

  const defaultExport = /export\s+default\s+function\s+([A-Z][A-Za-z0-9]*)/.exec(
    source,
  );
  if (defaultExport) {
    components.push({ name: defaultExport[1], expectedId: "page" });
  }

  return components;
}

function hasTargetWrapper(source) {
  return (
    source.includes("PrototypeTarget") ||
    source.includes("PrototypeComponent") ||
    source.includes("PrototypeControl")
  );
}

let failed = false;

for (const slug of listPrototypeSlugs()) {
  const registry = readRegistryIds(slug);
  if (!registry) {
    console.error(`[${slug}] Missing component-ids.ts`);
    failed = true;
    continue;
  }

  for (const file of collectTsxFiles(slug)) {
    if (file.endsWith("component-ids.ts")) continue;
    if (file.includes(`${path.sep}ui${path.sep}`)) continue;
    if (file.includes(`${path.sep}_server${path.sep}`)) continue;

    const source = fs.readFileSync(file, "utf8");
    const fileBase = fileBaseId(file, slug);
    const components = findRenderableComponents(source, fileBase);

    if (components.length === 0) continue;

    if (!hasTargetWrapper(source)) {
      console.error(
        `[${slug}] ${path.relative(repoRoot, file)}: no PrototypeTarget/PrototypeComponent/PrototypeControl wrapper`,
      );
      failed = true;
    }

    for (const { name, expectedId } of components) {
      const allowed =
        registry.ids.has(expectedId) ||
        registry.prefixes.some((p) => expectedId.startsWith(p));
      if (!allowed) {
        console.error(
          `[${slug}] ${name} in ${path.basename(file)}: expected registry id "${expectedId}"`,
        );
        failed = true;
      }
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log("Prototype component id verification passed.");
