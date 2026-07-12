import { normalizeReferenceDocLink } from "./reference-docs";

export type CreatePrototypeStarterScreen = {
  slug: string;
  title: string;
};

export function suggestPrototypeSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeCreatePrototypeDocLinks(links: string[] = []): string[] {
  return links
    .map((link) => normalizeReferenceDocLink(link.trim()))
    .filter((link) => link.length > 0);
}

export function buildCreatePrototypePrompt({
  title,
  description,
  origin = "http://localhost:3003",
  docLinks = [],
  useRealData = false,
  starterScreen,
}: {
  title: string;
  description: string;
  origin?: string;
  docLinks?: string[];
  useRealData?: boolean;
  starterScreen?: CreatePrototypeStarterScreen;
}): string {
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const suggestedSlug = suggestPrototypeSlug(trimmedTitle);
  const galleryUrl = `${origin}/`;
  const normalizedDocLinks = normalizeCreatePrototypeDocLinks(docLinks);

  const lines = [
    `Create a new prototype: "${trimmedTitle}".`,
    "",
    "## Brief",
    `- Title: ${trimmedTitle}`,
    `- Description: ${trimmedDescription}`,
    `- Suggested slug: \`${suggestedSlug || "my-prototype"}\` (pick a unique kebab-case slug if taken)`,
    `- Data: ${useRealData ? "Use real data from the linked source app (see **Real data** below)" : "Mock data only (default — typed constants, no live API calls)"}`,
  ];

  if (starterScreen) {
    lines.push(
      `- Starter screen: \`${starterScreen.slug}\` (${starterScreen.title}) — use as the initial page shell when scaffolding`,
    );
  }

  lines.push(
    "",
    "## Source app",
    "Draw from the **source application** (linked via `SOURCE_PATH` / `pnpm link-source`) — not from other prototypes in this gallery. Replicate the page or feature named in the brief **exactly**: layout, spacing, typography, components, empty/loading/error states, and interactions. Match the source side-by-side; do not approximate or invent alternate UI.",
    "",
    "## Gallery",
    galleryUrl,
  );

  if (normalizedDocLinks.length > 0) {
    lines.push(
      "",
      "## Reference docs",
      "Read these docs before scaffolding and wire them into the prototype:",
    );

    for (const link of normalizedDocLinks) {
      lines.push(`- ${link}`);
    }

    lines.push(
      "",
      `Create \`src/prototypes/${suggestedSlug || "<slug>"}/reference-docs.ts\` exporting \`REFERENCE_DOCS\` as a \`PrototypeReferenceDoc[]\` array with \`name\`, \`link\`, and \`content\` for each doc above. Derive a short \`name\` from each URL when needed and summarize relevant requirements in \`content\`. Wire the docs on the page with \`useRegisterPrototypeReferenceDocs(REFERENCE_DOCS)\` from \`prototype\`.`,
    );
  }

  if (starterScreen) {
    lines.push(
      "",
      "## Starter screen",
      `- Slug: \`${starterScreen.slug}\``,
      `- Title: ${starterScreen.title}`,
      `- Preview: ${origin}/starter-screens/${starterScreen.slug}`,
      "",
      `Use \`src/starter-screens/${starterScreen.slug}/\` as the starting layout shell. Adapt its structure and synced \`@/components/ui\` usage into the new prototype page instead of rebuilding chrome from scratch.`,
    );
  }

  if (useRealData) {
    lines.push(
      "",
      "## Real data",
      "Hook this prototype up to real backend data from the linked source app instead of mock constants:",
      "",
      "1. Configure `SOURCE_DB_ENV_VARS` in `prototype.sync.config.sh` with the env vars needed for local API/database access.",
      "2. Run `pnpm link-source-db` to copy those vars from the source app's `.env.local`.",
      "3. Use the source app's client/query patterns where appropriate — keep prototype scope in `src/prototypes/<slug>/` only.",
      "4. Do not commit secrets; rely on `.env.local` copied via `link-source-db`.",
    );
  }

  lines.push(
    "",
    "## URL state sync (required — blocking)",
    "Every preview mode change must update the browser URL as `?state=<registry-id>` (kebab-case id from the preview-state registry). Copy-pasting the URL must reproduce the exact mode.",
    "",
    "- Wire `useSyncPrototypePreviewStateToUrl(previewStateId, setPreviewState, { validStateIds })` in `index.tsx`",
    "- State map clicks must navigate with `PREVIEW_STATE_PARAM` (`?state=`) — not `shareState` or encoded blobs",
    "- `shareState` / `shareTarget` are for annotation share links only — never use them for preview navigation",
    "",
    "Reference: `src/prototypes/table-editor-filters/index.tsx`, `state-map-page.tsx`.",
    "",
    "## Preview states (required — do not skip)",
    "Before building UI, list every distinct mode reviewers must open directly from the State picker and `/prototypes/<slug>/states` map. Include modes implied by the brief and source page, for example:",
    "- Primary tabs, steps, or wizard stages",
    "- Empty, loading, and error branches",
    "- Filter bars, preset filters, active filter chips, and add-filter popovers",
    "- Modals, drawers, side shelves (SidePanel), sheets, and overlay branches",
    "- View toggles (list vs calendar, grid vs table, etc.)",
    "",
    "Each mode gets one registry entry in `*-preview-states.ts` with matching `liveState` in `createLiveStateForPreview`. Wire the full stack in the same pass as the UI — not as a follow-up.",
    "",
    "## Interactive state flow (required)",
    "Wire product controls so reviewers can navigate between preview modes by interacting with the prototype itself — not only the State picker or state map. Handlers update `liveState`; use `inferPreviewStateId` / `withInferredPreviewState` (or equivalent) so `previewStateId` stays aligned with underlying fields. Match interactions to registry `edges`:",
    "- Open shelves/sheets/modals from toolbar or row actions; close/cancel/save dismiss back to the base state",
    "- Apply and clear filters, search, or preset chips",
    "- Loading → ready transitions (e.g. refresh, initial fetch complete)",
    "- Empty ↔ populated actions (import, truncate, delete all)",
    "",
    "Reference: `src/prototypes/table-editor-filters/` (grid toolbar + side panels) and `src/prototypes/automat-workflows-page/` (`withInferredPreviewState`).",
    "",
    "## Instructions",
    "Follow AGENTS.md → New prototype checklist, **Live state & preview states (mandatory)**, and **Prototype overlays & side shelves (mandatory)** when the UI has shelves or overlays.",
    "",
    "1. Find the source page/feature in the linked source app, read it fully, and confirm side-by-side visual parity before finishing.",
    "2. Create `src/prototypes/<slug>/` with a default export page component.",
    "3. Add `component-ids.ts` — exhaustive static id list + `dynamicPrefixes`.",
    "4. Register in `prototype.config.ts` with `componentRegistry`.",
    "5. Wrap every UI component in `PrototypeComponent` / `PrototypeControl`.",
    "6. Define typed `liveState`, wire `usePrototypeComments(liveState, onRestore)`, **`useSyncPrototypePreviewStateToUrl(previewStateId, setPreviewState, { validStateIds })`**, and derive all preview-relevant UI from `liveState`. Every state change must update `?state=<registry-id>` — copy-pasting the browser URL must reproduce the exact preview mode.",
    "7. Wire interactive state flow in the same change — UI controls must update `liveState` so reviewers can move between preview modes by using the prototype (not only the State picker). Use `inferPreviewStateId` / `withInferredPreviewState` to keep `previewStateId` in sync when interactions change underlying fields (data mode, open shelf, filters, etc.). Map controls to registry `edges`: toolbar buttons open shelves, close/cancel returns to base state, apply/clear filters, loading → ready transitions, empty → populated actions.",
    "8. Add preview states in the same change (mandatory for feature pages — see **Preview states** above):",
    "   - `src/prototypes/<slug>/_components/<slug>-preview-states.ts` — `definePreviewStateRegistry`, `createLiveStateForPreview`, one entry per mode",
    '   - `src/prototypes/<slug>/_components/<slug>-preview-state-select.tsx` — wire `ControlsPanelSelect` with `appearance="menuList"` into the review toolbar via `setTweaksContent` (no floating mini-pill on the page)',
    "   - `src/prototypes/<slug>/_components/<slug>-state-canvas-config.tsx` — wireframes from the same registry",
    "   - `src/prototypes/<slug>/state-map-page.tsx` — full-page state map at `/prototypes/<slug>/states`; node clicks navigate to prototype with `?state=<id>`",
    "   - `stateMapComponent` on the prototype entry in `prototype.config.ts`",
    "   - In `index.tsx`: `review.setStateCanvasConfig(build…StateCanvasConfig(onStateSelect))` in an effect — pass only the select handler, not `liveState` or the current preview mode (state map is stateless; always light mode)",
    "9. Run `pnpm verify:prototype-ids` and `pnpm verify:prototype-preview-states`.",
    "10. Confirm URL sync: switch states and verify the URL updates (`?state=<id>`); reload and confirm the same mode renders.",
    "11. Capture a screenshot under `public/prototypes/screenshots/`; share via `pnpm share-prototype <slug>`.",
    "",
    "Reference: `src/prototypes/table-editor-filters/` (`index.tsx` URL sync, side panels) and `src/prototypes/booking-flow/` (`index.tsx`, `*-preview-states.ts`, `*-preview-state-select.tsx`, `*-state-canvas-config.tsx`, `state-map-page.tsx`, `prototype.config.ts` → `stateMapComponent`).",
  );

  return lines.join("\n");
}

export function buildCreatePrototypeCopyText({
  title,
  description,
  origin = "http://localhost:3003",
  docLinks = [],
  useRealData = false,
  starterScreen,
}: {
  title: string;
  description: string;
  origin?: string;
  docLinks?: string[];
  useRealData?: boolean;
  starterScreen?: CreatePrototypeStarterScreen;
}): string {
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const normalizedDocLinks = normalizeCreatePrototypeDocLinks(docLinks);
  const briefLines = [
    `Title: ${trimmedTitle}`,
    `Description: ${trimmedDescription}`,
    `Data: ${useRealData ? "Real data" : "Mock data only"}`,
  ];

  if (starterScreen) {
    briefLines.push(
      `Starter screen: ${starterScreen.title} (${starterScreen.slug})`,
    );
  }

  if (normalizedDocLinks.length > 0) {
    briefLines.push("Reference docs:", ...normalizedDocLinks.map((link) => `- ${link}`));
  }

  const prompt = buildCreatePrototypePrompt({
    title: trimmedTitle,
    description: trimmedDescription,
    origin,
    docLinks: normalizedDocLinks,
    useRealData,
    starterScreen,
  });

  return `${briefLines.join("\n")}\n\n---\n\n${prompt}`;
}
