import {
  buildWorkspaceProfilePromptLines,
  type WorkspaceProfile,
} from "./workspace-profile";
import {
  buildPhaseHardStopLines,
  BOOTSTRAP_VERIFY_SCRIPTS,
  COMPONENT_LIBRARY_GENERATE_COMMAND,
  COMPONENT_LIBRARY_SCOPE_COMMAND,
} from "./bootstrap-setup-phase-gates";

const DEFAULT_SYNC_CONFIG_PATH = "prototype.sync.config.sh";
const DEFAULT_COMPONENT_LIBRARY_PAGE_PATH = "src/app/component-library/page.tsx";

function buildComponentLibraryProductThemeLines(): string[] {
  return [
    "### Product theme on preview surfaces (handled by the plugin)",
    "",
    "Do **not** hand-author a token bridge. Proto re-applies the source's own token rules onto the nested component-library preview surface at runtime (the *generated bridge*), so `:root`-derived tokens resolve correctly there for both light and dark. Your only job is to copy the source token CSS in faithfully — and to not break the Tailwind `--color-*` mapping layer.",
    "",
    "1. **Detect what the source ships** — app-level theme config (e.g. `next-themes` `themes={[...]}`, MUI/Chakra providers, paired light/dark token files). Do not assume from CSS files alone.",
    "2. **Configure `productThemes`** on `createPrototypeComponentLibraryPage` to match what the source actually ships: `[\"light\"]` (default), `[\"dark\"]` for dark-only sources, or `[\"light\", \"dark\"]` when the source genuinely ships both.",
    "3. **Copy the source token CSS verbatim** into the host (via `pnpm sync-from-source`) and `@import` it from `globals.css`. Preserve `:root` / theme-class declarations exactly — the runtime re-scoper reads those declarations, so they must be present and unmodified.",
    "4. **Never introduce a circular `--color-*` mapping.** Do not add a `@theme inline` block that maps a token to itself (e.g. `--color-primary: var(--color-primary)`) — that resolves to nothing and renders every button/badge/swatch unstyled. The `--color-*` names must map to the source's semantic tokens, e.g. `--color-primary: var(--primary)`, which come from the source's imported theme CSS. If the source already ships that mapping, import it; do not re-declare it self-referentially. The runtime bridge cannot fix this layer — it re-scopes source `--*` tokens, not `--color-*`.",
    "5. **Verify per mode** — open `/component-library`, expand a section, and for each configured mode confirm a chromatic token (brand/primary) resolves to the source hue (not neutral/transparent). A dark preview is correct for a dark-only source.",
  ];
}

function buildComponentLibraryPreviewContainmentLines(): string[] {
  return [
    "### Preview containment (mandatory)",
    "",
    "Component library previews render inside the gallery shell — they must not escape into viewport layout or cover gallery chrome.",
    "",
    "1. **No viewport-fixed demos** — do not mount synced Sidebar, drawer, or shell layouts that use `fixed` / `inset-y-0` / `h-screen` / `100vh` in library previews. Use inline or mock layouts inside a bounded `relative overflow-hidden` wrapper instead.",
    "2. **Scope portaled overlays** — dialogs, sheets, menus, selects, popovers, and toasts may portal to `document.body`. Wire them with local `useState` and a trigger; do not leave overlays open on mount.",
    "3. **Do not break gallery chrome** — expanding an accordion section must not shift, cover, or restyle the platform sidebar or tool header. If a preview needs a portal, confirm the review sidebar and footer remain visible and clickable after opening it.",
  ];
}

/** Hosts that ship bundled Supabase example prototypes (proto-template). */
function buildBundledSupabaseDesignSystemGuardLines(): string[] {
  return [
    "### Leave bundled Supabase packages alone (proto-template and similar hosts)",
    "",
    "Some starter hosts ship **hardcoded Supabase workspace packages** that are **not** from the linked source:",
    "",
    "- `packages/ui` (npm name `ui`) — Supabase shadcn primitives",
    "- `packages/config` (npm name `config`) — Supabase design tokens",
    "- `packages/ui-patterns` — Supabase composite patterns",
    "",
    "Bundled example prototypes (e.g. `table-editor-filters`) import from `ui` and `ui-patterns`. **Do not overwrite, rename, relocate, or duplicate these packages during setup.**",
    "",
    "**Forbidden:**",
    "- Syncing the linked source into `packages/ui` or `packages/config` when those dirs already host the Supabase stack",
    "- Changing `packages/ui/package.json` or `packages/config/package.json` names away from `ui` / `config`",
    "- Creating workaround packages such as `supabase-ui`, `supabase-config`, or rewiring `ui-patterns` to new workspace names",
    "- Removing `ui` / `ui-patterns` from root `package.json` or `transpilePackages` when bundled prototypes still import them",
    "",
    "**Instead:** sync the linked source's design system to **non-colliding paths** already scaffolded in the host (e.g. `packages/coss-ui`, `packages/calcom-ui`, `packages/calcom-config`). Set `COMPONENT_LIBRARY_PRIMITIVE_ROOTS` / `COMPONENT_LIBRARY_COMPOSITE_ROOTS` to those synced source dirs — not the Supabase `packages/ui` tree.",
    "",
    "`pnpm sync-from-source` mirrors paths 1:1. When source and host share a path but different products (Cal `@calcom/ui` vs Supabase `ui`), **omit the colliding path from `SYNC_DIRS`** and sync into the host's alternate scaffold dir instead (copy manually if the sync script has no remap).",
    "",
    "Add product theme CSS for the component library via **separate** synced token files + host `src/app/globals.css` `@import`s — do not replace the Supabase `@import`s that prototypes rely on unless you migrate every bundled prototype off `ui` / `ui-patterns` in the same change.",
  ];
}

function buildComponentLibraryPageStructureLines({
  componentLibraryPagePath = DEFAULT_COMPONENT_LIBRARY_PAGE_PATH,
  origin = "http://localhost:3003",
}: {
  componentLibraryPagePath?: string;
  origin?: string;
} = {}): string[] {
  return [
    "## Component Library page",
    `Wire \`createPrototypeComponentLibraryPage\` in \`${componentLibraryPagePath}\`. Follow AGENTS.md **Component Library** section exactly.`,
    "",
    "Implement live previews in `src/app/component-library/component-library-content.tsx` (split subsection files optional but recommended).",
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
    "- Full-width dividers between sections: handled by `LibraryAccordionSection` (proto tool chrome).",
    "- Chevrons: `LibraryAccordionSection` uses proto `AccordionTrigger` with `hideIcon` + custom `ChevronDown` — do **not** import accordion from synced source UI.",
    "- Import layout from `proto-plugin` in **host** `component-library-content.tsx`: `ComponentLibraryAccordion`, `LibraryAccordionSection`. Section modules use `PreviewGrid`, `PreviewBlock`, `PreviewStack` internally.",
    "- Synced source components belong inside section content only — never for page accordion chrome.",
    "",
    "### Coverage",
    "",
    "- List every composite export in the synced source; each appears in section 2 or has an explicit skip comment.",
    "- Composite section should be roughly as long as the primitives section.",
    "- Stateful composites still get interactive previews (local state + trigger).",
    "",
    ...buildComponentLibraryProductThemeLines(),
    "",
    ...buildComponentLibraryPreviewContainmentLines(),
    "",
    `Gallery: ${origin}/component-library`,
  ];
}

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
    "Populate the Component Library for this prototype host app, directly from the linked source.",
    "",
    "**Run this section last** — after the source is linked and the workspace profile is set.",
    "",
    "## Goal",
    "The Component Library page is empty. Sync the source design system into this host, then run the shipped proto-plugin tooling to extract tokens, scaffold previews, and produce a gate-aligned guide. Gap-fill only what the scaffolder marks `needs-override` / `throws` / `degenerate`.",
    "",
    "**Be generous — when in doubt, port more rather than less.** Prefer syncing whole directories and shared primitives over cherry-picking a minimal subset.",
    ...buildWorkspaceProfilePromptLines(workspaceProfile ?? { userName: "", companyName: "" }),
    "",
    "## Source",
    sourceLine,
    "- Read the source app thoroughly before deciding what to skip.",
    "",
    "## What to extract (prioritize breadth)",
    "1. Design tokens and global styles (`globals.css`, fonts, CSS variables, theme layers). Copy the `:root` / theme-class token declarations **verbatim** — Proto re-scopes them onto preview surfaces at runtime, so they must be present unmodified.",
    "2. All shadcn/base UI primitives under `src/components/ui/`",
    "3. Shared layout primitives, form patterns, badges, cards, tables, dialogs, and other reusable chrome",
    "4. Shared utilities used by UI (`src/lib/utils.ts`, `cn` helpers, formatters, small hooks)",
    "5. **Composite components (mandatory — do not skip):** enumerate EVERY top-level export in the source design system's composite/patterns layer (e.g. a `ui-patterns` package, `src/components/patterns/`, or wherever multi-primitive components live). Render a preview for each one. A `// skip:` is the **narrow exception, not the default** — coverage is measured by RENDERED previews. A skip only counts when its reason cites an allowlisted category: `// skip: <ComponentName> - <category>: <reason>` where `<category>` is one of `server-only`, `type-only`, `hook-only`, `non-visual`, `infra-bound`, `deprecated`. Skips without a valid category, or skipping more than ~40% of a section, **fail the gate**. Do not stop at 2–3 examples — the composite section should be roughly as long as the primitives section.",
    "6. If the source organizes design-system pieces elsewhere (monorepo packages, shared folders), trace what product pages actually import and replicate those pieces here",
    "",
    "### Coverage check (before finishing)",
    "- List every composite export available in the synced source, then confirm each is either previewed on the page or explicitly skipped with a reason.",
    "- Stateful composites (modals, multi-selects, date pickers, command menus) still get a preview — wire local `useState` and a trigger so reviewers can open them.",
    "",
    "## How to sync",
    "1. Ensure `SOURCE_PATH` is set in `.env.local` and run `pnpm link-source`.",
    `2. Update \`${syncConfigPath}\` — add paths to \`SYNC_FILES\`, \`SYNC_DIRS\`, and/or \`SYNC_GLOBS\`. Prefer syncing whole directories (e.g. \`src/components/ui\`) over individual files.`,
    "",
    ...buildBundledSupabaseDesignSystemGuardLines(),
    "",
    "3. Run `pnpm sync-from-source`. This copies the files **and auto-installs the third-party packages the synced files import** (radix-ui, cmdk, vaul, sonner, …), pinned to the source app's own versions — so previews don't throw on the client. Watch the `Dependency check:` output; if it lists packages it added, they were installed for you.",
    "4. Re-apply any entries listed in `SYNC_LOCAL_EXTENSIONS` if this host customizes beyond source.",
    "",
    "### Module-resolution recipe (pick the shape, don't improvise aliases)",
    "The source is one of two shapes — follow the matching recipe so imports resolve deterministically:",
    "- **Monorepo with design-system packages** (e.g. `packages/ui`, `packages/ui-patterns` consumed by name): sync those package dirs, keep the packages listed as `workspace:*` deps and in `transpilePackages`, and import previews **by package name** (or a single package-root alias). Do not cherry-pick deep subpaths and invent per-file aliases — that breaks the package's own relative imports. **If the host already has `packages/ui` or `packages/config` reserved for bundled Supabase prototypes, sync the linked source into alternate scaffold dirs instead** (see above).",
    "- **Plain app with `src/components/ui`** (relative imports): sync the dir preserving its relative layout and rely on the host's existing `@/*` alias. Add at most one alias for the synced root.",
    "In both cases the synced components' own internal imports (`../../lib/utils/cn`, etc.) must keep resolving — sync the util/lib dirs they depend on, don't leave them dangling.",
    ...buildPhaseHardStopLines("component-library-sync", {
      extraVerifyLines: [
        "",
        "Confirm:",
        "- `prototype.sync.config.sh` has sync paths configured",
        "- `pnpm sync-from-source` succeeded",
        "- `src/app/component-library/page.tsx` exists (`pnpm setup-host` if missing)",
      ],
    }),
    "",
    "## Component library previews",
    "",
    "**Prerequisite:** CHECKPOINT 3 must already be in the conversation.",
    "",
    "### Tooling pipeline — TWO PHASES (run from the host repo root; no host pnpm scripts)",
    "",
    "The generator is a **hybrid**: the plugin ships no code that *guesses* a design system's structure. YOU (the agent) read the source and declare the structure in a profile; a deterministic engine then wires imports/aliases/token swatches; and you author the preview bodies the engine cannot safely fake.",
    "",
    "**PHASE 1 — scope the design system (you reason, then write the profile):**",
    "",
    "```bash",
    COMPONENT_LIBRARY_SCOPE_COMMAND,
    "```",
    "",
    "- Writes `.proto/design-system-evidence.json` (raw facts: candidate packages, their `exports` maps, component dir listings, story counts, context-token hits) and prints an instruction.",
    "- **Assume you can predict nothing.** Read the source `package.json` `exports` maps + a sample of component files, then WRITE `.proto/design-system-profile.json` (schema: `node_modules/proto-plugin/scripts/lib/design-system-profile.mjs`). Declare: `packages[]`, `roots.primitive[]` / `roots.composite[]` with a `specifierTemplate` per root (`\"@pkg/ui/components/{slug}\"` for subpath, or a bare package name for barrel), `themes.modes`/`roles`, `providers` (if any component needs app context), `authored[]` (components you will hand-author), and `skips[]`.",
    "- Pick each package's import style from its ACTUAL `exports` map, not its name. Set an `aliasPrefix` per package so shared export names (e.g. `Button` in two packages) de-collide.",
    "",
    "**PHASE 2 — generate (deterministic engine, requires the profile):**",
    "",
    "```bash",
    COMPONENT_LIBRARY_GENERATE_COMMAND,
    "```",
    "",
    "Runs: (1) extract design tokens via SkillUI → `.skillui/`; (2) build the catalog from the profile and emit structure. It **blocks** if the profile is missing/invalid.",
    "",
    "Outputs (regenerable — safe to re-run after editing the profile or re-syncing):",
    "   - `component-library-tokens.generated.tsx` — swatches from `themes.roles`",
    "   - `component-library-primitive-previews.generated.tsx` — collision-aware, aliased imports + `engine` previews",
    "   - `component-library-composite-previews.generated.tsx` — same for composites",
    "   - `component-library-guide.md` — one row per export: `engine` / `authored` / `skip`",
    "   - `.proto/component-library-catalog.json` — props/variants/CVA/mined-usage metadata",
    "",
    "Stable files (not overwritten on re-run):",
    "   - `component-library-content.tsx` — accordion shell (created/migrated once)",
    "   - `component-library-overrides.tsx` — your authored previews (regeneration-safe; seeded with the `authored` list + suggested imports)",
    "",
    "Then **author the `authored` rows** — open `component-library-guide.md`. For each `authored` row, write a real preview in `component-library-overrides.tsx` (mock data, provider wrapper from `providers`, compound composition). `engine` rows already render; `skip` rows are done. The engine deliberately leaves `authored` components uncounted until you write them, so the coverage gate keeps flagging them.",
    "",
    "4. **Loop the gates** (below) until all pass.",
    "",
    ...buildComponentLibraryPageStructureLines({
      componentLibraryPagePath,
      origin,
    }),
    "",
    "## Rules",
    "- Follow AGENTS.md — no runtime imports from `source/`; replicate into the host tree.",
    "- Preserve semantic tokens from `globals.css`; avoid hardcoded hex.",
    "- Do **not** hand-author a component-library token bridge — the plugin re-scopes source tokens onto preview surfaces at runtime (generated bridge).",
    "- Do **not** add a circular `--color-*: var(--color-*)` mapping — map `--color-*` to the source semantic tokens (e.g. `--color-primary: var(--primary)`). This is the #1 cause of unstyled previews and the runtime bridge cannot fix it.",
    "- Confirm components render correctly on `/component-library` before finishing.",
    ...buildPhaseHardStopLines("component-library-previews", {
      verifyCommand: BOOTSTRAP_VERIFY_SCRIPTS.componentLibrary,
      extraVerifyLines: [
        "",
        "This phase is a loop: run all three gates below and iterate until they ALL pass. Do not print CHECKPOINT 4 until they do.",
        "",
        "**0. Scope then generate (run at the start of this phase, from host repo root):**",
        "```bash",
        COMPONENT_LIBRARY_SCOPE_COMMAND,
        "# → read evidence, author .proto/design-system-profile.json, then:",
        COMPONENT_LIBRARY_GENERATE_COMMAND,
        "```",
        "- Phase 1 gathers evidence + you author the profile; Phase 2 produces `.skillui/`, generated preview files, `component-library-guide.md`, and `.proto/component-library-catalog.json`. Phase 2 blocks without a valid profile. Re-run after editing the profile or re-syncing.",
        "",
        "**1. Static gate (coverage + token layer + import resolution):**",
        "```bash",
        BOOTSTRAP_VERIFY_SCRIPTS.componentLibrary,
        "```",
        "- Fails until every synced primitive/composite is **rendered** or validly `// skip:`-commented (with an allowlisted `<category>` reason, and skips under ~40% per section), and there is no circular `--color-*` mapping. Coverage is measured by rendered previews — a list of names as text does not count. Fix the reported items and re-run.",
        "- Also fails on any **unresolved import**: if a previewed component imports a package the host has not installed (e.g. the source uses the unified `radix-ui` package but the host lacks it), it is reported here. Add the missing package(s) to the host `package.json` and `pnpm install`, then re-run. This is the class of bug that compiles, returns HTTP 200, and then throws on the client so the section never opens.",
        "- If it reports a missing/invalid profile or empty coverage roots, fix `.proto/design-system-profile.json` (`roots.primitive[].rel` / `roots.composite[].rel` must point at the exact synced design-system dirs that exist on disk), then re-run Phase 2.",
        "",
        "**2. Build gate (definitive render — proves the page actually compiles + renders):**",
        "```bash",
        "NODE_OPTIONS=--max-old-space-size=8192 pnpm build",
        "```",
        "- A successful production build resolves every import, type, and server/client boundary for the component-library route — a far stronger proof than an HTTP 200 from the dev server (which does not evaluate un-expanded accordion content). If the build fails, read the error, fix it, and re-run. Do not skip this because the dev server returned 200.",
        "- Syncing a whole design system can make the full-repo typecheck OOM. If the build crashes with a heap/`SIGABRT` error (not a real type/compile error), the raised `--max-old-space-size` above is the fix; if it still OOMs, scope the build/typecheck to the component-library route rather than routing around this gate.",
        "",
        "**3. Visual gate (computed themes + real rendered previews — no static check can prove this):**",
        "With the dev server running (`pnpm dev`), run the headless-browser gate:",
        "```bash",
        "pnpm verify:component-library-visual",
        "```",
        "- This launches a real headless Chromium, opens `/component-library`, expands each of the three sections (`ui-primitives`, `composite-components`, `tokens`), and asserts: no console errors/page exceptions fire while a section opens, each section renders a non-empty preview surface, the primitive/composite sections contain **real rendered controls** (buttons/inputs/etc. — not a list of component NAMES as text), and `--primary` resolves to a real color distinct from `--background`. It prints the resolved token colors and control counts as evidence.",
        "- The gate is **self-bootstrapping**: it auto-installs Playwright and the Chromium binary if missing (opt out with `PROTOTYPE_NO_AUTO_BROWSER=1`). It only reports UNAVAILABLE if that install fails or the dev server is down — fix that and re-run, do NOT skip it.",
        "- **Do not** substitute an editor-specific browser (e.g. a Cursor/IDE browser MCP) for this gate — it must run identically across Cursor, Codex, and Claude Code. The `verify:component-library-visual` OK line is the required evidence.",
        "",
        "In your reply, paste evidence: the `pnpm verify:component-library` OK output (static gate), confirmation that the build succeeded (build gate), and the `pnpm verify:component-library-visual` OK line including the resolved token colors (e.g. 'primary: rgb(62, 207, 142)') and rendered control counts.",
        "",
        "**Do not claim setup is finished here.** CHECKPOINT 4 only confirms the library renders and themes. Continue to the final bootstrap status API gate (CHECKPOINT 5) before telling the user setup is complete.",
      ],
    }),
  ];

  return lines.join("\n");
}

export function buildPopulateComponentLibraryCopyText(
  options: Parameters<typeof buildPopulateComponentLibraryPrompt>[0] = {},
): string {
  return buildPopulateComponentLibraryPrompt(options);
}
