import { normalizeReferenceDocLink } from "./reference-docs";
import {
  buildWorkspaceProfilePromptLines,
  type WorkspaceProfile,
} from "./workspace-profile";

export type CreatePrototypeReferenceDocInput = {
  name: string;
  content: string;
  link?: string;
};

export type ParsedCreatePrototypeSourceUrl = {
  href: string;
  pathname: string;
  search: string;
};

export function suggestPrototypeSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseCreatePrototypeSourceUrl(
  value: string,
): ParsedCreatePrototypeSourceUrl | null {
  const trimmed = value.trim();
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return {
      href: url.href,
      pathname: url.pathname || "/",
      search: url.search,
    };
  } catch {
    return null;
  }
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
  description = "",
  sourceUrl,
  referenceHtml,
  origin = "http://localhost:3003",
  referenceDocs = [],
  useRealData = false,
  sourcePath,
  workspaceProfile,
}: {
  title: string;
  description?: string;
  sourceUrl: string;
  referenceHtml: string;
  origin?: string;
  referenceDocs?: CreatePrototypeReferenceDocInput[];
  useRealData?: boolean;
  sourcePath?: string;
  workspaceProfile?: WorkspaceProfile;
}): string {
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const parsedSourceUrl = parseCreatePrototypeSourceUrl(sourceUrl);
  const trimmedSourceUrl = parsedSourceUrl?.href ?? sourceUrl.trim();
  const sourcePathname = parsedSourceUrl
    ? `${parsedSourceUrl.pathname}${parsedSourceUrl.search}`
    : sourceUrl.trim();
  const trimmedHtml = referenceHtml.trim();
  const suggestedSlug = suggestPrototypeSlug(trimmedTitle);
  const galleryUrl = `${origin}/`;
  const prototypePreviewUrl = `${origin}/prototypes/${suggestedSlug || "<slug>"}`;
  const componentLibraryUrl = `${origin}/design-system`;
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
    ...(trimmedDescription
      ? [`- Description: ${trimmedDescription}`]
      : []),
    `- Source URL: ${trimmedSourceUrl}`,
    `- Source path: \`${sourcePathname}\``,
    `- Suggested slug: \`${suggestedSlug || "my-prototype"}\` (pick a unique kebab-case slug if taken)`,
    `- Data: ${useRealData ? "Use real data from the linked source app (see **Real data** below)" : "Mock data only (default — typed constants, no live API calls)"}`,
    ...buildWorkspaceProfilePromptLines(workspaceProfile ?? { userName: "", companyName: "" }),
    "",
    "## Live source URL (required — visual source of truth)",
    "",
    `Source URL: ${trimmedSourceUrl}`,
    `Source path (from the URL): \`${sourcePathname}\``,
    sourceLine,
    "",
    "This URL is the page the prototype must look like. Linked source code and optional reference HTML are helpers. If they disagree with what is on screen at this URL, match the URL.",
    "",
    "### Before writing any UI",
    "",
    "1. Confirm the URL is reachable (`curl` or the browser). If it does not load (connection refused, auth wall, 404), **stop** and tell the user. Do not invent the page from memory or from source code alone.",
    "2. Open the URL in the Cursor browser. Follow `.cursor/rules/cursor-browser-mcp.mdc`: `browser_tabs` list first, reuse a real `glass-browser-*` tab, do not spam `newTab`. Take a snapshot **and** a screenshot. Keep that tab open for the rest of the task.",
    `3. Parse the URL. Use pathname \`${sourcePathname}\` (and search params if they change the view) to find the matching page in the linked \`source/\` tree. Read that page and its layout/shell imports. Do not import from \`source/\` at runtime — copy render structure into \`src/prototypes/<slug>/\` and mock data.`,
    "4. List every region actually visible on the live page (app chrome, main sections, open overlays). Prototype only what is on this URL. Do not add platform-only or other-environment UI that the live page does not show.",
    "",
    "### What \"match\" means",
    "",
    "Reproduce the live page pixel-close:",
    "",
    "- App chrome: header, product sidebar, footer, banners — same structure, icons, spacing, borders, active states",
    "- Layout: widths, padding, section order, grid/flex, scroll",
    "- Type: font, size, weight, color, heading vs body",
    "- Color: semantic tokens from the synced design system (no guessed hex)",
    "- Copy: labels, headings, helper text, empty/error strings as shown",
    "- Controls: buttons, inputs, menus, tabs — same variants and sizes",
    "- States: empty, loading, error, and any overlay that is part of the page",
    "- Interactions: hover, focus, open dropdowns/menus/popovers/sheets — captured from the live URL (see below)",
    "",
    "Do not approximate, simplify chrome, or invent an alternate layout.",
    "",
    "### Interact on the live URL (required)",
    "",
    "Do not stop at the resting page. On the source URL, use the Cursor browser (`browser_hover`, click to open menus, `take_screenshot_afterwards: true`) and walk every control a user would touch:",
    "",
    "- Hover: nav icons, header buttons, cards, table rows, links, icon buttons",
    "- Open: dropdowns, select menus, copy/overflow menus, popovers, tooltips that stay open, sheets/drawers",
    "- Click through: tabs, connect actions, primary CTAs that reveal another view on the same page",
    "",
    "For each revealed UI:",
    "",
    "1. Screenshot it (vision) and snapshot it (structure/copy).",
    "2. Read the matching source component for the hover/open classNames (do not guess colors).",
    "3. Copy that UI into the prototype:",
    "   - **Hover/focus** — copy the source hover classes onto the same controls. These are not preview-state registry entries (AGENTS.md: skip hover/focus micro-interactions).",
    "   - **Open menus, popovers, sheets** — replicate the open UI. If a reviewer should jump to that view, add a preview-state registry entry in the same change.",
    "",
    "Then perform the **same** hover/open actions on the prototype and screenshot those too.",
    "",
    "### Verify with screenshots + vision (required — blocking)",
    "",
    "There is no pixelmatch CI for prototypes. Verification is paired screenshots plus the agent's vision (Read the PNGs). `pnpm verify:design-system-visual` only checks design-system token colors — it does not prove page parity.",
    "",
    "**Cap: 2 rounds total** for the whole prototype (resting page + captured interactions). Do not keep iterating until pixel-perfect.",
    "",
    `1. Round 1 — screenshot the live source URL (resting page) and the prototype preview (\`${prototypePreviewUrl}\`), framed on \`#prototype-viewport\` / \`[data-prototype-screenshot]\` so review chrome is not in the crop. Include the 2–3 most important captured interactions (not every hover). Read the pairs, list mismatches (spacing, type, color, missing chrome, wrong copy), and fix the obvious ones.`,
    "2. Round 2 — re-shoot the same views once. List remaining mismatches. **Stop.** Do not start a third round.",
    "3. Then run `pnpm verify:prototype-ids` and `pnpm verify:prototype-preview-states`.",
    "",
    "If mismatches remain after round 2, ship the prototype and report them to the user. If the live URL cannot be screenshotted (down, auth), stop — do not claim visual parity from source code alone.",
  ];

  if (trimmedHtml) {
    lines.push(
      "",
      "## Reference HTML",
      "The user captured this rendered HTML as an extra snapshot. Use it to map structure, but the **live source URL wins** if they disagree. Rebuild as React components using the synced design system below. Do **not** paste or dangerously set this HTML at runtime.",
      "",
      "```html",
      trimmedHtml,
      "```",
    );
  }

  lines.push(
    "",
    "## Component library",
    "Build UI from the **cached design system** already synced in this host — not from ad-hoc markup.",
    "",
    `- Component library gallery: ${componentLibraryUrl}`,
    "- UI primitives: `@/components/ui/`",
    "- Design tokens and global styles: host `globals.css`",
    "",
    "Before writing UI, open `/design-system` — expand **UI primitives** and **Composite components** — and map each region on the live source URL to existing synced components. Reuse them directly; do not re-sync from source or invent parallel primitives when an equivalent already exists.",
    "",
    "## Source app",
    "Draw from the **source application** (linked via `SOURCE_PATH` / `pnpm link-source`) — not from other prototypes in this gallery. Replicate the page at the live source URL **exactly**: layout, spacing, typography, components, empty/loading/error states, and interactions. Match the live URL with paired screenshots; do not approximate or invent alternate UI.",
    "",
    "## Gallery",
    galleryUrl,
  );

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
    "Before building UI, list every distinct mode reviewers must open directly from the State picker and `/prototypes/<slug>/states` map. Include modes implied by the brief, the live source URL, and interactions captured on that URL, for example:",
    "- Primary tabs, steps, or wizard stages",
    "- Empty, loading, and error branches",
    "- Filter bars, preset filters, active filter chips, and add-filter popovers",
    "- Modals, drawers, side shelves (SidePanel), sheets, and overlay branches",
    "- Open dropdowns / copy menus / popovers that reviewers should jump to",
    "- View toggles (list vs calendar, grid vs table, etc.)",
    "",
    "Each mode gets one registry entry in `*-preview-states.ts` with matching `liveState` in `createLiveStateForPreview`. Wire the full stack in the same pass as the UI — not as a follow-up. Hover and focus are not registry entries — copy their source classNames onto the controls.",
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
    "## Product theme scoping (required — avoids washed-out preview)",
    "proto-plugin resets product `--*` tokens on `[data-prototype-screenshot]`, so host `globals.css` alone renders neutral/washed-out inside the preview frame. Before building UI:",
    "",
    "1. Create `src/prototypes/<slug>/<slug>-theme.css` that restores the source app's product token VALUES (colors, `--radius`, brand, surfaces) scoped to `[data-prototype-screenshot].<slug>-theme, .<slug>-theme`.",
    "2. `@import` it from host `globals.css`.",
    "3. In `index.tsx`, add/remove the `<slug>-theme` class on `#prototype-viewport` (`PROTOTYPE_VIEWPORT_ID`) via a `useEffect` with cleanup.",
    "4. Reference: `src/prototypes/table-editor-filters/table-editor-filters-theme.css` and `table-editor-filters/index.tsx` (classList effect).",
    "",
    "**Utility registration is host-level, not per-prototype.** Values restore alone is not enough if the host never imported the source's Tailwind `@theme` registration layer — classes like `bg-subtle` / `bg-brand-default` silently emit no CSS. Before blaming the scoped theme file, confirm design-system onboarding ran `extract-tailwind-theme.mjs` and `pnpm verify:tailwind-theme` passes. Do not re-declare the full `@theme` block inside `<slug>-theme.css`.",
    "",
    "Fonts are loaded once at host level during design-system onboarding — the scoped theme file carries color/radius VALUES only, not font assets or `--font-*` bindings.",
    "",
    "## Instructions",
    "Follow AGENTS.md → New prototype checklist, **Live state & preview states (mandatory)**, and **Prototype overlays & side shelves (mandatory)** when the UI has shelves or overlays.",
    "",
    `1. Open the live source URL (${trimmedSourceUrl}), snapshot and screenshot it, then read the matching page in \`source/\` at \`${sourcePathname}\`. If the URL does not load, stop.`,
    "2. Interact on the live URL: hover controls, open dropdowns/menus/popovers/sheets. Screenshot each revealed UI and copy hover classes plus open states into the prototype.",
    "3. Inspect `/design-system` (UI primitives + Composite components sections) and map synced components to each region on the live URL.",
    "4. Create `src/prototypes/<slug>/` with a default export page component that reproduces the live URL using `@/components/ui` and host tokens.",
    "5. Add `component-ids.ts` — exhaustive static id list + `dynamicPrefixes`.",
    "6. Register in `prototype.config.ts` with `componentRegistry`.",
    "7. Wrap every UI component in `PrototypeComponent` / `PrototypeControl`.",
    "8. Add product theme scoping (see **Product theme scoping** above): `<slug>-theme.css`, import in `globals.css`, and apply the theme class on `#prototype-viewport` in `index.tsx`.",
    "9. Define typed `liveState`, wire `usePrototypeComments(liveState, onRestore)`, **`useSyncPrototypePreviewStateToUrl(previewStateId, setPreviewState, { validStateIds })`**, and derive all preview-relevant UI from `liveState`. Every state change must update `?state=<registry-id>` — copy-pasting the browser URL must reproduce the exact preview mode.",
    "10. Wire interactive state flow in the same change — UI controls must update `liveState` so reviewers can move between preview modes by using the prototype (not only the State picker). Use `inferPreviewStateId` / `withInferredPreviewState` to keep `previewStateId` in sync when interactions change underlying fields (data mode, open shelf, filters, etc.). Map controls to registry `edges`: toolbar buttons open shelves, close/cancel returns to base state, apply/clear filters, loading → ready transitions, empty → populated actions.",
    "11. Add preview states in the same change (mandatory for feature pages — see **Preview states** above):",
    "   - `src/prototypes/<slug>/_components/<slug>-preview-states.ts` — `definePreviewStateRegistry`, `createLiveStateForPreview`, one entry per mode",
    '   - `src/prototypes/<slug>/_components/<slug>-preview-state-select.tsx` — wire `ControlsPanelSelect` with `appearance="menuList"` into the review toolbar via `setTweaksContent` (no floating mini-pill on the page)',
    "   - `src/prototypes/<slug>/_components/<slug>-state-canvas-config.tsx` — wireframes from the same registry",
    "   - `src/prototypes/<slug>/state-map-page.tsx` — full-page state map at `/prototypes/<slug>/states`; node clicks navigate to prototype with `?state=<id>`",
    "   - `stateMapComponent` on the prototype entry in `prototype.config.ts`",
    "   - In `index.tsx`: `review.setStateCanvasConfig(build…StateCanvasConfig(onStateSelect))` in an effect — pass only the select handler, not `liveState` or the current preview mode (state map is stateless; always light mode)",
    "12. Run `pnpm verify:prototype-ids` and `pnpm verify:prototype-preview-states`.",
    "13. Confirm URL sync: switch states and verify the URL updates (`?state=<id>`); reload and confirm the same mode renders.",
    `14. Verify with paired screenshots + vision against the live source URL (${trimmedSourceUrl}) — **at most 2 rounds** (see **Verify with screenshots + vision**). Resting page plus 2–3 key interactions; crop the prototype to \`#prototype-viewport\`. After round 2, stop and list leftovers. Also confirm (a) a chromatic token (brand/primary) resolves to the source hue — not neutral/washed-out — and (b) typography: headings and display text render in the source's typeface (e.g. a \`font-cal\` element is not the fallback). If a \`font-*\` class renders in the fallback face, fonts were not loaded during design-system onboarding — fix at host level per the design-system setup prompt, not with a per-prototype hack.`,
    "",
    "Do not run `pnpm share-prototype`, and do not commit or push. Sharing/publishing is the user's decision — stop after confirming the prototype works locally.",
    "",
    "Reference: `src/prototypes/table-editor-filters/` (`index.tsx` URL sync, side panels) and `src/prototypes/booking-flow/` (`index.tsx`, `*-preview-states.ts`, `*-preview-state-select.tsx`, `*-state-canvas-config.tsx`, `state-map-page.tsx`, `prototype.config.ts` → `stateMapComponent`).",
  );

  return lines.join("\n");
}

export function buildCreatePrototypeCopyText({
  title,
  description = "",
  sourceUrl,
  referenceHtml,
  origin = "http://localhost:3003",
  referenceDocs = [],
  useRealData = false,
  sourcePath,
  workspaceProfile,
}: {
  title: string;
  description?: string;
  sourceUrl: string;
  referenceHtml: string;
  origin?: string;
  referenceDocs?: CreatePrototypeReferenceDocInput[];
  useRealData?: boolean;
  sourcePath?: string;
  workspaceProfile?: WorkspaceProfile;
}): string {
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const parsedSourceUrl = parseCreatePrototypeSourceUrl(sourceUrl);
  const trimmedSourceUrl = parsedSourceUrl?.href ?? sourceUrl.trim();
  const normalizedReferenceDocs =
    normalizeCreatePrototypeReferenceDocs(referenceDocs);
  const briefLines = [
    `Title: ${trimmedTitle}`,
    ...(trimmedDescription ? [`Description: ${trimmedDescription}`] : []),
    `Source URL: ${trimmedSourceUrl}`,
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
    description: trimmedDescription,
    sourceUrl: trimmedSourceUrl,
    referenceHtml: referenceHtml.trim(),
    origin,
    referenceDocs: normalizedReferenceDocs,
    useRealData,
    sourcePath,
    workspaceProfile,
  });

  return `${briefLines.join("\n")}\n\n---\n\n${prompt}`;
}

/** @deprecated Use normalizeCreatePrototypeReferenceDocs */
export function normalizeCreatePrototypeDocLinks(links: string[] = []): string[] {
  return links
    .map((link) => normalizeReferenceDocLink(link.trim()))
    .filter((link) => link.length > 0);
}
