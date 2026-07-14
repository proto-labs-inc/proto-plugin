const DEFAULT_SYNC_CONFIG_PATH = "prototype.sync.config.sh";
const DEFAULT_COMPONENT_LIBRARY_PAGE_PATH = "src/app/component-library/page.tsx";

export function buildPopulateComponentLibraryPrompt({
  sourcePath,
  syncConfigPath = DEFAULT_SYNC_CONFIG_PATH,
  componentLibraryPagePath = DEFAULT_COMPONENT_LIBRARY_PAGE_PATH,
  origin = "http://localhost:3003",
}: {
  sourcePath?: string;
  syncConfigPath?: string;
  componentLibraryPagePath?: string;
  origin?: string;
} = {}): string {
  const sourceLine = sourcePath?.trim()
    ? `- Source path: \`${sourcePath.trim()}\` (also readable via the \`source/\` symlink after \`pnpm link-source\`)`
    : "- Source: set `SOURCE_PATH` in `.env.local`, run `pnpm link-source`, then read via the `source/` symlink";

  const lines = [
    "Populate the Component Library for this prototype host app.",
    "",
    "## Goal",
    "The Component Library page is empty. Inspect the linked source application and extract all base styles and UI building blocks into this host repo.",
    "",
    "**Be generous — when in doubt, port more rather than less.** Prefer syncing whole directories and shared primitives over cherry-picking a minimal subset.",
    "",
    "## Source",
    sourceLine,
    "- Read the source app thoroughly before deciding what to skip.",
    "",
    "## What to extract (prioritize breadth)",
    "1. Design tokens and global styles (`globals.css`, fonts, CSS variables, theme layers)",
    "2. All shadcn/base UI primitives under `src/components/ui/`",
    "3. Shared layout primitives, form patterns, badges, cards, tables, dialogs, and other reusable chrome",
    "4. Shared utilities used by UI (`src/lib/utils.ts`, `cn` helpers, formatters, small hooks)",
    "5. **Composite components (mandatory — do not skip):** enumerate EVERY top-level export in the source design system's composite/patterns layer (e.g. a `ui-patterns` package, `src/components/patterns/`, or wherever multi-primitive components live). Render a preview for each one unless it is server-only, non-visual (pure hooks/utils/context), or requires infrastructure that cannot be mocked. If you skip one, add a short comment saying why. Do not stop at 2–3 examples — the composite section should be roughly as long as the primitives section.",
    "6. If the source organizes design-system pieces elsewhere (monorepo packages, shared folders), trace what product pages actually import and replicate those pieces here",
    "",
    "### Coverage check (before finishing)",
    "- List every composite export available in the synced source, then confirm each is either previewed on the page or explicitly skipped with a reason.",
    "- Stateful composites (modals, multi-selects, date pickers, command menus) still get a preview — wire local `useState` and a trigger so reviewers can open them.",
    "",
    "## How to sync",
    "1. Ensure `SOURCE_PATH` is set in `.env.local` and run `pnpm link-source`.",
    `2. Update \`${syncConfigPath}\` — add paths to \`SYNC_FILES\`, \`SYNC_DIRS\`, and/or \`SYNC_GLOBS\`. Prefer syncing whole directories (e.g. \`src/components/ui\`) over individual files.`,
    "3. Run `pnpm sync-from-source`.",
    "4. Re-apply any entries listed in `SYNC_LOCAL_EXTENSIONS` if this host customizes beyond source.",
    "",
    "## Component Library page",
    `After syncing, wire live previews on \`${componentLibraryPagePath}\` via \`createPrototypeComponentLibraryPage\` so each primitive and composite is visible with common variants and states.`,
    "",
    `Gallery: ${origin}/component-library`,
    "",
    "## Rules",
    "- Follow AGENTS.md — no runtime imports from `source/`; replicate into the host tree.",
    "- Preserve semantic tokens from `globals.css`; avoid hardcoded hex.",
    "- Confirm components render correctly on `/component-library` before finishing.",
  ];

  return lines.join("\n");
}

export function buildPopulateComponentLibraryCopyText(
  options: Parameters<typeof buildPopulateComponentLibraryPrompt>[0] = {},
): string {
  const prompt = buildPopulateComponentLibraryPrompt(options);
  return prompt;
}
