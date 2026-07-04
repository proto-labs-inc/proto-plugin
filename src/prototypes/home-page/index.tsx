"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { usePrototypeComments } from "@prototype/lib/prototypes/use-prototype-comments";
import { useCallback, useState } from "react";

import { HomePageCopyBlock } from "./_components/home-page-copy-block";
import { HomePageShapesBackground } from "./_components/home-page-shapes-background";
import { useRegisterHomeVariantSets } from "./_components/home-page-variant-sets";
import {
  DEFAULT_SHAPE_COLORS_VARIANT,
  type ShapeColorsVariant,
} from "./_components/shape-colors-design-exploration-config";
import { ShapeColorsVariantToggle } from "./_components/shape-colors-variant-toggle";

type LiveState = Record<string, never>;

export default function HomePage() {
  const liveState: LiveState = {};
  const [shapeColorsVariant, setShapeColorsVariant] =
    useState<ShapeColorsVariant>(DEFAULT_SHAPE_COLORS_VARIANT);

  const onRestore = useCallback((_restored: LiveState) => {}, []);

  usePrototypeComments(liveState, onRestore);
  useRegisterHomeVariantSets();

  return (
    <PrototypeComponent
      id="scroll-container"
      className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white"
    >
      <div className="sr-only" aria-hidden>
        <ShapeColorsVariantToggle
          variant={shapeColorsVariant}
          onVariantChange={setShapeColorsVariant}
          registerOnly
        />
      </div>
      <PrototypeComponent
        id="page"
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white"
      >
        <HomePageShapesBackground colorScheme={shapeColorsVariant} />
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-center [&_*]:pointer-events-none [&_a]:pointer-events-auto">
          <HomePageCopyBlock />
        </div>
        <div className="absolute inset-x-0 bottom-0 z-30 p-3">
          <ShapeColorsVariantToggle
            variant={shapeColorsVariant}
            onVariantChange={setShapeColorsVariant}
          />
        </div>
      </PrototypeComponent>
    </PrototypeComponent>
  );
}
