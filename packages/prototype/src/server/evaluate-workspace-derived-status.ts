import "server-only";

import fs from "node:fs";
import path from "node:path";

/**
 * Derives workspace onboarding + component-library status from real files on
 * disk. There are no `.proto/` marker flags — the gallery unlocks from actual
 * workspace state only.
 */

const COMPONENT_LIBRARY_SECTION_IDS = [
  "ui-primitives",
  "composite-components",
  "tokens",
] as const;

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

/** Prefer `process.env` (Vercel, Next.js); fall back to `.env.local` for CLI verify scripts. */
function envHasValue(
  hostRoot: string,
  key: string,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (env[key]?.trim()) return true;
  return envLocalHasValue(hostRoot, key);
}

/** Source linked + workspace profile set — onboarding is materially complete. */
export function isWorkspaceOnboardedByState(
  hostRoot: string,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const sourcePathSet = envHasValue(hostRoot, "SOURCE_PATH", env);
  const userNameSet = envHasValue(hostRoot, "PROTOTYPE_USER_NAME", env);
  const sourceLinked = hasSourceSymlink(hostRoot) || sourcePathSet;

  return sourceLinked && sourcePathSet && userNameSet;
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

/** Library page populated with the three required accordion sections. */
export function isComponentLibraryReadyByState(hostRoot: string): boolean {
  const dir = path.join(hostRoot, "src", "app", "component-library");
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
    for (const id of COMPONENT_LIBRARY_SECTION_IDS) {
      if (text.includes(`"${id}"`) || text.includes(`'${id}'`)) {
        found.add(id);
      }
    }
  }

  return COMPONENT_LIBRARY_SECTION_IDS.every((id) => found.has(id));
}
