#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import path from "node:path";

import {
  isComponentLibraryReadyByState,
  isWorkspaceOnboardedByState,
} from "./lib/bootstrap-workspace-state.mjs";
import { resolveHostRoot } from "./lib/resolve-host-root.mjs";

const CHECKS = {
  onboarded: {
    passed: (hostRoot) => isWorkspaceOnboardedByState(hostRoot),
    success: "onboarded — SOURCE_PATH and workspace profile set.",
    failure:
      "not onboarded — need SOURCE_PATH + PROTOTYPE_USER_NAME via host-env (process.env / Vercel or .env.local). Set the source path and workspace profile first.",
  },
  "component-library-loaded": {
    passed: (hostRoot) => isComponentLibraryReadyByState(hostRoot),
    success:
      "component library populated — ui-primitives, composite-components, and tokens sections found.",
    failure:
      "component library not populated — required sections not found under src/app/component-library/. Run the component library generate script first.",
  },
  /** @deprecated use component-library-loaded */
  "design-system-loaded": {
    passed: (hostRoot) => isComponentLibraryReadyByState(hostRoot),
    success:
      "component library populated — ui-primitives, composite-components, and tokens sections found.",
    failure:
      "component library not populated — required sections not found under src/app/component-library/. Run the component library generate script first.",
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
