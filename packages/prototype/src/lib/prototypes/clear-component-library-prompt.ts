const DEFAULT_COMPONENT_LIBRARY_PAGE_PATH = "src/app/component-library/page.tsx";
const DEFAULT_COMPONENT_LIBRARY_CONTENT_PATH =
  "src/app/component-library/component-library-content.tsx";

export function buildClearComponentLibraryPrompt({
  componentLibraryPagePath = DEFAULT_COMPONENT_LIBRARY_PAGE_PATH,
  componentLibraryContentPath = DEFAULT_COMPONENT_LIBRARY_CONTENT_PATH,
  origin = "http://localhost:3003",
}: {
  componentLibraryPagePath?: string;
  componentLibraryContentPath?: string;
  origin?: string;
} = {}): string {
  const lines = [
    "Clear the Component Library for this prototype host app.",
    "",
    "## Goal",
    "Reset the Component Library page to its empty state so it can be repopulated from the linked source application.",
    "",
    "## What to change",
    `1. Update \`${componentLibraryPagePath}\` — call \`createPrototypeComponentLibraryPage()\` with no \`children\` so the empty state renders.`,
    `2. Delete \`${componentLibraryContentPath}\` (or remove all preview content if you prefer keeping the file stub).`,
    "",
    "## Do not change",
    "- Synced design-system files under `src/components/ui/`, `globals.css`, or `prototype.sync.config.sh` unless the user explicitly asks to remove those too.",
    "- Package code under `packages/prototype/`.",
    "",
    `Gallery: ${origin}/component-library`,
    "",
    "## Verify",
    "- `/component-library` shows the empty state with the populate prompt.",
  ];

  return lines.join("\n");
}

export function buildClearComponentLibraryCopyText(
  options: Parameters<typeof buildClearComponentLibraryPrompt>[0] = {},
): string {
  return buildClearComponentLibraryPrompt(options);
}
