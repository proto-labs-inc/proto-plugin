import {
  buildWorkspaceProfilePromptLines,
  type WorkspaceProfile,
} from "./workspace-profile";
import {
  buildPhaseHardStopLines,
  BOOTSTRAP_VERIFY_SCRIPTS,
  DESIGN_SYSTEM_GENERATE_COMMAND,
  EXTRACT_TAILWIND_THEME_COMMAND,
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
    "1. Sync **only** the linked source's token/theme CSS — prefer a **dedicated path** (e.g. `src/styles/product-globals.css`) rather than `SYNC_DIRS` into `packages/ui/src` or overwriting `src/app/globals.css` wholesale.",
    "2. **Append** source token imports to `src/app/globals.css` — keep existing Supabase `@import`s and `@source` scans; add the product token sheet as an additional import.",
    "3. **Do not** list `packages/ui`, `packages/ui-patterns`, or `packages/config` in `SYNC_DIRS` when those dirs already hold the bundled Supabase template.",
    "4. After `pnpm sync-from-source`, **re-apply** every `SYNC_LOCAL_EXTENSIONS` entry (especially Supabase prototype theme and globals customizations).",
    "",
    "The `/design-system` page previews the **linked source** tokens only. Existing Supabase prototypes keep their scoped theme CSS — setup must not break them.",
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
    "The Design system page shows design token swatches. Sync the source token CSS into this host, then run the shipped proto-plugin generator to extract SkillUI tokens and scaffold the tokens page.",
    "",
    ...buildWorkspaceProfilePromptLines(workspaceProfile ?? { userName: "", companyName: "" }),
    "",
    "## Source",
    sourceLine,
    "",
    "## What to sync (two CSS layers — both required)",
    "",
    "Foreign design systems split CSS into **two layers** with different lifetimes. Syncing only one produces washed-out / unstyled product UI even when token values look correct in DevTools.",
    "",
    "| Layer | What it is | Lifetime | Runtime rescoper can fix? |",
    "| --- | --- | --- | --- |",
    "| **Values** | `:root` / `.dark` / `[data-theme]` custom properties (`--cal-bg-subtle`, `--background`, …) | Runtime cascade | Yes — plugin re-scopes onto preview surfaces |",
    "| **Registration** | Tailwind `@theme` / `@theme inline` (or v3 `theme.extend`) that maps `--color-subtle: var(--cal-bg-subtle)` so utilities like `bg-subtle` are **generated** | **Build time** | **No** — missing registration → class silently emits no CSS |",
    "",
    "1. **Values:** Design tokens and global styles. Copy `:root` / theme-class token declarations **verbatim** into a host-safe sheet (e.g. `src/styles/product-globals.css`).",
    "2. **Registration (mandatory when the source has `@theme`):** Do **not** `@import` the source theme entrypoint wholesale — it almost always includes host-unsafe `@plugin` / `@config` / `@source` lines that break Turbopack. Instead extract a sanitized registration sheet:",
    "```bash",
    `${EXTRACT_TAILWIND_THEME_COMMAND} \\`,
    "  --input source/<path-to-source-theme.css> \\",
    "  --out src/styles/product-tailwind-theme.css",
    "```",
    "   Then `@import` **both** the VALUES sheet and `product-tailwind-theme.css` from `src/app/globals.css`. List the registration output in `SYNC_LOCAL_EXTENSIONS` so later syncs do not drop it.",
    "   - Tailwind **v3** sources: convert `theme.extend` color/shadow keys into a v4 `@theme inline` block (same token names), or hand-author the equivalent registration sheet — values alone still are not enough.",
    "3. **Fonts (required — copying token CSS verbatim is not enough):**",
    "   - Identify every font the source loads: `@font-face` rules in shared UI CSS (they reference asset URLs like `/fonts/cal.ttf`) **and** `next/font` / `localFont` bindings in the source layout that assign `--font-*` variables (e.g. `--font-cal`, `--font-sans`).",
    "   - Copy the referenced font **assets** into the host `public/` at the same URL paths the `@font-face` `src` expects.",
    "   - Bind each `--font-*` variable at the host root — mirror the source layout (host `src/app/layout.tsx` via `next/font/local`), or add `@font-face` + `:root { --font-*: ... }` in host `globals.css`. Do **not** rely on synced token CSS alone — it often only self-references the vars (`--font-cal: var(--font-cal)`) and never resolves without the layout binding.",
    "4. Shared utilities used by synced CSS if needed (`cn`, formatters).",
    "",
    ...buildSupabaseTemplatePreservationLines(),
    "## How to sync",
    "1. Ensure `SOURCE_PATH` is set in `.env.local` and run `pnpm link-source`.",
    "2. Read `prototype.sync.config.sh` and check for bundled Supabase template content (see section above). If present, sync linked-source tokens to a **separate path** — do not merge into Supabase packages.",
    `3. Update \`${syncConfigPath}\` — add token/theme **VALUES** CSS paths to \`SYNC_FILES\`, \`SYNC_DIRS\`, and/or \`SYNC_GLOBS\` (never into existing Supabase dirs). Prefer extracting \`:root\`/\`.dark\` only when the source file bundles \`@plugin\` directives.`,
    "4. Run `pnpm sync-from-source`.",
    "5. **Extract + import the registration layer** (see **What to sync** above) — run `extract-tailwind-theme.mjs`, `@import` the output in `globals.css`.",
    "6. Re-apply any entries listed in `SYNC_LOCAL_EXTENSIONS` if this host customizes beyond source (required when Supabase extensions are listed).",
    "7. Run the registration gate:",
    "```bash",
    BOOTSTRAP_VERIFY_SCRIPTS.tailwindThemeRegistration,
    "```",
    "",
    ...buildPhaseHardStopLines("design-system-sync", {
      verifyCommand: BOOTSTRAP_VERIFY_SCRIPTS.tailwindThemeRegistration,
      extraVerifyLines: [
        "",
        "Confirm:",
        "- `prototype.sync.config.sh` has sync paths configured",
        "- `pnpm sync-from-source` succeeded",
        "- Host `globals.css` imports **both** token VALUES and a sanitized `@theme` registration sheet",
        `- \`${BOOTSTRAP_VERIFY_SCRIPTS.tailwindThemeRegistration}\` passed (or skipped only when the source has no \`@theme\` blocks)`,
        "- `src/app/design-system/page.tsx` exists (`pnpm setup-host` if missing)",
      ],
    }),
    "",
    "## Design system tokens",
    "",
    "**Prerequisite:** CHECKPOINT 3 must already be in the conversation.",
    "",
    "After sync succeeds, run from the host repo root:",
    "",
    "```bash",
    DESIGN_SYSTEM_GENERATE_COMMAND,
    "```",
    "",
    "This runs SkillUI token extraction → `.skillui/tokens/` and scaffolds:",
    "- `design-system-tokens.generated.tsx` — semantic color swatches",
    "- `design-system-content.tsx` — renders tokens directly (no accordion)",
    "",
    "Wire `DesignSystemContent` in `design-system/page.tsx` via `createPrototypeDesignSystemPage`.",
    "",
    "Copy source token CSS faithfully. When the host still has Supabase `@import`s, **append** the synced product VALUES sheet **and** the sanitized `@theme` registration sheet to `src/app/globals.css` — do not replace Supabase imports. Do **not** hand-author a runtime token bridge — the plugin re-scopes source VALUES onto the preview surface at runtime. The rescoper does **not** generate missing Tailwind utilities; registration must be present at build time.",
    "",
    ...buildPhaseHardStopLines("design-system-previews", {
      verifyCommand: BOOTSTRAP_VERIFY_SCRIPTS.designSystemStatic,
      extraVerifyLines: [
        "",
        "**Registration gate (again — catches regressions after globals edits):**",
        "```bash",
        BOOTSTRAP_VERIFY_SCRIPTS.tailwindThemeRegistration,
        "```",
        "",
        "**Build gate:**",
        "```bash",
        "NODE_OPTIONS=--max-old-space-size=8192 pnpm build",
        "```",
        "",
        "**Visual gate (dev server running):**",
        "```bash",
        BOOTSTRAP_VERIFY_SCRIPTS.designSystemVisual,
        "```",
        "",
        "Swatches must render visible colors — `verify:design-system-loaded` (string match only) is **not** sufficient.",
        "",
        "**Typography gate:** confirm a source display/heading class (e.g. `font-cal`) renders in the real typeface on `/design-system`, not the browser fallback. If headings look like the default sans-serif, fonts were not loaded — revisit the **Fonts** step above.",
        "",
        "Do **not** claim setup is finished here.** CHECKPOINT 4 only confirms the design system renders. Continue to CHECKPOINT 5 (`pnpm verify:bootstrap-status` + `pnpm verify:design-system-visual` with dev server running).",
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
