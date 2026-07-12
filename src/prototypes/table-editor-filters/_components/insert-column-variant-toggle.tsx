"use client";

import { PrototypeComponent, PrototypeVariantExplorer } from "proto-plugin";

import {
  buildInsertColumnDesignExplorationConfig,
  type InsertColumnVariant,
} from "./insert-column-design-exploration-config";
import { INSERT_COLUMN_LAYOUT_VARIANT_SET } from "./table-editor-filters-variant-sets";

type InsertColumnVariantToggleProps = {
  variant: InsertColumnVariant;
  onVariantChange: (next: InsertColumnVariant) => void;
  registerOnly?: boolean;
};

export function InsertColumnVariantToggle({
  variant,
  onVariantChange,
  registerOnly = false,
}: InsertColumnVariantToggleProps) {
  return (
    <PrototypeComponent
      id="insert-column-variant-toggle"
      className="relative z-30 shrink-0"
    >
      <PrototypeVariantExplorer
        {...buildInsertColumnDesignExplorationConfig(variant, onVariantChange)}
        variantSet={INSERT_COLUMN_LAYOUT_VARIANT_SET}
        mobbinGalleryId="insert-column-mobbin-inspiration-gallery"
        wrapRoot={false}
        registerOnly={registerOnly}
        hideInlinePreview={!registerOnly}
      />
    </PrototypeComponent>
  );
}
