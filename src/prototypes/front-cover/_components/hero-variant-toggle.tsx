"use client";

import { PrototypeComponent, PrototypeVariantExplorer } from "proto-plugin";

import { buildHeroCoverDesignExplorationConfig } from "./hero-design-exploration-config";
import type { FrontCoverHeroVariant } from "./front-cover-types";
import { HERO_COVER_VARIANT_SET } from "./hero-variant-sets";

type HeroVariantToggleProps = {
  variant: FrontCoverHeroVariant;
  onVariantChange: (next: FrontCoverHeroVariant) => void;
  registerOnly?: boolean;
};

export function HeroVariantToggle({
  variant,
  onVariantChange,
  registerOnly = false,
}: HeroVariantToggleProps) {
  return (
    <PrototypeComponent id="hero-variant-toggle">
      <PrototypeVariantExplorer
        {...buildHeroCoverDesignExplorationConfig(variant, onVariantChange)}
        variantSet={HERO_COVER_VARIANT_SET}
        wrapRoot={false}
        registerOnly={registerOnly}
      />
    </PrototypeComponent>
  );
}
