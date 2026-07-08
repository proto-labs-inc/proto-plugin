"use client";

import { PrototypeComponent } from "proto-plugin";
import { PrototypeVariantExplorer } from "proto-plugin";

import { SHAPE_COLOR_PICKER_VARIANT_SET } from "./partner-variant-sets";
import {
  buildShapeColorPickerDesignExplorationConfig,
  type ShapeColorPickerVariant,
} from "./shape-color-picker-design-exploration-config";
import type { ShapeColorPickerSelection } from "./shape-color-picker-block";

type ShapeColorPickerVariantToggleProps = {
  variant: ShapeColorPickerVariant;
  onVariantChange: (next: ShapeColorPickerVariant) => void;
  selection: ShapeColorPickerSelection;
  onSelectionChange: (next: ShapeColorPickerSelection) => void;
  registerOnly?: boolean;
};

export function ShapeColorPickerVariantToggle({
  variant,
  onVariantChange,
  selection,
  onSelectionChange,
  registerOnly = false,
}: ShapeColorPickerVariantToggleProps) {
  return (
    <PrototypeComponent id="shape-color-picker-variant-toggle" className="shrink-0">
      <PrototypeVariantExplorer
        {...buildShapeColorPickerDesignExplorationConfig(
          variant,
          onVariantChange,
          selection,
          onSelectionChange,
        )}
        variantSet={SHAPE_COLOR_PICKER_VARIANT_SET}
        mobbinGalleryId="shape-color-picker-mobbin-inspiration-gallery"
        wrapRoot={false}
        registerOnly={registerOnly}
      />
    </PrototypeComponent>
  );
}
