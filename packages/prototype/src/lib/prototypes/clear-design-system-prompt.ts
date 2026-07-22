const DEFAULT_COMPONENT_LIBRARY_PAGE_PATH = "src/app/design-system/page.tsx";
const DEFAULT_COMPONENT_LIBRARY_CONTENT_PATH =
  "src/app/design-system/design-system-content.tsx";

export function buildClearDesignSystemPrompt({
  designSystemPagePath = DEFAULT_COMPONENT_LIBRARY_PAGE_PATH,
  componentLibraryContentPath = DEFAULT_COMPONENT_LIBRARY_CONTENT_PATH,
  origin = "http://localhost:3003",
}: {
  designSystemPagePath?: string;
  componentLibraryContentPath?: string;
  origin?: string;
} = {}): string {
  const lines = [
    "Clear the Design system for this prototype host app.",
    "",
    "## Goal",
    "Reset the Design system page to its empty state so it can be repopulated from the linked source application.",
    "",
    "## What to change",
    `1. Update \`${designSystemPagePath}\` — call \`createPrototypeDesignSystemPage()\` with no \`children\` so the empty state renders.`,
    `2. Delete \`${componentLibraryContentPath}\` (or remove all preview content if you prefer keeping the file stub).`,
    "",
    "## Do not change",
    "- Synced design-system files under `src/components/ui/`, `globals.css`, or `prototype.sync.config.sh` unless the user explicitly asks to remove those too.",
    "- Package code under `packages/prototype/`.",
    "",
    `Gallery: ${origin}/design-system`,
    "",
    "## Verify",
    "- `/design-system` shows the empty state with the populate prompt.",
  ];

  return lines.join("\n");
}

export function buildClearDesignSystemCopyText(
  options: Parameters<typeof buildClearDesignSystemPrompt>[0] = {},
): string {
  return buildClearDesignSystemPrompt(options);
}
