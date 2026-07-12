import type { ReactNode } from "react";

export type DesignExplorationRationale = {
  good: string;
  bad: string;
};

export type DesignExplorationVariantOption<TVariant extends string> = {
  value: TVariant;
  label: string;
  hint?: string;
  /** One-line pros/cons shown under the variant title in the design brief. */
  rationale?: DesignExplorationRationale;
};

export type DesignExplorationBrief = {
  titleDefault: string;
  descriptionDefault: string;
};

/** Open-ended context — prototype defines the JSON shape. */
export type DesignExplorationContext = {
  label: string;
  data: unknown;
  render?: (data: unknown) => ReactNode;
  defaultExpanded?: boolean;
  /** Stable id suffix for aria-controls on the collapsible panel. */
  panelId?: string;
};

export type MobbinReference = {
  id: string;
  appName: string;
  imageUrl: string;
  mobbinUrl: string;
  relevance: string;
  variantHint?: string;
};

export type DesignExplorationMobbin = {
  references: MobbinReference[];
  title?: string;
  description?: string;
  imagePathForReference?: (id: string) => string;
};

export type DesignExplorationVariantsSection = {
  title?: string;
  description?: string;
};

/** Pre-exploration UI — always pinned at the bottom of the variant list. */
export type DesignExplorationBaselineOption<TVariant extends string> = {
  value: TVariant;
  /** Shown in the brief and tabs. Default: "Original". */
  label?: string;
  hint?: string;
  rationale?: DesignExplorationRationale;
};

export type DesignExplorationConfig<TVariant extends string> = {
  componentIdPrefix: string;
  variantTabsIdPrefix: string;
  storageKeyPrefix: string;
  variant: TVariant;
  onVariantChange: (variant: TVariant) => void;
  /** Layout directions being explored — newest first. Excludes baseline. */
  options: DesignExplorationVariantOption<TVariant>[];
  renderers: Record<TVariant, () => ReactNode>;
  brief: DesignExplorationBrief;
  context?: DesignExplorationContext;
  mobbin?: DesignExplorationMobbin;
  variantsSection?: DesignExplorationVariantsSection;
  /**
   * UI state before this exploration was added. Rendered last in the brief
   * and tabs; deduped from `options` when the same value appears there.
   */
  baseline: DesignExplorationBaselineOption<TVariant>;
  /**
   * Default variant stored in the codebase (e.g. `DEFAULT_*_VARIANT`). Marks
   * the "Default" option in the design brief. Falls back to the first option.
   */
  defaultVariant?: TVariant;
  /** Label for prev/next variant tab buttons. Default: "variant". */
  variantTabAriaLabel?: string;
  /** Path to design exploration config — included in copy prompts. */
  briefConfigFilePath?: string;
};

export const DESIGN_EXPLORATION_BASELINE_LABEL = "Original";

export function resolveDesignExplorationBaselineOption<
  TVariant extends string,
>(
  baseline: DesignExplorationBaselineOption<TVariant>,
): DesignExplorationVariantOption<TVariant> {
  return {
    value: baseline.value,
    label: baseline.label ?? DESIGN_EXPLORATION_BASELINE_LABEL,
    hint: baseline.hint,
    rationale: baseline.rationale,
  };
}

/** Exploration options only — baseline value removed when duplicated. */
export function getDesignExplorationVariantOptions<
  TVariant extends string,
>(
  options: DesignExplorationVariantOption<TVariant>[],
  baseline: DesignExplorationBaselineOption<TVariant>,
): DesignExplorationVariantOption<TVariant>[] {
  return options.filter((option) => option.value !== baseline.value);
}

/** Exploration options plus baseline pinned at the bottom (for tabs / cycling). */
export function getDesignExplorationDisplayOptions<
  TVariant extends string,
>(
  options: DesignExplorationVariantOption<TVariant>[],
  baseline: DesignExplorationBaselineOption<TVariant>,
): DesignExplorationVariantOption<TVariant>[] {
  return [
    ...getDesignExplorationVariantOptions(options, baseline),
    resolveDesignExplorationBaselineOption(baseline),
  ];
}

/** Mobbin references tagged with `variantHint` matching a layout direction label. */
export function getMobbinReferencesForVariantLabel(
  references: MobbinReference[],
  variantLabel: string,
): MobbinReference[] {
  return references.filter(
    (reference) => reference.variantHint === variantLabel,
  );
}

/** Plain-text copy of the overview fields as shown in the design brief modal. */
export function buildBriefOverviewCopyText(
  title: string,
  description: string,
): string {
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  if (!trimmedTitle) return trimmedDescription;
  if (!trimmedDescription) return trimmedTitle;
  return `${trimmedTitle}\n\n${trimmedDescription}`;
}

export function buildCreateDesignExplorationPrompt({
  slug,
  existingExplorations = [],
  origin = "http://localhost:3003",
  previewUrl,
  briefText,
  includeMobbin = true,
}: {
  slug: string;
  existingExplorations?: Array<{ id: string; label: string }>;
  origin?: string;
  /** Full browser URL including pathname and query params (e.g. `?state=`). */
  previewUrl?: string;
  briefText?: string;
  includeMobbin?: boolean;
}): string {
  const prototypeUrl = previewUrl ?? `${origin}/prototypes/${slug}`;
  const variantSetsRegistrar = `src/prototypes/${slug}/_components/*-variant-sets.tsx`;
  const trimmedBrief = briefText?.trim() ?? "";

  const lines = [
    `Add a new design exploration to the "${slug}" prototype.`,
    "",
    "## Brief",
  ];

  if (trimmedBrief) {
    lines.push(trimmedBrief);
  } else {
    lines.push(
      "Describe the UI problem to explore and the 2+ directions to compare:",
      "- Problem:",
      "- Variants to explore:",
    );
  }

  if (existingExplorations.length > 0) {
    lines.push("", "## Existing explorations on this prototype");
    for (const exploration of existingExplorations) {
      lines.push(`- ${exploration.label} (\`${exploration.id}\`)`);
    }
  }

  lines.push(
    "",
    "## Prototype",
    `- Slug: \`${slug}\``,
    `- Preview: ${prototypeUrl}`,
  );

  if (previewUrl?.includes("?")) {
    lines.push(
      "- The preview URL includes the current page state and other URL params from review mode.",
    );
  }

  if (includeMobbin) {
    lines.push(
      "",
      "## Mobbin references",
      "Before building variants, pull real-world reference screens from Mobbin. Use the Mobbin MCP `search_screens` tool when available; otherwise search on mobbin.com.",
      "",
      "1. Search for **3–5 screens** that match the brief and the distinct layout directions you plan to explore. Prefer specific UI descriptions (e.g. \"settings page with profile photo and bio field\") over vague style words.",
      "2. Pick references that clarify layout, hierarchy, and copy patterns — not just visual polish.",
      "3. In `*-design-exploration-config.tsx`, add a `mobbin` block:",
      "   - `references`: `{ id, appName, imageUrl, mobbinUrl, relevance, variantHint? }[]` — use each screen UUID as `id`",
      "   - `imagePathForReference`: `(id) => \\`/prototypes/mobbin-references/${id}.webp\\``",
      "4. Register `mobbin-inspiration-gallery` and `mobbin-inspiration-gallery.` in `component-ids.ts` (or pass a custom `mobbinGalleryId` to `PrototypeVariantExplorer`).",
      "5. Download local assets: `pnpm download-mobbin-references -- --ids=<comma-separated-ids>`",
      "",
      "Reference: `src/prototypes/proto-partner-page/_components/invite-copy-design-exploration-config.tsx`.",
    );
  }

  lines.push(
    "",
    "## Instructions",
    "Follow AGENTS.md → Design exploration. Do not register a new prototype slug — add a design exploration variant set on this page.",
    "",
    "1. Add `{ id, label, previewMode? }` to the variant sets registrar (e.g. `" +
      variantSetsRegistrar +
      "`).",
    "   - Give this exploration a **distinct Lucide icon** in the review sidebar: add a `{ test, icon }` rule to `packages/prototype/src/lib/prototypes/variant-set-lucide-icon.tsx` that matches its id or label. Place the rule **before** broad matchers (e.g. `/mobile/i`) so it wins. Pick an icon that fits the topic and avoid reusing icons already assigned to other explorations on this prototype — do not leave new explorations on the default `LayoutGrid` fallback or the generic `Smartphone` icon shared by unrelated mobile explorations.",
    `2. Create \`*-design-exploration-config.tsx\` with options, renderers, brief defaults, baseline,${includeMobbin ? " and the Mobbin references above" : ""}.`,
    "   - `baseline`: the UI before this exploration existed — `{ value, label?, hint? }`, pinned at the bottom of the variant list.",
    "   - `options`: layout directions to compare — exclude the baseline value when possible.",
    "   - Build renderers with `buildDesignExplorationRenderers(options, (variant) => …, baseline)` — one preview per option plus baseline.",
    "   - Wrap overlay-style variants in `DesignExplorationVariantPreviewShell` with `layout=\"overlay\"` for sidebar previews.",
    "3. Create `*-variant-toggle.tsx` mounting `PrototypeVariantExplorer` with matching `variantSet={{ id, label }}`.",
    "4. Register static ids + any `dynamicPrefixes` in `src/prototypes/" +
      slug +
      "/component-ids.ts`.",
    "5. If the exploration needs a specific page state, wire preview mode in mock data / URL params and render the toggle on the page.",
    "6. Prepend new variant options to the top of `*_VARIANT_OPTIONS` so newest explorations appear first.",
    "7. Run `pnpm verify:prototype-ids`.",
    "",
    "Reference: `src/prototypes/example-feature/_components/no-data-design-exploration-config.tsx` + `no-data-variant-toggle.tsx`.",
  );

  return lines.join("\n");
}

export function buildCreateDesignExplorationCopyText({
  slug,
  existingExplorations = [],
  origin = "http://localhost:3003",
  previewUrl,
  briefText,
  includeMobbin = true,
}: {
  slug: string;
  existingExplorations?: Array<{ id: string; label: string }>;
  origin?: string;
  previewUrl?: string;
  briefText: string;
  includeMobbin?: boolean;
}): string {
  const trimmedBrief = briefText.trim();
  const prompt = buildCreateDesignExplorationPrompt({
    slug,
    existingExplorations,
    origin,
    previewUrl,
    briefText: trimmedBrief,
    includeMobbin,
  });

  return `${trimmedBrief}\n\n---\n\n${prompt}`;
}

export function buildMoreDesignExplorationVariantsPrompt({
  slug,
  explorationLabel,
  explorationId,
  options,
  brief,
  configFilePath,
  origin = "http://localhost:3003",
  briefText,
  multipleVersions = true,
}: {
  slug: string;
  explorationLabel: string;
  explorationId?: string;
  options: Array<{ value: string; label: string; hint?: string }>;
  brief: DesignExplorationBrief;
  configFilePath?: string;
  origin?: string;
  briefText?: string;
  /** When false, prompt asks for one targeted derivative variant. */
  multipleVersions?: boolean;
}): string {
  const prototypeUrl = `${origin}/prototypes/${slug}`;
  const configTarget = configFilePath ?? "the design exploration config file";
  const trimmedBrief = briefText?.trim() ?? "";

  const lines = [
    `Add new layout variants to the "${explorationLabel}" design exploration on the "${slug}" prototype.`,
    "",
    "## Brief",
  ];

  if (trimmedBrief) {
    lines.push(trimmedBrief);
  } else if (multipleVersions) {
    lines.push(
      "Describe the new directions to explore:",
      "- What to try:",
      "- Target count: 3–5 new variants",
    );
  } else {
    lines.push(
      "Describe the variation to explore:",
      "- What to try:",
      "- Target count: 1 new variant",
    );
  }

  lines.push(
    "",
    "## Exploration context",
    `- Label: ${explorationLabel}`,
  );

  if (explorationId) {
    lines.push(`- Variant set id: \`${explorationId}\``);
  }

  lines.push(
    `- Overview title: ${brief.titleDefault}`,
    `- Overview description: ${brief.descriptionDefault}`,
    "",
    "## Existing variants",
  );

  for (const option of options) {
    const hint = option.hint ? ` — ${option.hint}` : "";
    lines.push(`- ${option.label} (\`${option.value}\`)${hint}`);
  }

  lines.push(
    "",
    "## Prototype",
    `- Slug: \`${slug}\``,
    `- Config: \`${configTarget}\``,
    `- Preview: ${prototypeUrl}`,
    "",
    "## Instructions",
    "Follow AGENTS.md → Design exploration → Iterating on variants.",
    "",
    multipleVersions
      ? "Supply **3–5 new variant options** unless the brief specifies a different count."
      : "Add **one new derivative variant** unless the brief specifies otherwise.",
    "",
    multipleVersions
      ? "When modifying an existing option, add **new variants** (do not replace in place)."
      : "When modifying an existing option, add a **single new variant** (do not replace in place). Keep all existing variants.",
    "",
    "1. Prepend new entries to the top of `*_VARIANT_OPTIONS` so newest explorations appear first.",
    "2. Add matching renderers via `buildDesignExplorationRenderers` and any new component ids.",
    "3. Keep existing variants unless the brief explicitly asks to remove one.",
    "4. Run `pnpm verify:prototype-ids`.",
  );

  return lines.join("\n");
}

export function buildMoreDesignExplorationVariantsCopyText({
  slug,
  explorationLabel,
  explorationId,
  options,
  brief,
  configFilePath,
  origin = "http://localhost:3003",
  briefText,
  multipleVersions = true,
}: {
  slug: string;
  explorationLabel: string;
  explorationId?: string;
  options: Array<{ value: string; label: string; hint?: string }>;
  brief: DesignExplorationBrief;
  configFilePath?: string;
  origin?: string;
  briefText: string;
  multipleVersions?: boolean;
}): string {
  const trimmedBrief = briefText.trim();
  const prompt = buildMoreDesignExplorationVariantsPrompt({
    slug,
    explorationLabel,
    explorationId,
    options,
    brief,
    configFilePath,
    origin,
    briefText: trimmedBrief,
    multipleVersions,
  });

  return `${trimmedBrief}\n\n---\n\n${prompt}`;
}

export function buildResetBriefDefaultsPrompt({
  brief,
  configFilePath,
}: {
  brief: DesignExplorationBrief;
  configFilePath?: string;
}): string {
  const target = configFilePath ?? "the design exploration config file";

  return [
    "Update the design exploration overview defaults.",
    "",
    `In ${target}, set brief.titleDefault and brief.descriptionDefault to:`,
    "",
    `Title: ${brief.titleDefault}`,
    "",
    "Description:",
    brief.descriptionDefault,
  ].join("\n");
}

/**
 * Prompt that asks an agent to set the codebase-stored default variant. Copied
 * by the "Make default" control in the design brief — the default lives in the
 * config file (e.g. `DEFAULT_*_VARIANT`), not in KV storage.
 */
export function buildSetDefaultVariantPrompt({
  variantLabel,
  variantValue,
  configFilePath,
}: {
  variantLabel: string;
  variantValue: string;
  configFilePath?: string;
}): string {
  const target = configFilePath ?? "the design exploration config file";

  return [
    `Make "${variantLabel}" the default design exploration variant.`,
    "",
    `In ${target}, update the exported default variant constant (e.g. \`DEFAULT_*_VARIANT\`) so it equals:`,
    "",
    variantValue,
    "",
    'This constant is the codebase-stored default the prototype renders first, and the option marked "Default" in the design brief. Keep it as one of the values in the variant options list.',
  ].join("\n");
}

/**
 * Prepend new entries to the top of *_VARIANT_OPTIONS so they appear first in the
 * design-brief scroll view (see AGENTS.md). The default variant is stored in the
 * codebase config (`defaultVariant`), not KV.
 */
export function getAdjacentDesignExplorationVariant<TVariant extends string>(
  options: DesignExplorationVariantOption<TVariant>[],
  current: TVariant,
  direction: "prev" | "next",
): TVariant {
  const index = options.findIndex((option) => option.value === current);
  const offset = direction === "prev" ? -1 : 1;
  const nextIndex = (index + offset + options.length) % options.length;
  return options[nextIndex].value;
}
