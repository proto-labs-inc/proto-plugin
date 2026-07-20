import fs from "node:fs";
import path from "node:path";

/** Gitignore only — generation runs from the onboarding setup prompt, not host pnpm scripts. */
const GITIGNORE_ENTRIES = [
  ".skillui/",
  "src/app/component-library/component-library-*.generated.tsx",
];

function isPrototypeHost(hostRoot) {
  if (fs.existsSync(path.join(hostRoot, "prototype.config.ts"))) {
    return true;
  }
  const packageJsonPath = path.join(hostRoot, "package.json");
  if (!fs.existsSync(packageJsonPath)) return false;
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    return Boolean(deps["proto-plugin"]);
  } catch {
    return false;
  }
}

function ensureGitignore(hostRoot) {
  const gitignorePath = path.join(hostRoot, ".gitignore");
  let content = "";
  if (fs.existsSync(gitignorePath)) {
    content = fs.readFileSync(gitignorePath, "utf8");
  }

  const missing = GITIGNORE_ENTRIES.filter(
    (entry) => !content.split("\n").some((line) => line.trim() === entry.trim()),
  );
  if (missing.length === 0) {
    return { updated: false };
  }

  const suffix = missing.join("\n");
  const next = content.endsWith("\n") || content.length === 0
    ? `${content}${suffix}\n`
    : `${content}\n${suffix}\n`;
  fs.writeFileSync(gitignorePath, next, "utf8");
  return { updated: true, added: missing.length };
}

export function ensureComponentLibraryTooling(hostRoot) {
  if (!isPrototypeHost(hostRoot)) {
    return { updated: false, reason: "not-a-prototype-host" };
  }

  const gitignoreResult = ensureGitignore(hostRoot);

  return {
    updated: gitignoreResult.updated,
    gitignore: gitignoreResult,
  };
}
