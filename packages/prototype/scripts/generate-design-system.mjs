#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

console.log("Generating design system (SkillUI tokens only)...\n");
runScript("extract-design-system.mjs");
console.log("");
runScript("scaffold-design-system.mjs");
