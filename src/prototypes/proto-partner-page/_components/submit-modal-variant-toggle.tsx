"use client";

import { PrototypeComponent } from "proto-plugin";
import { PrototypeVariantExplorer } from "proto-plugin";

import { SUBMIT_MODAL_VARIANT_SET } from "./partner-variant-sets";
import type { ProtoShapeSelection } from "./proto-shape-customizer-block";
import {
  buildSubmitModalDesignExplorationConfig,
  type SubmitModalVariant,
} from "./submit-modal-design-exploration-config";

type SubmitModalVariantToggleProps = {
  variant: SubmitModalVariant;
  onVariantChange: (next: SubmitModalVariant) => void;
  selection: ProtoShapeSelection;
  registerOnly?: boolean;
};

export function SubmitModalVariantToggle({
  variant,
  onVariantChange,
  selection,
  registerOnly = false,
}: SubmitModalVariantToggleProps) {
  return (
    <PrototypeComponent id="submit-modal-variant-toggle" className="shrink-0">
      <PrototypeVariantExplorer
        {...buildSubmitModalDesignExplorationConfig(
          variant,
          onVariantChange,
          selection,
        )}
        variantSet={SUBMIT_MODAL_VARIANT_SET}
        mobbinGalleryId="submit-modal-mobbin-inspiration-gallery"
        wrapRoot={false}
        registerOnly={registerOnly}
      />
    </PrototypeComponent>
  );
}
