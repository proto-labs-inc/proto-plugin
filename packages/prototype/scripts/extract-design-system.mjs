#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { readHostConfigArrays } from "./lib/component-library-coverage.mjs";
import {
  buildDesignSystemTokenManifest,
  validateManifestForScaffold,
  writeDesignSystemTokenManifest,
} from "./lib/design-system-token-manifest.mjs";
import { resolveHostRoot } from "./lib/resolve-host-root.mjs";

function resolveSourceRoot(hostRoot) {
  const link = path.join(hostRoot, "source");
  if (fs.existsSync(link)) {
    try {
      const stat = fs.lstatSync(link);
      if (stat.isSymbolicLink() || stat.isDirectory()) {
        return fs.realpathSync(link);
      }
    } catch {
      // fall through
    }
  }
  return null;
}

function pickTokenExtractDir(hostRoot, sourceRoot) {
  const arrays = readHostConfigArrays(hostRoot, ["SYNC_FILES", "SYNC_DIRS"]);
  const cssFiles = arrays.SYNC_FILES.filter((rel) =>
    /\.(css|scss)$/i.test(rel),
  )
    .map((rel) => path.join(sourceRoot, rel))
    .filter((abs) => fs.existsSync(abs));

  if (cssFiles.length > 0) {
    return path.dirname(cssFiles[0]);
  }

  const tokenDirs = arrays.SYNC_DIRS.filter((rel) =>
    /config|theme|styles|tokens/i.test(rel),
  )
    .map((rel) => path.join(sourceRoot, rel))
    .filter((abs) => fs.existsSync(abs));

  if (tokenDirs.length > 0) return tokenDirs[0];

  const fallbacks = [
    "packages/ui/src",
    "packages/ui",
    "packages/config",
    "packages/config/theme",
    "apps/web/styles",
    "src/styles",
  ].map((rel) => path.join(sourceRoot, rel));

  for (const candidate of fallbacks) {
    if (fs.existsSync(candidate)) return candidate;
  }

  const hostGlobals = path.join(hostRoot, "src", "app", "globals.css");
  if (fs.existsSync(hostGlobals)) {
    return path.dirname(hostGlobals);
  }

  return sourceRoot;
}

function runSkillUi(hostRoot, dir, outDir, name) {
  const result = spawnSync(
    "npx",
    [
      "--yes",
      "skillui@1.3.4",
      "--dir",
      dir,
      "--out",
      outDir,
      "--name",
      name,
      "--format",
      "both",
    ],
    { cwd: hostRoot, stdio: "inherit", env: process.env },
  );
  return result.status === 0;
}

function consolidateSkillUiTokens(outDir) {
  const targetTokensDir = path.join(outDir, "tokens");
  fs.mkdirSync(targetTokensDir, { recursive: true });

  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "tokens" && full !== targetTokensDir) {
          for (const file of fs.readdirSync(full)) {
            if (file.endsWith(".json")) {
              fs.copyFileSync(
                path.join(full, file),
                path.join(targetTokensDir, file),
              );
            }
          }
        } else {
          walk(full);
        }
      }
    }
  }

  walk(outDir);

  // Keep DESIGN.md / .skill packages for agent reference; only remove duplicate token dirs.
  for (const entry of fs.readdirSync(outDir, { withFileTypes: true })) {
    if (entry.name === "tokens") continue;
    if (entry.isDirectory() && entry.name.endsWith("-design")) continue;
    if (entry.isFile() && entry.name.endsWith(".skill")) continue;
    fs.rmSync(path.join(outDir, entry.name), { recursive: true, force: true });
  }
}

function writeColorsJsonFromManifest(hostRoot, manifest) {
  const colorsPath = path.join(hostRoot, ".skillui", "tokens", "colors.json");
  fs.mkdirSync(path.dirname(colorsPath), { recursive: true });
  const colors = manifest.swatches.map((swatch) => ({
    name: swatch.role,
    variable: swatch.sourceVar,
    format: swatch.format,
  }));
  fs.writeFileSync(colorsPath, `${JSON.stringify(colors, null, 2)}\n`, "utf8");
  return colorsPath;
}

function main() {
  const toolRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const hostRoot = resolveHostRoot(toolRoot);
  const sourceRoot = resolveSourceRoot(hostRoot);

  if (!sourceRoot) {
    console.error(
      "BLOCKED: source/ symlink not found. Run pnpm link-source first.",
    );
    process.exit(1);
  }

  const outDir = path.join(hostRoot, ".skillui");
  fs.mkdirSync(outDir, { recursive: true });

  const extractDir = pickTokenExtractDir(hostRoot, sourceRoot);
  const name = path.basename(extractDir).replace(/[^a-z0-9-]+/gi, "-") || "tokens";

  console.log(
    `Extracting SkillUI tokens from ${path.relative(sourceRoot, extractDir)} (static, tokens only)...`,
  );

  if (!runSkillUi(hostRoot, extractDir, outDir, name)) {
    console.warn(
      "WARN: SkillUI CLI failed — continuing with CSS-derived token manifest.",
    );
  }

  consolidateSkillUiTokens(outDir);

  const manifest = buildDesignSystemTokenManifest(hostRoot);
  const manifestErrors = validateManifestForScaffold(manifest);
  if (manifestErrors.length) {
    console.error("BLOCKED: could not build a usable design-system token manifest.");
    for (const error of manifestErrors) {
      console.error(`- ${error}`);
    }
    console.error(
      "Sync source token CSS into the host (see AGENTS.md) and ensure :root / .dark declarations are @imported from src/app/globals.css.",
    );
    process.exit(1);
  }

  const manifestPath = writeDesignSystemTokenManifest(hostRoot, manifest);
  const colorsPath = writeColorsJsonFromManifest(hostRoot, manifest);

  console.log(
    `Token manifest: ${path.relative(hostRoot, manifestPath)} (${manifest.swatches.length} swatches)`,
  );
  console.log(`SkillUI colors: ${path.relative(hostRoot, colorsPath)}`);
}

main();
