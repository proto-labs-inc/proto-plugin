"use client";

import { PrototypeComponent, PrototypeVariantExplorer } from "proto-plugin";

import {
  buildGridEmptyStateDesignExplorationConfig,
  type GridEmptyStateVariant,
} from "./grid-empty-state-design-exploration-config";
import { GRID_EMPTY_STATE_LAYOUT_VARIANT_SET } from "./table-editor-filters-variant-sets";

type GridEmptyStateVariantToggleProps = {
  variant: GridEmptyStateVariant;
  onVariantChange: (next: GridEmptyStateVariant) => void;
  registerOnly?: boolean;
};

export function GridEmptyStateVariantToggle({
  variant,
  onVariantChange,
  registerOnly = false,
}: GridEmptyStateVariantToggleProps) {
  return (
    <PrototypeComponent
      id="grid-empty-state-variant-toggle"
      className="relative z-30 shrink-0"
    >
      <PrototypeVariantExplorer
        {...buildGridEmptyStateDesignExplorationConfig(variant, onVariantChange)}
        variantSet={GRID_EMPTY_STATE_LAYOUT_VARIANT_SET}
        mobbinGalleryId="grid-empty-state-mobbin-inspiration-gallery"
        wrapRoot={false}
        registerOnly={registerOnly}
        hideInlinePreview={!registerOnly}
      />
    </PrototypeComponent>
  );
}
