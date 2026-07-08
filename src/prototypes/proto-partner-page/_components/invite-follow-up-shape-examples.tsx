"use client";

import { PrototypeComponent } from "proto-plugin";
import { cn } from "@/lib/cn";
import { useMemo, useSyncExternalStore } from "react";

import {
  HomePageShapesBackground,
  type MultiShapeSpringsCanvasConfig,
} from "../../home-page/_components/home-page-shapes-background";
import {
  getIsMobileViewport,
  subscribeToMobileViewport,
} from "../partner-shape-canvas";
import { INVITE_FOLLOW_UP_BEAT } from "./invite-animations-block";
import {
  DEFAULT_INVITE_FOLLOW_UP_SHAPE_LAYOUT_VARIANT,
  getInviteFollowUpShapeSlots,
  type InviteFollowUpShapeLayoutVariant,
} from "./invite-follow-up-shape-layout-content";

function useMobileViewport() {
  return useSyncExternalStore(
    subscribeToMobileViewport,
    getIsMobileViewport,
    () => false,
  );
}

/** Matches invite layout density in HomePageShapesBackground. */
const INVITE_LAYOUT_SHAPE_SCALE = 0.88;

const INVITE_FOLLOW_UP_SHAPES_BASE_CONFIG: Omit<
  MultiShapeSpringsCanvasConfig,
  "fixedSlots"
> = {
  shapeCount: 5,
  seed: 0,
  gridCols: 5,
  minRestFloorFactor: 0.12,
  maxRestFloorFactor: 0.995,
  minVisualScale: 1,
  maxVisualScale: 1.12,
  backgroundShapeScale: INVITE_LAYOUT_SHAPE_SCALE,
  colorMode: "proto-colors",
  physicsMode: "partner",
  entrancePopInPlace: true,
  /** Extra beat after the copy lands before the shapes start popping. */
  shapeEntranceDelay: 0.2,
  shapeEntranceStagger: INVITE_FOLLOW_UP_BEAT / 5,
};

type InviteFollowUpShapeExamplesProps = {
  layoutVariant?: InviteFollowUpShapeLayoutVariant;
  /** Forces a remount when the layout variant switches. */
  previewKey?: string;
  className?: string;
  dragAttributionLabel?: string;
};

export function InviteFollowUpShapeExamples({
  layoutVariant = DEFAULT_INVITE_FOLLOW_UP_SHAPE_LAYOUT_VARIANT,
  previewKey = layoutVariant,
  className,
  dragAttributionLabel,
}: InviteFollowUpShapeExamplesProps) {
  const isMobileViewport = useMobileViewport();
  const config = useMemo<MultiShapeSpringsCanvasConfig>(() => {
    const fixedSlots = getInviteFollowUpShapeSlots(layoutVariant, {
      mobile: isMobileViewport,
    });

    return {
      ...INVITE_FOLLOW_UP_SHAPES_BASE_CONFIG,
      shapeCount: fixedSlots.length,
      fixedSlots,
      shapeEntranceStagger: INVITE_FOLLOW_UP_BEAT / fixedSlots.length,
      dragAttributionLabel,
    };
  }, [dragAttributionLabel, isMobileViewport, layoutVariant]);

  return (
    <PrototypeComponent id="invite-follow-up-shape-examples">
      <HomePageShapesBackground
        config={config}
        previewKey={`${previewKey}-${isMobileViewport ? "mobile" : "desktop"}`}
        className={cn(
          "pointer-events-auto absolute inset-0 z-10 overflow-hidden bg-transparent",
          className,
        )}
        componentId="invite-follow-up-shape-examples"
        ariaLabel="Interactive proto shape examples"
      />
    </PrototypeComponent>
  );
}
