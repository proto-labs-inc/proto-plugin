import fs from "node:fs";
import path from "node:path";

export const COMPONENT_LIBRARY_SECTION_IDS = [
  "ui-primitives",
  "composite-components",
  "tokens",
];

function readEnvLocal(hostRoot) {
  try {
    return fs.readFileSync(path.join(hostRoot, ".env.local"), "utf8");
  } catch {
    return "";
  }
}

export function envLocalHasValue(hostRoot, key) {
  return new RegExp(`^${key}=\\s*\\S`, "m").test(readEnvLocal(hostRoot));
}

/** Prefer `process.env` (Vercel, Next.js); fall back to `.env.local` for CLI verify scripts. */
export function envHasValue(hostRoot, key, env = process.env) {
  if (env[key]?.trim()) return true;
  return envLocalHasValue(hostRoot, key);
}

export function hasSourceSymlink(hostRoot) {
  try {
    return fs.lstatSync(path.join(hostRoot, "source")).isSymbolicLink();
  } catch {
    return false;
  }
}

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
  const sourcePathSet = envHasValue(hostRoot, "SOURCE_PATH", env);
  const userNameSet = envHasValue(hostRoot, "PROTOTYPE_USER_NAME", env);
  const sourceLinked = hasSourceSymlink(hostRoot) || sourcePathSet;

  return sourceLinked && sourcePathSet && userNameSet;
}

export function isComponentLibraryReadyByState(hostRoot) {
  const dir = path.join(hostRoot, "src", "app", "component-library");
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

  return COMPONENT_LIBRARY_SECTION_IDS.every((id) => found.has(id));
}

export function readExpectedBootstrapStatus(hostRoot) {
  const onboarded = isWorkspaceOnboardedByState(hostRoot);
  const componentLibraryReady = isComponentLibraryReadyByState(hostRoot);

  return {
    complete: onboarded,
    componentLibraryReady: onboarded ? componentLibraryReady : componentLibraryReady,
  };
}
