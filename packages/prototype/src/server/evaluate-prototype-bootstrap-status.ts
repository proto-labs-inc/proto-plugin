import fs from "node:fs";
import path from "node:path";

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

/** Resolve host repo root even when Next.js API routes run with an unexpected cwd. */
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

/**
 * Workspace onboarding status is derived entirely from real state on disk:
 *
 * - `onboarded` — `SOURCE_PATH` + `PROTOTYPE_USER_NAME` in env (Vercel / Next.js
 *   / `.env.local` fallback), and source linked locally (`source` symlink) or via env
 * - `component-library-ready` — the component library page is populated with the
 *   three required accordion sections
 */
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
