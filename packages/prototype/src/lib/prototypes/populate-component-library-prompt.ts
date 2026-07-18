import {
  buildWorkspaceProfilePromptLines,
  type WorkspaceProfile,
} from "./workspace-profile";

const DEFAULT_SYNC_CONFIG_PATH = "prototype.sync.config.sh";
const DEFAULT_COMPONENT_LIBRARY_PAGE_PATH = "src/app/component-library/page.tsx";

export function buildPopulateComponentLibraryPrompt({
  sourcePath,
  syncConfigPath = DEFAULT_SYNC_CONFIG_PATH,
  componentLibraryPagePath = DEFAULT_COMPONENT_LIBRARY_PAGE_PATH,
  origin = "http://localhost:3003",
  workspaceProfile,
}: {
  sourcePath?: string;
  syncConfigPath?: string;
  componentLibraryPagePath?: string;
  origin?: string;
  workspaceProfile?: WorkspaceProfile;
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
    ...buildWorkspaceProfilePromptLines(workspaceProfile ?? { userName: "", companyName: "" }),
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
    `Implement live previews in \`${componentLibraryPagePath}\` (content in \`src/app/component-library/component-library-content.tsx\`) via \`createPrototypeComponentLibraryPage\`. Follow AGENTS.md **Component Library** section exactly.`,
    "",
    "### Page structure (mandatory)",
    "",
    "Single page at `/component-library`. Three collapsible accordion sections — **all collapsed on first load** (`type=\"multiple\"`, `defaultValue={[]}`):",
    "",
    "| # | `id` / accordion value | Title | Content |",
    "| - | ---------------------- | ----- | ------- |",
    "| 1 | `ui-primitives` | UI primitives | Synced `ui` / shadcn primitives — buttons, inputs, badges, cards, dialogs, tabs, switches, etc. Use `PreviewGrid` / `PreviewBlock` / `PreviewStack` with variant/state examples. |",
    "| 2 | `composite-components` | Composite components | Synced patterns/composites (`ui-patterns` or equivalent) — page headers, empty states, admonitions, metric cards, modals, multi-selects, etc. **One preview per export** unless server-only/non-visual (comment skips). Wire `useState` for stateful previews. |",
    "| 3 | `tokens` | Design tokens | Semantic color/surface swatches from `globals.css` / source tokens. |",
    "",
    "### Layout & UX rules",
    "",
    "- Shell already shows \"Component Library\" / \"Base components from the source directory.\" — **do not** duplicate that header or add section subtitles/eyebrows.",
    "- Accordion section triggers: **title only** (e.g. \"UI primitives\"). No \"Synced from packages/ui…\" paragraphs.",
    "- Full-width dividers between sections: `border-b !border-stronger` on each `AccordionItem`, wrapper `-mx-6 pb-20`; first section trigger `pt-0`.",
    "- Chevrons: up when collapsed, down when expanded (`ChevronDown`, `rotate-180` closed / `rotate-0` open; override default `AccordionTrigger` icon).",
    "- Copy the `LibraryAccordionSection` + preview helper pattern from the reference host `component-library-content.tsx` if present; otherwise match this spec.",
    "",
    "### Coverage",
    "",
    "- List every composite export in the synced source; each appears in section 2 or has an explicit skip comment.",
    "- Composite section should be roughly as long as the primitives section.",
    "- Stateful composites still get interactive previews (local state + trigger).",
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
