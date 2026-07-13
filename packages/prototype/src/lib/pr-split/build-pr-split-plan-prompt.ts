export type PrSplitPlanPromptOptions = {
  slug: string;
  origin?: string;
  sourceRepo?: string;
  sourceWorkPath?: string;
};

export function buildPrSplitPlanPrompt({
  slug,
  origin = "http://localhost:1985",
  sourceRepo = "calcom/cal.diy",
  sourceWorkPath = "apps/web",
}: PrSplitPlanPromptOptions): string {
  const prototypePath = `src/prototypes/${slug}/`;
  const configPath = `${prototypePath}_components/pr-split-config.ts`;
  const wireframesPath = `${prototypePath}_components/pr-split-wireframes.tsx`;
  const previewUrl = `${origin}/prototypes/${slug}?reviewPanel=spec`;

  return [
    `Create a PR split spec for the \`${slug}\` prototype. **First identify everything that changed**, then propose a merge-ordered PR plan and implement the spec in this repo.`,
    "",
    "## Phase 1 — Audit what changed",
    "",
    "1. Read the prototype at `" +
      prototypePath +
      "` — especially `index.tsx`, any `*-preview-states.ts`, all `*-design-exploration-config.tsx` files, mock data, and `component-ids.ts`.",
    "2. For each design exploration, compare the **baseline** option (marked **Original** in the brief) to the **default variant** in code (`DEFAULT_*_VARIANT` constants). Baselines = production / pre-exploration UI; defaults = chosen shipping direction.",
    "3. Compare against production in the source app (`SOURCE_PATH` / `source/` symlink, repo `" +
      sourceRepo +
      "`). Find the real page under `" +
      sourceWorkPath +
      "` and list layout, behavior, and data-model deltas.",
    "4. Run `git log` and `git diff` on `" +
      prototypePath +
      "` to capture the full change history (including uncommitted work).",
    "5. Read preview states in `*-preview-states.ts` — each distinct reviewer mode may map to a PR slice.",
    "6. Note explorations that should **stay in the design brief only** (alternate layout or entry-point variants not chosen for shipping).",
    "",
    "## Phase 2 — Plan the PR breakdown",
    "",
    "Propose **3–7 small, merge-ordered PRs** for `" +
      sourceRepo +
      "`. For each PR, define:",
    "",
    "- `order`, `title`, `description` (2–3 sentences of source-repo work)",
    "- `size` (`Small` | `Medium` | `Large`)",
    "- `targetId` — one registered id from `component-ids.ts`",
    "- `wireframeId` — key for a full-page schematic wireframe renderer",
    "- `liveState` — restores the prototype preview for that slice",
    "- Dependencies on earlier PRs in the series",
    "",
    "Grouping guidance:",
    "- Ship data / filter logic before UI entry points that depend on it",
    "- Keep the primary layout change as its own PR",
    "- Empty states, modals, and polish can follow once foundation PRs land",
    "- Do not bundle unrelated design-brief alternates into shipping PRs",
    "",
    "Present the plan as a numbered list with a short dependency diagram before implementing.",
    "",
    "## Phase 3 — Implement the PR split spec (this repo)",
    "",
    "Follow `packages/prototype/AGENTS.md` → **PR split specs**:",
    "",
    "1. Create `" +
      configPath +
      "` with `PR_SPLIT_CONFIG` and `PR_SPLIT_ENTRIES`",
    '   - `slug: "' + slug + '"`',
    '   - `sourceRepo: "' +
      sourceRepo +
      '"`, `sourceWorkPath: "' +
      sourceWorkPath +
      '"`',
    "   - `writeEntryToSearchParams` restores each entry's `liveState`",
    "   - `scopeNote` guardrail: do not ship unchosen design-brief variants",
    "2. Create `" +
      wireframesPath +
      "` — full-page schematic wireframes (see **Wireframe rules** below)",
    "3. Wire `" +
      prototypePath +
      "index.tsx` — parse/sync `?prSplit=`, call `setSpecContent(<PrototypeSpecPanelContent ...>)`, `handlePrNavigate` with `focusShareTarget`",
    "4. Update `component-ids.ts` — add `spec-panel-content`, wireframe ids, etc.",
    "5. Verify each PR card restores the correct prototype state and highlights the right component",
    "",
    "### Wireframe rules (mandatory)",
    "",
    "Each PR card preview must show the **full prototype page shell** — sidebar, header/toolbar, and main content area as reviewers see them in the live preview. Do **not** draw cropped excerpts, zoomed-in component slices, or short strips that only show the changed region.",
    "",
    "- Scaffold every wireframe from the prototype's real page layout (match the shell layout component)",
    "- Use low-fidelity `Wire` blocks; apply `PR_TARGET_HIGHLIGHT_BORDER` / `PR_TARGET_HIGHLIGHT_FILL` only on the PR target",
    "- Fill the card preview area: wrap the wireframe root in `PR_SPLIT_WIREFRAME_FRAME_CLASS` (`aspect-video w-full overflow-hidden`) so the schematic reads as a full screen, not a tiny excerpt",
    "- The highlight shows where the slice lands on the page; surrounding chrome provides context",
    "",
    "Prototype preview: " + previewUrl,
    "",
    "After the spec is wired, summarize the final PR sequence for the user. Do not open source PRs until the plan is approved.",
  ].join("\n");
}

export function buildPrSplitPlanCopyText(
  options: PrSplitPlanPromptOptions,
): string {
  return buildPrSplitPlanPrompt(options);
}
