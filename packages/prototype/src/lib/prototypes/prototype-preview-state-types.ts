export type PrototypePreviewState = {
  id: string;
  label: string;
};

export function buildCreatePreviewStatePrompt({
  slug,
  existingStates = [],
  origin = "http://localhost:3003",
  briefText,
}: {
  slug: string;
  existingStates?: PrototypePreviewState[];
  origin?: string;
  briefText?: string;
}): string {
  const prototypeUrl = `${origin}/prototypes/${slug}`;
  const registryFile = `src/prototypes/${slug}/**/*-preview-states.ts`;
  const trimmedBrief = briefText?.trim() ?? "";

  const lines = [
    `Add a new preview state to the "${slug}" prototype.`,
    "",
    "## Brief",
  ];

  if (trimmedBrief) {
    lines.push(trimmedBrief);
  } else {
    lines.push(
      "Describe the UI state to add:",
      "- State id (kebab-case):",
      "- Label (shown in the states menu):",
      "- What should the page show:",
    );
  }

  if (existingStates.length > 0) {
    lines.push("", "## Existing states on this prototype");
    for (const state of existingStates) {
      lines.push(`- ${state.label} (\`${state.id}\`)`);
    }
  }

  lines.push(
    "",
    "## Prototype",
    `- Slug: \`${slug}\``,
    `- Preview: ${prototypeUrl}`,
    "",
    "## Instructions",
    "Add a preview state on this prototype page — do not register a new prototype slug.",
    "",
    "1. Add the state to `${registryFile}` using `definePreviewStateRegistry` — one entry drives both the state picker and state map. Place it in `canvasLayout.rows` (no manual x/y); nested options go in `variants`. When adding or moving states, keep `edges` readable: connected states must not share a column (or sit on the line) with an unrelated state between them — edge paths do not route around intervening nodes.",
    "2. Extend the preview mode / live-state type if needed (e.g. in `use-mock-*-data.ts` or the page module).",
    "3. Wire mock data / fixtures so the new mode renders the correct UI.",
    "4. For nested options (e.g. billing plans), add a `variants` array on the registry entry — it becomes a picker submenu and map callouts automatically.",
    "5. Sync URL via `useSyncPrototypePreviewStateToUrl(previewStateId, setPreviewState, { validStateIds })` — every preview mode must appear as `?state=<registry-id>` on load and on every change. State map clicks must use `PREVIEW_STATE_PARAM`, not `shareState`.",
    "6. Open the prototype in dev — `PrototypeStateScreenshotCapture` saves a thumbnail under `public/prototypes/screenshots/<slug>/states/`.",
    "7. Run `pnpm verify:prototype-ids` if you add new UI components.",
    "8. Run `pnpm verify:prototype-preview-states` to confirm picker/map parity.",
    "9. Reload a `?state=<new-id>` URL and confirm the new mode renders.",
    "",
    "Reference: `src/prototypes/example-feature/_components/list-preview-states.ts`.",
  );

  return lines.join("\n");
}

export function buildCreatePreviewStateCopyText({
  slug,
  existingStates = [],
  origin = "http://localhost:3003",
  briefText,
}: {
  slug: string;
  existingStates?: PrototypePreviewState[];
  origin?: string;
  briefText: string;
}): string {
  const trimmedBrief = briefText.trim();
  const prompt = buildCreatePreviewStatePrompt({
    slug,
    existingStates,
    origin,
    briefText: trimmedBrief,
  });

  return `${trimmedBrief}\n\n---\n\n${prompt}`;
}
