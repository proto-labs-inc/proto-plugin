"use client";

import { PrototypeComponent } from "proto";

import { HomePageShapesBackground } from "./home-page-shapes-background";
import type { ShapeColorsVariant } from "./shape-colors-content";

type ShapeColorsPreviewBlockProps = {
  variant: ShapeColorsVariant;
};

export function ShapeColorsPreviewBlock({
  variant,
}: ShapeColorsPreviewBlockProps) {
  return (
    <PrototypeComponent
      id="shape-colors-preview-block"
      className="relative h-full min-h-[360px] w-full overflow-hidden bg-white"
    >
      <HomePageShapesBackground colorScheme={variant} previewKey={variant} />
    </PrototypeComponent>
  );
}
