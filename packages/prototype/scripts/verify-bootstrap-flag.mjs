#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import path from "node:path";

import {
  isComponentLibraryReadyByState,
  isWorkspaceOnboardedByState,
} from "./lib/bootstrap-workspace-state.mjs";
import { resolveHostRoot } from "./lib/resolve-host-root.mjs";

/**
 * Read-only verify for workspace bootstrap state on disk.
 *
 * There are no `.proto/` marker flags — Proto derives onboarding and component
 * library status from real workspace state. These checks confirm that state for
 * the setup agent's phase gates and exit non-zero when prerequisites are unmet.
 *
 * Gallery UI unlock uses GET /api/prototypes/bootstrap-status — run
 * `pnpm verify:bootstrap-status` after disk checks pass.
 */

const CHECKS = {
  onboarded: {
    passed: (hostRoot) => isWorkspaceOnboardedByState(hostRoot),
    success: "onboarded — source linked and workspace profile set.",
    failure:
      "not onboarded — need SOURCE_PATH + PROTOTYPE_USER_NAME in env (Vercel dashboard, or .env.local locally). Local dev also needs `pnpm link-source` for the `source/` symlink.",
  },
  "component-library-loaded": {
    passed: (hostRoot) => isComponentLibraryReadyByState(hostRoot),
    success:
      "component library populated — ui-primitives, composite-components, and tokens sections found.",
    failure:
      "component library not populated — sections [ui-primitives, composite-components, tokens] not found under src/app/component-library/. Complete the component library sync + previews first.",
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
