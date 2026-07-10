"use client";

import { PrototypeComponent, PrototypeVariantExplorer } from "proto-plugin";

import {
  buildAutomatAnalyticsDesignExplorationConfig,
  type AutomatAnalyticsVariant,
} from "./automat-analytics-design-exploration-config";
import { AUTOMAT_ANALYTICS_VARIANT_SET } from "./automat-analytics-variant-sets";

type AutomatAnalyticsVariantToggleProps = {
  variant: AutomatAnalyticsVariant;
  onVariantChange: (next: AutomatAnalyticsVariant) => void;
  registerOnly?: boolean;
};

export function AutomatAnalyticsVariantToggle({
  variant,
  onVariantChange,
  registerOnly = false,
}: AutomatAnalyticsVariantToggleProps) {
  return (
    <PrototypeComponent
      id="automat-analytics-variant-toggle"
      className="relative z-30 shrink-0"
    >
      <PrototypeVariantExplorer
        {...buildAutomatAnalyticsDesignExplorationConfig(variant, onVariantChange)}
        variantSet={AUTOMAT_ANALYTICS_VARIANT_SET}
        mobbinGalleryId="automat-analytics-mobbin-inspiration-gallery"
        wrapRoot={false}
        registerOnly={registerOnly}
        hideInlinePreview={!registerOnly}
      />
    </PrototypeComponent>
  );
}
