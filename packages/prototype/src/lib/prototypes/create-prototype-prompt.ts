import { normalizeReferenceDocLink } from "./reference-docs";

export type CreatePrototypeReferenceDocInput = {
  name: string;
  content: string;
  link?: string;
};

export function suggestPrototypeSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeCreatePrototypeReferenceDocs(
  docs: CreatePrototypeReferenceDocInput[] = [],
): CreatePrototypeReferenceDocInput[] {
  return docs
    .map((doc) => ({
      name: doc.name.trim(),
      content: doc.content.trim(),
      link: doc.link?.trim() ? normalizeReferenceDocLink(doc.link.trim()) : "",
    }))
    .filter((doc) => doc.content.length > 0);
}

export function buildCreatePrototypePrompt({
  title,
  route,
  referenceHtml,
  origin = "http://localhost:3003",
  referenceDocs = [],
  useRealData = false,
  sourcePath,
}: {
  title: string;
  route: string;
  referenceHtml: string;
  origin?: string;
  referenceDocs?: CreatePrototypeReferenceDocInput[];
  useRealData?: boolean;
  sourcePath?: string;
}): string {
  const trimmedTitle = title.trim();
  const trimmedRoute = route.trim();
  const trimmedHtml = referenceHtml.trim();
  const suggestedSlug = suggestPrototypeSlug(trimmedTitle);
  const galleryUrl = `${origin}/`;
  const componentLibraryUrl = `${origin}/component-library`;
  const normalizedReferenceDocs =
    normalizeCreatePrototypeReferenceDocs(referenceDocs);
  const trimmedSourcePath = sourcePath?.trim();
  const sourceLine = trimmedSourcePath
    ? `- Linked source: \`${trimmedSourcePath}\` (readable via the \`source/\` symlink after \`pnpm link-source\`)`
    : "- Linked source: set `SOURCE_PATH` in `.env.local` and run `pnpm link-source`";

  const lines = [
    `Create a new prototype: "${trimmedTitle}".`,
    "",
    "## Brief",
    `- Title: ${trimmedTitle}`,
    `- Source route: \`${trimmedRoute}\``,
    `- Suggested slug: \`${suggestedSlug || "my-prototype"}\` (pick a unique kebab-case slug if taken)`,
    `- Data: ${useRealData ? "Use real data from the linked source app (see **Real data** below)" : "Mock data only (default — typed constants, no live API calls)"}`,
    "",
    "## Source page",
    sourceLine,
    `Find this page in the linked source app at route \`${trimmedRoute}\`. Read the page component and its imports to understand structure and behavior before building the prototype.`,
    "",
    "## Reference HTML",
    "The user captured this rendered HTML as the visual target. Match layout, spacing, typography, hierarchy, and component structure — rebuild it as React components using the synced component library below. Do **not** paste or dangerously set this HTML at runtime.",
    "",
    "```html",
    trimmedHtml,
    "```",
    "",
    "## Component library",
    "Build UI from the **cached component library** already synced in this host — not from ad-hoc markup.",
    "",
    `- Component library gallery: ${componentLibraryUrl}`,
    "- UI primitives: `@/components/ui/`",
    "- Design tokens and global styles: host `globals.css`",
    "",
    "Before writing UI, open `/component-library` and map each region in the reference HTML to existing synced primitives (buttons, inputs, cards, badges, tables, dialogs, etc.). Reuse them directly; do not re-sync from source or invent parallel primitives when an equivalent already exists.",
    "",
    "## Source app",
    "Draw from the **source application** (linked via `SOURCE_PATH` / `pnpm link-source`) — not from other prototypes in this gallery. Replicate the page or feature named in the brief **exactly**: layout, spacing, typography, components, empty/loading/error states, and interactions. Match the source side-by-side; do not approximate or invent alternate UI.",
    "",
    "## Gallery",
    galleryUrl,
  ];

  if (normalizedReferenceDocs.length > 0) {
    lines.push(
      "",
      "## Reference docs",
      "Read these docs before scaffolding and wire them into the prototype:",
    );

    for (const doc of normalizedReferenceDocs) {
      const heading = doc.name || "Reference doc";
      lines.push("", `### ${heading}`);
      if (doc.link) {
        lines.push(`Link: ${doc.link}`);
      }
      lines.push("", "Content:", doc.content);
    }

    lines.push(
      "",
      `Create \`src/prototypes/${suggestedSlug || "<slug>"}/reference-docs.ts\` exporting \`REFERENCE_DOCS\` as a \`PrototypeReferenceDoc[]\` array with \`content\`, optional \`name\`, and optional \`link\` for each doc above. Use the provided content verbatim; include \`name\` and \`link\` only when supplied. Wire the docs on the page with \`useRegisterPrototypeReferenceDocs(REFERENCE_DOCS)\` from \`prototype\`.`,
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
    `1. Open the source page at \`${trimmedRoute}\` and read its component tree alongside the reference HTML above.`,
    "2. Inspect `/component-library` and map synced components to each region in the reference HTML.",
    "3. Create `src/prototypes/<slug>/` with a default export page component that reproduces the reference HTML using `@/components/ui` and host tokens.",
    "4. Add `component-ids.ts` — exhaustive static id list + `dynamicPrefixes`.",
    "5. Register in `prototype.config.ts` with `componentRegistry`.",
    "6. Wrap every UI component in `PrototypeComponent` / `PrototypeControl`.",
    "7. Define typed `liveState`, wire `usePrototypeComments(liveState, onRestore)`, **`useSyncPrototypePreviewStateToUrl(previewStateId, setPreviewState, { validStateIds })`**, and derive all preview-relevant UI from `liveState`. Every state change must update `?state=<registry-id>` — copy-pasting the browser URL must reproduce the exact preview mode.",
    "8. Wire interactive state flow in the same change — UI controls must update `liveState` so reviewers can move between preview modes by using the prototype (not only the State picker). Use `inferPreviewStateId` / `withInferredPreviewState` to keep `previewStateId` in sync when interactions change underlying fields (data mode, open shelf, filters, etc.). Map controls to registry `edges`: toolbar buttons open shelves, close/cancel returns to base state, apply/clear filters, loading → ready transitions, empty → populated actions.",
    "9. Add preview states in the same change (mandatory for feature pages — see **Preview states** above):",
    "   - `src/prototypes/<slug>/_components/<slug>-preview-states.ts` — `definePreviewStateRegistry`, `createLiveStateForPreview`, one entry per mode",
    '   - `src/prototypes/<slug>/_components/<slug>-preview-state-select.tsx` — wire `ControlsPanelSelect` with `appearance="menuList"` into the review toolbar via `setTweaksContent` (no floating mini-pill on the page)',
    "   - `src/prototypes/<slug>/_components/<slug>-state-canvas-config.tsx` — wireframes from the same registry",
    "   - `src/prototypes/<slug>/state-map-page.tsx` — full-page state map at `/prototypes/<slug>/states`; node clicks navigate to prototype with `?state=<id>`",
    "   - `stateMapComponent` on the prototype entry in `prototype.config.ts`",
    "   - In `index.tsx`: `review.setStateCanvasConfig(build…StateCanvasConfig(onStateSelect))` in an effect — pass only the select handler, not `liveState` or the current preview mode (state map is stateless; always light mode)",
    "10. Run `pnpm verify:prototype-ids` and `pnpm verify:prototype-preview-states`.",
    "11. Confirm URL sync: switch states and verify the URL updates (`?state=<id>`); reload and confirm the same mode renders.",
    "12. Confirm side-by-side visual parity with the reference HTML and source page before finishing.",
    "13. Capture a screenshot under `public/prototypes/screenshots/`; share via `pnpm share-prototype <slug>`.",
    "",
    "Reference: `src/prototypes/table-editor-filters/` (`index.tsx` URL sync, side panels) and `src/prototypes/booking-flow/` (`index.tsx`, `*-preview-states.ts`, `*-preview-state-select.tsx`, `*-state-canvas-config.tsx`, `state-map-page.tsx`, `prototype.config.ts` → `stateMapComponent`).",
  );

  return lines.join("\n");
}

export function buildCreatePrototypeCopyText({
  title,
  route,
  referenceHtml,
  origin = "http://localhost:3003",
  referenceDocs = [],
  useRealData = false,
  sourcePath,
}: {
  title: string;
  route: string;
  referenceHtml: string;
  origin?: string;
  referenceDocs?: CreatePrototypeReferenceDocInput[];
  useRealData?: boolean;
  sourcePath?: string;
}): string {
  const trimmedTitle = title.trim();
  const trimmedRoute = route.trim();
  const normalizedReferenceDocs =
    normalizeCreatePrototypeReferenceDocs(referenceDocs);
  const briefLines = [
    `Title: ${trimmedTitle}`,
    `Route: ${trimmedRoute}`,
    `Data: ${useRealData ? "Real data" : "Mock data only"}`,
  ];

  if (normalizedReferenceDocs.length > 0) {
    briefLines.push("Reference docs:");
    for (const doc of normalizedReferenceDocs) {
      briefLines.push(`- ${doc.name || "Reference doc"}`);
    }
  }

  const prompt = buildCreatePrototypePrompt({
    title: trimmedTitle,
    route: trimmedRoute,
    referenceHtml: referenceHtml.trim(),
    origin,
    referenceDocs: normalizedReferenceDocs,
    useRealData,
    sourcePath,
  });

  return `${briefLines.join("\n")}\n\n---\n\n${prompt}`;
}

/** @deprecated Use normalizeCreatePrototypeReferenceDocs */
export function normalizeCreatePrototypeDocLinks(links: string[] = []): string[] {
  return links
    .map((link) => normalizeReferenceDocLink(link.trim()))
    .filter((link) => link.length > 0);
}
