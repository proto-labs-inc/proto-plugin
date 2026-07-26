#!/usr/bin/env node
/**
 * Verify the host registered Tailwind utility tokens for the linked source's
 * @theme layer — not only the CSS custom-property VALUES.
 *
 * Failure mode this catches: source defines `--cal-bg-subtle` (values) and
 * `@theme { --color-subtle: var(--cal-bg-subtle) }` (registration), but the host
 * only synced values. Classes like `bg-subtle` then silently emit no CSS.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  collectThemeTokenNames,
  extractTailwindThemeBlocks,
} from "./lib/extract-tailwind-theme.mjs";
import { readHostEnvValue } from "./lib/host-env.mjs";
import { resolveHostRoot } from "./lib/resolve-host-root.mjs";

const SOURCE_THEME_CANDIDATES = [
  "packages/config/theme/tokens.css",
  "packages/config/tailwind.config.css",
  "packages/ui/src/styles/globals.css",
  "apps/web/styles/globals.css",
  "apps/web/app/globals.css",
  "src/styles/globals.css",
  "src/app/globals.css",
  "styles/globals.css",
];

function resolveSourceRoot(hostRoot) {
  const symlink = path.join(hostRoot, "source");
  try {
    if (fs.lstatSync(symlink).isSymbolicLink()) {
      return fs.realpathSync(symlink);
    }
  } catch {
    // fall through
  }
  const raw = readHostEnvValue(hostRoot, "SOURCE_PATH");
  if (raw && fs.existsSync(raw)) return path.resolve(raw);
  return null;
}

function readCssImportGraph(entryPath, seen = new Set()) {
  const abs = path.resolve(entryPath);
  if (seen.has(abs) || !fs.existsSync(abs)) return "";
  seen.add(abs);
  let css = fs.readFileSync(abs, "utf8");
  const importRe = /@import\s+(?:url\()?["']([^"']+)["']\)?[^;]*;/g;
  let m;
  const chunks = [css];
  while ((m = importRe.exec(css)) !== null) {
    const spec = m[1];
    if (spec.startsWith("tailwindcss") || spec.startsWith("tw-")) continue;
    const child = path.resolve(path.dirname(abs), spec);
    chunks.push(readCssImportGraph(child, seen));
  }
  return chunks.join("\n");
}

function findSourceThemeCss(sourceRoot) {
  const parts = [];
  for (const rel of SOURCE_THEME_CANDIDATES) {
    const abs = path.join(sourceRoot, rel);
    if (!fs.existsSync(abs)) continue;
    const css = fs.readFileSync(abs, "utf8");
    if (extractTailwindThemeBlocks(css)) {
      parts.push({ path: abs, css });
    }
  }
  // Also scan shallow packages/*/src/**/*.css for @theme if candidates miss
  if (!parts.length) {
    const packagesDir = path.join(sourceRoot, "packages");
    if (fs.existsSync(packagesDir)) {
      walkCssForTheme(packagesDir, parts, 0, 4);
    }
  }
  return parts;
}

function walkCssForTheme(dir, out, depth, maxDepth) {
  if (depth > maxDepth || out.length >= 5) return;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkCssForTheme(abs, out, depth + 1, maxDepth);
      continue;
    }
    if (!entry.name.endsWith(".css")) continue;
    try {
      const css = fs.readFileSync(abs, "utf8");
      if (extractTailwindThemeBlocks(css)) {
        out.push({ path: abs, css });
      }
    } catch {
      // skip unreadable
    }
  }
}

/** Product-ish theme keys — ignore generic shadcn overlaps when scoring coverage. */
function isProductThemeKey(name) {
  if (name.startsWith("shadow-") || name.startsWith("fill-")) return true;
  if (name.startsWith("text-color-") || name.startsWith("border-color-")) {
    return true;
  }
  if (!name.startsWith("color-")) return false;
  const generic = new Set([
    "color-background",
    "color-foreground",
    "color-card",
    "color-card-foreground",
    "color-popover",
    "color-popover-foreground",
    "color-primary",
    "color-primary-foreground",
    "color-secondary",
    "color-secondary-foreground",
    "color-muted",
    "color-muted-foreground",
    "color-accent",
    "color-accent-foreground",
    "color-destructive",
    "color-destructive-foreground",
    "color-border",
    "color-input",
    "color-ring",
  ]);
  return !generic.has(name);
}

function main() {
  const toolRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const hostRoot = resolveHostRoot(toolRoot);
  const sourceRoot = resolveSourceRoot(hostRoot);

  if (!sourceRoot) {
    console.log(
      "SKIP: verify-tailwind-theme-registration — no linked source (source/ or SOURCE_PATH).",
    );
    process.exit(0);
  }

  const sourceParts = findSourceThemeCss(sourceRoot);
  if (!sourceParts.length) {
    console.log(
      "SKIP: linked source has no @theme / @theme inline blocks in known CSS paths (v3-only or non-Tailwind).",
    );
    process.exit(0);
  }

  const sourceNames = new Set();
  for (const part of sourceParts) {
    for (const name of collectThemeTokenNames(part.css)) {
      sourceNames.add(name);
    }
  }

  const productSourceNames = [...sourceNames].filter(isProductThemeKey);
  if (!productSourceNames.length) {
    console.log(
      "SKIP: source @theme blocks only declare generic shadcn color keys.",
    );
    process.exit(0);
  }

  const globalsPath = path.join(hostRoot, "src/app/globals.css");
  if (!fs.existsSync(globalsPath)) {
    console.error("BLOCKED: src/app/globals.css not found.");
    process.exit(1);
  }

  const hostCss = readCssImportGraph(globalsPath);
  const hostNames = collectThemeTokenNames(hostCss);
  const missing = productSourceNames.filter((name) => !hostNames.has(name));
  const coverage =
    (productSourceNames.length - missing.length) / productSourceNames.length;

  // Require majority coverage — partial host themes (subset of source) are OK
  // if they register the bulk of product utilities; silent total miss fails.
  if (coverage < 0.35 || missing.length === productSourceNames.length) {
    console.error(
      "BLOCKED: Tailwind utility registration layer missing or incomplete.",
    );
    console.error("");
    console.error(
      "The linked source defines @theme tokens that generate utilities (bg-*, text-*,",
    );
    console.error(
      "border-*, shadow-*), but host globals.css does not register most of them.",
    );
    console.error(
      "Token VALUES alone (--cal-*, --background, …) are not enough — Tailwind must",
    );
    console.error("see an @theme block at build time or classes silently emit no CSS.");
    console.error("");
    console.error(`Source theme files:`);
    for (const part of sourceParts) {
      console.error(`  - ${path.relative(sourceRoot, part.path)}`);
    }
    console.error(
      `Product @theme keys in source: ${productSourceNames.length}; in host: ${productSourceNames.length - missing.length} (${Math.round(coverage * 100)}% coverage).`,
    );
    console.error(`Example missing: ${missing.slice(0, 12).join(", ")}`);
    console.error("");
    console.error("Fix:");
    console.error(
      "  node node_modules/proto-plugin/scripts/extract-tailwind-theme.mjs \\",
    );
    console.error(
      `    --input source/${path.relative(sourceRoot, sourceParts[0].path)} \\`,
    );
    console.error("    --out src/styles/product-tailwind-theme.css");
    console.error(
      "  Then @import that file from src/app/globals.css next to the VALUES sheet.",
    );
    process.exit(1);
  }

  console.log("OK: Tailwind @theme registration layer present in host CSS.");
  console.log(
    `  product keys: ${productSourceNames.length - missing.length}/${productSourceNames.length} registered (${Math.round(coverage * 100)}%)`,
  );
  if (missing.length) {
    console.log(
      `  note: ${missing.length} source keys not in host (acceptable if unused): ${missing.slice(0, 8).join(", ")}${missing.length > 8 ? "…" : ""}`,
    );
  }
}

main();
