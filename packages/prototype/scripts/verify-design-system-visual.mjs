#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { readDesignSystemTokenManifest } from "./lib/design-system-token-manifest.mjs";
import { resolveHostRoot } from "./lib/resolve-host-root.mjs";

const DESIGN_SYSTEM_PATH = "/design-system";
const SURFACE_SELECTOR =
  '[data-prototype-source-surface][data-prototype-product-theme-managed]';

function readDevServerOrigin(hostRoot) {
  const fromEnv = process.env.PROTOTYPE_DEV_ORIGIN?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const packageJsonPath = path.join(hostRoot, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      const devScript = packageJson.scripts?.dev ?? "";
      const portMatch = devScript.match(/(?:^|\s)-p\s+(\d+)/);
      if (portMatch) {
        return `http://localhost:${portMatch[1]}`;
      }
    } catch {
      // fall through
    }
  }

  return "http://localhost:1985";
}

function isBlankColor(color) {
  if (!color) return true;
  const normalized = color.replace(/\s+/g, "").toLowerCase();
  return (
    normalized === "transparent" ||
    normalized === "rgba(0,0,0,0)" ||
    normalized === "rgba(0,0,0,0.0)"
  );
}

async function loadPlaywright() {
  try {
    const mod = await import("playwright");
    return mod.chromium;
  } catch {
    console.error(
      "BLOCKED: playwright is not installed. Run: pnpm add -D playwright && pnpm exec playwright install chromium",
    );
    process.exit(1);
  }
}

async function setSurfaceTheme(page, mode) {
  await page.evaluate(
    ({ selector, theme }) => {
      const surface = document.querySelector(selector);
      if (!surface) return;
      surface.setAttribute("data-theme", theme);
      surface.classList.remove("light", "dark");
      surface.classList.add(theme);
    },
    { selector: SURFACE_SELECTOR, theme: mode },
  );
}

async function waitForThemeRescope(page) {
  await page.waitForTimeout(400);
}

async function readSwatchResults(page) {
  return page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll("[data-token-swatch][data-token-required='true']"),
    );
    return nodes.map((node) => ({
      name: node.getAttribute("data-token-name") ?? "",
      token: node.getAttribute("data-token-var") ?? "",
      color: getComputedStyle(node).backgroundColor,
    }));
  });
}

async function main() {
  const toolRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const hostRoot = resolveHostRoot(toolRoot);
  const manifest = readDesignSystemTokenManifest(hostRoot);

  if (!manifest?.swatches?.length) {
    console.error(
      "BLOCKED: .proto/design-system-tokens.json missing — run generate-design-system.mjs first.",
    );
    process.exit(1);
  }

  const origin = readDevServerOrigin(hostRoot);
  const url = `${origin}${DESIGN_SYSTEM_PATH}`;
  const themes = manifest.productThemes ?? ["light"];

  const chromium = await loadPlaywright();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const response = await page.goto(url, { waitUntil: "networkidle" });
    if (!response?.ok()) {
      console.error(
        `BLOCKED: ${url} returned ${response?.status() ?? "no response"}. Start \`pnpm dev\` and retry.`,
      );
      process.exit(1);
    }

    await page.waitForSelector(SURFACE_SELECTOR, { timeout: 15000 });
    await page.waitForSelector("[data-token-swatch]", { timeout: 15000 });

    const failures = [];

    for (const mode of themes) {
      await setSurfaceTheme(page, mode);
      await waitForThemeRescope(page);

      const results = await readSwatchResults(page);
      const blank = results.filter((r) => isBlankColor(r.color));

      if (blank.length) {
        failures.push(
          `${mode}: ${blank.length} required swatch(es) rendered transparent — ${blank
            .map((r) => `${r.name} (${r.token})`)
            .join(", ")}`,
        );
      }

      const chromatic = results.find((r) => r.token === "--destructive" || r.token === "--primary");
      if (chromatic && isBlankColor(chromatic.color)) {
        failures.push(`${mode}: chromatic token ${chromatic.token} is unstyled`);
      }
    }

    if (failures.length) {
      console.error("BLOCKED: design system visual verification failed.");
      for (const failure of failures) {
        console.error(`- ${failure}`);
      }
      console.error(
        "Fix token CSS sync / circular --color-* mappings, re-run generate-design-system.mjs, then retry.",
      );
      process.exit(1);
    }

    console.log(`OK: design system tokens render on ${url}.`);
    for (const mode of themes) {
      const count = manifest.swatches.filter((s) => s.required).length;
      console.log(`- ${mode}: ${count} required swatch(es) have visible background colors`);
    }
  } finally {
    await browser.close();
  }
}

main();
