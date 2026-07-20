#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  PROFILE_RELATIVE_PATH,
  loadProfile,
  validateProfile,
} from "./lib/design-system-profile.mjs";
import { resolveHostRoot } from "./lib/resolve-host-root.mjs";

const toolRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function runScript(name) {
  const scriptPath = path.join(toolRoot, "scripts", name);
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: process.cwd(),
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// PHASE 2 — deterministic structure engine. Requires the Phase 1 profile.
const hostRoot = resolveHostRoot(toolRoot);
const profile = loadProfile(hostRoot);
const validation = validateProfile(profile);
if (!validation.ok) {
  console.error(
    `Component library generation is PHASE 2 and needs ${PROFILE_RELATIVE_PATH}.\n\nRun PHASE 1 first to gather evidence and author the profile:\n  node node_modules/proto-plugin/scripts/profile-design-system.mjs\n`,
  );
  for (const err of validation.errors) console.error(`  - ${err}`);
  process.exit(1);
}

console.log("Generating component library (PHASE 2: tokens + structure engine)...\n");
runScript("extract-design-system.mjs");
console.log("");
runScript("scaffold-component-library.mjs");
