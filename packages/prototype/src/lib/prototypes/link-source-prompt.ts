export function buildLinkSourcePrompt({
  sourceInput,
  description,
  currentSourcePath,
  referencePaths = [],
}: {
  sourceInput?: string;
  description?: string;
  currentSourcePath?: string;
  referencePaths?: string[];
} = {}): string {
  const trimmedInput = sourceInput?.trim();
  const trimmedDescription = description?.trim();
  const trimmedCurrent = currentSourcePath?.trim();
  const isUpdate = Boolean(trimmedCurrent);

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

  if (trimmedInput) {
    lines.push(`- ${trimmedInput}`);
    lines.push(
      "",
      "Resolve this to a filesystem path (folder name, relative path like `../cal.diy`, or absolute path) before writing `.env.local`.",
    );
  } else {
    lines.push("- (Specify folder name, path, or description above before copying.)");
  }

  lines.push(
    "",
    "## Clarification",
    "If the input is vague, matches multiple folders on disk, or you cannot confidently identify the correct repo from the description and filesystem, ask the user a clarifying question before changing anything. Do not guess — confirm the exact path first.",
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
    "1. Confirm the correct source path. If it is still unclear after checking the description and filesystem, ask the user before proceeding.",
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
}: {
  sourcePath?: string;
  description?: string;
  currentSourcePath?: string;
  referencePaths?: string[];
} = {}): string {
  return buildLinkSourcePrompt({
    sourceInput: sourcePath,
    description,
    currentSourcePath,
    referencePaths,
  });
}
