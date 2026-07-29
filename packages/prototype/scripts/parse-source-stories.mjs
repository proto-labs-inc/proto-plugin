#!/usr/bin/env node
/**
 * Scan the linked source app for Storybook stories and write a facts-only
 * component inventory to `.proto/design-system-stories.json`.
 *
 * This is the detection step behind the design-system setup prompt's component
 * inventory route: the last stdout line is either
 *   STORYBOOK: detected (N story files, M stories across P packages)
 * or
 *   STORYBOOK: none
 *
 * Static text parsing only — the source stays read-only and no Storybook build
 * or install is required. `--source <abs-path>` scans a directory directly, so
 * this can run before `SOURCE_PATH` / the `source/` symlink exist.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveSourceRoot } from "./lib/design-system-evidence.mjs";
import { readHostEnvValue } from "./lib/host-env.mjs";
import { resolveHostRoot } from "./lib/resolve-host-root.mjs";
import {
  formatStoryScanVerdict,
  scanSourceStories,
} from "./lib/source-stories.mjs";

const OUTPUT_RELATIVE_PATH = path.join(".proto", "design-system-stories.json");
const MAX_LISTED_PACKAGES = 12;
const MAX_LISTED_STORY_FILES = 25;

function parseArgs(argv) {
  const options = { source: null, json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--source" || arg === "-s") {
      options.source = argv[i + 1] ?? null;
      i += 1;
    } else if (arg.startsWith("--source=")) {
      options.source = arg.slice("--source=".length);
    } else if (arg === "--json") {
      options.json = true;
    }
  }
  return options;
}

function resolveScanRoot(hostRoot, override) {
  if (override) {
    const abs = path.resolve(override);
    if (!fs.existsSync(abs)) {
      console.error(`BLOCKED: --source path does not exist: ${abs}`);
      process.exit(1);
    }
    return { root: fs.realpathSync(abs), via: "--source" };
  }

  const linked = resolveSourceRoot(hostRoot);
  if (linked) return { root: linked, via: "source/ symlink" };

  const fromEnv = readHostEnvValue(hostRoot, "SOURCE_PATH");
  if (fromEnv && fs.existsSync(fromEnv)) {
    return { root: fs.realpathSync(fromEnv), via: "SOURCE_PATH" };
  }

  return { root: null, via: null };
}

function printSummary(scan, hostRoot, outputPath) {
  if (scan.configs.length) {
    console.log("Storybook config:");
    for (const config of scan.configs) {
      const framework = config.framework ?? "unknown framework";
      const owner = config.package?.name ? ` [${config.package.name}]` : "";
      console.log(`  - ${config.dir} (${framework})${owner}`);
      for (const script of config.package?.storybookScripts ?? []) {
        console.log(`      run: ${script}`);
      }
    }
    console.log("");
  }

  if (scan.packages.length) {
    console.log("Packages with stories:");
    for (const pkg of scan.packages.slice(0, MAX_LISTED_PACKAGES)) {
      console.log(
        `  - ${pkg.name ?? pkg.dir} @ ${pkg.dir} — ${pkg.storyFiles} files, ${pkg.stories} stories`,
      );
    }
    if (scan.packages.length > MAX_LISTED_PACKAGES) {
      console.log(`  … ${scan.packages.length - MAX_LISTED_PACKAGES} more`);
    }
    console.log("");
  }

  if (scan.storyFiles.length) {
    console.log("Components (story title → component → story exports):");
    for (const record of scan.storyFiles.slice(0, MAX_LISTED_STORY_FILES)) {
      const title = record.title ?? "(untitled)";
      const component = record.component?.name ?? "(no component)";
      const exports = record.stories.map((story) => story.exportName);
      const shown = exports.slice(0, 6).join(", ");
      const more = exports.length > 6 ? `, +${exports.length - 6}` : "";
      console.log(`  - ${title} → ${component} → ${shown || "(none)"}${more}`);
    }
    if (scan.storyFiles.length > MAX_LISTED_STORY_FILES) {
      console.log(
        `  … ${scan.storyFiles.length - MAX_LISTED_STORY_FILES} more (see ${OUTPUT_RELATIVE_PATH})`,
      );
    }
    console.log("");
  }

  if (scan.truncated) {
    console.log(
      "WARN: story file cap reached — the inventory is a partial sample.",
    );
  }

  console.log(`Inventory: ${path.relative(hostRoot, outputPath)}`);
}

function main() {
  const toolRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const hostRoot = resolveHostRoot(toolRoot);
  const options = parseArgs(process.argv.slice(2));
  const { root: scanRoot, via } = resolveScanRoot(hostRoot, options.source);

  if (!scanRoot) {
    console.error(
      "BLOCKED: no source to scan. Run pnpm link-source (or pass --source <abs-path>).",
    );
    process.exit(1);
  }

  console.log(`Scanning ${scanRoot} for Storybook stories (via ${via})...`);
  console.log("");

  const scan = scanSourceStories(scanRoot);
  const outputPath = path.join(hostRoot, OUTPUT_RELATIVE_PATH);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(scan, null, 2)}\n`, "utf8");

  if (options.json) {
    console.log(JSON.stringify(scan.totals, null, 2));
    console.log("");
  }

  if (scan.detected) {
    printSummary(scan, hostRoot, outputPath);
  } else {
    console.log(
      "No `*.stories.*` files and no `.storybook/` config found in the source.",
    );
    console.log(
      "Helper files such as `_storybookData.ts` do not count — a removed Storybook stays removed.",
    );
    console.log("");
    console.log(`Inventory: ${path.relative(hostRoot, outputPath)}`);
  }

  console.log("");
  console.log(formatStoryScanVerdict(scan));
}

main();
