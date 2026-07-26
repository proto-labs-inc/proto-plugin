#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import path from "node:path";

import { hostEnvHasValue } from "./lib/host-env.mjs";
import { resolveHostRoot } from "./lib/resolve-host-root.mjs";

function main() {
  const toolRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const hostRoot = resolveHostRoot(toolRoot);
  const keys = process.argv.slice(2);

  if (keys.length === 0) {
    console.error(
      "Usage: node verify-host-env.mjs <ENV_KEY> [ENV_KEY...]",
    );
    process.exit(2);
  }

  const missing = keys.filter((key) => !hostEnvHasValue(hostRoot, key));
  if (missing.length > 0) {
    console.error(
      `BLOCKED: missing ${missing.join(", ")} — set in process.env (e.g. Vercel) or .env.local.`,
    );
    process.exit(1);
  }

  console.log(`OK: ${keys.join(", ")} set.`);
}

main();
