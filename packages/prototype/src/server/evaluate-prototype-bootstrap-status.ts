import {
  createCompletedBootstrapStatus,
  createOnboardingRequiredBootstrapStatus,
  type PrototypeBootstrapStatus,
} from "@prototype/lib/prototypes/prototype-bootstrap-status";
import type { PrototypeBootstrapConfig } from "@prototype/lib/prototypes/prototype-config-types";
import { readComponentLibraryLoaded } from "@prototype/lib/prototypes/workspace-component-library-loaded-io";
import { readWorkspaceOnboarded } from "@prototype/lib/prototypes/workspace-onboarded-io";

/**
 * Workspace onboarding uses two agent-written flags under `.proto/`:
 *
 * - `component-library-loaded` — agent sets after the library sync finishes
 * - `onboarded` — agent sets after all setup steps finish (last)
 */
export function evaluateHostBootstrapStatus(
  options: {
    hostRoot?: string;
    bootstrap?: PrototypeBootstrapConfig;
    env?: NodeJS.ProcessEnv;
  } = {},
): PrototypeBootstrapStatus {
  const hostRoot = options.hostRoot ?? process.cwd();
  const componentLibraryReady = readComponentLibraryLoaded(hostRoot);

  if (readWorkspaceOnboarded(hostRoot)) {
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
