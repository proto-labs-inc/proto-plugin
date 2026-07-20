#!/usr/bin/env node
import process from "node:process";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/**
 * Visual gate for the component library (CHECKPOINT 4, gate 3).
 *
 * This is the ONLY check that verifies *computed* CSS AND that the sections
 * render real, interactive components rather than a list of names. The static
 * gate and `pnpm build` prove the code compiles, imports resolve, and the tree
 * renders — but they cannot prove that after the cascade runs `--primary`
 * computes to a real color, nor that the previews are actual rendered controls.
 * This launches a real headless Chromium, opens `/component-library`, expands
 * each accordion section, and asserts:
 *   - no console errors / page exceptions fire while a section opens,
 *   - each section renders real content (a non-empty preview surface),
 *   - the primitive/composite sections contain real rendered controls
 *     (buttons/inputs/etc.), not just text labels ("names as text" failure),
 *   - a chromatic token (`--primary`) resolves to a real color, distinct from
 *     `--background` (not transparent, not identical to the surface bg).
 *
 * It is a `pnpm` command (not an interactive/MCP browser), so it runs uniformly
 * across Cursor, Codex, and Claude Code. It is self-bootstrapping: when
 * Playwright or the Chromium binary is missing it installs them automatically
 * (opt out with PROTOTYPE_NO_AUTO_BROWSER=1) so the mandatory gate can never be
 * silently skipped.
 */

const URL =
  process.env.COMPONENT_LIBRARY_URL ||
  "http://localhost:1999/component-library";

const SECTIONS = [
  { id: "ui-primitives", title: "UI primitives", requireControls: true },
  { id: "composite-components", title: "Composite components", requireControls: true },
  { id: "tokens", title: "Design tokens", requireControls: false },
];

// Minimum real rendered control elements a component section must contain.
// A list of component names as text has zero — this kills that failure mode.
const MIN_RENDERED_CONTROLS = 3;

const EXIT_UNAVAILABLE = 2; // cannot run the check (missing tool / browser / server)
const EXIT_FAIL = 1; // ran, found problems

function hostRootFromToolRoot() {
  const toolRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  // Host root is where the sync config / package.json live; walk up from the
  // installed package (node_modules/proto-plugin/..) to the nearest package.json
  // that is not the tool package.
  let dir = process.cwd();
  for (let i = 0; i < 6; i += 1) {
    if (
      fs.existsSync(path.join(dir, "package.json")) &&
      fs.existsSync(path.join(dir, "prototype.sync.config.sh"))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

function detectPackageManager(hostRoot) {
  if (fs.existsSync(path.join(hostRoot, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(hostRoot, "yarn.lock"))) return "yarn";
  if (fs.existsSync(path.join(hostRoot, "package-lock.json"))) return "npm";
  return "pnpm";
}

async function importChromium() {
  try {
    const mod = await import("playwright");
    return mod.chromium ?? null;
  } catch {
    try {
      const mod = await import("playwright-chromium");
      return mod.chromium ?? null;
    } catch {
      return null;
    }
  }
}

/** Load Playwright, installing it (and the Chromium binary) if missing. */
async function loadChromium() {
  let chromium = await importChromium();
  if (chromium) return chromium;

  if (process.env.PROTOTYPE_NO_AUTO_BROWSER === "1") return null;

  const hostRoot = hostRootFromToolRoot();
  const pm = detectPackageManager(hostRoot);
  const addArgs =
    pm === "npm" ? ["install", "-D", "playwright"] : ["add", "-D", "playwright"];
  console.log(`Visual gate: Playwright missing — installing with ${pm} …`);
  try {
    execFileSync(pm, addArgs, { cwd: hostRoot, stdio: "inherit" });
  } catch (err) {
    console.error(`Visual gate: could not auto-install Playwright (${err.message}).`);
    return null;
  }
  chromium = await importChromium();
  return chromium;
}

/** Install the Chromium browser binary (idempotent). Returns true on success. */
function installChromiumBinary() {
  if (process.env.PROTOTYPE_NO_AUTO_BROWSER === "1") return false;
  const hostRoot = hostRootFromToolRoot();
  const pm = detectPackageManager(hostRoot);
  const runner = pm === "npm" ? "npx" : pm;
  const args =
    pm === "npm"
      ? ["playwright", "install", "chromium"]
      : ["exec", "playwright", "install", "chromium"];
  console.log("Visual gate: installing Chromium binary …");
  try {
    execFileSync(runner, args, { cwd: hostRoot, stdio: "inherit" });
    return true;
  } catch (err) {
    console.error(`Visual gate: could not install Chromium (${err.message}).`);
    return false;
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
    // Most common cause: Playwright is installed but the Chromium binary is
    // not. Auto-install it once and retry before giving up.
    console.log(
      `Visual gate: Chromium launch failed (${err.message}) — attempting binary install.`,
    );
    const installed = installChromiumBinary();
    if (installed) {
      try {
        browser = await chromium.launch({ headless: true });
      } catch (retryErr) {
        console.error(
          `Visual gate UNAVAILABLE: Chromium still won't launch after install (${retryErr.message}).`,
        );
        process.exit(EXIT_UNAVAILABLE);
      }
    } else {
      console.error(
        `Visual gate UNAVAILABLE: could not launch Chromium (${err.message}).\n` +
          "  Install the browser binary, then re-run:\n" +
          "    pnpm exec playwright install chromium",
      );
      process.exit(EXIT_UNAVAILABLE);
    }
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

        // Real rendered controls, not a list of names. A "names as text"
        // library has interactive elements ~0; a real preview grid has many.
        if (section.requireControls) {
          const controlCount = await surface
            .evaluate(
              (el) =>
                el.querySelectorAll(
                  "button, input, select, textarea, [role='button'], [role='switch'], [role='checkbox'], [role='tab'], [role='dialog'], [data-radix-collection-item], svg",
                ).length,
            )
            .catch(() => 0);
          if (controlCount < MIN_RENDERED_CONTROLS) {
            failures.push(
              `section "${section.id}" renders only ${controlCount} real control element(s) (min ${MIN_RENDERED_CONTROLS}) — looks like a list of component NAMES, not rendered previews. Import and render the actual components.`,
            );
          } else {
            notes.push(
              `section "${section.id}": ${controlCount} rendered control element(s)`,
            );
          }
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
