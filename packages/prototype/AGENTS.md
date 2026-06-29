# AGENTS.md

Instructions for AI agents working with `prototype` and host-app prototypes.

## Scope in host repos

Unless `DEVELOPER=true` is set in `.env.local`, agent work scope in a **host app** (e.g. `your-host-app`) is `**src/prototypes/<slug>/` only**. Do not modify prototype package code (`packages/prototype/`), app routing, or shared UI unless explicitly developing the prototype package.

---

## Architecture


| Layer                  | Location                                                                | Notes                                                            |
| ---------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Prototype**   | `packages/prototype/`                                            | Shell, comments, variant explorer, gallery client, verify script |
| **Host prototypes**    | `src/prototypes/<slug>/`                                                | Feature UI, mock data, `component-ids.ts`                        |
| **Host manifest**      | `prototype.config.ts`                                                   | Registers all prototypes                                         |
| **Host design system** | `src/app/globals.css`, `@/components/ui`                                | Synced from source; host prototypes only                         |
| **Tool design system** | Host `globals.css`, `src/components/ui/`, `src/components/platform-ui/` | Uses host tokens; shadcn primitives + tool chrome composites     |


Host prototypes import framework from `prototype` and UI from `@/components/ui`.

**Prototype package code must never import `@/components/ui` or `@/lib/utils` from the host.** Use `@prototype/components/ui`, `@prototype/components/platform-ui`, and `@prototype/lib/utils` only.

---

## Relationship to source app (host apps)

Host apps replicate product UI from the **source application** (linked read-only via `SOURCE_PATH` and `pnpm link-source`) **exactly** — standalone code, no runtime imports from the source monorepo.

### What is synced vs replicated


| Layer                   | Source                                                   | Runtime import from source? |
| ----------------------- | -------------------------------------------------------- | --------------------------- |
| Design tokens + base UI | Synced → `@/components/ui`, `globals.css`                | No                          |
| Feature/page UI         | Replicated → `src/prototypes/<slug>/_components/`        | No                          |
| Data / auth / routing   | Mock constants + local state                             | No                          |
| Source reference        | `source/` symlink (`SOURCE_PATH` + `pnpm link-source`) | Read-only                   |


**Synced** via `pnpm sync-from-source`: `globals.css` (host only), fonts, `src/components/ui/`, shared utils.

**Replicated per prototype**: page components, layout shells, form/section layout, mock data.

### Source sync config (`prototype.sync.config.sh`)

The sync/link scripts are host-agnostic — package code names nothing host-specific. The host declares everything in a `prototype.sync.config.sh` at its repo root (the scripts error until it exists). Create it from the template at `scripts/lib/host-config.example.sh`. It declares:

- `SYNC_FILES`, `SYNC_DIRS`, `SYNC_GLOBS` — paths to copy from source (mirrored 1:1).
- `SYNC_LOCAL_EXTENSIONS` — components this host customizes beyond source; printed as a re-apply reminder since the sync overwrites them.
- `SOURCE_DB_ENV_VARS`, `SOURCE_DB_CONSOLE_URL` — env vars `link-source-db` copies from the source app's `.env.local`, and the console URL to print.

### How to build a prototype from source

1. Link source: `SOURCE_PATH` in `.env.local`, run `pnpm link-source`. (First-time setup: create `prototype.sync.config.sh` from `scripts/lib/host-config.example.sh`.)
2. Find the real page in source and read it fully.
3. Trace imports; classify as base UI (`@/components/ui`), shared util, context-bound (mock), or layout chrome (`Mock`*).
4. Copy render logic, not infrastructure — preserve class names, layout, semantic tokens.
5. Mock data as typed constants matching screenshots/source fixtures.
6. Look up dimensions from source — do not guess.
7. Wire prototype infrastructure (checklist below).
8. Run `pnpm verify:prototype-ids`.

Default to **mock data only**.

Reference prototype: `example-feature` — `src/prototypes/example-feature/` (or any registered slug in your host app).

---

## Prototypes (`src/prototypes/`)

Shareable UI at `/prototypes/[slug]`. Registered in `prototype.config.ts`.

**Every UI component must be comment-anchorable** — enforced by `pnpm verify:prototype-ids`.

### Rules (mandatory)

1. **Register** the slug in `prototype.config.ts` and add a screenshot under `public/prototypes/screenshots/`.
2. **Create** `src/prototypes/<slug>/component-ids.ts` — every component target id (see `example-feature/component-ids.ts`).
3. **Wire comments** with `usePrototypeComments` on the page (see `example-feature/index.tsx`).
4. **Wrap the root JSX of every React component** in `PrototypeComponent` from `prototype`.
5. **On-page prototype controls** (state pickers, variant tabs, preview toggles) must use `PrototypeControl` or `PrototypeControlGroup`, not plain `PrototypeComponent`.
6. **Use ids from the registry only** — dev mode logs an error for unregistered ids.
7. **Id naming:**
  - File's main export: kebab-case filename (`settings-section.tsx` → `settings-section`; `index.tsx` → `page`).
  - Other functions in the same file: `{filename}.{function-kebab}`.
  - Dynamic list items: add a prefix to `dynamicPrefixes` in `component-ids.ts`.
8. **Scroll container:** `PrototypeComponent` with `id="scroll-container"` on the main `overflow-y-auto` wrapper.
9. **Do not** use `data-testid` for comment anchoring.

### Examples

```tsx
import { PrototypeComponent } from "prototype";

export function SettingsSection(props: SettingsSectionProps) {
  return (
    <PrototypeComponent id="settings-section" className="...">
      ...
    </PrototypeComponent>
  );
}
```

```tsx
import { PrototypeControl } from "prototype";

export function PrototypePreviewStateSelect(...) {
  return (
    <PrototypeControl id="prototype-preview-state-select" className="flex items-center gap-2">
      ...
    </PrototypeControl>
  );
}
```

### New prototype checklist

1. Identify the source page/feature and confirm visual parity.
2. Create `src/prototypes/<slug>/` with a default export page component.
3. Add `component-ids.ts` — exhaustive static id list + `dynamicPrefixes`.
4. Register in `prototype.config.ts` with `componentRegistry`.
5. Wrap every UI component in `PrototypeComponent` / `PrototypeControl`.
6. Call `usePrototypeComments(liveState, onRestore)` on the page.
7. Run `pnpm verify:prototype-ids`.
8. Capture screenshot; share via `pnpm share-prototype <slug>`.

---

## Preview states & state map

Prototypes with preview modes use `definePreviewStateRegistry` in `*-preview-states.ts`. One registry drives the state picker, map nodes, `edges`, and sections.

### State map layout

Edge paths draw directly between node anchors (straight or elbow segments). They **do not route around** other states.

When two states are connected by an `edges` entry, arrange `canvasLayout.rows` so **no unrelated state sits on the path between them**. Otherwise the connector passes through the intervening card — arrows only render at path endpoints, so the middle segment looks directionless and the link reads ambiguously.

Prefer adjacent columns on the same row, or use `{ id, column }` / `startColumn` to offset nodes so vertical edges do not cut through unrelated cards in the same column.

Reference: `src/prototypes/example-feature/_components/list-preview-states.ts`.

---

## Design exploration

Use when comparing **2+ UI directions** for the same user problem.


| Layer         | Location                                               | Owns                                                                                         |
| ------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| **Tool**      | `prototype` (`PrototypeVariantExplorer`, etc.) | Modal chrome, variant tabs, Mobbin gallery, localStorage for brief fields |
| **Prototype** | `src/prototypes/<slug>/_components/`                   | Variant renderers, context JSON, Mobbin references, `component-ids.ts`      |


Reference: `src/prototypes/proto-partner-page/_components/invite-copy-design-exploration-config.tsx` + `invite-copy-variant-toggle.tsx`.

### Renderers

Build one preview per option with `buildDesignExplorationRenderers`. In host prototype files (client components), import from `@prototype/...` — not the `proto-plugin` barrel, which includes server-only modules:

```ts
import { buildDesignExplorationRenderers } from "@prototype/lib/prototypes/build-design-exploration-renderers";
import { DesignExplorationVariantPreviewShell } from "@prototype/components/prototypes/design-exploration-variant-preview-shell";

const renderers = buildDesignExplorationRenderers(VARIANT_OPTIONS, (variant) => (
  <MyBlock variant={variant} />
));

// Overlay-style variants (absolute positioning on the live page):
const renderers = buildDesignExplorationRenderers(VARIANT_OPTIONS, (variant) => (
  <DesignExplorationVariantPreviewShell layout={isOverlay(variant) ? "overlay" : "inline"}>
    <MyBlock variant={variant} />
  </DesignExplorationVariantPreviewShell>
));
```

Do not hand-roll renderer maps that return `null` for some variants — the helper maps every option and warns in dev when a renderer returns empty content.

### Config shape

```ts
{
  componentIdPrefix: string;
  variantTabsIdPrefix: string;
  storageKeyPrefix: string;
  variant, onVariantChange,
  options: { value, label, hint? }[];
  renderers: Record<TVariant, ComponentType>;
  brief: { titleDefault, descriptionDefault };
  defaultVariant?: TVariant; // codebase-stored default (e.g. DEFAULT_*_VARIANT); marked "Default" in the brief
  context?: { label, data: unknown, render?, defaultExpanded?, panelId? };
  mobbin?: { references, title?, description?, imagePathForReference? };
  variantsSection?: { title?, description? };
}
```

The default variant lives in the codebase config (`defaultVariant`, typically `DEFAULT_*_VARIANT`) — not KV. In the brief, each non-default option shows a **Make default** button that copies a prompt (`buildSetDefaultVariantPrompt`) asking an agent to update that constant; the current default is marked **Default**.

### Iterating on variants

When asked to **modify an existing option**, add a **new variant** (do not replace in place), register ids, and update `DEFAULT_*_VARIANT`.

**Variant list order:** prepend each new entry to the top of `*_VARIANT_OPTIONS` (first item in the array). That order drives the design-brief sidebar/modal scroll view and variant tabs — newest explorations appear at the top.

In review mode, each exploration sidebar includes a brief field and **Copy prompt** button below the header. It copies `buildMoreDesignExplorationVariantsCopyText` with the typed brief, existing variants, and config path — use that to request more layout directions from an agent.


| Prompt intent         | Action                                          |
| --------------------- | ----------------------------------------------- |
| Targeted modification | One new derivative variant; keep prior variants |
| Broad regeneration    | New full set of variants                        |


---

## PR split specs (implementation plan)

Use when a prototype ships as a **sequence of small source PRs** rather than one monolith. The review sidebar **Spec** panel lists each PR, previews its slice, and generates agent prompts.


| Layer         | Location                             | Owns                                                                                                                                             |
| ------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Tool**      | `prototype`                  | `PrototypeSpecPanelContent`, `buildPrSplitPrototypeUrl`, `buildPrAgentPrompt`, Vercel preview fetch (`/api/pr-vercel-preview`), highlight tokens |
| **Prototype** | `src/prototypes/<slug>/_components/` | `PR_SPLIT_ENTRIES` data, `PR_SPLIT_CONFIG`, wireframe renderers, live-state URL wiring                                                           |


Reference: `example-feature/_components/pr-split-config.ts` + `pr-split-wireframes.tsx`.

### Host setup

1. Re-export the preview API route:

```ts
// src/app/api/pr-vercel-preview/route.ts
export { getPrVercelPreview as GET } from "prototype/server";
```

1. Set `GITHUB_TOKEN` (or rely on local `gh` CLI) so PR cards can resolve Vercel preview URLs.

### Prototype data (`pr-split-config.ts`)

Keep **only** prototype-specific config and entries in the host prototype:

```ts
import type { PrSplitConfig, PrSplitEntry as PrSplitEntryBase } from "prototype";

export type MyWireframeId = "sidebar" | "invite-form" | "member-list" | /* … */;

export type MyPrSplitEntry = PrSplitEntryBase<MyWireframeId, MyLiveState>;

export const PR_SPLIT_CONFIG: PrSplitConfig<MyLiveState> = {
  slug: "my-slug",
  seriesLabel: "My feature FE",
  sourceRepo: "your-org/your-repo",
  sourceWorkPath: "apps/web",
  configFilePath: "src/prototypes/my-slug/_components/pr-split-config.ts",
  branchName: (entry) => `feature/my-feature-fe-${entry.order}-…`,
  writeEntryToSearchParams: (searchParams, entry) => {
    // Write liveState into URL params (plus tool adds `prSplit=<order>`)
  },
  defaultPreviewPath: "/settings/team",
  vercelProjectName: "source-app",
  scopeNote: "Do not bundle unrelated work.",
};

export const PR_SPLIT_ENTRIES: MyPrSplitEntry[] = [
  {
    order: 1,
    title: "…",
    description: "…",
    size: "Small" | "Medium" | "Large",
    targetId: "my-slug.settings-section", // registered in component-ids.ts
    liveState: { /* restores prototype when card is clicked */ },
    wireframeId: "invite-form",
    prUrl: "https://github.com/your-org/your-repo/pull/…", // after PR opens
    branch: "…",
    analyticsNotes: ["Event name"],
    approved: true,
  },
];
```

**Entry fields:**


| Field                          | Required       | Purpose                                                                        |
| ------------------------------ | -------------- | ------------------------------------------------------------------------------ |
| `order`                        | yes            | Merge sequence (1, 2, 3…)                                                      |
| `title`, `description`, `size` | yes            | Card copy + agent prompt                                                       |
| `targetId`                     | yes            | Component to highlight (`focusShareTarget`) — must exist in `component-ids.ts` |
| `liveState`                    | yes            | Prototype state restored when the card is selected                             |
| `wireframeId`                  | yes            | Key into prototype wireframe registry                                          |
| `prUrl`, `branch`              | after PR opens | Sidebar links + dependency chain in prompts                                    |
| `linearUrl`                    | optional       | Linear issue link shown in the PR split sidebar                                  |
| `previewPath`                  | optional       | Path on Vercel preview host (default from config)                              |
| `vercelPreviewHost`            | optional       | Fallback when GitHub comment lookup fails                                      |
| `analyticsNotes`               | optional       | Product analytics events for the agent prompt                                  |
| `approved`                     | optional       | Shows approved vs in-review badge                                              |


### Wireframes (`pr-split-wireframes.tsx`)

Prototype-specific schematic thumbnails for each `wireframeId`. Pattern:

1. Define a `PageShell` (or layout scaffold) matching the prototype page structure.
2. Use low-fidelity `Wire` blocks — neutral grays for chrome, **highlighted** regions for the PR target.
3. Import highlight tokens from the tool: `PR_TARGET_HIGHLIGHT_BORDER`, `PR_TARGET_HIGHLIGHT_FILL`.
4. Register one renderer per `wireframeId` in a `Record<WireframeId, () => ReactNode>`.
5. Export `PrSplitWireframe` wrapped in `PrototypeComponent` (register id in `component-ids.ts`).

Highlighted areas must match what `targetId` points to on the real prototype.

### Page wiring (`index.tsx`)

1. Parse `?prSplit=<order>` on load; restore matching entry's `liveState`.
2. Sync `prSplit` param when selection changes.
3. Mount spec panel via review context:

```tsx
import {
  PrototypeSpecPanelContent,
  buildPrAgentPrompt,
} from "prototype";

setSpecContent(
  <PrototypeSpecPanelContent
    entries={PR_SPLIT_ENTRIES}
    renderWireframe={(id) => <PrSplitWireframe id={id} embedded />}
    buildAgentPrompt={(entry, origin) =>
      buildPrAgentPrompt(entry, PR_SPLIT_ENTRIES, PR_SPLIT_CONFIG, origin)
    }
    onPrNavigate={handlePrNavigate}
    selectedPrOrder={selectedPrOrder}
  />,
);
```

1. `handlePrNavigate` applies `entry.liveState` and calls `review.focusShareTarget(entry.targetId)`.
2. Register `"spec-panel-content"` in `component-ids.ts`.

### Agent workflow

1. Copy prompt from an unopened PR card (copy icon).
2. Implement in source app per prompt instructions.
3. Open PR → set `prUrl` and `branch` on the matching `PR_SPLIT_ENTRIES` item.
4. Later PR prompts automatically list prior PRs as dependencies.

---

## Consuming the review context in effects

`usePrototypeReview()` / `usePrototypeReviewOptional()` return a **new context object on most renders** — the provider's `value` memo rebuilds whenever review state changes (e.g. `variantSets`, panel open state). Several of its methods (`registerVariantSet`, `unregisterVariantSet`, etc.) also call `setState`.

**Never put the whole `review` object in an effect dependency array.** Doing so creates an infinite loop ("Maximum update depth exceeded"): the effect calls a method → state changes → `value` gets a new identity → the effect re-runs → its cleanup undoes the work → the body redoes it → repeat.

Depend on the **specific stable callbacks** instead. The context methods are wrapped in `useCallback(..., [])`, so their identities are stable across renders.

```tsx
// ❌ loops forever — `review` identity changes whenever it registers/unregisters
useLayoutEffect(() => {
  if (!review) return;
  review.registerVariantSet(set);
  return () => review.unregisterVariantSet(set.id);
}, [review]);

// ✅ stable deps — runs once, cleans up once
const registerVariantSet = review?.registerVariantSet;
const unregisterVariantSet = review?.unregisterVariantSet;
useLayoutEffect(() => {
  if (!registerVariantSet || !unregisterVariantSet) return;
  registerVariantSet(set);
  return () => unregisterVariantSet(set.id);
}, [registerVariantSet, unregisterVariantSet]);
```

---

## Comment system

- Storage: Upstash Redis key `prototype-comments:<slug>`
- Resolution: `targetId` → `querySelector` inside `[data-prototype-screenshot]`
- Library: `packages/prototype/src/lib/prototype-comments/`

---

## Fidelity checklist

Before finishing, confirm side-by-side with source or a screenshot:

- Layout, spacing, typography, badge variants, empty/loading/error states
- All semantic tokens from `globals.css` — no hardcoded hex
- Interactive states behave like source where in scope

### Anti-patterns

- Importing from `source/` at runtime
- Reimplementing synced `@/components/ui` primitives
- Approximating layout dimensions or colors
- Depending on the whole `review` context object in an effect's deps (see "Consuming the review context in effects") — use the specific stable callbacks instead

