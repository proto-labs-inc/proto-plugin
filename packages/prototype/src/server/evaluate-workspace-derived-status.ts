import "server-only";

import fs from "node:fs";
import path from "node:path";

import { hostEnvHasValue } from "./host-env";

const DESIGN_SYSTEM_SECTION_IDS = ["tokens"] as const;

export function isWorkspaceOnboardedByState(
  hostRoot: string,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return (
    hostEnvHasValue(hostRoot, "SOURCE_PATH", env) &&
    hostEnvHasValue(hostRoot, "PROTOTYPE_USER_NAME", env)
  );
}

function collectSourceFiles(dir: string, acc: string[]): void {
  let entries: fs.Dirent[];
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

export function isDesignSystemReadyByState(hostRoot: string): boolean {
  const dir = path.join(hostRoot, "src", "app", "design-system");
  const files: string[] = [];
  collectSourceFiles(dir, files);

  const found = new Set<string>();
  for (const file of files) {
    let text: string;
    try {
      text = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const id of DESIGN_SYSTEM_SECTION_IDS) {
      if (text.includes(`"${id}"`) || text.includes(`'${id}'`)) {
        found.add(id);
      }
    }
  }

  return DESIGN_SYSTEM_SECTION_IDS.every((id) => found.has(id));
}

/** @deprecated use isDesignSystemReadyByState */
export const isComponentLibraryReadyByState = isDesignSystemReadyByState;
