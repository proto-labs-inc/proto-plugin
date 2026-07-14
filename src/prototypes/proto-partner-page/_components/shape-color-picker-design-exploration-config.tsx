"use client";

import { DesignExplorationVariantPreviewShell } from "proto-plugin";
import type {
  DesignExplorationConfig,
  MobbinReference,
} from "proto-plugin";
import { buildDesignExplorationRenderers } from "proto-plugin";

import type { ProtoShapeSelection } from "./proto-shape-customizer-block";
import {
  DEFAULT_PROTO_COLOR_ID,
  DEFAULT_PROTO_SHAPE_ID,
  DEFAULT_PROTO_TEXTURE_ID,
} from "./proto-shape-content";
import {
  ShapeColorPickerBlock,
  type ShapeColorPickerSelection,
} from "./shape-color-picker-block";
import {
  DEFAULT_SHAPE_COLOR_PICKER_VARIANT,
  SHAPE_COLOR_PICKER_CONTEXT,
  type ShapeColorPickerVariant,
} from "./shape-color-picker-content";

export type { ShapeColorPickerVariant };
export { DEFAULT_SHAPE_COLOR_PICKER_VARIANT };

const MOBBIN_REFERENCES: MobbinReference[] = [
  {
    id: "cec7c82f-1b3c-460f-a6ba-ba2489fa785c",
    appName: "WhatsApp",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/cec7c82f-1b3c-460f-a6ba-ba2489fa785c.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/cec7c82f-1b3c-460f-a6ba-ba2489fa785c",
    relevance:
      "Icon-only segmented bar for switching attribute types — maps directly to a connected shape icon track.",
    variantHint: "Segmented icons",
  },
  {
    id: "f91fdc51-be1d-4e45-9882-36c03a3959e6",
    appName: "Flo",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/f91fdc51-be1d-4e45-9882-36c03a3959e6.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/f91fdc51-be1d-4e45-9882-36c03a3959e6",
    relevance:
      "Soft tonal color circles with shape tiles in a gallery — reference for elevated, borderless swatches.",
    variantHint: "Material tonal",
  },
  {
    id: "4859c50f-1770-4866-9077-d2bb8b0d495d",
    appName: "Reddit",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/4859c50f-1770-4866-9077-d2bb8b0d495d.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/4859c50f-1770-4866-9077-d2bb8b0d495d",
    relevance:
      "Horizontal avatar carousel with labeled cards — maps to combo preview tiles that show shape in each color.",
    variantHint: "Combo mini",
  },
  {
    id: "5345df64-f1a1-4305-bbae-efb0c5a76012",
    appName: "Snapchat",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/5345df64-f1a1-4305-bbae-efb0c5a76012.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/5345df64-f1a1-4305-bbae-efb0c5a76012",
    relevance:
      "Skin-tone tiles with filled selection states — each option reads as a solid chip, not an outline.",
    variantHint: "Filled silhouette",
  },
  {
    id: "1d38806a-712e-4344-a504-40870769764f",
    appName: "Reddit",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/1d38806a-712e-4344-a504-40870769764f.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/1d38806a-712e-4344-a504-40870769764f",
    relevance:
      "Horizontal swatch row with minimal chrome — selection via ring only, no container boxes.",
    variantHint: "Minimal underline",
  },
];

export const SHAPE_COLOR_PICKER_VARIANT_OPTIONS: Array<{
  value: ShapeColorPickerVariant;
  label: string;
  hint?: string;
}> = [
  {
    value: "ring-gradient",
    label: "Ring gradient",
    hint: "Gradient ring highlight on selected shape and color",
  },
  {
    value: "list-radio",
    label: "List radio",
    hint: "Vertical list rows with radio indicators",
  },
  {
    value: "stamp-outlined",
    label: "Stamp outlined",
    hint: "Square stamp tiles and square color chips",
  },
  {
    value: "neon-glow",
    label: "Neon glow",
    hint: "Dark strip with colored glow halos on selection",
  },
  {
    value: "minimal-underline",
    label: "Minimal underline",
    hint: "Icon-only shapes and swatches with underline dot",
  },
  {
    value: "material-tonal",
    label: "Material tonal",
    hint: "Soft elevated circles and rounded shape tiles",
  },
  {
    value: "combo-mini",
    label: "Combo mini",
    hint: "Each color swatch previews the shape filled in that color",
  },
  {
    value: "pill-labels",
    label: "Pill labels",
    hint: "Text pill chips for shapes, labeled swatches for colors",
  },
  {
    value: "segmented-icons",
    label: "Segmented icons",
    hint: "Connected segmented bar of shape icons",
  },
  {
    value: "filled-silhouette",
    label: "Filled silhouette",
    hint: "Active shape in full color, muted outlines otherwise",
  },
];

export const SHAPE_COLOR_PICKER_BASELINE = {
  value: "labeled-tiles" as const satisfies ShapeColorPickerVariant,
  hint: "Labeled rows with tile buttons and ring swatches",
};

const COMPONENT_ID_PREFIX = "shape-color-picker-explorer";
const VARIANT_TABS_ID_PREFIX = "shape-color-picker-variant-tabs";
const STORAGE_KEY_PREFIX = "proto-partner-page-shape-color-picker";

export function buildShapeColorPickerDesignExplorationConfig(
  variant: ShapeColorPickerVariant,
  onVariantChange: (next: ShapeColorPickerVariant) => void,
  selection: ShapeColorPickerSelection,
  onSelectionChange: (next: ShapeColorPickerSelection) => void,
): DesignExplorationConfig<ShapeColorPickerVariant> {
  const renderers = buildDesignExplorationRenderers<ShapeColorPickerVariant>(
    SHAPE_COLOR_PICKER_VARIANT_OPTIONS,
    (optionVariant) => (
      <DesignExplorationVariantPreviewShell layout="overlay">
        <ShapeColorPickerBlock
          variant={optionVariant}
          selection={selection}
          onSelectionChange={onSelectionChange}
        />
      </DesignExplorationVariantPreviewShell>
    ),
    SHAPE_COLOR_PICKER_BASELINE,
  );

  return {
    componentIdPrefix: COMPONENT_ID_PREFIX,
    variantTabsIdPrefix: VARIANT_TABS_ID_PREFIX,
    storageKeyPrefix: STORAGE_KEY_PREFIX,
    variant,
    onVariantChange,
    options: SHAPE_COLOR_PICKER_VARIANT_OPTIONS,
    baseline: SHAPE_COLOR_PICKER_BASELINE,
    defaultVariant: DEFAULT_SHAPE_COLOR_PICKER_VARIANT,
    renderers,
    brief: {
      titleDefault: "Shape & color picker",
      descriptionDefault:
        "Explore diverse ways to present the five proto shapes, five brand colors, and six canvas textures — tile grids, segmented bars, filled silhouettes, neon glow, list radios, and more.",
    },
    context: {
      label: "Options",
      panelId: "shape-color-picker",
      defaultExpanded: true,
      data: SHAPE_COLOR_PICKER_CONTEXT,
      render: (data) => {
        const context = data as typeof SHAPE_COLOR_PICKER_CONTEXT;
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
              <span className="text-foreground font-medium">Textures</span>
              <br />
              <span className="text-muted-foreground">
                {context.textures.map((texture) => texture.label).join(", ")}
              </span>
            </p>
            <p>
              <span className="text-foreground font-medium">Defaults</span>
              <br />
              <span className="text-muted-foreground">
                {context.defaultShape} / {context.defaultColor} /{" "}
                {context.defaultTexture}
              </span>
            </p>
          </div>
        );
      },
    },
    variantsSection: {
      title: "Picker styles",
      description:
        "Each option keeps the same compact dock placement but changes how shape, color, and texture controls look and feel.",
    },
    mobbin: {
      references: MOBBIN_REFERENCES,
      title: "Mobbin references",
      imagePathForReference: (id) => `/prototypes/mobbin-references/${id}.webp`,
    },
    variantTabAriaLabel: "shape and color picker",
    briefConfigFilePath:
      "src/prototypes/proto-partner-page/_components/shape-color-picker-design-exploration-config.tsx",
  };
}

export function defaultShapeColorPickerSelection(): ShapeColorPickerSelection {
  return {
    shapeId: DEFAULT_PROTO_SHAPE_ID,
    colorId: DEFAULT_PROTO_COLOR_ID,
    textureId: DEFAULT_PROTO_TEXTURE_ID,
  };
}

export type { ShapeColorPickerSelection, ProtoShapeSelection };
