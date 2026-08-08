import fs from "node:fs";
import path from "node:path";

import { hostEnvHasValue } from "./host-env.mjs";

export const COMPONENT_LIBRARY_SECTION_IDS = [
  "ui-primitives",
  "composite-components",
  "tokens",
];

function collectSourceFiles(dir, acc) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(full, acc);
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      acc.push(full);
    }
  }
}

export function isWorkspaceOnboardedByState(hostRoot, env = process.env) {
  return (
    hostEnvHasValue(hostRoot, "SOURCE_PATH", env) &&
    hostEnvHasValue(hostRoot, "PROTOTYPE_USER_NAME", env)
  );
}

export function isComponentLibraryReadyByState(hostRoot) {
  for (const rel of ["src/app/component-library", "src/app/design-system"]) {
    const dir = path.join(hostRoot, rel);
    const files = [];
    collectSourceFiles(dir, files);

    const found = new Set();
    for (const file of files) {
      let text;
      try {
        text = fs.readFileSync(file, "utf8");
      } catch {
        continue;
      }
      for (const id of COMPONENT_LIBRARY_SECTION_IDS) {
        if (text.includes(`"${id}"`) || text.includes(`'${id}'`)) {
          found.add(id);
        }
      }
    }

    if (COMPONENT_LIBRARY_SECTION_IDS.every((id) => found.has(id))) {
      return true;
    }
  }

  return false;
}

/** @deprecated use isComponentLibraryReadyByState */
export const isDesignSystemReadyByState = isComponentLibraryReadyByState;

export function readExpectedBootstrapStatus(hostRoot) {
  const onboarded = isWorkspaceOnboardedByState(hostRoot);
  const componentLibraryReady = isComponentLibraryReadyByState(hostRoot);

  return {
    complete: onboarded,
    componentLibraryReady,
  };
}

// Re-export so scripts can import env helpers from the bootstrap state module.
export {
  hostEnvHasValue,
  readHostEnvValue,
  readEnvLocalValue,
} from "./host-env.mjs";
