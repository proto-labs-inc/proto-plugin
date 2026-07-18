import "server-only";

import { COMPONENT_LIBRARY_LOADED_RELATIVE_PATH } from "@prototype/lib/prototypes/workspace-component-library-loaded";
import { readProtoBooleanFlag } from "@prototype/lib/prototypes/workspace-proto-flag-io";

export function readComponentLibraryLoaded(hostRoot: string): boolean {
  return readProtoBooleanFlag(hostRoot, COMPONENT_LIBRARY_LOADED_RELATIVE_PATH);
}
