import {
  buildWorkspaceProfilePromptLines,
  type WorkspaceProfile,
} from "./workspace-profile";
import {
  buildPhaseHardStopLines,
  BOOTSTRAP_VERIFY_SCRIPTS,
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
    "The Component Library page is empty. Inspect the linked source application and pull all base styles and UI building blocks into this host repo. There is no pre-built export — read the source directly.",
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
    "5. **Composite components (mandatory — do not skip):** enumerate EVERY top-level export in the source design system's composite/patterns layer (e.g. a `ui-patterns` package, `src/components/patterns/`, or wherever multi-primitive components live). Render a preview for each one unless it is server-only, non-visual (pure hooks/utils/context), or requires infrastructure that cannot be mocked. If you skip one, add a `// skip: <ComponentName> - <reason>` comment in `component-library-content.tsx`. Do not stop at 2–3 examples — the composite section should be roughly as long as the primitives section. This is enforced: `pnpm verify:component-library` enumerates the synced primitive/composite directories and fails until every export is previewed or has a `// skip:` comment.",
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
        "**1. Static gate (coverage + token layer + import resolution):**",
        "```bash",
        BOOTSTRAP_VERIFY_SCRIPTS.componentLibrary,
        "```",
        "- Fails until every synced primitive/composite is previewed or `// skip:`-commented, and there is no circular `--color-*` mapping. Fix the reported items and re-run.",
        "- Also fails on any **unresolved import**: if a previewed component imports a package the host has not installed (e.g. the source uses the unified `radix-ui` package but the host lacks it), it is reported here. Add the missing package(s) to the host `package.json` and `pnpm install`, then re-run. This is the class of bug that compiles, returns HTTP 200, and then throws on the client so the section never opens.",
        "- If it reports empty/misconfigured coverage roots, set `COMPONENT_LIBRARY_PRIMITIVE_ROOTS` / `COMPONENT_LIBRARY_COMPOSITE_ROOTS` in `prototype.sync.config.sh` to the exact synced design-system dirs, then re-run.",
        "",
        "**2. Build gate (definitive render — proves the page actually compiles + renders):**",
        "```bash",
        "pnpm build",
        "```",
        "- A successful production build resolves every import, type, and server/client boundary for the component-library route — a far stronger proof than an HTTP 200 from the dev server (which does not evaluate un-expanded accordion content). If the build fails, read the error, fix it, and re-run. Do not skip this because the dev server returned 200.",
        "",
        "**3. Visual gate (computed themes — no static check can prove this):**",
        "With the dev server running (`pnpm dev`), run the headless-browser gate:",
        "```bash",
        "pnpm verify:component-library-visual",
        "```",
        "- This launches a real headless Chromium, opens `/component-library`, expands each of the three sections (`ui-primitives`, `composite-components`, `tokens`), and asserts: no console errors/page exceptions fire while a section opens, each section renders a non-empty preview surface, and `--primary` resolves to a real color distinct from `--background` (not transparent/grey). It prints the resolved token colors as evidence.",
        "- First run may require the browser binary: `pnpm exec playwright install chromium`. If the gate reports UNAVAILABLE (Playwright/Chromium missing, or dev server down), fix that and re-run — do NOT skip it or claim you verified visually without it.",
        "- If you additionally have an interactive browser tool, you may open `/component-library` and eyeball it, but the `verify:component-library-visual` OK line is the required evidence.",
        "",
        "In your reply, paste evidence: the `pnpm verify:component-library` OK output (static gate), confirmation that `pnpm build` succeeded (build gate), and the `pnpm verify:component-library-visual` OK line including the resolved token colors (e.g. 'primary: rgb(62, 207, 142)').",
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
