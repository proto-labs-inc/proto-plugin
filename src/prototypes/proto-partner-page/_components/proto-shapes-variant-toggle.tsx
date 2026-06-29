"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { PrototypeVariantExplorer } from "@prototype/components/prototypes/prototype-variant-explorer";

import {
  buildProtoShapesDesignExplorationConfig,
  type ProtoShapeCustomizerVariant,
} from "./proto-shapes-design-exploration-config";
import type { ProtoShapeSelection } from "./proto-shape-customizer-block";
import { PROTO_SHAPES_VARIANT_SET } from "./partner-variant-sets";

type ProtoShapesVariantToggleProps = {
  variant: ProtoShapeCustomizerVariant;
  onVariantChange: (next: ProtoShapeCustomizerVariant) => void;
  selection: ProtoShapeSelection;
  onSelectionChange: (next: ProtoShapeSelection) => void;
  registerOnly?: boolean;
};

export function ProtoShapesVariantToggle({
  variant,
  onVariantChange,
  selection,
  onSelectionChange,
  registerOnly = false,
}: ProtoShapesVariantToggleProps) {
  return (
    <PrototypeComponent id="proto-shapes-variant-toggle" className="shrink-0">
      <PrototypeVariantExplorer
        {...buildProtoShapesDesignExplorationConfig(
          variant,
          onVariantChange,
          selection,
          onSelectionChange,
        )}
        variantSet={PROTO_SHAPES_VARIANT_SET}
        mobbinGalleryId="protoshapes-mobbin-inspiration-gallery"
        wrapRoot={false}
        registerOnly={registerOnly}
      />
    </PrototypeComponent>
  );
}
