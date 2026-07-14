"use client";

import { DesignExplorationVariantPreviewShell } from "proto-plugin";
import type {
  DesignExplorationConfig,
  MobbinReference,
} from "proto-plugin";
import { buildDesignExplorationRenderers } from "proto-plugin";

import {
  ProtoShapeCustomizerBlock,
  type ProtoShapeSelection,
} from "./proto-shape-customizer-block";
import {
  DEFAULT_PROTO_COLOR_ID,
  DEFAULT_PROTO_SHAPE_ID,
  DEFAULT_PROTO_TEXTURE_ID,
  isOverlayProtoShapeCustomizerVariant,
  PROTO_SHAPE_CUSTOMIZER_CONTEXT,
  type ProtoShapeCustomizerVariant,
} from "./proto-shape-content";

export type { ProtoShapeCustomizerVariant };

const MOBBIN_REFERENCES: MobbinReference[] = [
  {
    id: "cec7c82f-1b3c-460f-a6ba-ba2489fa785c",
    appName: "WhatsApp",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/cec7c82f-1b3c-460f-a6ba-ba2489fa785c.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/cec7c82f-1b3c-460f-a6ba-ba2489fa785c",
    relevance:
      "Avatar editor with a segmented Shape / Color control — one panel visible at a time keeps the layout compact.",
    variantHint: "Segment tabs",
  },
  {
    id: "5345df64-f1a1-4305-bbae-efb0c5a76012",
    appName: "Snapchat",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/5345df64-f1a1-4305-bbae-efb0c5a76012.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/5345df64-f1a1-4305-bbae-efb0c5a76012",
    relevance:
      "Skin-tone tiles anchored in a bottom sheet — strong pattern for color selection over a live preview.",
    variantHint: "Bottom dock",
  },
  {
    id: "1d38806a-712e-4344-a504-40870769764f",
    appName: "Reddit",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/1d38806a-712e-4344-a504-40870769764f.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/1d38806a-712e-4344-a504-40870769764f",
    relevance:
      "Eye-color swatches in a tight horizontal row — good reference for a floating toolbar that toggles attribute type.",
    variantHint: "Floating toolbar",
  },
  {
    id: "f91fdc51-be1d-4e45-9882-36c03a3959e6",
    appName: "Flo",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/f91fdc51-be1d-4e45-9882-36c03a3959e6.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/f91fdc51-be1d-4e45-9882-36c03a3959e6",
    relevance:
      "Avatar gallery with shape tiles and color swatches both visible — no tab switch required.",
    variantHint: "Dual row",
  },
  {
    id: "4859c50f-1770-4866-9077-d2bb8b0d495d",
    appName: "Reddit",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/4859c50f-1770-4866-9077-d2bb8b0d495d.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/4859c50f-1770-4866-9077-d2bb8b0d495d",
    relevance:
      "Horizontal avatar carousel with labeled cards — maps well to scrolling through shape options.",
    variantHint: "Shape carousel",
  },
];

export const PROTO_SHAPES_VARIANT_OPTIONS: Array<{
  value: ProtoShapeCustomizerVariant;
  label: string;
  hint?: string;
}> = [
  {
    value: "compact-nudge-inline",
    label: "Compact inline",
    hint: "Compact shape and color rows at bottom",
  },
  {
    value: "compact-nudge-text-first",
    label: "Compact dual row",
    hint: "Smaller dual-row pickers in a tight bottom dock",
  },
  {
    value: "compact-link-nudge",
    label: "Compact link dock",
    hint: "Tight bottom picker dock under invite copy",
  },
  {
    value: "dual-row-reserved",
    label: "Dual row reserved",
    hint: "Dual rows with canvas inset to keep the shape visible",
  },
  {
    value: "dual-row-nudge-first",
    label: "Dual row padded",
    hint: "Dual rows in a padded bottom sheet",
  },
  {
    value: "dual-row-columns",
    label: "Dual row columns",
    hint: "Shape and color side by side in two columns",
  },
  {
    value: "dual-row-lifted-card",
    label: "Dual row lifted card",
    hint: "Floating card with dual rows",
  },
  {
    value: "segment-tabs",
    label: "Segment tabs",
    hint: "WhatsApp-style Shape | Color toggle",
  },
  {
    value: "bottom-dock",
    label: "Bottom dock",
    hint: "Fixed sheet over the canvas",
  },
  {
    value: "floating-toolbar",
    label: "Floating toolbar",
    hint: "Compact pill above safe area",
  },
  {
    value: "dual-row",
    label: "Dual row",
    hint: "Shape tiles + color swatches always visible",
  },
  {
    value: "shape-carousel",
    label: "Shape carousel",
    hint: "Scrollable shape cards with panel toggle",
  },
];

export const PROTO_SHAPES_BASELINE = {
  value: "compact-minimal-dock" as const satisfies ProtoShapeCustomizerVariant,
  hint: "Compact shape and color rows at bottom with bouncing preview",
};

export const DEFAULT_PROTO_SHAPES_VARIANT: ProtoShapeCustomizerVariant =
  "compact-minimal-dock";

const COMPONENT_ID_PREFIX = "proto-shapes-explorer";
const VARIANT_TABS_ID_PREFIX = "proto-shapes-variant-tabs";
const STORAGE_KEY_PREFIX = "proto-partner-page-proto-shapes";

export function buildProtoShapesDesignExplorationConfig(
  variant: ProtoShapeCustomizerVariant,
  onVariantChange: (next: ProtoShapeCustomizerVariant) => void,
  selection: ProtoShapeSelection,
  onSelectionChange: (next: ProtoShapeSelection) => void,
): DesignExplorationConfig<ProtoShapeCustomizerVariant> {
  const renderers = buildDesignExplorationRenderers<ProtoShapeCustomizerVariant>(
    PROTO_SHAPES_VARIANT_OPTIONS,
    (optionVariant) => (
      <DesignExplorationVariantPreviewShell
        layout={
          isOverlayProtoShapeCustomizerVariant(optionVariant)
            ? "overlay"
            : "inline"
        }
      >
        <ProtoShapeCustomizerBlock
          variant={optionVariant}
          selection={selection}
          onSelectionChange={onSelectionChange}
        />
      </DesignExplorationVariantPreviewShell>
    ),
    PROTO_SHAPES_BASELINE,
  );

  return {
    componentIdPrefix: COMPONENT_ID_PREFIX,
    variantTabsIdPrefix: VARIANT_TABS_ID_PREFIX,
    storageKeyPrefix: STORAGE_KEY_PREFIX,
    variant,
    onVariantChange,
    options: PROTO_SHAPES_VARIANT_OPTIONS,
    baseline: PROTO_SHAPES_BASELINE,
    defaultVariant: DEFAULT_PROTO_SHAPES_VARIANT,
    renderers,
    brief: {
      titleDefault: "Proto shape customization",
      descriptionDefault:
        "Experiment with ways to let partners switch between 5 shapes and 5 colors for their interactive proto shape — mobile-first controls that stay out of the canvas play area.",
    },
    context: {
      label: "Options",
      panelId: "proto-shapes",
      defaultExpanded: true,
      data: PROTO_SHAPE_CUSTOMIZER_CONTEXT,
      render: (data) => {
        const context = data as typeof PROTO_SHAPE_CUSTOMIZER_CONTEXT;
        return (
          <div className="flex flex-col gap-3 text-sm leading-relaxed">
            <p>
              <span className="text-foreground font-medium">Shapes</span>
              <br />
              <span className="text-muted-foreground">
                {context.shapes.map((shape) => shape.label).join(", ")}
              </span>
            </p>
            <p>
              <span className="text-foreground font-medium">Colors</span>
              <br />
              <span className="text-muted-foreground">
                {context.colors.map((color) => color.label).join(", ")}
              </span>
            </p>
            <p>
              <span className="text-foreground font-medium">Defaults</span>
              <br />
              <span className="text-muted-foreground">
                {context.defaultShape} / {context.defaultColor}
              </span>
            </p>
          </div>
        );
      },
    },
    variantsSection: {
      title: "Switcher patterns",
      description:
        "Each option explores a different way to toggle between shape and color pickers.",
    },
    mobbin: {
      references: MOBBIN_REFERENCES,
      title: "Mobbin references",
      imagePathForReference: (id) => `/prototypes/mobbin-references/${id}.webp`,
    },
    variantTabAriaLabel: "proto shape customizer",
    briefConfigFilePath:
      "src/prototypes/proto-partner-page/_components/proto-shapes-design-exploration-config.tsx",
  };
}

export function defaultProtoShapeSelection(): ProtoShapeSelection {
  return {
    shapeId: DEFAULT_PROTO_SHAPE_ID,
    colorId: DEFAULT_PROTO_COLOR_ID,
    textureId: DEFAULT_PROTO_TEXTURE_ID,
  };
}

export type { ProtoShapeSelection };
