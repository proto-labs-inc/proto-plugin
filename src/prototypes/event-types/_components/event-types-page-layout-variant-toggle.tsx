"use client";

import { PrototypeComponent, PrototypeVariantExplorer } from "proto-plugin";

import {
  buildEventTypesPageLayoutDesignExplorationConfig,
  type EventTypesPageLayoutVariant,
} from "./event-types-page-layout-design-exploration-config";
import { EVENT_TYPES_PAGE_LAYOUT_VARIANT_SET } from "./event-types-variant-sets";

type EventTypesPageLayoutVariantToggleProps = {
  variant: EventTypesPageLayoutVariant;
  onVariantChange: (next: EventTypesPageLayoutVariant) => void;
  registerOnly?: boolean;
};

export function EventTypesPageLayoutVariantToggle({
  variant,
  onVariantChange,
  registerOnly = false,
}: EventTypesPageLayoutVariantToggleProps) {
  return (
    <PrototypeComponent
      id="event-types-page-layout-variant-toggle"
      className="relative z-30 shrink-0"
    >
      <PrototypeVariantExplorer
        {...buildEventTypesPageLayoutDesignExplorationConfig(variant, onVariantChange)}
        variantSet={EVENT_TYPES_PAGE_LAYOUT_VARIANT_SET}
        mobbinGalleryId="event-types-page-layout-mobbin-inspiration-gallery"
        wrapRoot={false}
        registerOnly={registerOnly}
        hideInlinePreview={!registerOnly}
      />
    </PrototypeComponent>
  );
}
