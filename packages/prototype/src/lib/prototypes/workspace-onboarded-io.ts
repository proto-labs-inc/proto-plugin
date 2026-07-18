import fs from "node:fs";
import path from "node:path";

import { WORKSPACE_ONBOARDED_RELATIVE_PATH } from "@prototype/lib/prototypes/workspace-onboarded";
import {
  readProtoBooleanFlag,
  writeProtoBooleanFlag,
} from "@prototype/lib/prototypes/workspace-proto-flag-io";

export function resolveWorkspaceOnboardedPath(hostRoot: string): string {
  return path.join(hostRoot, WORKSPACE_ONBOARDED_RELATIVE_PATH);
}

export function readWorkspaceOnboarded(hostRoot: string): boolean {
  return readProtoBooleanFlag(hostRoot, WORKSPACE_ONBOARDED_RELATIVE_PATH);
}

export function markWorkspaceOnboarded(hostRoot: string): void {
  writeProtoBooleanFlag(hostRoot, WORKSPACE_ONBOARDED_RELATIVE_PATH);
}
