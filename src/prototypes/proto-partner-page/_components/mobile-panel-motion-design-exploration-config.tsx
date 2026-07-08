"use client";

import { DesignExplorationVariantPreviewShell } from "proto-plugin";
import type {
  DesignExplorationConfig,
  MobbinReference,
} from "proto-plugin";
import { buildDesignExplorationRenderers } from "proto-plugin";

import { MobilePanelMotionBlock } from "./mobile-panel-motion-block";
import {
  DEFAULT_MOBILE_PANEL_MOTION_VARIANT,
  MOBILE_PANEL_MOTION_CONTEXT,
  type MobilePanelMotionVariant,
} from "./mobile-panel-motion-content";
import type { ShapeColorPickerSelection } from "./shape-color-picker-block";
import { defaultShapeColorPickerSelection } from "./shape-color-picker-design-exploration-config";

export type { MobilePanelMotionVariant };
export { DEFAULT_MOBILE_PANEL_MOTION_VARIANT };

const MOBBIN_REFERENCES: MobbinReference[] = [
  {
    id: "5345df64-f1a1-4305-bbae-efb0c5a76012",
    appName: "Snapchat",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/5345df64-f1a1-4305-bbae-efb0c5a76012.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/5345df64-f1a1-4305-bbae-efb0c5a76012",
    relevance:
      "Collapsed bar expands into a full picker sheet — reference for sliding the whole control surface up from the bottom.",
    variantHint: "Slide up",
  },
  {
    id: "4859c50f-1770-4866-9077-d2bb8b0d495d",
    appName: "Reddit",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/4859c50f-1770-4866-9077-d2bb8b0d495d.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/4859c50f-1770-4866-9077-d2bb8b0d495d",
    relevance:
      "Bottom sheet with spring settle — maps to an overshooting sheet entrance.",
    variantHint: "Spring sheet",
  },
  {
    id: "1d38806a-712e-4344-a504-40870769764f",
    appName: "Reddit",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/1d38806a-712e-4344-a504-40870769764f.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/1d38806a-712e-4344-a504-40870769764f",
    relevance:
      "Accordion rows expand sequentially — panel can land first, then inner controls follow.",
    variantHint: "Stagger inside",
  },
  {
    id: "f91fdc51-be1d-4e45-9882-36c03a3959e6",
    appName: "Flo",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/f91fdc51-be1d-4e45-9882-36c03a3959e6.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/f91fdc51-be1d-4e45-9882-36c03a3959e6",
    relevance:
      "Soft-focus modal content — blur clearing as the panel arrives.",
    variantHint: "Blur fade",
  },
  {
    id: "cec7c82f-1b3c-460f-a6ba-ba2489fa785c",
    appName: "WhatsApp",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/cec7c82f-1b3c-460f-a6ba-ba2489fa785c.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/cec7c82f-1b3c-460f-a6ba-ba2489fa785c",
    relevance:
      "Attachment tray scales up from the bottom edge — scale-reveal from a bottom anchor.",
    variantHint: "Scale reveal",
  },
];

export const MOBILE_PANEL_MOTION_VARIANT_OPTIONS: Array<{
  value: MobilePanelMotionVariant;
  label: string;
  hint?: string;
}> = [
  {
    value: "spring-sheet-whole-panel",
    label: "Spring sheet whole panel",
    hint: "Spring overshoot — grey dock, divider line, and controls slide up together as one unit",
  },
  {
    value: "slide-up",
    label: "Slide up",
    hint: "The whole bottom panel and all picker controls translate up together from off-screen",
  },
  {
    value: "spring-sheet",
    label: "Spring sheet",
    hint: "Sheet-style slide with a slight spring overshoot at the end",
  },
  {
    value: "stagger-inside",
    label: "Stagger inside",
    hint: "Panel rises first; picker contents fade up after the shell lands",
  },
  {
    value: "blur-fade",
    label: "Blur fade",
    hint: "Panel drifts up while blur clears — soft, low-contrast entrance",
  },
  {
    value: "scale-reveal",
    label: "Scale reveal",
    hint: "Panel scales from the bottom edge while sliding into place",
  },
  {
    value: "curtain-expand",
    label: "Curtain expand",
    hint: "Height reveals from the bottom like a curtain rising over the controls",
  },
];

export const MOBILE_PANEL_MOTION_BASELINE = {
  value: "none" as const satisfies MobilePanelMotionVariant,
  label: "Static",
  hint: "Bottom panel before motion exploration — no panel entrance animation",
};

const COMPONENT_ID_PREFIX = "mobile-panel-motion-explorer";
const VARIANT_TABS_ID_PREFIX = "mobile-panel-motion-variant-tabs";
const STORAGE_KEY_PREFIX = "proto-partner-page-mobile-panel-motion";

export function buildMobilePanelMotionDesignExplorationConfig(
  variant: MobilePanelMotionVariant,
  onVariantChange: (next: MobilePanelMotionVariant) => void,
  selection: ShapeColorPickerSelection,
  onSelectionChange: (next: ShapeColorPickerSelection) => void,
): DesignExplorationConfig<MobilePanelMotionVariant> {
  const renderers = buildDesignExplorationRenderers<MobilePanelMotionVariant>(
    MOBILE_PANEL_MOTION_VARIANT_OPTIONS,
    (optionVariant) => (
      <DesignExplorationVariantPreviewShell layout="overlay">
        <MobilePanelMotionBlock
          variant={optionVariant}
          selection={selection}
          onSelectionChange={onSelectionChange}
          replayKey={optionVariant}
        />
      </DesignExplorationVariantPreviewShell>
    ),
    MOBILE_PANEL_MOTION_BASELINE,
  );

  return {
    componentIdPrefix: COMPONENT_ID_PREFIX,
    variantTabsIdPrefix: VARIANT_TABS_ID_PREFIX,
    storageKeyPrefix: STORAGE_KEY_PREFIX,
    variant,
    onVariantChange,
    options: MOBILE_PANEL_MOTION_VARIANT_OPTIONS,
    baseline: MOBILE_PANEL_MOTION_BASELINE,
    defaultVariant: DEFAULT_MOBILE_PANEL_MOTION_VARIANT,
    renderers,
    brief: {
      titleDefault: "Mobile panel motion",
      descriptionDefault:
        "How can we animate the bottom panel controls on mobile? Give one example where we're just sliding it and all its contents up from the bottom, but other ideas too.",
    },
    context: {
      label: "Context",
      panelId: "mobile-panel-motion",
      defaultExpanded: true,
      data: MOBILE_PANEL_MOTION_CONTEXT,
      render: (data) => {
        const context = data as typeof MOBILE_PANEL_MOTION_CONTEXT;
        return (
          <div className="flex flex-col gap-3 text-sm leading-relaxed">
            <p>
              <span className="text-foreground font-medium">Trigger</span>
              <br />
              <span className="text-muted-foreground">{context.trigger}</span>
            </p>
            <p>
              <span className="text-foreground font-medium">Panel</span>
              <br />
              <span className="text-muted-foreground">{context.panel}</span>
            </p>
            <p>
              <span className="text-foreground font-medium">Note</span>
              <br />
              <span className="text-muted-foreground">{context.note}</span>
            </p>
          </div>
        );
      },
    },
    variantsSection: {
      title: "Panel entrance directions",
      description:
        "Each option replays on select. Motion applies on the live customize page on mobile and desktop.",
    },
    mobbin: {
      references: MOBBIN_REFERENCES,
      title: "Mobbin references",
      imagePathForReference: (id) => `/prototypes/mobbin-references/${id}.webp`,
    },
    variantTabAriaLabel: "mobile panel motion",
    briefConfigFilePath:
      "src/prototypes/proto-partner-page/_components/mobile-panel-motion-design-exploration-config.tsx",
  };
}

export function defaultMobilePanelMotionSelection(): ShapeColorPickerSelection {
  return defaultShapeColorPickerSelection();
}

export type { ShapeColorPickerSelection };
