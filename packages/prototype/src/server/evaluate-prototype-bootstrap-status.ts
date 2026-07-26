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
import { resolveHostRoot } from "./host-env";

export function evaluateHostBootstrapStatus(
  options: {
    hostRoot?: string;
    bootstrap?: PrototypeBootstrapConfig;
    env?: NodeJS.ProcessEnv;
  } = {},
): PrototypeBootstrapStatus {
  const hostRoot = resolveHostRoot(options.hostRoot);
  const env = options.env ?? process.env;
  const designSystemReady = isDesignSystemReadyByState(hostRoot);

  if (isWorkspaceOnboardedByState(hostRoot, env)) {
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
