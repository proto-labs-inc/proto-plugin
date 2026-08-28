import {
  buildAgentContextCopyText,
  buildAgentContextFromPathCopyText,
} from "@prototype/lib/prototypes/agent-context-prompt";
import {
  buildBootstrapSetupFinalApiGateLines,
  buildBootstrapSetupMasterGatesLines,
} from "@prototype/lib/prototypes/bootstrap-setup-phase-gates";
import { buildLinkSourceCopyText } from "@prototype/lib/prototypes/link-source-prompt";
import { buildPopulateDesignSystemCopyText } from "@prototype/lib/prototypes/populate-design-system-prompt";
import { buildWorkspaceProfileCopyText } from "@prototype/lib/prototypes/profile-prompt";
import { looksLikeAbsolutePath } from "@prototype/lib/prototypes/resolve-file-path";
import type { WorkspaceProfile } from "@prototype/lib/prototypes/workspace-profile";

/** When SOURCE_PATH is already set, it wins over stale onboarding folder names. */
export function resolveBootstrapLinkSourceInputs({
  sourcePath,
  sourceFolderName,
  currentSourcePath,
}: {
  sourcePath?: string;
  sourceFolderName?: string;
  currentSourcePath?: string;
}): {
  linkSourcePath?: string;
  linkFolderName?: string;
  linkCurrentSourcePath?: string;
  effectiveSourcePath?: string;
} {
  const trimmedCurrent = currentSourcePath?.trim();
  const trimmedSourcePath = sourcePath?.trim();
  const absoluteSourcePath =
    trimmedSourcePath && looksLikeAbsolutePath(trimmedSourcePath)
      ? trimmedSourcePath
      : undefined;
  const trimmedFolderName = sourceFolderName?.trim();

  if (trimmedCurrent && !absoluteSourcePath) {
    return {
      linkSourcePath: trimmedCurrent,
      effectiveSourcePath: trimmedCurrent,
    };
  }

  const linkCurrentSourcePath =
    absoluteSourcePath && trimmedCurrent && absoluteSourcePath !== trimmedCurrent
      ? trimmedCurrent
      : undefined;

  return {
    linkSourcePath: absoluteSourcePath,
    linkFolderName: absoluteSourcePath ? undefined : trimmedFolderName,
    linkCurrentSourcePath,
    effectiveSourcePath: absoluteSourcePath ?? trimmedCurrent,
  };
}

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
  agentContext,
  agentContextPath,
  syncConfigPath,
  designSystemPagePath,
  origin,
  workspaceProfile,
}: {
  sourcePath?: string;
  sourceFolderName?: string;
  sourceDescription?: string;
  currentSourcePath?: string;
  userName: string;
  agentContext?: string;
  agentContextPath?: string;
  syncConfigPath?: string;
  designSystemPagePath?: string;
  origin?: string;
  workspaceProfile?: WorkspaceProfile;
}): string {
  const sections = [
    "Complete prototype workspace setup for this host app.",
    "",
    "Run every section below **in order**. Each section ends with **⛔ HARD STOP** — print its checkpoint line before starting the next section.",
    "",
    "Proto tracks progress from real workspace state — there are no flags to write:",
    "- Host env vars resolve from `process.env` first (incl. Vercel), then `.env.local`. Gallery onboarding completes once `SOURCE_PATH` and the workspace profile are set. Creating the `source/` symlink is still required before design-system sync.",
    "- The design system unlocks automatically once `/design-system` is populated with styles and base components from the linked source.",
    "- The gallery UI reads `GET /api/prototypes/bootstrap-status` — disk verify scripts alone are **not** enough to declare setup finished.",
    "",
    "Reload the gallery when setup finishes.",
    "",
    ...buildBootstrapSetupMasterGatesLines(),
    "",
  ];

  const trimmedSourceDescription = sourceDescription?.trim();
  const linkSourceInputs = resolveBootstrapLinkSourceInputs({
    sourcePath,
    sourceFolderName,
    currentSourcePath,
  });

  if (
    linkSourceInputs.linkSourcePath ||
    linkSourceInputs.linkFolderName ||
    trimmedSourceDescription
  ) {
    appendSection(
      sections,
      "Link source directory",
      buildLinkSourceCopyText({
        sourcePath: linkSourceInputs.linkSourcePath,
        selectedFolderName: linkSourceInputs.linkFolderName,
        description: trimmedSourceDescription,
        currentSourcePath: linkSourceInputs.linkCurrentSourcePath,
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
  appendSection(
    sections,
    "Agent context",
    trimmedAgentContextPath
      ? buildAgentContextFromPathCopyText({
          contextFilePath: trimmedAgentContextPath,
        })
      : buildAgentContextCopyText({ content: agentContext ?? "" }),
  );

  appendSection(
    sections,
    "Design system",
    buildPopulateDesignSystemCopyText({
      sourcePath: linkSourceInputs.effectiveSourcePath,
      syncConfigPath,
      designSystemPagePath,
      origin,
      workspaceProfile,
    }),
  );

  sections.push(...buildBootstrapSetupFinalApiGateLines());

  return sections.join("\n").trimEnd();
}
