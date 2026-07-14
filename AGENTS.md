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

## Prototype product theme (Supabase Light / Dark)

This host syncs **Supabase Studio** and loads both **Light** and **Dark** product tokens (`SUPABASE_PRODUCT_THEMES` in `supabase-product-theme.constants.ts`). `<html>` stays pinned to Light for font and base setup.

**Prototype previews invert the tool chrome theme** when both modes are configured: tool dark → product light, tool light → product dark. `SupabaseProductTheme` applies the resolved mode on `#prototype-viewport` and other non-managed product surfaces. The component library keeps its own header toggle (`data-prototype-product-theme-managed`).

When building or reviewing prototypes under `src/prototypes/`, still match **Supabase Light** tokens and screenshots — that is the shipped product target. Dark preview is for review contrast only.

The gallery/review **tool theme toggle** only affects tool chrome directly — prototype preview content follows the inverse rule above, not the tool tokens themselves.

### Detect source theming and load both modes (mandatory)

When **setting up product theming or (re)syncing from a source app**, first investigate the source's theming mechanism and configure product theme modes to match what the source actually ships. Do **not** assume light-only.

1. **Find the source's theming source of truth** — check, in order, whichever applies:
   - App-level theme provider config (e.g. `next-themes` `themes={[...]}` in a `Providers`/layout file, `singleThemes`, MUI `createTheme`, Chakra, styled-components `ThemeProvider`).
   - Design-token sets with paired light/dark values (e.g. `themes/light.css` + `themes/dark.css`, token JSON with both modes).
   - CSS conventions: `.dark` / `[data-theme="dark"]` blocks, `@media (prefers-color-scheme: dark)`, Tailwind `dark:` variants.
2. **Decide from the discriminating signal, not the design system.** The app-level theme config (what themes the app actually enables) is authoritative. The mere presence of light/dark CSS in a shared UI package is **not** — those often ship for every consumer regardless of whether the app offers dark mode.
3. **If the source defines both a light and dark theme, load both.** Configure both product token sets (e.g. list both in `SUPABASE_PRODUCT_THEMES` / the host's product-theme constants) so the component library toggle and the prototype preview theme inversion both work. If the source ships only one mode, configure only that one and do not expose a toggle.
4. **Non-binary theme sets** (e.g. `system` / `dark` / `classic-dark`): pick the canonical light and dark variants the product actually uses; do not treat extra brand/system themes as separate product modes unless the prototype explicitly compares them.
5. **Detection is expected to be reliable; completeness is not.** Finding whether both themes are *defined* is a normal investigation task — do it. But "both defined" does not prove "both render correctly." Before finishing, open `/component-library` and toggle both modes to confirm previews actually theme (no washed-out text, no unstyled surfaces); fix or scope down if a mode is incomplete.

## Prototype wireframes (dark schematic)

PR split and state-map wireframe previews always render on a **dark** schematic surface — even in tool light mode or when the prototype product theme is light. Use CSS variables from the `[data-prototype-wireframe-preview]` scope (`--prototype-wireframe-block`, `--cal-bg`, `--border-subtle`, …); do not hardcode light grays or `#fff`. See **Wireframes** in `packages/prototype/AGENTS.md`.

## Prototype overlays & side shelves

When prototypes include product shelves (`SidePanel`), sheets (`Sheet`), drawers, or modal overlays, portal them **inside `#prototype-viewport`** with `usePrototypeProductOverlayPortal()` so they do not cover the review sidebar or proto bottom bar. For raw `Sheet`/`Dialog`, also pass `modal={false}` when using `portalContainer` — otherwise Radix locks `pointer-events` on `body` and blocks plugin chrome. Viewport-scoped overlays must **not dismiss** when reviewers click plugin chrome (footer, sidebar, toolbars); `SidePanel`/`SheetContent`/tool `Dialog` handle this automatically when `portalContainer` is set. See **Prototype overlays & side shelves** in `packages/prototype/AGENTS.md`.
