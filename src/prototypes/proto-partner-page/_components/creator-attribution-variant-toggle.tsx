"use client";

import { PrototypeComponent } from "proto-plugin";
import { PrototypeVariantExplorer } from "proto-plugin";

import {
  buildCreatorAttributionDesignExplorationConfig,
  type CreatorAttributionVariant,
} from "./creator-attribution-design-exploration-config";
import { CREATOR_ATTRIBUTION_VARIANT_SET } from "./partner-variant-sets";

type CreatorAttributionVariantToggleProps = {
  variant: CreatorAttributionVariant;
  onVariantChange: (next: CreatorAttributionVariant) => void;
  registerOnly?: boolean;
};

export function CreatorAttributionVariantToggle({
  variant,
  onVariantChange,
  registerOnly = false,
}: CreatorAttributionVariantToggleProps) {
  return (
    <PrototypeComponent id="creator-attribution-variant-toggle" className="sr-only">
      <PrototypeVariantExplorer
        {...buildCreatorAttributionDesignExplorationConfig(
          variant,
          onVariantChange,
        )}
        variantSet={CREATOR_ATTRIBUTION_VARIANT_SET}
        wrapRoot={false}
        registerOnly={registerOnly}
      />
    </PrototypeComponent>
  );
}
