import { buildAgentContextFromPathCopyText } from "@prototype/lib/prototypes/agent-context-prompt";
import {
  buildBootstrapSetupFinalApiGateLines,
  buildBootstrapSetupMasterGatesLines,
} from "@prototype/lib/prototypes/bootstrap-setup-phase-gates";
import { buildLinkSourceCopyText } from "@prototype/lib/prototypes/link-source-prompt";
import { buildPopulateComponentLibraryCopyText } from "@prototype/lib/prototypes/populate-component-library-prompt";
import { buildWorkspaceProfileCopyText } from "@prototype/lib/prototypes/profile-prompt";
import { looksLikeAbsolutePath } from "@prototype/lib/prototypes/resolve-file-path";
import type { WorkspaceProfile } from "@prototype/lib/prototypes/workspace-profile";

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
    "Run every section below **in order**. Each section ends with **⛔ HARD STOP** — print its checkpoint line before starting the next section.",
    "",
    "Proto tracks progress from real workspace state — there are no flags to write:",
    "- Onboarding completes automatically once the source is linked and the workspace profile is set.",
    "- The component library unlocks automatically once `/component-library` is populated.",
    "- The gallery UI reads `GET /api/prototypes/bootstrap-status` — disk verify scripts alone are **not** enough to declare setup finished.",
    "",
    "Reload the gallery when setup finishes.",
    "",
    ...buildBootstrapSetupMasterGatesLines(),
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
    "Component library",
    buildPopulateComponentLibraryCopyText({
      sourcePath: absoluteSourcePath,
      syncConfigPath,
      componentLibraryPagePath,
      origin,
      workspaceProfile,
    }),
  );

  sections.push(...buildBootstrapSetupFinalApiGateLines());

  return sections.join("\n").trimEnd();
}
