import { buildAgentContextFromPathCopyText } from "@prototype/lib/prototypes/agent-context-prompt";
import { buildLinkSourceCopyText } from "@prototype/lib/prototypes/link-source-prompt";
import { buildPopulateComponentLibraryCopyText } from "@prototype/lib/prototypes/populate-component-library-prompt";
import { buildWorkspaceProfileCopyText } from "@prototype/lib/prototypes/profile-prompt";
import { looksLikeAbsolutePath } from "@prototype/lib/prototypes/resolve-file-path";
import type { WorkspaceProfile } from "@prototype/lib/prototypes/workspace-profile";
import { buildMarkWorkspaceOnboardedPromptLines } from "@prototype/lib/prototypes/workspace-onboarded";

function appendSection(sections: string[], title: string, body: string) {
  const trimmedBody = body.trim();
  if (!trimmedBody) return;
  sections.push(`## ${title}`, "", trimmedBody, "");
}

export function buildBootstrapSetupCopyText({
  sourcePath,
  sourceFolderName,
  sourceDescription,
  currentSourcePath,
  userName,
  agentContextPath,
  syncConfigPath,
  componentLibraryPagePath,
  origin,
  workspaceProfile,
}: {
  sourcePath?: string;
  sourceFolderName?: string;
  sourceDescription?: string;
  currentSourcePath?: string;
  userName: string;
  agentContextPath?: string;
  syncConfigPath?: string;
  componentLibraryPagePath?: string;
  origin?: string;
  workspaceProfile?: WorkspaceProfile;
}): string {
  const sections = [
    "Complete prototype workspace setup for this host app.",
    "",
    "Run every section below in order. The agent writes two flags when done:",
    "- `.proto/component-library-loaded` — immediately after the component library sync",
    "- `.proto/onboarded` — last, after every step succeeds",
    "",
    "Reload the gallery after marking onboarded.",
    "",
  ];

  const trimmedSourcePath = sourcePath?.trim();
  const trimmedSourceFolderName = sourceFolderName?.trim();
  const trimmedSourceDescription = sourceDescription?.trim();
  const absoluteSourcePath =
    trimmedSourcePath && looksLikeAbsolutePath(trimmedSourcePath)
      ? trimmedSourcePath
      : undefined;

  if (
    absoluteSourcePath ||
    trimmedSourceFolderName ||
    trimmedSourceDescription
  ) {
    appendSection(
      sections,
      "Link source directory",
      buildLinkSourceCopyText({
        sourcePath: absoluteSourcePath,
        selectedFolderName:
          absoluteSourcePath ? undefined : trimmedSourceFolderName,
        description: trimmedSourceDescription,
        currentSourcePath,
      }),
    );
  }

  const trimmedUserName = userName.trim();
  if (trimmedUserName) {
    appendSection(
      sections,
      "Workspace profile",
      buildWorkspaceProfileCopyText({ userName: trimmedUserName }),
    );
  }

  appendSection(
    sections,
    "Component library",
    buildPopulateComponentLibraryCopyText({
      sourcePath: absoluteSourcePath,
      syncConfigPath,
      componentLibraryPagePath,
      origin,
      workspaceProfile,
    }),
  );

  const trimmedAgentContextPath = agentContextPath?.trim();
  if (trimmedAgentContextPath) {
    appendSection(
      sections,
      "Agent context",
      buildAgentContextFromPathCopyText({
        contextFilePath: trimmedAgentContextPath,
      }),
    );
  }

  appendSection(
    sections,
    "Mark workspace onboarded",
    buildMarkWorkspaceOnboardedPromptLines().join("\n"),
  );

  return sections.join("\n").trimEnd();
}
