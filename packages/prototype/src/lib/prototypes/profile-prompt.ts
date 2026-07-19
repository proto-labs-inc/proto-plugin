import {
  BOOTSTRAP_VERIFY_SCRIPTS,
  buildPhaseHardStopLines,
} from "./bootstrap-setup-phase-gates";
import { WORKSPACE_PROFILE_ENV_KEYS } from "./workspace-profile";

export function buildWorkspaceProfilePrompt({
  userName,
}: {
  userName: string;
}): string {
  const trimmedUserName = userName.trim();

  return [
    "Update the workspace profile for this prototype host app.",
    "",
    "## Workspace profile",
    `- User name: ${trimmedUserName}`,
    "",
    "## Goal",
    "Persist the user name used in agent prompts across this prototype host.",
    "",
    "## Steps",
    `1. Set \`${WORKSPACE_PROFILE_ENV_KEYS.userName}\` in \`.env.local\` at the host repo root (same file as \`SOURCE_PATH\`).`,
    "2. Restart the dev server if it is running so Next.js picks up the new env values.",
    "3. Confirm `/settings` shows the correct user name.",
    "4. Include the user name in future agent prompts when relevant.",
    ...buildPhaseHardStopLines("workspace-profile", {
      verifyCommand: BOOTSTRAP_VERIFY_SCRIPTS.workspaceProfile,
    }),
  ].join("\n");
}

export function buildWorkspaceProfileCopyText(
  options: Parameters<typeof buildWorkspaceProfilePrompt>[0],
): string {
  return buildWorkspaceProfilePrompt(options);
}

export function buildProfilePrompt({
  userName,
  companyName,
  sourceName,
  sourceDescription,
  sourcePath,
}: {
  userName: string;
  companyName: string;
  sourceName: string;
  sourceDescription?: string;
  sourcePath?: string;
}): string {
  const trimmedUserName = userName.trim();
  const trimmedCompanyName = companyName.trim();
  const trimmedSourceName = sourceName.trim();
  const trimmedDescription = sourceDescription?.trim();
  const trimmedPath = sourcePath?.trim();
  const hasLinkedSource = Boolean(trimmedPath);

  const lines = [
    "Configure workspace settings for this prototype host app.",
    "",
    "## Workspace profile",
    `- User name: ${trimmedUserName}`,
    `- Company name: ${trimmedCompanyName}`,
    `- Product codebase directory name: \`${trimmedSourceName}\``,
    "",
    "## Goal",
    hasLinkedSource
      ? "Persist these workspace settings and ensure the linked source application is correctly configured for this prototype host."
      : "Link the source application and persist these workspace settings for this prototype host.",
  ];

  if (hasLinkedSource) {
    lines.push("", "## Linked source", `- \`SOURCE_PATH\`: \`${trimmedPath}\``);
  } else if (trimmedDescription) {
    lines.push(
      "",
      "## Source context",
      trimmedDescription,
      "",
      "Use the directory name and description above to identify the correct product repo on disk.",
    );
  }

  lines.push(
    "",
    "## Steps",
    ...(hasLinkedSource
      ? [
          "1. Confirm `SOURCE_PATH` in `.env.local` matches the linked source path above.",
          "2. Run `pnpm link-source` if the `source/` symlink is missing or stale.",
          "3. Restart the dev server if env changed.",
          "4. Confirm the gallery sidebar profile shows the correct directory name.",
        ]
      : [
          "1. Identify the correct source repo from the directory name and description. Ask the user if unclear — do not guess.",
          "2. Set `SOURCE_PATH` in `.env.local` at the host repo root.",
          "3. Run `pnpm link-source` to create the `source/` symlink.",
          "4. Restart the dev server.",
          "5. Confirm the gallery sidebar profile shows the linked directory name.",
        ]),
  );

  return lines.join("\n");
}

export function buildProfileCopyText(
  options: Parameters<typeof buildProfilePrompt>[0],
): string {
  return buildProfilePrompt(options);
}
