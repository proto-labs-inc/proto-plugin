"use client";

import { PrototypeComponent } from "proto-plugin";
import { PrototypeVariantExplorer } from "proto-plugin";

import {
  buildMobilePickerLayoutDesignExplorationConfig,
  type MobilePickerLayoutVariant,
} from "./mobile-picker-layout-design-exploration-config";
import { MOBILE_PICKER_LAYOUT_VARIANT_SET } from "./partner-variant-sets";
import type { ShapeColorPickerSelection } from "./shape-color-picker-block";

type MobilePickerLayoutVariantToggleProps = {
  variant: MobilePickerLayoutVariant;
  onVariantChange: (next: MobilePickerLayoutVariant) => void;
  selection: ShapeColorPickerSelection;
  onSelectionChange: (next: ShapeColorPickerSelection) => void;
  registerOnly?: boolean;
};

export function MobilePickerLayoutVariantToggle({
  variant,
  onVariantChange,
  selection,
  onSelectionChange,
  registerOnly = false,
}: MobilePickerLayoutVariantToggleProps) {
  return (
    <PrototypeComponent id="mobile-picker-layout-variant-toggle" className="shrink-0">
      <PrototypeVariantExplorer
        {...buildMobilePickerLayoutDesignExplorationConfig(
          variant,
          onVariantChange,
          selection,
          onSelectionChange,
        )}
        variantSet={MOBILE_PICKER_LAYOUT_VARIANT_SET}
        mobbinGalleryId="mobile-picker-layout-mobbin-inspiration-gallery"
        wrapRoot={false}
        registerOnly={registerOnly}
      />
    </PrototypeComponent>
  );
}
