"use client";

import type { DesignExplorationConfig } from "proto-plugin";
import { buildDesignExplorationRenderers } from "proto-plugin";

import { DEFAULT_FRONT_COVER_HERO_VARIANT } from "./front-cover-preview-states";
import type { FrontCoverHeroVariant } from "./front-cover-types";
import { HeroSection } from "./hero-section";

export const HERO_COVER_VARIANT_OPTIONS: Array<{
  value: Exclude<FrontCoverHeroVariant, "original">;
  label: string;
  hint: string;
}> = [
  {
    value: "signal-field",
    label: "Signal field",
    hint: "Brand-green drench with a Postgres-centered architecture diagram.",
  },
  {
    value: "orbit-canvas",
    label: "Orbit canvas",
    hint: "Color wash behind an orbital product diagram.",
  },
  {
    value: "stack-cutaway",
    label: "Stack cutaway",
    hint: "Layered platform stack with brand, warning, and forest fills.",
  },
];

export const HERO_COVER_BASELINE = {
  value: "original" as const satisfies FrontCoverHeroVariant,
  hint: "Current supabase.com hero: two-line headline, supporting copy, two buttons. No diagram.",
};

const renderers = buildDesignExplorationRenderers<FrontCoverHeroVariant>(
  HERO_COVER_VARIANT_OPTIONS,
  (variant) => <HeroSection variant={variant} />,
  HERO_COVER_BASELINE,
);

export function buildHeroCoverDesignExplorationConfig(
  variant: FrontCoverHeroVariant,
  onVariantChange: (next: FrontCoverHeroVariant) => void,
): DesignExplorationConfig<FrontCoverHeroVariant> {
  return {
    componentIdPrefix: "hero-cover-explorer",
    variantTabsIdPrefix: "hero-cover-variant-tabs",
    storageKeyPrefix: "front-cover-hero",
    variant,
    onVariantChange,
    options: HERO_COVER_VARIANT_OPTIONS,
    baseline: HERO_COVER_BASELINE,
    defaultVariant: DEFAULT_FRONT_COVER_HERO_VARIANT,
    renderers,
    brief: {
      titleDefault: "Front cover",
      descriptionDefault:
        "Homepage looks too blank and white. Try striking colors and more diagrams or visuals on the hero.",
    },
    variantsSection: {
      title: "Hero directions",
      description: "Color and diagram treatments for the marketing homepage cover.",
    },
  };
}
