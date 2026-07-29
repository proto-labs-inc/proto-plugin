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
    "## Model cost check (do this first)",
    "",
    "Workspace setup is long and mechanical — **do not run it on a premium / frontier model**.",
    "",
    "**You usually cannot see which model you are on**, and pricing changes across Cursor, Claude, OpenAI, Gemini, etc. Do **not** assume you know your current model or that training data is current.",
    "",
    "Before any other work, ask the user (one short question):",
    '',
    '> "Which model is this chat using? Setup should run on a cheap / included model (Cursor **Auto** or **Composer**, or an equivalent fast/economy tier). If you are on a frontier model (Opus, Sonnet, GPT-5-class, Gemini Pro/Ultra, etc.), switch the model picker and reply when ready."',
    "",
    "**⛔ HARD STOP** — wait for their answer. If they are on a premium/frontier model, tell them to switch and **do not start setup** until they confirm they switched (or explicitly insist on continuing).",
    "",
    "Heuristic if they name a model (approximate — when unsure, ask):",
    "- **OK for setup:** Cursor Auto, Composer / Composer Fast, Haiku-class, Flash/Lite/Mini/Nano economy tiers, other clearly labeled fast/cheap models",
    "- **Too expensive for setup:** Opus, Claude Sonnet (non-Haiku), GPT-5 / o-series reasoning, Gemini Pro/Ultra, Max/Thinking/Pro high tiers, anything marketed as frontier or highest intelligence",
    "",
    "After they confirm a cheap model (or insist), continue with the sections below.",
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
      sourcePath: absoluteSourcePath,
      syncConfigPath,
      designSystemPagePath,
      origin,
      workspaceProfile,
    }),
  );

  sections.push(...buildBootstrapSetupFinalApiGateLines());

  return sections.join("\n").trimEnd();
}
