import {
  createCompletedBootstrapStatus,
  createOnboardingRequiredBootstrapStatus,
  type PrototypeBootstrapStatus,
} from "@prototype/lib/prototypes/prototype-bootstrap-status";
import type { PrototypeBootstrapConfig } from "@prototype/lib/prototypes/prototype-config-types";

import {
  isComponentLibraryReadyByState,
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
  const componentLibraryReady = isComponentLibraryReadyByState(hostRoot);

  if (isWorkspaceOnboardedByState(hostRoot, env)) {
    return {
      ...createCompletedBootstrapStatus(),
      componentLibraryReady,
    };
  }

  return {
    ...createOnboardingRequiredBootstrapStatus(),
    componentLibraryReady,
  };
}
