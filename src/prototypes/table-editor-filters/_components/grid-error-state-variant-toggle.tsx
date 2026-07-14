"use client";

import { PrototypeComponent, PrototypeVariantExplorer } from "proto-plugin";

import {
  buildGridErrorStateDesignExplorationConfig,
  type GridErrorStateVariant,
} from "./grid-error-state-design-exploration-config";
import { GRID_ERROR_STATE_LAYOUT_VARIANT_SET } from "./table-editor-filters-variant-sets";

type GridErrorStateVariantToggleProps = {
  variant: GridErrorStateVariant;
  onVariantChange: (next: GridErrorStateVariant) => void;
  registerOnly?: boolean;
};

export function GridErrorStateVariantToggle({
  variant,
  onVariantChange,
  registerOnly = false,
}: GridErrorStateVariantToggleProps) {
  return (
    <PrototypeComponent
      id="grid-error-state-variant-toggle"
      className="relative z-30 shrink-0"
    >
      <PrototypeVariantExplorer
        {...buildGridErrorStateDesignExplorationConfig(variant, onVariantChange)}
        variantSet={GRID_ERROR_STATE_LAYOUT_VARIANT_SET}
        mobbinGalleryId="grid-error-state-mobbin-inspiration-gallery"
        wrapRoot={false}
        registerOnly={registerOnly}
        hideInlinePreview={!registerOnly}
      />
    </PrototypeComponent>
  );
}
