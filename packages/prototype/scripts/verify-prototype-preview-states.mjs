#!/usr/bin/env node
/**
 * Ensures each prototype with a state map uses a single *-preview-states.ts
 * registry that both the picker and canvas config import from.
 *
 * Runtime 1:1 parity (labels, variants, counts) is enforced when the registry
 * module loads via definePreviewStateRegistry().
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
const prototypeConfigPath = path.join(repoRoot, "prototype.config.ts");

function readPrototypeConfigSource() {
  if (!fs.existsSync(prototypeConfigPath)) {
    return null;
  }
  return fs.readFileSync(prototypeConfigPath, "utf8");
}

function prototypeConfigBlockHasStateMapComponent(slug, configSource) {
  const slugMarker = `slug: "${slug}"`;
  const slugIndex = configSource.indexOf(slugMarker);
  if (slugIndex === -1) return false;

  const nextSlugIndex = configSource.indexOf('slug: "', slugIndex + slugMarker.length);
  const block =
    nextSlugIndex === -1
      ? configSource.slice(slugIndex)
      : configSource.slice(slugIndex, nextSlugIndex);

  return block.includes("stateMapComponent");
}

function findStateMapPageFiles(slug) {
  const stateMapPagePath = path.join(prototypesDir, slug, "state-map-page.tsx");
  return fs.existsSync(stateMapPagePath) ? [stateMapPagePath] : [];
}

function indexUsesStateCanvasConfig(slug) {
  const indexPath = path.join(prototypesDir, slug, "index.tsx");
  if (!fs.existsSync(indexPath)) return false;
  const source = fs.readFileSync(indexPath, "utf8");
  return source.includes("setStateCanvasConfig");
}

function listPrototypeSlugs() {
  return fs
    .readdirSync(prototypesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name);
}

function walkFiles(dir, predicate) {
  const files = [];

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (predicate(full, entry.name)) files.push(full);
    }
  }

  walk(dir);
  return files;
}

function findPreviewStateFiles(slug) {
  return walkFiles(
    path.join(prototypesDir, slug),
    (_full, name) => name.endsWith("-preview-states.ts"),
  );
}

function findStateCanvasConfigFiles(slug) {
  return walkFiles(
    path.join(prototypesDir, slug),
    (_full, name) => name.endsWith("-state-canvas-config.tsx"),
  );
}

function findStateSelectFiles(slug) {
  return walkFiles(
    path.join(prototypesDir, slug),
    (_full, name) =>
      name.endsWith(".tsx") &&
      (name.includes("state-select") || name.includes("tab-select")),
  );
}

function fileUsesPreviewStateRegistry(filePath, registryBasename) {
  const source = fs.readFileSync(filePath, "utf8");
  const registryModule = registryBasename.replace(/\.ts$/, "");
  return (
    source.includes(registryModule) ||
    source.includes("PREVIEW_STATE_REGISTRY") ||
    source.includes("_PREVIEW_OPTIONS")
  );
}

let failed = false;

for (const slug of listPrototypeSlugs()) {
  const previewStateFiles = findPreviewStateFiles(slug);
  const canvasConfigFiles = findStateCanvasConfigFiles(slug);
  const stateSelectFiles = findStateSelectFiles(slug);

  if (canvasConfigFiles.length > 0 && previewStateFiles.length === 0) {
    console.error(
      `[${slug}] Has state canvas config but no *-preview-states.ts registry.`,
    );
    failed = true;
    continue;
  }

  if (previewStateFiles.length === 0) {
    continue;
  }

  if (previewStateFiles.length > 1) {
    console.error(
      `[${slug}] Expected one *-preview-states.ts file, found ${previewStateFiles.length}.`,
    );
    failed = true;
  }

  const registryFile = previewStateFiles[0];
  const registryBasename = path.basename(registryFile);
  const registrySource = fs.readFileSync(registryFile, "utf8");

  if (!registrySource.includes("definePreviewStateRegistry")) {
    console.error(
      `[${slug}] ${path.relative(repoRoot, registryFile)} must call definePreviewStateRegistry().`,
    );
    failed = true;
  }

  for (const file of canvasConfigFiles) {
    if (!fileUsesPreviewStateRegistry(file, registryBasename)) {
      console.error(
        `[${slug}] ${path.relative(repoRoot, file)} must import preview states from ${registryBasename}.`,
      );
      failed = true;
    }
  }

  for (const file of stateSelectFiles) {
    if (!fileUsesPreviewStateRegistry(file, registryBasename)) {
      console.error(
        `[${slug}] ${path.relative(repoRoot, file)} must import preview states from ${registryBasename}.`,
      );
      failed = true;
    }
  }

  const stateMapPageFiles = findStateMapPageFiles(slug);
  if (stateMapPageFiles.length === 0) {
    console.error(
      `[${slug}] Has *-preview-states.ts but no state-map-page.tsx. Add src/prototypes/${slug}/state-map-page.tsx and register stateMapComponent in prototype.config.ts.`,
    );
    failed = true;
  }

  const configSource = readPrototypeConfigSource();
  if (configSource && !prototypeConfigBlockHasStateMapComponent(slug, configSource)) {
    console.error(
      `[${slug}] Has *-preview-states.ts but prototype.config.ts is missing stateMapComponent for this slug.`,
    );
    failed = true;
  }

  if (!indexUsesStateCanvasConfig(slug)) {
    console.error(
      `[${slug}] Has *-preview-states.ts but index.tsx does not wire review.setStateCanvasConfig(...).`,
    );
    failed = true;
  }

  const indexPath = path.join(prototypesDir, slug, "index.tsx");
  if (fs.existsSync(indexPath)) {
    const indexSource = fs.readFileSync(indexPath, "utf8");
    if (!indexSource.includes("useSyncPrototypePreviewStateToUrl")) {
      console.error(
        `[${slug}] Has *-preview-states.ts but index.tsx does not call useSyncPrototypePreviewStateToUrl(...). Every preview mode must sync to ?state=<id>. See packages/prototype/AGENTS.md → URL state sync.`,
      );
      failed = true;
    }
  }

  for (const stateMapPage of stateMapPageFiles) {
    const stateMapSource = fs.readFileSync(stateMapPage, "utf8");
    if (
      !stateMapSource.includes("PREVIEW_STATE_PARAM") &&
      !stateMapSource.includes('searchParams.set("state"')
    ) {
      console.error(
        `[${slug}] ${path.relative(repoRoot, stateMapPage)} must navigate with ?state=<id> (PREVIEW_STATE_PARAM), not shareState. See packages/prototype/AGENTS.md → URL state sync.`,
      );
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log("Prototype preview state verification passed.");
