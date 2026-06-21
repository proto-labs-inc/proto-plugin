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
}

if (failed) {
  process.exit(1);
}

console.log("Prototype preview state verification passed.");
