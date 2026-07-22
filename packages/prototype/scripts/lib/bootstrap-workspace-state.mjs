import fs from "node:fs";
import path from "node:path";

export const DESIGN_SYSTEM_SECTION_IDS = ["tokens"];

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

export function isWorkspaceOnboardedByState(hostRoot) {
  return (
    hasSourceSymlink(hostRoot) &&
    envLocalHasValue(hostRoot, "SOURCE_PATH") &&
    envLocalHasValue(hostRoot, "PROTOTYPE_USER_NAME")
  );
}

export function isDesignSystemReadyByState(hostRoot) {
  const dir = path.join(hostRoot, "src", "app", "design-system");
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

export function readExpectedBootstrapStatus(hostRoot) {
  const onboarded = isWorkspaceOnboardedByState(hostRoot);
  const designSystemReady = isDesignSystemReadyByState(hostRoot);

  return {
    complete: onboarded,
    designSystemReady: onboarded ? designSystemReady : designSystemReady,
  };
}
