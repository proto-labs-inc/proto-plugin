import {
  buildWorkspaceProfilePromptLines,
  type WorkspaceProfile,
} from "./workspace-profile";
import {
  buildPhaseHardStopLines,
  BOOTSTRAP_VERIFY_SCRIPTS,
  DESIGN_SYSTEM_GENERATE_COMMAND,
  SOURCE_STORIES_PARSE_COMMAND,
} from "./bootstrap-setup-phase-gates";

const DEFAULT_SYNC_CONFIG_PATH = "prototype.sync.config.sh";
const DEFAULT_DESIGN_SYSTEM_PAGE_PATH = "src/app/design-system/page.tsx";

/** Lines injected into the design-system setup prompt for neutral hosts that ship Supabase examples. */
export function buildSupabaseTemplatePreservationLines(): string[] {
  return [
    "## Existing Supabase template content (do not overwrite)",
    "",
    "Many neutral proto hosts ship **Supabase example** design-system packages and prototypes alongside the linked product source. Before syncing, check whether the host already has:",
    "",
    "- `packages/ui`, `packages/ui-patterns`, `packages/config` (bundled Supabase UI + tokens)",
    "- Supabase `@import` lines in `src/app/globals.css` (e.g. `packages/config/css/*.css`)",
    "- `src/prototypes/table-editor-filters/table-editor-filters-theme.css` (prototype-scoped Supabase tokens)",
    "- `SYNC_LOCAL_EXTENSIONS` entries in `prototype.sync.config.sh` that mention Supabase or `table-editor-filters`",
    "",
    "**If any of the above exist, treat them as host-local.** Do not sync the linked source into those paths, do not delete Supabase styles, and do not `git checkout` Supabase files to recover from a bad merge.",
    "",
    "Instead:",
    "",
    "1. Sync **only** the linked source's styles (tokens, theme CSS, fonts) and base components — prefer a **dedicated path** (e.g. `src/styles/product-globals.css`) rather than `SYNC_DIRS` into `packages/ui/src` or overwriting `src/app/globals.css` wholesale.",
    "2. **Append** source style imports to `src/app/globals.css` — keep existing Supabase `@import`s and `@source` scans; add the product style sheet as an additional import.",
    "3. **Do not** list `packages/ui`, `packages/ui-patterns`, or `packages/config` in `SYNC_DIRS` when those dirs already hold the bundled Supabase template.",
    "4. After `pnpm sync-from-source`, **re-apply** every `SYNC_LOCAL_EXTENSIONS` entry (especially Supabase prototype theme and globals customizations).",
    "",
    "The `/design-system` page previews **styles and base components** from the linked source only. Existing Supabase prototypes keep their scoped theme CSS — setup must not break them.",
    "",
  ];
}

/**
 * Conditional component-inventory route. The scan runs against the linked
 * source before any sync, and its verdict line selects one of two routes:
 * story-driven when the source ships Storybook, direct source reading when it
 * does not.
 */
export function buildComponentInventoryRouteLines(
  syncConfigPath: string,
): string[] {
  return [
    "### Component inventory route",
    "",
    "Run from the host repo root (reads the linked source only — safe before any sync):",
    "",
    "```bash",
    SOURCE_STORIES_PARSE_COMMAND,
    "```",
    "",
    "It writes `.proto/design-system-stories.json` and prints one verdict line as its last output. Take the route that matches that line.",
    "",
    "**`STORYBOOK: detected (…)` — the source's stories are the component inventory.**",
    "",
    "- Treat `.proto/design-system-stories.json` as the list of what to preview. Do not re-derive that list from a directory crawl.",
    `- **Sync paths:** each record's \`component.resolvedFile\` and \`package.dir\` are the real files behind a story — use them to choose \`SYNC_FILES\` / \`SYNC_DIRS\` entries in \`${syncConfigPath}\` instead of syncing whole trees and hoping.`,
    "- **Previews:** author one `PreviewBlock` per named story export from that story's `args`. When `viaFactory` is true the story is built by a helper, so read `initializer` instead. `metaArgs` holds args shared by every story in the file.",
    "- **Variants:** `controls[]` comes from the story file's `argTypes` `options` — the source's own variant list for a prop. Prefer it over inferring variants from `cva` internals.",
    "- **Mock data:** `fixtures[]` holds the top-level consts a story references (table rows, column defs, option lists). Lift those rather than inventing data.",
    "- **Sections:** `titleSegments` (from `meta.title`) is the source's own grouping — use it to split UI primitives from composite components. A record with `component: null` is a showcase/docs story, not one component.",
    "- **Truncation:** long `args` / `initializer` / fixture snippets are cut with a `… truncated` marker. Open the file at `storyFile` when you need the full body.",
    "- **Coverage:** every record with at least one story export should end up previewed, or carry a stated reason it was not.",
    "",
    "**`STORYBOOK: none` — the source ships no stories.**",
    "",
    "- Build the inventory by reading the source directly: component directories plus each package's `package.json` `exports` map.",
    "- Do **not** add Storybook to the source or to this host to work around a missing one.",
    "",
  ];
}

export function buildPopulateDesignSystemPrompt({
  sourcePath,
  syncConfigPath = DEFAULT_SYNC_CONFIG_PATH,
  designSystemPagePath = DEFAULT_DESIGN_SYSTEM_PAGE_PATH,
  origin = "http://localhost:3003",
  workspaceProfile,
}: {
  sourcePath?: string;
  syncConfigPath?: string;
  designSystemPagePath?: string;
  origin?: string;
  workspaceProfile?: WorkspaceProfile;
} = {}): string {
  const sourceLine = sourcePath?.trim()
    ? `- Source path: \`${sourcePath.trim()}\` (also readable via the \`source/\` symlink after \`pnpm link-source\`)`
    : "- Source: set `SOURCE_PATH` in `.env.local`, run `pnpm link-source`, then read via the `source/` symlink";

  const lines = [
    "Populate the Design system page for this prototype host app, directly from the linked source.",
    "",
    "**Run this section last** — after the source is linked and the workspace profile is set.",
    "",
    "## Goal",
    "Do your best to distill **base components and styles** from the linked source onto `/design-system` (UI primitives the product actually uses, plus tokens, colors, typography, and fonts).",
    "",
    ...buildWorkspaceProfilePromptLines(workspaceProfile ?? { userName: "", companyName: "" }),
    "",
    "## Source",
    sourceLine,
    "",
    ...buildSupabaseTemplatePreservationLines(),
    "## How to populate",
    "1. Ensure `SOURCE_PATH` is set in `.env.local` and run `pnpm link-source`.",
    "2. Build the component inventory — see **Component inventory route** below. Do this before writing sync config; the inventory tells you which source files to sync.",
    `3. Sync styles from the linked source into this host (use \`${syncConfigPath}\` + \`pnpm sync-from-source\` as needed). Prefer a dedicated product CSS path over overwriting bundled Supabase template packages.`,
    "4. Bring over base components and styles (tokens, colors, typography, fonts) so product UI can render faithfully on `/design-system`.",
    "5. Run the registration gate when the source uses Tailwind `@theme`:",
    "```bash",
    BOOTSTRAP_VERIFY_SCRIPTS.tailwindThemeRegistration,
    "```",
    "",
    ...buildComponentInventoryRouteLines(syncConfigPath),
    ...buildPhaseHardStopLines("design-system-sync", {
      verifyCommand: BOOTSTRAP_VERIFY_SCRIPTS.tailwindThemeRegistration,
      extraVerifyLines: [
        "",
        "Confirm:",
        `- \`${syncConfigPath}\` / sync succeeded as needed`,
        `- \`${BOOTSTRAP_VERIFY_SCRIPTS.tailwindThemeRegistration}\` passed (or skipped only when the source has no \`@theme\` blocks)`,
        `- \`${designSystemPagePath}\` exists (\`pnpm setup-host\` if missing)`,
      ],
    }),
    "",
    "## Design system page",
    "",
    "**Prerequisite:** CHECKPOINT 3 must already be in the conversation.",
    "",
    "After sync succeeds, run from the host repo root:",
    "",
    "```bash",
    DESIGN_SYSTEM_GENERATE_COMMAND,
    "```",
    "",
    "Wire the generated content in `design-system/page.tsx` via `createPrototypeDesignSystemPage`. Expand the page as needed so reviewers can see **base components and styles** from the linked source.",
    "",
    "That command generates token swatches only — component previews are yours to author. Work from the inventory you built in **Component inventory route** (`.proto/design-system-stories.json` on the Storybook route).",
    "",
    "**Section order (mandatory):** put **Base components** (UI primitives / composites) **above** **Colors** (token swatches / semantic colors). On the page, base components come first; colors and other style sections follow below. Do not lead with a colors-only stack.",
    "",
    "**Color swatches — wide, not tall:** use short landscape chips (e.g. `h-12 w-full`) in a dense multi-column grid. Do **not** use `w-full aspect-square` (or `PreviewGrid`'s 2-column layout for color tiles) — that produces huge tall swatches.",
    "",
    ...buildPhaseHardStopLines("design-system-previews", {
      verifyCommand: BOOTSTRAP_VERIFY_SCRIPTS.designSystemStatic,
      extraVerifyLines: [
        "",
        "**Visual gate (dev server running):**",
        "```bash",
        BOOTSTRAP_VERIFY_SCRIPTS.designSystemVisual,
        "```",
        "",
        "Do **not** claim setup is finished here. CHECKPOINT 4 only confirms the design system renders. Continue to CHECKPOINT 5 (`pnpm verify:bootstrap-status` + `pnpm verify:design-system-visual` with dev server running).",
      ],
    }),
    "",
    `Gallery: ${origin}/design-system`,
  ];

  return lines.join("\n");
}

export function buildPopulateDesignSystemCopyText(
  options: Parameters<typeof buildPopulateDesignSystemPrompt>[0] = {},
): string {
  return buildPopulateDesignSystemPrompt(options);
}
