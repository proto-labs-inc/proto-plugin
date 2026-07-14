export type UpgradeProtoPluginPromptOptions = {
  installed: string;
  latest: string;
};

export function buildUpgradeProtoPluginPrompt({
  installed,
  latest,
}: UpgradeProtoPluginPromptOptions): string {
  return [
    `Upgrade \`proto-plugin\` in this host app from \`${installed}\` to \`${latest}\`. **Do every step yourself** — the user should not run commands manually.`,
    "",
    "## Your job",
    `Update the dependency, restart the dev server if needed, and confirm the gallery and at least one prototype still work on \`${latest}\`.`,
    "",
    "## Versions",
    `- Installed: \`${installed}\``,
    `- Latest: \`${latest}\``,
    "",
    "## Steps",
    "1. Detect the package manager from the lockfile (`pnpm-lock.yaml`, `package-lock.json`, or `yarn.lock`).",
    "2. Update the dependency:",
    `   - pnpm: \`pnpm update proto-plugin\` or \`pnpm add proto-plugin@${latest}\``,
    `   - npm: \`npm install proto-plugin@${latest}\``,
    `   - yarn: \`yarn add proto-plugin@${latest}\``,
    "3. Restart the dev server if it is already running.",
    `4. Skim \`node_modules/proto-plugin/AGENTS.md\` (or the package changelog on npm) for breaking changes since \`${installed}\`.`,
    "5. Open `/` and one prototype preview — confirm the gallery and review chrome load without errors.",
    "",
    "## Notes",
    "- Do not modify prototype source under `src/prototypes/` unless AGENTS.md or the changelog requires migration steps for this upgrade.",
    "- If the update fails (peer dependency conflicts, build errors), diagnose and fix before stopping.",
  ].join("\n");
}

export function buildUpgradeProtoPluginCopyText(
  options: UpgradeProtoPluginPromptOptions,
): string {
  return buildUpgradeProtoPluginPrompt(options);
}

export function buildUpgradeProtoPluginCommand({
  latest,
}: Pick<UpgradeProtoPluginPromptOptions, "latest">): string {
  return `pnpm add proto-plugin@${latest}`;
}
