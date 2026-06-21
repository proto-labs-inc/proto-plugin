import type { ReactNode } from "react";

export type DesignExplorationVariantOption<TVariant extends string> = {
  value: TVariant;
  label: string;
  hint?: string;
};

export type DesignExplorationRationale = {
  good: string;
  bad: string;
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

/** Persists to KV via `storageKeyPrefix` — use `useDesignExplorationDefault`. */
export type DesignExplorationConfig<TVariant extends string> = {
  componentIdPrefix: string;
  variantTabsIdPrefix: string;
  storageKeyPrefix: string;
  variant: TVariant;
  onVariantChange: (variant: TVariant) => void;
  options: DesignExplorationVariantOption<TVariant>[];
  rationale: Record<TVariant, DesignExplorationRationale>;
  renderers: Record<TVariant, () => ReactNode>;
  brief: DesignExplorationBrief;
  context?: DesignExplorationContext;
  mobbin?: DesignExplorationMobbin;
  variantsSection?: DesignExplorationVariantsSection;
  /** Label for prev/next variant tab buttons. Default: "variant". */
  variantTabAriaLabel?: string;
  /** Path to design exploration config — included in reset-brief copy prompt. */
  briefConfigFilePath?: string;
};

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
  briefText,
}: {
  slug: string;
  existingExplorations?: Array<{ id: string; label: string }>;
  origin?: string;
  briefText?: string;
}): string {
  const prototypeUrl = `${origin}/prototypes/${slug}`;
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
    "",
    "## Instructions",
    "Follow AGENTS.md → Design exploration. Do not register a new prototype slug — add a design exploration variant set on this page.",
    "",
    "1. Add `{ id, label, previewMode? }` to the variant sets registrar (e.g. `" +
      variantSetsRegistrar +
      "`).",
    "2. Create `*-design-exploration-config.tsx` with options, rationale, renderers, and brief defaults.",
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
  briefText,
}: {
  slug: string;
  existingExplorations?: Array<{ id: string; label: string }>;
  origin?: string;
  briefText: string;
}): string {
  const trimmedBrief = briefText.trim();
  const prompt = buildCreateDesignExplorationPrompt({
    slug,
    existingExplorations,
    origin,
    briefText: trimmedBrief,
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
 * Prepend new entries to the top of *_VARIANT_OPTIONS so they appear first in the
 * design-brief scroll view (see AGENTS.md). Default variant is stored in KV.
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
