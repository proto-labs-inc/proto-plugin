"use client";

import { PrototypeComponent } from "proto-plugin";
import { PrototypeVariantExplorer } from "proto-plugin";

import {
  buildMobilePanelMotionDesignExplorationConfig,
  type MobilePanelMotionVariant,
} from "./mobile-panel-motion-design-exploration-config";
import { MOBILE_PANEL_MOTION_VARIANT_SET } from "./partner-variant-sets";
import type { ShapeColorPickerSelection } from "./shape-color-picker-block";

type MobilePanelMotionVariantToggleProps = {
  variant: MobilePanelMotionVariant;
  onVariantChange: (next: MobilePanelMotionVariant) => void;
  selection: ShapeColorPickerSelection;
  onSelectionChange: (next: ShapeColorPickerSelection) => void;
  registerOnly?: boolean;
};

export function MobilePanelMotionVariantToggle({
  variant,
  onVariantChange,
  selection,
  onSelectionChange,
  registerOnly = false,
}: MobilePanelMotionVariantToggleProps) {
  return (
    <PrototypeComponent id="mobile-panel-motion-variant-toggle" className="shrink-0">
      <PrototypeVariantExplorer
        {...buildMobilePanelMotionDesignExplorationConfig(
          variant,
          onVariantChange,
          selection,
          onSelectionChange,
        )}
        variantSet={MOBILE_PANEL_MOTION_VARIANT_SET}
        mobbinGalleryId="mobile-panel-motion-mobbin-inspiration-gallery"
        wrapRoot={false}
        registerOnly={registerOnly}
      />
    </PrototypeComponent>
  );
}
