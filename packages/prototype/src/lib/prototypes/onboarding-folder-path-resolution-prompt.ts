export function buildOnboardingFolderPathResolutionLines(
  folderName: string,
): string[] {
  const trimmedFolderName = folderName.trim();

  return [
    `No absolute path was captured for folder \`${trimmedFolderName}\`.`,
    "",
    "Locate the product repo on this machine using your own judgment — do **not** run broad filesystem search scripts (no `find`, `mdfind`, `locate`, or full-home-directory scans).",
    "",
    "Use common sense about where repos usually live on a dev machine (`Documents`, `Downloads`, `Desktop`, `Projects`, sibling folders to this host repo, etc.) and check the most likely paths first. The folder basename should match `" +
      trimmedFolderName +
      "` (exact match preferred), and the repo root should look like the real product application (has its own `package.json`, `src/`, and design-system files).",
    "",
    "If a few plausible candidates exist, pick the best match and say why. Ask the user only if you cannot find a reasonable path after checking likely locations.",
  ];
}

export function buildOnboardingFolderPathResolutionStep(
  folderName: string,
): string {
  const trimmedFolderName = folderName.trim();
  return `1. Resolve the absolute path: use common sense to find \`${trimmedFolderName}\` on this machine (check likely repo locations under the user's home directory — Documents, Downloads, Projects, etc.). Confirm it is the correct product repo (has its own \`package.json\` and design-system files) at the repo root. Do not run broad search scripts. Ask the user only if no plausible match is found.`;
}
