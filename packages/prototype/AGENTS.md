# AGENTS.md

Instructions for AI agents working with `prototype` and host-app prototypes.

## Scope in host repos

Unless `DEVELOPER=true` is set in `.env.local`, agent work scope in a **host app** (e.g. `your-host-app`) is `**src/prototypes/<slug>/` only\*\*. Do not modify prototype package code (`packages/prototype/`), app routing, or shared UI unless explicitly developing the prototype package.

---

## Architecture

| Layer                  | Location                                                                | Notes                                                            |
| ---------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Prototype**          | `packages/prototype/`                                                   | Shell, comments, variant explorer, gallery client, verify script |
| **Host prototypes**    | `src/prototypes/<slug>/`                                                | Feature UI, mock data, `component-ids.ts`                        |
| **Host manifest**      | `prototype.config.ts`                                                   | Registers all prototypes                                         |
| **Host design system** | `src/app/globals.css`, `@/components/ui`                                | Synced from source; host prototypes only                         |
| **Tool design system** | Host `globals.css`, `src/components/ui/`, `src/components/platform-ui/` | Uses host tokens; shadcn primitives + tool chrome composites     |

Host prototypes import framework from `prototype` and UI from `@/components/ui`.

**Prototype package code must never import `@/components/ui` or `@/lib/utils` from the host.** Use `@prototype/components/ui`, `@prototype/components/platform-ui`, and `@prototype/lib/utils` only.

---

## Viewport layout vs responsive UI

The review toolbar **Layout** toggle (desktop / mobile) only changes the **preview frame** — it sets `#prototype-viewport` dimensions and `data-prototype-viewport-layout` for shell chrome (device frame, footer behavior). It must **not** drive product UI differences inside prototype content.

**Host prototype content** must respond to **viewport width** only:

- Tailwind breakpoints (`sm:`, `md:`, …) or container queries for CSS
- `matchMedia` / resize observers when JS must branch

**Do not use** for layout or component swaps inside `src/prototypes/`:

- `prototype-desktop:` / `prototype-mobile:` variants (deprecated; do not reintroduce)
- `usePrototypeMobileViewportFrame()` / `usePrototypeViewportFrame()` for UI branching
- `review.viewportLayout` or `data-prototype-viewport-layout` in prototype components

The mobile preview frame is 390×844px; the desktop frame fills the preview stage. Breakpoints apply to the **content viewport width** — the same surface users see in production.

---

## Tool theme vs prototype preview content

The gallery/review **light/dark mode toggle** only changes **tool chrome** (sidebar, header, gallery nav, modals). It must **never** change colors, typography, or tokens inside prototype preview content (`#prototype-viewport` / `[data-prototype-screenshot]`).

**Tool theme** is scoped to `[data-prototype-root]` via `--tool-chrome-*` and `data-prototype-comment-theme`. Tool UI uses those tokens (or Tailwind utilities whose `--color-*` values resolve from `[data-prototype-root]`).

**Prototype preview content** uses fixed **product** tokens from the synced source app. Host `globals.css` defines `--product-*` names and maps them to shadcn tokens inside `[data-prototype-screenshot]` only. Package CSS resets all semantic and `--color-*` tokens on `[data-prototype-screenshot]` so tool theme cannot cascade in.

**Do not use** for styling inside `src/prototypes/`:

- `usePrototypeToolTheme()` / `useLightTheme` / `commentTheme`
- `data-prototype-comment-theme` on prototype components
- `--tool-chrome-*` tokens in prototype JSX or CSS

**Do not** in package or host CSS:

- Bridge shadcn tokens (`--background`, `--foreground`, `--card`, …) to `--tool-chrome-*` on `[data-prototype-root]`
- Map host `@theme inline` `--color-*` to `var(--background)` — use self-referential `var(--color-*)` for tool chrome; product tokens belong in `[data-prototype-screenshot]` only
- Put product token values on `:root` without the `--product-*` prefix (tool theme would override them)

---

## Relationship to source app (host apps)

Host apps replicate product UI from the **source application** (linked read-only via `SOURCE_PATH` and `pnpm link-source`) **exactly** — standalone code, no runtime imports from the source monorepo.

### What is synced vs replicated

| Layer                   | Source                                                 | Runtime import from source? |
| ----------------------- | ------------------------------------------------------ | --------------------------- |
| Design tokens + base UI | Synced → `@/components/ui`, `globals.css`              | No                          |
| Feature/page UI         | Replicated → `src/prototypes/<slug>/_components/`      | No                          |
| Data / auth / routing   | Mock constants + local state                           | No                          |
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
3. Trace imports; classify as base UI (`@/components/ui`), shared util, context-bound (mock), or layout chrome (`Mock`\*).
4. Copy render logic, not infrastructure — preserve class names, layout, semantic tokens.
5. Mock data as typed constants matching screenshots/source fixtures.
6. Look up dimensions from source — do not guess.
7. Wire prototype infrastructure (checklist below).
8. Run `pnpm verify:prototype-ids`.

Default to **mock data only**.

Reference prototype: `booking-flow` — `src/prototypes/booking-flow/` (or any registered slug in your host app).

---

## Prototypes (`src/prototypes/`)

Shareable UI at `/prototypes/[slug]`. Registered in `prototype.config.ts`.

**Every UI component must be comment-anchorable** — enforced by `pnpm verify:prototype-ids`.

### Rules (mandatory)

1. **Register** the slug in `prototype.config.ts` and add a screenshot under `public/prototypes/screenshots/`.
2. **Create** `src/prototypes/<slug>/component-ids.ts` — every component target id (see `booking-flow/component-ids.ts`).
3. **Wire comments** with `usePrototypeComments(liveState, onRestore)` on the page (see `booking-flow/index.tsx`).
4. **Wrap the root JSX of every React component** in `PrototypeComponent` from `prototype`.
5. **On-page prototype controls** (state pickers, variant tabs, preview toggles) must use `PrototypeControl` or `PrototypeControlGroup`, not plain `PrototypeComponent`.
6. **Use ids from the registry only** — dev mode logs an error for unregistered ids.
7. **Id naming:**

- File's main export: kebab-case filename (`settings-section.tsx` → `settings-section`; `index.tsx` → `page`).
- Other functions in the same file: `{filename}.{function-kebab}`.
- Dynamic list items: add a prefix to `dynamicPrefixes` in `component-ids.ts`.

8. **Scroll container:** `PrototypeComponent` with `id="scroll-container"` — see **Prototype viewport fill** below.
9. **Do not** use `data-testid` for comment anchoring.

### Prototype viewport fill (avoid offset / clipping)

There are **two** common offset bugs — do not confuse them:

| Symptom                                                                      | Cause                                                                                    | Fix                                                                                                                                           |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Prototype preview pinned to top-left; empty space + clipping on right/bottom | Missing `h-full` fill chain inside `#prototype-viewport`                                 | Use layout constants below on every nested wrapper                                                                                            |
| Gallery / sidebar with black gaps + white bar at bottom of window            | Site shell height mismatch (`h-full` parent + `h-svh` child, or body bg showing through) | Do **not** change gallery shell height classes ad hoc — parent route wrapper owns `h-svh`; `[data-prototype-root]` fills with `h-full flex-1` |

The preview shell (`#prototype-viewport`) only auto-sizes **direct** children of `.viewportPage` (`width/height: 100%`, column flex). Every nested layer must repeat the fill chain or content shrinks to the top-left and clips on the opposite edge.

**Use the exported constants** (do not hand-roll variants):

```tsx
import {
  PROTOTYPE_PAGE_CLASS,
  PROTOTYPE_SCROLL_CONTAINER_CLASS,
  PROTOTYPE_VIEW_SHELL_CLASS,
} from "prototype";
```

**Required page shell** (match `home-page` / `proto-partner-page`):

```tsx
<PrototypeComponent
  id="scroll-container"
  className={cn(PROTOTYPE_SCROLL_CONTAINER_CLASS, "…")}
>
  <PrototypeComponent id="page" className={cn(PROTOTYPE_PAGE_CLASS, "…")}>
```

**Every step/view root** (including `AnimatePresence` / motion wrappers):

```tsx
className={cn(PROTOTYPE_VIEW_SHELL_CLASS, "…")}
```

Put `overflow-y-auto` on the **view** that scrolls, not on `scroll-container`, unless the entire page is one scroll surface.

**Centered embed/card layouts** (public booking pages): outer view = `w-full flex-1`; inner content = `mx-auto w-full max-w-*`. Use top padding (`py-10`) for embed pages — avoid `justify-center` on a `flex-1` wrapper when content can exceed viewport height (mobile stack); it vertically centers overflow and hides content off-screen.

**Motion:** Prefer opacity-only cross-fades on page-level wrappers. Avoid horizontal `translateX` on wrappers that lack explicit `w-full` — `#prototype-viewport` uses `transform: translateZ(0)`, and transform + shrink-wrapped children produces the common top-left / clipped-right offset bug.

**Post-build layout check (mandatory before finishing):**

1. Open `/` — sidebar flush to content, no black gutter, no white strip at bottom of window.
2. Open the prototype at desktop width — main surface fills the preview frame, not hugging a corner.
3. Toggle mobile preview — tall stacked pages still scroll; nothing hidden off-screen from `justify-center`.

### Prototype overlays & side shelves (mandatory)

Product **shelves, sheets, drawers, and modal overlays** (e.g. Supabase `SidePanel`, `Sheet`, Radix `Dialog`) must render **inside `#prototype-viewport`**, not on `document.body`. Default Radix portals cover the **review sidebar** and **proto bottom bar** — wrong for prototype previews.

**Required pattern:**

1. **Portal to the preview viewport** — pass `portalContainer` from `usePrototypeProductOverlayPortal()` (or `getPrototypeDialogPortalContainer()` in client-only render paths) to `SidePanel`, `SheetContent`, and any custom `Dialog.Portal` / `Sheet.Portal`.
2. **Non-modal when scoped** — Radix `Dialog`/`Sheet` with `modal={true}` (the default) sets `pointer-events: none` on `document.body`, which blocks the **review sidebar** and **proto footer** even when the portal target is `#prototype-viewport`. `SidePanel` sets `modal={false}` automatically when `portalContainer` is passed. For raw `Sheet` / `Dialog.Root`, pass `modal={false}` whenever `portalContainer` is set.
3. **Ignore plugin chrome for outside dismiss** — viewport-scoped `SidePanel`, `SheetContent`, and `@prototype/components/ui/dialog` call `preventDefault` on Radix outside events (`onPointerDownOutside`, `onInteractOutside`, `onFocusOutside`) when the target is proto-plugin chrome (review footer, sidebar, toolbar panels, comment UI). Clicks on plugin chrome must **not** close an open product shelf. Selectors live in `comment-capture-blocked.ts` (prototype) and `prevent-prototype-plugin-chrome-dismiss.ts` (ui) — keep them in sync.
4. **Mount panels inside the page layout** — place shelf components as siblings of the main content inside a `relative overflow-hidden` wrapper (see `table-editor-filters/_components/table-editor-page.tsx`). Do not hoist shelves to the gallery shell or outside `[data-prototype-screenshot]`.
5. **Height** — scoped panels use `h-full` / `inset-y-0`, not `h-screen` / `100vh` (viewport units ignore the preview frame height). Scoped overlay/content use `absolute` (not `fixed`) inside the portal container.
6. **Preview states** — each open shelf is a distinct preview mode in `*-preview-states.ts` (see **Live state & preview states**).
7. **Post-build check** — open a shelf state; confirm the review sidebar and proto footer remain visible, clickable, and **do not dismiss** the open shelf.

```tsx
import { usePrototypeProductOverlayPortal } from "prototype";

export function InsertRowPanel({ visible }: { visible: boolean }) {
  const portalContainer = usePrototypeProductOverlayPortal();

  return (
    <SidePanel visible={visible} portalContainer={portalContainer} /* … */>
      …
    </SidePanel>
  );
}
```

```tsx
// Page layout — shelves live inside the main content column
<div className="flex flex-1 min-w-0 overflow-hidden relative">
  <div className="flex flex-row h-full w-full">{/* grid + menu */}</div>
  <InsertRowPanel visible={sidePanel === "insert-row"} />
</div>
```

**Tool chrome modals** (prompt copy, link source, design brief) use `getPrototypeToolDialogPortalContainer()` / `portalScope="tool"` on `@prototype/components/ui/dialog` — not the viewport container.

Reference: `src/prototypes/table-editor-filters/_components/insert-row-panel.tsx`, `insert-column-panel.tsx`, `table-editor-page.tsx`.

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
import { ControlsPanelSelect } from "@prototype/components/platform-ui/controls-panel-select";
import { usePrototypeReviewOptional } from "@prototype/lib/prototypes/prototype-review-context";
import { useLayoutEffect } from "react";

export function PrototypePreviewStateSelect({
  stateId,
  onStateChange,
  options,
}) {
  const setTweaksContent = usePrototypeReviewOptional()?.setTweaksContent;

  useLayoutEffect(() => {
    if (!setTweaksContent) return;
    setTweaksContent(
      <ControlsPanelSelect
        appearance="menuList"
        value={stateId}
        onValueChange={onStateChange}
        options={options}
      />,
    );
    return () => setTweaksContent(null);
  }, [onStateChange, options, setTweaksContent, stateId]);

  return null;
}
```

### New prototype checklist

1. Identify the source page/feature and confirm visual parity.
2. Create `src/prototypes/<slug>/` with a default export page component.
3. Add `component-ids.ts` — exhaustive static id list + `dynamicPrefixes`.
4. Register in `prototype.config.ts` with `componentRegistry`.
5. Wrap every UI component in `PrototypeComponent` / `PrototypeControl`.
6. Define **`liveState`** and wire `usePrototypeComments(liveState, onRestore)` plus **`useSyncPrototypePreviewStateToUrl(previewStateId, setPreviewState, { validStateIds })`** — see **Live state & preview states**.
7. **Enumerate preview modes** from the brief and source (tabs, empty/loading/error, filters, modals, view toggles, wizard steps) and add the full preview-state stack in the **same change** as the UI:
   - `*-preview-states.ts` (`definePreviewStateRegistry`, `createLiveStateForPreview`)
   - `*-preview-state-select.tsx` (`ControlsPanelSelect` with `appearance="menuList"` via `setTweaksContent` — not a floating pill on the page)
   - `*-state-canvas-config.tsx`
   - `state-map-page.tsx` + `stateMapComponent` in `prototype.config.ts` — map clicks navigate with `?state=<id>` (`PREVIEW_STATE_PARAM`)
   - `review.setStateCanvasConfig(...)` in `index.tsx`
8. Run `pnpm verify:prototype-ids` and `pnpm verify:prototype-preview-states`.
9. Capture screenshot; share via `pnpm share-prototype <slug>`.

---

## Live state & preview states (mandatory)

Prototype state is a first-class tool feature — comments, share links, the review **State** map, and PR split cards all read from the same snapshot. **Do not invent parallel state systems.** Use the plugin's live-state + preview-state registry pattern on every prototype that has reviewable UI modes.

### Do this proactively

When **building or modifying** a prototype, treat preview states as part of the feature — not a follow-up:

1. **Read existing state first** — `index.tsx`, any `*-preview-states.ts`, design-exploration configs, and `pr-split-config.ts` before changing UI.
2. **Define a typed `TLiveState`** — one JSON-serializable object holding every field a reviewer needs to reproduce the view (step/screen, modal open, form values, toggles, selected tab, etc.).
3. **One `liveState` on the page** — `useState<TLiveState>(createDefaultLiveState)` (or hydrate from `readPersistedPrototypeLiveState`). Derive rendered UI from `liveState`; route interactions through setters that update it.
4. **Wire comments** — `usePrototypeComments(liveState, onRestore)` where `onRestore` calls `setLiveState(restored)`. This powers annotation restore and share links.
5. **Sync every state change to the URL (mandatory)** — `useSyncPrototypePreviewStateToUrl(previewStateId, setPreviewState, { validStateIds })` keeps `?state=<preview-state-id>` updated on every mode change and hydrates from the URL on load. Copy-pasting the browser URL must reproduce the exact preview mode. Use the registry state ids (kebab-case). Do **not** invent other query param names (`?step=`, `?view=`, encoded blobs, etc.).
6. **Preview states are part of the feature, not a follow-up** — for feature pages, add or update a single `definePreviewStateRegistry` in `*-preview-states.ts` (see below). Every distinct tab, empty/loading/error branch, filter mode, modal, view toggle, or wizard step reviewers should jump to gets a registry entry **in the same change** as the UI. Only skip the registry for truly static single-view pages with no reviewable modes.
7. **Wire the state picker into the review toolbar** — `*-preview-state-select.tsx` calls `review.setTweaksContent(...)` with `ControlsPanelSelect` using `appearance="menuList"` and `pickerOptions` from the registry. Do **not** render a floating `miniPill` select on the prototype surface (see `booking-flow-preview-state-select.tsx`).
8. **Wire the state map** — `*-state-canvas-config.tsx` builds `PrototypeStateCanvasConfig` from the same registry. In `index.tsx`, call `review.setStateCanvasConfig(...)` in an effect; depend on stable review callbacks, not the whole `review` object. Add a `stateMapComponent` on the prototype in `prototype.config.ts` (see `table-editor-filters/state-map-page.tsx`) so `/prototypes/<slug>/states` renders the map instead of the default empty page. State map clicks must navigate to the prototype with `?state=<id>`.
9. **Verify** — run `pnpm verify:prototype-preview-states` whenever a `*-preview-states.ts` file exists.

Optional: `usePersistPrototypeLiveState(slug, liveState)` keeps reviewer position across reloads.

### Architecture

| Piece                               | Location         | Purpose                                                                     |
| ----------------------------------- | ---------------- | --------------------------------------------------------------------------- |
| `TLiveState` + `liveState`          | page `index.tsx` | Single snapshot of all preview-relevant UI                                  |
| `usePrototypeComments`              | page             | Freeze/restore `liveState` for comments & share links                       |
| `useSyncPrototypePreviewStateToUrl` | page             | Keep `?state=<id>` in the URL on every preview mode change; hydrate on load |
| `*-preview-states.ts`               | `_components/`   | `definePreviewStateRegistry` — picker, map nodes, `edges`, sections         |
| `*-preview-state-select.tsx`        | `_components/`   | On-page / sidebar step picker (`PrototypeControl`)                          |
| `*-state-canvas-config.tsx`         | `_components/`   | Wireframes + registry data for the review **State** panel                   |

Reference: `src/prototypes/table-editor-filters/` (`index.tsx`, `state-map-page.tsx`, `*-preview-states.ts`).

### URL state sync (mandatory)

**Every preview mode change must appear in the browser URL.** Reviewers copy-paste URLs to share a specific view — if the URL does not change when they switch states, that is a blocking defect.

Use the plain query param **`?state=<registry-id>`** (kebab-case id from `definePreviewStateRegistry`). Do **not** use encoded blobs, `shareState`, or custom param names (`?step=`, `?view=`, `?mode=`, etc.) for preview navigation.

| Param         | Purpose                                                                                |
| ------------- | -------------------------------------------------------------------------------------- |
| `state`       | Preview mode navigation — **always sync this**                                         |
| `shareState`  | Annotation share links only (full frozen snapshot) — do not use for preview navigation |
| `shareTarget` | Annotation share links only — do not use for preview navigation                        |

**Page (`index.tsx`):**

```tsx
import {
  usePrototypeComments,
  useSyncPrototypePreviewStateToUrl,
} from "proto-plugin";

const setPreviewState = useCallback((previewStateId: MyPreviewStateId) => {
  setLiveState(createLiveStateForPreview(previewStateId));
}, []);

usePrototypeComments(liveState, onRestore);
useSyncPrototypePreviewStateToUrl(liveState.previewStateId, setPreviewState, {
  validStateIds: MY_PREVIEW_STATE_IDS,
});
```

Requirements:

- Pass `liveState.previewStateId` (or equivalent registry id field) — the hook syncs that id to `?state=`.
- Pass the same `setPreviewState` handler used by the state picker and state map.
- Pass `validStateIds` from the same const array that defines your preview state union (e.g. `MY_PREVIEW_STATE_IDS`).
- When the user interacts with the prototype (filters, shelves, loading transitions), update `liveState` so `previewStateId` stays correct (`inferPreviewStateId` / `withInferredPreviewState`) — the URL follows automatically.

**State map (`state-map-page.tsx`):**

When a map node is clicked, navigate back to the prototype with `?state=` set — not `shareState`:

```tsx
import { PREVIEW_STATE_PARAM } from "proto-plugin";

const handleStateSelect = useCallback(
  (previewStateId: MyPreviewStateId) => {
    const url = new URL(backHref, window.location.origin);
    url.searchParams.set(PREVIEW_STATE_PARAM, previewStateId);
    router.push(`${url.pathname}${url.search}`);
  },
  [backHref, router],
);
```

**Before finishing:** open the prototype, switch states via the States menu and via in-prototype interactions, and confirm the URL updates each time (e.g. `/prototypes/my-slug?state=filtered-empty`). Reload that URL and confirm the same mode renders.

### Page wiring (minimal)

```tsx
const [liveState, setLiveState] = useState<TLiveState>(createDefaultLiveState);

const onRestore = useCallback((restored: TLiveState) => {
  setLiveState(restored);
}, []);

const setPreviewState = useCallback((previewStateId: TPreviewStateId) => {
  setLiveState(createLiveStateForPreview(previewStateId));
}, []);

usePrototypeComments(liveState, onRestore);
useSyncPrototypePreviewStateToUrl(liveState.previewStateId, setPreviewState, {
  validStateIds: MY_PREVIEW_STATE_IDS,
});

const setStateCanvasConfig = review?.setStateCanvasConfig;
useEffect(() => {
  if (!setStateCanvasConfig) return;
  setStateCanvasConfig(buildMyStateCanvasConfig(setPreviewState));
  return () => setStateCanvasConfig(null);
}, [setStateCanvasConfig, setPreviewState]);
```

### When to add a preview-state registry entry

Add (or update) a registry state when you introduce:

- A new screen, step, wizard stage, or primary tab reviewers should open directly
- A modal, drawer, or overlay branch worth reviewing on its own
- Empty, loading, or error branches that are distinct preview modes

Skip registry entries for hover, focus, or other non-shareable micro-interactions.

### Simple prototypes without steps

If there are no navigable preview modes, `liveState` may be `{}` or hold only a few toggles — still call `usePrototypeComments`. Design explorations register separately via variant sets; do not fold exploration variants into ad-hoc `useState` without also exposing them through the exploration config.

Multi-route prototypes (e.g. `proto-partner-page`) may use Next routes for real page boundaries; in-prototype step/modal switching within a page still belongs in `liveState`.

### Anti-patterns

- Multiple independent `useState` hooks for step/modal/view **without** aggregating into `liveState`
- Custom URL query params for preview mode (`?step=`, `?view=`, encoded blobs, etc.) — use `?state=<registry-id>` via `useSyncPrototypePreviewStateToUrl` instead
- Shipping a prototype page **without** `useSyncPrototypePreviewStateToUrl` — every preview mode change must update the URL
- Hand-rolled `<select>` / tabs for preview modes outside `ControlsPanelSelect` + the registry
- Floating `ControlsPanelSelect` with `appearance="miniPill"` on the prototype surface — states belong in the review toolbar **States** menu via `appearance="menuList"` and `setTweaksContent`
- Duplicating picker labels or state ids outside `definePreviewStateRegistry`
- Adding UI steps or modal branches **without** updating the registry, picker, and state map in the same change
- Separate state maps or pickers that are not imported from the single `*-preview-states.ts` file
- Passing `liveState` or the current preview mode into the state map config — the map is a **stateless** navigation surface, not a mirror of the active state
- Tracking `activeStateId` / selected styling / checkmarks on state map nodes

---

## Preview states & state map

Prototypes with preview modes use `definePreviewStateRegistry` in `*-preview-states.ts`. One registry drives the state picker, map nodes, `edges`, and sections. The picker, canvas config, and verification script must all import from this file — never maintain parallel state lists.

### State map behavior (mandatory)

The state map is a **stateless picker** — it must **not** reflect, highlight, or mark the current preview state.

- **No active-state association** — Do not pass the current preview mode, `liveState`, or any `activeStateId` into `PrototypeStateCanvasConfig` or `build…StateCanvasConfig`. Clicking a node navigates to that state; there is no checkmark, selected border, or `aria-current` on the map.
- **Follows tool theme** — The state map canvas (background, chrome, edges, section labels, node cards) uses `--tool-chrome-*` tokens and matches the gallery/review light/dark mode toggle.
- **`build…StateCanvasConfig(onStateSelect)`** — The builder takes only the select handler. Wire it once in `index.tsx` and `state-map-page.tsx`; do not re-build when `liveState` changes.

Reference: `src/prototypes/booking-flow/_components/booking-flow-state-canvas-config.tsx`, `table-editor-filters/state-map-page.tsx`.

### State map layout

Edge paths draw directly between node anchors (straight or elbow segments). They **do not route around** other states.

When two states are connected by an `edges` entry, arrange `canvasLayout.rows` so **no unrelated state sits on the path between them**. Otherwise the connector passes through the intervening card — arrows only render at path endpoints, so the middle segment looks directionless and the link reads ambiguously.

Prefer adjacent columns on the same row, or use `{ id, column }` / `startColumn` to offset nodes so vertical edges do not cut through unrelated cards in the same column.

Reference: `src/prototypes/booking-flow/_components/booking-flow-preview-states.ts`.

---

## Design exploration

Use when comparing **2+ UI directions** for the same user problem.

| Layer         | Location                                       | Owns                                                                      |
| ------------- | ---------------------------------------------- | ------------------------------------------------------------------------- |
| **Tool**      | `prototype` (`PrototypeVariantExplorer`, etc.) | Modal chrome, variant tabs, Mobbin gallery, localStorage for brief fields |
| **Prototype** | `src/prototypes/<slug>/_components/`           | Variant renderers, context JSON, Mobbin references, `component-ids.ts`    |

Reference: `src/prototypes/proto-partner-page/_components/invite-copy-design-exploration-config.tsx` + `invite-copy-variant-toggle.tsx`.

### Renderers

Build one preview per option with `buildDesignExplorationRenderers`. In host prototype files (client components), import from `@prototype/...` — not the `proto-plugin` barrel, which includes server-only modules:

```ts
import { buildDesignExplorationRenderers } from "@prototype/lib/prototypes/build-design-exploration-renderers";
import { DesignExplorationVariantPreviewShell } from "@prototype/components/prototypes/design-exploration-variant-preview-shell";

const renderers = buildDesignExplorationRenderers(VARIANT_OPTIONS, (variant) => (
  <MyBlock variant={variant} />
), BASELINE);

// Overlay-style variants (absolute positioning on the live page):
const renderers = buildDesignExplorationRenderers(VARIANT_OPTIONS, (variant) => (
  <DesignExplorationVariantPreviewShell layout={isOverlay(variant) ? "overlay" : "inline"}>
    <MyBlock variant={variant} />
  </DesignExplorationVariantPreviewShell>
), BASELINE);
```

Do not hand-roll renderer maps that return `null` for some variants — the helper maps every option and warns in dev when a renderer returns empty content.

### Config shape

```ts
{
  componentIdPrefix: string;
  variantTabsIdPrefix: string;
  storageKeyPrefix: string;
  variant, onVariantChange,
  options: { value, label, hint? }[]; // exploration directions — newest first; exclude baseline when possible
  renderers: Record<TVariant, ComponentType>;
  brief: { titleDefault, descriptionDefault };
  baseline: { value, label?, hint? }; // pre-exploration UI — always pinned at the bottom of the variant list
  defaultVariant?: TVariant; // codebase-stored default (e.g. DEFAULT_*_VARIANT); marked "Default" in the brief
  context?: { label, data: unknown, render?, defaultExpanded?, panelId? };
  mobbin?: { references, title?, description?, imagePathForReference? };
  variantsSection?: { title?, description? };
}
```

Every exploration **must** define `baseline` — the UI as it existed before the exploration was added. The design brief shows it last with an **Original** badge. Use `getDesignExplorationDisplayOptions(options, baseline)` for tabs and keyboard cycling; use `getDesignExplorationVariantOptions(options, baseline)` when listing directions in prompts.

Build renderers with `buildDesignExplorationRenderers(options, renderVariant, baseline)` so the baseline preview is included.

### Exploration icons

The review sidebar explorations menu shows a Lucide icon per variant set via `VariantSetLucideIcon` (`packages/prototype/src/lib/prototypes/variant-set-lucide-icon.tsx`). Rules match on `id` + `label` (first fit wins); unmatched sets fall back to `LayoutGrid`.

When adding a new exploration, **assign it a distinct icon**:

1. Pick a Lucide icon that reflects the exploration topic (not `LayoutGrid` unless nothing else fits).
2. Add a `{ test: /…/, icon: … }` entry to `VARIANT_SET_ICON_RULES`, placed **above** broad rules such as `/mobile/i`, so this exploration wins over generic matchers.
3. Do not reuse icons already assigned to other explorations on the same prototype.
4. Import the chosen icon from `lucide-react`.

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
| **Tool**      | `prototype`                          | `PrototypeSpecPanelContent`, `buildPrSplitPrototypeUrl`, `buildPrAgentPrompt`, Vercel preview fetch (`/api/pr-vercel-preview`), highlight tokens |
| **Prototype** | `src/prototypes/<slug>/_components/` | `PR_SPLIT_ENTRIES` data, `PR_SPLIT_CONFIG`, wireframe renderers, live-state URL wiring                                                           |

Reference: `booking-flow/_components/pr-split-config.ts` + `pr-split-wireframes.tsx` (when present) or any prototype with a spec panel.

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
| `linearUrl`                    | optional       | Linear issue link shown in the PR split sidebar                                |
| `previewPath`                  | optional       | Path on Vercel preview host (default from config)                              |
| `vercelPreviewHost`            | optional       | Fallback when GitHub comment lookup fails                                      |
| `analyticsNotes`               | optional       | Product analytics events for the agent prompt                                  |
| `approved`                     | optional       | Shows approved vs in-review badge                                              |

### Wireframes (`pr-split-wireframes.tsx`)

Prototype-specific **full-page** schematic previews for each `wireframeId`. Each card must show the complete page shell (sidebar, header/toolbar, main content) — not a cropped excerpt or zoomed-in slice of the PR target. Pattern:

1. Define a `PageShell` (or layout scaffold) matching the prototype's real page structure — every zone reviewers see in the live preview.
2. Use low-fidelity `Wire` blocks — neutral grays for chrome, **highlighted** regions for the PR target only.
3. Import highlight tokens from the tool: `PR_TARGET_HIGHLIGHT_BORDER`, `PR_TARGET_HIGHLIGHT_FILL`.
4. Fill the card preview: wrap the wireframe root in `PR_SPLIT_WIREFRAME_FRAME_CLASS` from `prototype` (`aspect-video w-full overflow-hidden`) so the schematic reads as a full screen, not a short strip.
5. Register one renderer per `wireframeId` in a `Record<WireframeId, () => ReactNode>`.
6. Export `PrSplitWireframe` wrapped in `PrototypeComponent` (register id in `component-ids.ts`).

Highlighted areas must match what `targetId` points to on the real prototype; surrounding chrome provides context for where the change sits on the page.

### Page wiring (`index.tsx`)

1. Parse `?prSplit=<order>` on load; restore matching entry's `liveState`.
2. Sync `prSplit` param when selection changes.
3. Mount spec panel via review context:

```tsx
import { PrototypeSpecPanelContent, buildPrAgentPrompt } from "prototype";

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
- **Inventing custom prototype state** instead of `liveState` + `definePreviewStateRegistry` (see **Live state & preview states**)
- **Adding screens/modals without registering preview states** in the same change
- **Shipping preview modes without URL sync** — every mode change must update `?state=<registry-id>` via `useSyncPrototypePreviewStateToUrl`
- Depending on the whole `review` context object in an effect's deps (see "Consuming the review context in effects") — use the specific stable callbacks instead
- **`scroll-container` with `overflow-y-auto` and no `h-full` fill chain** — causes top-left offset and clipped content in the preview frame (see **Prototype viewport fill**)
- **Page-level motion with `translateX` on wrappers missing `w-full flex-1`** — same offset bug; use opacity-only or fill classes first
- **Product shelves/sheets/dialogs without `portalContainer`** — default body portals cover review sidebar and proto footer; use `usePrototypeProductOverlayPortal()` (see **Prototype overlays & side shelves**)
- **Custom Radix overlays that dismiss on plugin chrome clicks** — viewport-scoped dialogs must call `preventDismissOnPrototypePluginChrome` on outside events (or use `SidePanel` / tool `Dialog` which do this automatically)
- **Viewport-scoped Radix dialogs with default `modal={true}`** — sets `pointer-events: none` on `body`, blocking review sidebar and proto footer; use `portalContainer` on `SidePanel` (auto `modal={false}`) or pass `modal={false}` on `Sheet` / `Dialog.Root`
