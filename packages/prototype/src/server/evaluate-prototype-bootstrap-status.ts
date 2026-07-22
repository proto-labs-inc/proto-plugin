import fs from "node:fs";
import path from "node:path";

import {
  createCompletedBootstrapStatus,
  createOnboardingRequiredBootstrapStatus,
  type PrototypeBootstrapStatus,
} from "@prototype/lib/prototypes/prototype-bootstrap-status";
import type { PrototypeBootstrapConfig } from "@prototype/lib/prototypes/prototype-config-types";

import {
  isDesignSystemReadyByState,
  isWorkspaceOnboardedByState,
} from "./evaluate-workspace-derived-status";

function resolveHostRoot(explicitHostRoot?: string): string {
  if (explicitHostRoot) {
    return explicitHostRoot;
  }

  let dir = process.cwd();
  while (true) {
    if (fs.existsSync(path.join(dir, "prototype.config.ts"))) {
      return dir;
    }

    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }

  return process.cwd();
}

export function evaluateHostBootstrapStatus(
  options: {
    hostRoot?: string;
    bootstrap?: PrototypeBootstrapConfig;
    env?: NodeJS.ProcessEnv;
  } = {},
): PrototypeBootstrapStatus {
  const hostRoot = resolveHostRoot(options.hostRoot);
  const designSystemReady = isDesignSystemReadyByState(hostRoot);

  if (isWorkspaceOnboardedByState(hostRoot)) {
    return {
      ...createCompletedBootstrapStatus(),
      designSystemReady,
    };
  }

  return {
    ...createOnboardingRequiredBootstrapStatus(),
    designSystemReady,
  };
}
