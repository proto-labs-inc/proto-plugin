import { looksLikeAbsolutePath } from "@prototype/lib/prototypes/resolve-file-path";
import {
  buildOnboardingFolderPathResolutionLines,
  buildOnboardingFolderPathResolutionStep,
} from "@prototype/lib/prototypes/onboarding-folder-path-resolution-prompt";

export function buildLinkSourcePrompt({
  sourceInput,
  description,
  currentSourcePath,
  referencePaths = [],
  selectedFolderName,
}: {
  sourceInput?: string;
  description?: string;
  currentSourcePath?: string;
  referencePaths?: string[];
  /** Folder name from onboarding picker when absolute path was not captured. */
  selectedFolderName?: string;
} = {}): string {
  const trimmedInput = sourceInput?.trim();
  const trimmedDescription = description?.trim();
  const trimmedCurrent = currentSourcePath?.trim();
  const trimmedFolderName = selectedFolderName?.trim();
  const isUpdate = Boolean(trimmedCurrent);
  const hasAbsoluteSourceInput = Boolean(
    trimmedInput && looksLikeAbsolutePath(trimmedInput),
  );

  const lines = [
    isUpdate
      ? "Update the linked source application for this prototype host app."
      : "Link the source application for this prototype host app.",
    "",
    "## Goal",
    "Set `SOURCE_PATH` in `.env.local` and run `pnpm link-source` so the `source/` symlink points at the real product repo.",
  ];

  if (trimmedCurrent) {
    lines.push("", "## Current source", `- \`SOURCE_PATH\`: \`${trimmedCurrent}\``);
  }

  lines.push("", "## Desired source");

  if (hasAbsoluteSourceInput) {
    lines.push(`- \`${trimmedInput}\``);
    lines.push(
      "",
      "This is the absolute path from Proto onboarding. Confirm it exists and looks like the real product repo (its own `package.json`, `src/`, and design-system files) before writing `.env.local`.",
    );
  } else if (trimmedFolderName) {
    lines.push(`- Folder selected in onboarding: \`${trimmedFolderName}\``);
    lines.push("", ...buildOnboardingFolderPathResolutionLines(trimmedFolderName));
  } else if (trimmedInput) {
    lines.push(`- ${trimmedInput}`);
    lines.push(
      "",
      "Resolve this to a filesystem path (relative path like `../cal.diy` or absolute path) before writing `.env.local`. If it is only a folder name, use common sense to locate it under the user's home directory (Documents, Downloads, Projects, etc.) — do not run broad search scripts.",
    );
  } else {
    lines.push("- (Specify folder name, path, or description above before copying.)");
  }

  lines.push(
    "",
    "## Clarification",
    "If the path is still unclear after checking the most likely locations, ask the user to confirm the exact folder they picked in onboarding.",
  );

  if (trimmedDescription) {
    lines.push("", "## Notes", trimmedDescription);
  }

  if (referencePaths.length > 0) {
    lines.push(
      "",
      "## Reference screenshots",
      "Use these files for additional context:",
    );
    for (const referencePath of referencePaths) {
      lines.push(`- \`${referencePath}\``);
    }
  }

  lines.push(
    "",
    "## Steps",
    hasAbsoluteSourceInput
      ? "1. Confirm the absolute path exists and is the correct product repo."
      : trimmedFolderName
        ? buildOnboardingFolderPathResolutionStep(trimmedFolderName)
        : "1. Confirm the correct source path. If it is still unclear, use common sense to check likely repo locations under the user's home directory before asking the user.",
    "2. Set or update `SOURCE_PATH` in `.env.local` at the host repo root (see `.env.example`).",
    "3. Run `pnpm link-source` from the host repo to create or refresh the `source/` symlink.",
    "4. Restart the dev server if it is already running so env changes are picked up.",
    "5. Confirm the gallery sidebar footer shows the correct source directory name.",
  );

  return lines.join("\n");
}

export function buildLinkSourceCopyText({
  sourcePath,
  description,
  currentSourcePath,
  referencePaths = [],
  selectedFolderName,
}: {
  sourcePath?: string;
  description?: string;
  currentSourcePath?: string;
  referencePaths?: string[];
  selectedFolderName?: string;
} = {}): string {
  return buildLinkSourcePrompt({
    sourceInput: sourcePath,
    description,
    currentSourcePath,
    referencePaths,
    selectedFolderName,
  });
}
