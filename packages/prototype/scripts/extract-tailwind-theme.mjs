#!/usr/bin/env node
/**
 * Extract host-safe Tailwind v4 @theme registration CSS from a source theme file.
 *
 * Usage:
 *   node node_modules/proto-plugin/scripts/extract-tailwind-theme.mjs \
 *     --input source/packages/config/theme/tokens.css \
 *     --out src/styles/product-tailwind-theme.css
 *
 * Then @import the output from host src/app/globals.css.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildHostSafeThemeCss } from "./lib/extract-tailwind-theme.mjs";
import { resolveHostRoot } from "./lib/resolve-host-root.mjs";

function usage() {
  console.log(`Usage: node extract-tailwind-theme.mjs --input <css> [--input <css>...] --out <path>

Extract @theme / @theme inline blocks from source CSS into a host-safe registration
sheet (strips @plugin / @config / @source that break the host build).

Options:
  --input <path>   Source CSS file (repeatable). Relative paths resolve from host root.
  --out <path>     Output path (relative to host root or absolute).
  -h, --help       Show help
`);
}

function parseArgs(argv) {
  const inputs = [];
  let out = "";
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") return { help: true };
    if (arg === "--input") {
      inputs.push(argv[++i] ?? "");
      continue;
    }
    if (arg === "--out") {
      out = argv[++i] ?? "";
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return { inputs, out, help: false };
}

function resolvePath(hostRoot, p) {
  if (!p) return "";
  return path.isAbsolute(p) ? p : path.join(hostRoot, p);
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(String(error?.message ?? error));
    usage();
    process.exit(1);
  }

  if (args.help) {
    usage();
    process.exit(0);
  }

  if (!args.inputs.length || !args.out) {
    console.error("Required: --input <css> and --out <path>");
    usage();
    process.exit(1);
  }

  const toolRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const hostRoot = resolveHostRoot(toolRoot);

  const cssParts = [];
  for (const input of args.inputs) {
    const abs = resolvePath(hostRoot, input);
    if (!fs.existsSync(abs)) {
      console.error(`Input not found: ${abs}`);
      process.exit(1);
    }
    cssParts.push(fs.readFileSync(abs, "utf8"));
  }

  const body = buildHostSafeThemeCss(cssParts);
  if (!body.trim()) {
    console.error(
      "No @theme / @theme inline blocks found in the given input(s).",
    );
    console.error(
      "If the source uses Tailwind v3, convert theme.extend into a @theme inline block first.",
    );
    process.exit(1);
  }

  const outAbs = resolvePath(hostRoot, args.out);
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });
  fs.writeFileSync(outAbs, body, "utf8");
  console.log(`Wrote host-safe @theme registration → ${outAbs}`);
  console.log(
    "Next: @import this file from src/app/globals.css (alongside the token VALUES sheet).",
  );
}

main();
