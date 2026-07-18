export const WORKSPACE_PROFILE_ENV_KEYS = {
  userName: "PROTOTYPE_USER_NAME",
  companyName: "PROTOTYPE_COMPANY_NAME",
} as const;

export type WorkspaceProfile = {
  userName: string;
  companyName: string;
};

export function readWorkspaceProfileFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): WorkspaceProfile {
  return {
    userName: env[WORKSPACE_PROFILE_ENV_KEYS.userName]?.trim() ?? "",
    companyName: env[WORKSPACE_PROFILE_ENV_KEYS.companyName]?.trim() ?? "",
  };
}

export function hasWorkspaceProfile(profile: WorkspaceProfile): boolean {
  return profile.userName.length > 0 || profile.companyName.length > 0;
}

export function resolveCommentAuthorName(
  profile: Pick<WorkspaceProfile, "userName">,
): string | undefined {
  const trimmed = profile.userName.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function resolveCommentTeamName(
  profile: Pick<WorkspaceProfile, "companyName">,
): string {
  return profile.companyName.trim();
}

/** Prompt section lines for agent copy text when profile values are set. */
export function buildWorkspaceProfilePromptLines(
  profile: WorkspaceProfile,
): string[] {
  const trimmedUserName = profile.userName.trim();
  const trimmedCompanyName = profile.companyName.trim();

  if (!trimmedUserName && !trimmedCompanyName) {
    return [];
  }

  return [
    "",
    "## Workspace profile",
    ...(trimmedUserName ? [`- User name: ${trimmedUserName}`] : []),
    ...(trimmedCompanyName ? [`- Company name: ${trimmedCompanyName}`] : []),
  ];
}
