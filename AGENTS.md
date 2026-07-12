<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Glass browser

This repo runs on **port 1985**. Cursor's `browser_navigate` hangs when called without `viewId` or `newTab: true` while multiple Glass tabs are open. See `.cursor/rules/cursor-browser-mcp.mdc`.

## Prototype viewport fill

When building or fixing prototypes under `src/prototypes/`, follow **Prototype viewport fill** in `packages/prototype/AGENTS.md`. Import `PROTOTYPE_SCROLL_CONTAINER_CLASS`, `PROTOTYPE_PAGE_CLASS`, and `PROTOTYPE_VIEW_SHELL_CLASS` from `prototype` — do not hand-roll fill classes. Before finishing, verify `/` (gallery shell) and the prototype preview both fill the viewport with no corner offset or white bottom strip.

## Prototype live state

When building or modifying prototypes, follow **Live state & preview states (mandatory)** and **URL state sync (mandatory)** in `packages/prototype/AGENTS.md`. Use the plugin's `liveState` + `definePreviewStateRegistry` pattern — do not invent separate state management. Register preview states (including `state-map-page.tsx` and `stateMapComponent`) in the same change as new screens, tabs, filters, modals, or branches.

**URL state (blocking):** every preview mode change must sync to the URL as `?state=<registry-id>` via `useSyncPrototypePreviewStateToUrl`. Copy-pasting the browser URL must reproduce the exact state. Use plain `?state=filtered-empty` — not encoded blobs, not `shareState`, not custom param names. State map clicks must also navigate with `?state=`.

**State map:** never tie the map to the current preview state (no checkmarks / `activeStateId`). The map follows the tool light/dark theme — see **State map behavior** in `packages/prototype/AGENTS.md`.

Reference implementation: `src/prototypes/table-editor-filters/` (`index.tsx`, `state-map-page.tsx`).

## Prototype product theme (Supabase Light)

This host syncs **Supabase Studio** and pins **Light** on `<html class="light" data-theme="light">` (see `layout.tsx` and `SUPABASE_PRODUCT_THEME`). Host `supabase-product-surface.css` clears proto-plugin gray-scale token overrides on product surfaces so Supabase semantic tokens inherit correctly.

When building or reviewing prototypes under `src/prototypes/`, match **Supabase Light** tokens and screenshots. Do not use `classic-dark`, `dark`, or dark-only utilities unless the prototype explicitly compares themes.

The gallery/review **tool theme toggle** still only affects tool chrome — not prototype preview content.

## Prototype overlays & side shelves

When prototypes include product shelves (`SidePanel`), sheets (`Sheet`), drawers, or modal overlays, portal them **inside `#prototype-viewport`** with `usePrototypeProductOverlayPortal()` so they do not cover the review sidebar or proto bottom bar. See **Prototype overlays & side shelves** in `packages/prototype/AGENTS.md`.
