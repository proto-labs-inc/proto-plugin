#!/usr/bin/env node
import process from "node:process";

/**
 * Visual gate for the component library (CHECKPOINT 4, gate 3).
 *
 * This is the ONLY check that verifies *computed* CSS. The static gate and
 * `pnpm build` prove the code compiles, imports resolve, and the tree renders —
 * but they cannot prove that after the cascade runs, `--primary` actually
 * computes to a real color (source design systems derive tokens via
 * oklch/color-mix and re-scope them onto a nested surface at runtime; that can
 * collapse to transparent/grey). This launches a real headless Chromium, opens
 * `/component-library`, expands each accordion section, and asserts:
 *   - no console errors / page exceptions fire while a section opens,
 *   - each section renders real content (a non-empty preview surface),
 *   - a chromatic token (`--primary`) resolves to a real color, distinct from
 *     `--background` (not transparent, not identical to the surface bg).
 *
 * It is a `pnpm` command (not an interactive/MCP browser), so it runs uniformly
 * across Cursor, Codex, and Claude Code. It requires the dev server running and
 * a Chromium binary; when Playwright/Chromium is unavailable it exits with a
 * distinct code and actionable instructions rather than passing silently.
 */

const URL =
  process.env.COMPONENT_LIBRARY_URL ||
  "http://localhost:1999/component-library";

const SECTIONS = [
  { id: "ui-primitives", title: "UI primitives" },
  { id: "composite-components", title: "Composite components" },
  { id: "tokens", title: "Design tokens" },
];

const EXIT_UNAVAILABLE = 2; // cannot run the check (missing tool / browser / server)
const EXIT_FAIL = 1; // ran, found problems

async function loadChromium() {
  try {
    const mod = await import("playwright");
    return mod.chromium ?? null;
  } catch {
    try {
      // Some hosts install only the browser-specific package.
      const mod = await import("playwright-chromium");
      return mod.chromium ?? null;
    } catch {
      return null;
    }
  }
}

function isBlankColor(color) {
  if (!color) return true;
  const c = color.replace(/\s+/g, "").toLowerCase();
  if (c === "transparent") return true;
  // rgba(...,0) — fully transparent
  const m = c.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const parts = m[1].split(",");
    if (parts.length === 4 && Number(parts[3]) === 0) return true;
  }
  return false;
}

async function main() {
  const chromium = await loadChromium();
  if (!chromium) {
    console.error(
      "Visual gate UNAVAILABLE: Playwright is not installed.\n" +
        "  Install it in the host, then re-run:\n" +
        "    pnpm add -D playwright && pnpm exec playwright install chromium\n" +
        "  Do NOT skip this gate silently — CHECKPOINT 4 requires the computed-theme check.",
    );
    process.exit(EXIT_UNAVAILABLE);
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    console.error(
      `Visual gate UNAVAILABLE: could not launch Chromium (${err.message}).\n` +
        "  Install the browser binary, then re-run:\n" +
        "    pnpm exec playwright install chromium",
    );
    process.exit(EXIT_UNAVAILABLE);
  }

  const failures = [];
  const notes = [];

  try {
    const page = await browser.newPage();
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(String(err?.message ?? err)));

    // 1. Load the page.
    let resp;
    try {
      resp = await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
    } catch (err) {
      console.error(
        `Visual gate UNAVAILABLE: could not load ${URL} (${err.message}).\n` +
          "  Is the dev server running? Start it with `pnpm dev` (port 1999) and re-run.",
      );
      await browser.close();
      process.exit(EXIT_UNAVAILABLE);
    }
    if (!resp || !resp.ok()) {
      failures.push(`page load returned HTTP ${resp ? resp.status() : "no response"}`);
    }

    // 2. Expand each section and verify it opens with content and no errors.
    for (const section of SECTIONS) {
      const before = consoleErrors.length;

      const item = page.locator(`#${section.id}`);
      const exists = (await item.count()) > 0;
      if (!exists) {
        failures.push(
          `section "${section.id}" not found on the page — expected an accordion item with id="${section.id}"`,
        );
        continue;
      }

      // Expand if not already open.
      const trigger = item.locator("button").first();
      try {
        const state = await trigger.getAttribute("data-state");
        if (state !== "open") {
          await trigger.click({ timeout: 5000 });
        }
        await item
          .locator('[data-state="open"]')
          .first()
          .waitFor({ state: "attached", timeout: 5000 })
          .catch(() => {});
      } catch (err) {
        failures.push(`could not expand section "${section.id}": ${err.message}`);
        continue;
      }

      // Let content mount + styles settle.
      await page.waitForTimeout(400);

      // Content present?
      const surface = item.locator("[data-prototype-source-surface]").first();
      const surfaceCount = await surface.count();
      if (surfaceCount === 0) {
        failures.push(
          `section "${section.id}" opened but has no preview surface (blank / did not render real content)`,
        );
      } else {
        const text = (await surface.innerText().catch(() => "")).trim();
        const childCount = await surface
          .evaluate((el) => el.querySelectorAll("*").length)
          .catch(() => 0);
        if (text.length === 0 && childCount < 3) {
          failures.push(
            `section "${section.id}" preview surface is empty (no rendered content)`,
          );
        }
      }

      // Console errors that fired while opening this section.
      const newErrors = consoleErrors.slice(before);
      if (newErrors.length > 0) {
        failures.push(
          `section "${section.id}" produced ${newErrors.length} console error(s): ${newErrors
            .slice(0, 3)
            .map((e) => e.split("\n")[0])
            .join(" | ")}`,
        );
      }
    }

    // 3. Chromatic probe — does --primary resolve to a real color distinct
    //    from the surface background? Runs inside the source surface so the
    //    re-scoped tokens are in scope.
    const probe = await page
      .evaluate(() => {
        const surface = document.querySelector(
          "[data-prototype-source-surface]",
        );
        const host = surface ?? document.body;
        const read = (expr) => {
          const el = document.createElement("div");
          el.style.color = expr;
          host.appendChild(el);
          const c = getComputedStyle(el).color;
          el.remove();
          return c;
        };
        return {
          primary: read("var(--primary)"),
          background: read("var(--background)"),
          foreground: read("var(--foreground)"),
          hadSurface: Boolean(surface),
        };
      })
      .catch(() => null);

    if (!probe) {
      failures.push("could not probe computed token colors");
    } else {
      notes.push(
        `computed tokens — primary: ${probe.primary}, background: ${probe.background}, foreground: ${probe.foreground} (surface: ${probe.hadSurface ? "found" : "fallback to body"})`,
      );
      if (isBlankColor(probe.primary)) {
        failures.push(
          `--primary resolves to a blank/transparent color (${probe.primary}) — token layer did not resolve to the source hue`,
        );
      }
      if (
        !isBlankColor(probe.primary) &&
        probe.primary.replace(/\s+/g, "") ===
          probe.background.replace(/\s+/g, "")
      ) {
        failures.push(
          `--primary is identical to --background (${probe.primary}) — chromatic token did not resolve distinctly`,
        );
      }
    }

    await browser.close();
  } catch (err) {
    try {
      await browser.close();
    } catch {
      // ignore
    }
    console.error(`Visual gate errored unexpectedly: ${err.message}`);
    process.exit(EXIT_UNAVAILABLE);
  }

  for (const note of notes) console.log(note);
  if (failures.length === 0) {
    console.log(
      `OK: visual gate passed — all ${SECTIONS.length} sections opened with real content, no console errors, and --primary resolves to a distinct source hue.`,
    );
    process.exit(0);
  }

  console.error("BLOCKED: component library visual gate failed —");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(EXIT_FAIL);
}

main();
