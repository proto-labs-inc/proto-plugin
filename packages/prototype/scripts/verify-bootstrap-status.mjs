#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { readExpectedBootstrapStatus } from "./lib/bootstrap-workspace-state.mjs";
import { resolveHostRoot } from "./lib/resolve-host-root.mjs";

const BOOTSTRAP_STATUS_PATH = "/api/prototypes/bootstrap-status";

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

async function fetchBootstrapStatus(origin) {
  const url = `${origin}${BOOTSTRAP_STATUS_PATH}`;
  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Bootstrap status API returned ${response.status} from ${url}. ${body.slice(0, 240)}`,
    );
  }

  return response.json();
}

function formatMismatch(label, expected, actual) {
  return `${label}: expected ${expected}, API returned ${actual}`;
}

async function main() {
  const toolRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const hostRoot = resolveHostRoot(toolRoot);
  const expected = readExpectedBootstrapStatus(hostRoot);
  const origin = readDevServerOrigin(hostRoot);

  let actual;
  try {
    actual = await fetchBootstrapStatus(origin);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch bootstrap status.";
    console.error(`BLOCKED: ${message}`);
    console.error(
      "Start the dev server (`pnpm dev`) and retry. Override origin with PROTOTYPE_DEV_ORIGIN if needed.",
    );
    process.exit(1);
  }

  const mismatches = [];

  if (actual.complete !== expected.complete) {
    mismatches.push(formatMismatch("complete", expected.complete, actual.complete));
  }

  if (actual.componentLibraryReady !== expected.componentLibraryReady) {
    mismatches.push(
      formatMismatch(
        "componentLibraryReady",
        expected.componentLibraryReady,
        actual.componentLibraryReady,
      ),
    );
  }

  if (mismatches.length > 0) {
    console.error("BLOCKED: bootstrap status API disagrees with workspace state on disk.");
    for (const mismatch of mismatches) {
      console.error(`- ${mismatch}`);
    }
    console.error(
      "The gallery UI reads this API — disk-only verify scripts are not enough. Fix the bootstrap status route / host layout wiring, then retry.",
    );
    process.exit(1);
  }

  if (!expected.complete || !expected.componentLibraryReady) {
    console.error(
      "BLOCKED: bootstrap status API is reachable but workspace setup is not finished on disk yet.",
    );
    console.error(
      `- complete: ${actual.complete}`,
      `- componentLibraryReady: ${actual.componentLibraryReady}`,
    );
    process.exit(1);
  }

  console.log(
    `OK: bootstrap status API matches workspace state (${origin}${BOOTSTRAP_STATUS_PATH}).`,
  );
  console.log("OK: complete=true, componentLibraryReady=true — gallery and component library should unlock.");
}

main();
