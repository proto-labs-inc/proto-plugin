"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { PrototypeVariantExplorer } from "@prototype/components/prototypes/prototype-variant-explorer";

import { SHAPE_COLORS_VARIANT_SET } from "./home-page-variant-sets";
import {
  buildShapeColorsDesignExplorationConfig,
  type ShapeColorsVariant,
} from "./shape-colors-design-exploration-config";

type ShapeColorsVariantToggleProps = {
  variant: ShapeColorsVariant;
  onVariantChange: (next: ShapeColorsVariant) => void;
  registerOnly?: boolean;
};

export function ShapeColorsVariantToggle({
  variant,
  onVariantChange,
  registerOnly = false,
}: ShapeColorsVariantToggleProps) {
  return (
    <PrototypeComponent
      id="shape-colors-variant-toggle"
      className="relative z-30 shrink-0"
    >
      <PrototypeVariantExplorer
        {...buildShapeColorsDesignExplorationConfig(variant, onVariantChange)}
        variantSet={SHAPE_COLORS_VARIANT_SET}
        mobbinGalleryId="shape-colors-mobbin-inspiration-gallery"
        wrapRoot={false}
        registerOnly={registerOnly}
        hideInlinePreview={!registerOnly}
      />
    </PrototypeComponent>
  );
}
