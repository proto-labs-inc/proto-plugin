#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { readHostConfigArrays } from "./lib/component-library-coverage.mjs";
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

function pickExtractDirs(hostRoot, sourceRoot) {
  const arrays = readHostConfigArrays(hostRoot, ["SYNC_DIRS"]);
  const dirs = arrays.SYNC_DIRS.filter((rel) =>
    /ui|pattern|component|design/i.test(rel),
  );

  const resolved = dirs
    .map((rel) => path.join(sourceRoot, rel))
    .filter((abs) => fs.existsSync(abs));

  if (resolved.length > 0) return resolved;

  const fallbacks = [
    "packages/ui",
    "packages/ui-patterns",
    "packages/ui/src",
  ].map((rel) => path.join(sourceRoot, rel));

  return fallbacks.filter((abs) => fs.existsSync(abs));
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

  const extractDirs = pickExtractDirs(hostRoot, sourceRoot);
  if (extractDirs.length === 0) {
    console.error(
      "BLOCKED: no design-system dirs found under source/. Configure SYNC_DIRS in prototype.sync.config.sh.",
    );
    process.exit(1);
  }

  console.log(
    `Extracting design tokens from ${extractDirs.length} source dir(s) via SkillUI (dir mode, static)...`,
  );

  let ok = true;
  for (const dir of extractDirs) {
    const name = path.basename(dir).replace(/[^a-z0-9-]+/gi, "-");
    console.log(`  → ${path.relative(sourceRoot, dir)}`);
    if (!runSkillUi(hostRoot, dir, outDir, name)) ok = false;
  }

  if (!ok) {
    console.error(
      "WARN: one or more SkillUI extractions failed — continuing with partial output.",
    );
  }

  console.log(`SkillUI output: ${path.relative(hostRoot, outDir)}`);
}

main();
