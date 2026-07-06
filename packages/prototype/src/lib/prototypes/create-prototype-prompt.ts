export function suggestPrototypeSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildCreatePrototypePrompt({
  title,
  description,
  origin = "http://localhost:3003",
}: {
  title: string;
  description: string;
  origin?: string;
}): string {
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const suggestedSlug = suggestPrototypeSlug(trimmedTitle);
  const galleryUrl = `${origin}/`;

  const lines = [
    `Create a new prototype: "${trimmedTitle}".`,
    "",
    "## Brief",
    `- Title: ${trimmedTitle}`,
    `- Description: ${trimmedDescription}`,
    `- Suggested slug: \`${suggestedSlug || "my-prototype"}\` (pick a unique kebab-case slug if taken)`,
    "",
    "## Source app",
    "Draw from the **source application** (linked via `SOURCE_PATH` / `pnpm link-source`) — not from other prototypes in this gallery. Replicate the page or feature named in the brief **exactly**: layout, spacing, typography, components, empty/loading/error states, and interactions. Match the source side-by-side; do not approximate or invent alternate UI.",
    "",
    "## Gallery",
    galleryUrl,
  ];

  lines.push(
    "",
    "## Preview states (required — do not skip)",
    "Before building UI, list every distinct mode reviewers must open directly from the State picker and `/prototypes/<slug>/states` map. Include modes implied by the brief and source page, for example:",
    "- Primary tabs, steps, or wizard stages",
    "- Empty, loading, and error branches",
    "- Filter bars, preset filters, active filter chips, and add-filter popovers",
    "- Modals, drawers, and overlay branches",
    "- View toggles (list vs calendar, grid vs table, etc.)",
    "",
    "Each mode gets one registry entry in `*-preview-states.ts` with matching `liveState` in `createLiveStateForPreview`. Wire the full stack in the same pass as the UI — not as a follow-up.",
    "",
    "## Instructions",
    "Follow AGENTS.md → New prototype checklist and **Live state & preview states (mandatory)**.",
    "",
    "1. Find the source page/feature in the linked source app, read it fully, and confirm side-by-side visual parity before finishing.",
    "2. Create `src/prototypes/<slug>/` with a default export page component.",
    "3. Add `component-ids.ts` — exhaustive static id list + `dynamicPrefixes`.",
    "4. Register in `prototype.config.ts` with `componentRegistry`.",
    "5. Wrap every UI component in `PrototypeComponent` / `PrototypeControl`.",
    "6. Define typed `liveState`, wire `usePrototypeComments(liveState, onRestore)`, and derive all preview-relevant UI from `liveState`.",
    "7. Add preview states in the same change (mandatory for feature pages — see **Preview states** above):",
    "   - `src/prototypes/<slug>/_components/<slug>-preview-states.ts` — `definePreviewStateRegistry`, `createLiveStateForPreview`, one entry per mode",
    "   - `src/prototypes/<slug>/_components/<slug>-preview-state-select.tsx` — wire `ControlsPanelSelect` with `appearance=\"menuList\"` into the review toolbar via `setTweaksContent` (no floating mini-pill on the page)",
    "   - `src/prototypes/<slug>/_components/<slug>-state-canvas-config.tsx` — wireframes from the same registry",
    "   - `src/prototypes/<slug>/state-map-page.tsx` — full-page state map at `/prototypes/<slug>/states`",
    "   - `stateMapComponent` on the prototype entry in `prototype.config.ts`",
    "   - In `index.tsx`: `review.setStateCanvasConfig(build…StateCanvasConfig(onStateSelect))` in an effect — pass only the select handler, not `liveState` or the current preview mode (state map is stateless; always light mode)",
    "8. Run `pnpm verify:prototype-ids` and `pnpm verify:prototype-preview-states`.",
    "9. Capture a screenshot under `public/prototypes/screenshots/`; share via `pnpm share-prototype <slug>`.",
    "",
    "Reference: `src/prototypes/booking-flow/` (`index.tsx`, `*-preview-states.ts`, `*-preview-state-select.tsx`, `*-state-canvas-config.tsx`, `state-map-page.tsx`, `prototype.config.ts` → `stateMapComponent`).",
  );

  return lines.join("\n");
}

export function buildCreatePrototypeCopyText({
  title,
  description,
  origin = "http://localhost:3003",
}: {
  title: string;
  description: string;
  origin?: string;
}): string {
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const brief = [`Title: ${trimmedTitle}`, `Description: ${trimmedDescription}`].join(
    "\n",
  );
  const prompt = buildCreatePrototypePrompt({
    title: trimmedTitle,
    description: trimmedDescription,
    origin,
  });

  return `${brief}\n\n---\n\n${prompt}`;
}
