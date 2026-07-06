<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Glass browser

This repo runs on **port 1985**. Cursor's `browser_navigate` hangs when called without `viewId` or `newTab: true` while multiple Glass tabs are open. See `.cursor/rules/cursor-browser-mcp.mdc`.

## Prototype viewport fill

When building or fixing prototypes under `src/prototypes/`, follow **Prototype viewport fill** in `packages/prototype/AGENTS.md`. Import `PROTOTYPE_SCROLL_CONTAINER_CLASS`, `PROTOTYPE_PAGE_CLASS`, and `PROTOTYPE_VIEW_SHELL_CLASS` from `prototype` — do not hand-roll fill classes. Before finishing, verify `/` (gallery shell) and the prototype preview both fill the viewport with no corner offset or white bottom strip.

## Prototype live state

When building or modifying prototypes, follow **Live state & preview states (mandatory)** in `packages/prototype/AGENTS.md`. Use the plugin's `liveState` + `definePreviewStateRegistry` pattern — do not invent separate state management. Register preview states (including `state-map-page.tsx` and `stateMapComponent`) in the same change as new screens, tabs, filters, modals, or branches.

**State map:** never tie the map to the current preview state (no checkmarks / `activeStateId`). The map always renders in light mode — see **State map behavior** in `packages/prototype/AGENTS.md`.
