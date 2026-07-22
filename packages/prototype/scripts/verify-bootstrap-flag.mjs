#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import path from "node:path";

import {
  isDesignSystemReadyByState,
  isWorkspaceOnboardedByState,
} from "./lib/bootstrap-workspace-state.mjs";
import { resolveHostRoot } from "./lib/resolve-host-root.mjs";

const CHECKS = {
  onboarded: {
    passed: (hostRoot) => isWorkspaceOnboardedByState(hostRoot),
    success: "onboarded — source linked and workspace profile set.",
    failure:
      "not onboarded — need `source` symlink + SOURCE_PATH + PROTOTYPE_USER_NAME in .env.local. Run `pnpm link-source` and set the workspace profile first.",
  },
  "design-system-loaded": {
    passed: (hostRoot) => isDesignSystemReadyByState(hostRoot),
    success: "design system populated — tokens section found.",
    failure:
      "design system not populated — tokens section not found under src/app/design-system/. Run the design system generate script first.",
  },
};

function main() {
  const toolRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const hostRoot = resolveHostRoot(toolRoot);

  const which = process.argv[2];
  const check = CHECKS[which];
  if (!check) {
    console.error(
      `Unknown check "${which ?? ""}". Expected one of: ${Object.keys(CHECKS).join(", ")}`,
    );
    process.exit(2);
  }

  if (!check.passed(hostRoot)) {
    console.error(`BLOCKED: ${check.failure}`);
    process.exit(1);
  }

  console.log(`OK: ${check.success}`);
}

main();
