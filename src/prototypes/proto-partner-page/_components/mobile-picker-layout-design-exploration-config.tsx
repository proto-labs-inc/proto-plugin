"use client";

import { DesignExplorationVariantPreviewShell } from "proto-plugin";
import type {
  DesignExplorationConfig,
  MobbinReference,
} from "proto-plugin";
import { buildDesignExplorationRenderers } from "proto-plugin";

import {
  MobilePickerLayoutBlock,
} from "./mobile-picker-layout-block";
import type { ShapeColorPickerSelection } from "./shape-color-picker-block";
import {
  DEFAULT_MOBILE_PICKER_LAYOUT_VARIANT,
  MOBILE_PICKER_LAYOUT_CONTEXT,
  type MobilePickerLayoutVariant,
} from "./mobile-picker-layout-content";
import { defaultShapeColorPickerSelection } from "./shape-color-picker-design-exploration-config";

export type { MobilePickerLayoutVariant };
export { DEFAULT_MOBILE_PICKER_LAYOUT_VARIANT };

const MOBBIN_REFERENCES: MobbinReference[] = [
  {
    id: "cec7c82f-1b3c-460f-a6ba-ba2489fa785c",
    appName: "WhatsApp",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/cec7c82f-1b3c-460f-a6ba-ba2489fa785c.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/cec7c82f-1b3c-460f-a6ba-ba2489fa785c",
    relevance:
      "Three-way segmented control switches attribute panels — one row of options visible at a time on a narrow screen.",
    variantHint: "Three-way tabs",
  },
  {
    id: "5345df64-f1a1-4305-bbae-efb0c5a76012",
    appName: "Snapchat",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/5345df64-f1a1-4305-bbae-efb0c5a76012.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/5345df64-f1a1-4305-bbae-efb0c5a76012",
    relevance:
      "Collapsed skin-tone bar expands into a full picker sheet — peek summary before committing vertical space.",
    variantHint: "Peek bar",
  },
  {
    id: "4859c50f-1770-4866-9077-d2bb8b0d495d",
    appName: "Reddit",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/4859c50f-1770-4866-9077-d2bb8b0d495d.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/4859c50f-1770-4866-9077-d2bb8b0d495d",
    relevance:
      "Horizontal avatar carousel with dot pagination — maps to swiping between shape, color, and texture panels.",
    variantHint: "Swipe dots",
  },
  {
    id: "f91fdc51-be1d-4e45-9882-36c03a3959e6",
    appName: "Flo",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/f91fdc51-be1d-4e45-9882-36c03a3959e6.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/f91fdc51-be1d-4e45-9882-36c03a3959e6",
    relevance:
      "Icon rail beside a content panel — compact vertical nav for switching picker categories.",
    variantHint: "Icon rail",
  },
  {
    id: "1d38806a-712e-4344-a504-40870769764f",
    appName: "Reddit",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/1d38806a-712e-4344-a504-40870769764f.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/1d38806a-712e-4344-a504-40870769764f",
    relevance:
      "Accordion-style settings rows collapse to a single-line summary — saves height until the user expands a section.",
    variantHint: "Accordion",
  },
];

export const MOBILE_PICKER_LAYOUT_VARIANT_OPTIONS: Array<{
  value: MobilePickerLayoutVariant;
  label: string;
  hint?: string;
}> = [
  {
    value: "sliding-grey-tabs",
    label: "Sliding grey tabs",
    hint: "Light grey rounded track — white thumb slides between Shape, Color, and Texture",
  },
  {
    value: "scrubber-pills",
    label: "Scrubber pills",
    hint: "Scrollable pill labels scrub between shape, color, and texture",
  },
  {
    value: "step-wizard",
    label: "Step wizard",
    hint: "Progress bar with Back / Next through each picker type",
  },
  {
    value: "swipe-dots",
    label: "Swipe dots",
    hint: "Dot pagination with chevrons between picker panels",
  },
  {
    value: "peek-bar",
    label: "Peek bar",
    hint: "Collapsed summary row expands into tabbed pickers",
  },
  {
    value: "accordion",
    label: "Accordion",
    hint: "Expand one section at a time; collapsed rows show current selection",
  },
  {
    value: "icon-rail",
    label: "Icon rail",
    hint: "Vertical icon nav beside a single active picker panel",
  },
  {
    value: "three-way-tabs",
    label: "Three-way tabs",
    hint: "Segmented Shape | Color | Texture — one row visible at a time",
  },
];

export const MOBILE_PICKER_LAYOUT_BASELINE = {
  value: "stacked-rows" as const satisfies MobilePickerLayoutVariant,
  hint: "All three labeled picker rows visible at once",
};

const COMPONENT_ID_PREFIX = "mobile-picker-layout-explorer";
const VARIANT_TABS_ID_PREFIX = "mobile-picker-layout-variant-tabs";
const STORAGE_KEY_PREFIX = "proto-partner-page-mobile-picker-layout";

export function buildMobilePickerLayoutDesignExplorationConfig(
  variant: MobilePickerLayoutVariant,
  onVariantChange: (next: MobilePickerLayoutVariant) => void,
  selection: ShapeColorPickerSelection,
  onSelectionChange: (next: ShapeColorPickerSelection) => void,
): DesignExplorationConfig<MobilePickerLayoutVariant> {
  const renderers = buildDesignExplorationRenderers<MobilePickerLayoutVariant>(
    MOBILE_PICKER_LAYOUT_VARIANT_OPTIONS,
    (optionVariant) => (
      <DesignExplorationVariantPreviewShell layout="overlay">
        <MobilePickerLayoutBlock
          variant={optionVariant}
          selection={selection}
          onSelectionChange={onSelectionChange}
        />
      </DesignExplorationVariantPreviewShell>
    ),
    MOBILE_PICKER_LAYOUT_BASELINE,
  );

  return {
    componentIdPrefix: COMPONENT_ID_PREFIX,
    variantTabsIdPrefix: VARIANT_TABS_ID_PREFIX,
    storageKeyPrefix: STORAGE_KEY_PREFIX,
    variant,
    onVariantChange,
    options: MOBILE_PICKER_LAYOUT_VARIANT_OPTIONS,
    baseline: MOBILE_PICKER_LAYOUT_BASELINE,
    defaultVariant: DEFAULT_MOBILE_PICKER_LAYOUT_VARIANT,
    renderers,
    brief: {
      titleDefault: "Mobile picker layout",
      descriptionDefault:
        "On mobile, what are different ways we can show all of the pickers without taking up a lot of space? This can include toggling between picker types. Be creative!",
    },
    context: {
      label: "Options",
      panelId: "mobile-picker-layout",
      defaultExpanded: true,
      data: MOBILE_PICKER_LAYOUT_CONTEXT,
      render: (data) => {
        const context = data as typeof MOBILE_PICKER_LAYOUT_CONTEXT;
        return (
          <div className="flex flex-col gap-3 text-sm leading-relaxed">
            <p>
              <span className="text-foreground font-medium">Picker types</span>
              <br />
              <span className="text-muted-foreground">
                Shape (5), Color (5), Texture (6)
              </span>
            </p>
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
          </div>
        );
      },
    },
    variantsSection: {
      title: "Compact mobile patterns",
      description:
        "Each option keeps the same tile pickers but changes how shape, color, and texture are revealed on a narrow viewport.",
    },
    mobbin: {
      references: MOBBIN_REFERENCES,
      title: "Mobbin references",
      imagePathForReference: (id) => `/prototypes/mobbin-references/${id}.webp`,
    },
    variantTabAriaLabel: "mobile picker layout",
    briefConfigFilePath:
      "src/prototypes/proto-partner-page/_components/mobile-picker-layout-design-exploration-config.tsx",
  };
}

export function defaultMobilePickerLayoutSelection(): ShapeColorPickerSelection {
  return defaultShapeColorPickerSelection();
}

export type { ShapeColorPickerSelection };
