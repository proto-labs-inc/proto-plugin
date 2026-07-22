import "server-only";

import fs from "node:fs";
import path from "node:path";

const DESIGN_SYSTEM_SECTION_IDS = ["tokens"] as const;

function readEnvLocal(hostRoot: string): string {
  try {
    return fs.readFileSync(path.join(hostRoot, ".env.local"), "utf8");
  } catch {
    return "";
  }
}

function envLocalHasValue(hostRoot: string, key: string): boolean {
  return new RegExp(`^${key}=\\s*\\S`, "m").test(readEnvLocal(hostRoot));
}

function hasSourceSymlink(hostRoot: string): boolean {
  try {
    return fs.lstatSync(path.join(hostRoot, "source")).isSymbolicLink();
  } catch {
    return false;
  }
}

export function isWorkspaceOnboardedByState(hostRoot: string): boolean {
  return (
    hasSourceSymlink(hostRoot) &&
    envLocalHasValue(hostRoot, "SOURCE_PATH") &&
    envLocalHasValue(hostRoot, "PROTOTYPE_USER_NAME")
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
