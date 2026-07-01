"use client";

import { DesignExplorationVariantPreviewShell } from "@prototype/components/prototypes/design-exploration-variant-preview-shell";
import type {
  DesignExplorationConfig,
  MobbinReference,
} from "@prototype/lib/prototypes/design-exploration-types";
import { buildDesignExplorationRenderers } from "@prototype/lib/prototypes/build-design-exploration-renderers";
import type { ReactNode } from "react";

import { ShapeColorsPreviewBlock } from "./shape-colors-preview-block";
import {
  SHAPE_COLORS_BASELINE_SCHEME,
  SHAPE_COLORS_CONTEXT,
  type ShapeColorsVariant,
} from "./shape-colors-content";

export type { ShapeColorsVariant };

const MOBBIN_REFERENCES: MobbinReference[] = [
  {
    id: "5345df64-f1a1-4305-bbae-efb0c5a76012",
    appName: "Snapchat",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/5345df64-f1a1-4305-bbae-efb0c5a76012.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/5345df64-f1a1-4305-bbae-efb0c5a76012",
    relevance:
      "Skin-tone tiles with filled selection states — each swatch reads as a solid, desaturated chip rather than a neon outline.",
    variantHint: "Muted jewel",
  },
  {
    id: "3161e1d3-1dfa-4002-b02c-d3130126b465",
    appName: "Linear",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/3161e1d3-1dfa-4002-b02c-d3130126b465.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/3161e1d3-1dfa-4002-b02c-d3130126b465",
    relevance:
      "Dark, editorial landing with subtle glow accents — reference for ink-slate tones that feel professional, not playful.",
    variantHint: "Ink slate",
  },
  {
    id: "46c08d7e-0d27-4f0a-b763-e2fe41b9b862",
    appName: "Stripe",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/46c08d7e-0d27-4f0a-b763-e2fe41b9b862.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/46c08d7e-0d27-4f0a-b763-e2fe41b9b862",
    relevance:
      "Gradient mesh with multiple hues at controlled saturation — maps to a richer but still grown-up multi-color field.",
    variantHint: "Muted jewel",
  },
  {
    id: "f91fdc51-be1d-4e45-9882-36c03a3959e6",
    appName: "Flo",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/f91fdc51-be1d-4e45-9882-36c03a3959e6.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/f91fdc51-be1d-4e45-9882-36c03a3959e6",
    relevance:
      "Soft tonal swatches with elevated, borderless color chips — reference for misty pastels that stay sophisticated.",
    variantHint: "Soft mist",
  },
  {
    id: "8a3d75a1-b322-4adb-8cfc-bbbdee2104fa",
    appName: "Figma",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/8a3d75a1-b322-4adb-8cfc-bbbdee2104fa.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/8a3d75a1-b322-4adb-8cfc-bbbdee2104fa",
    relevance:
      "Homepage hero with warm organic accents on neutral ground — maps to earth-clay tones with natural texture.",
    variantHint: "Earth clay",
  },
];

export const SHAPE_COLORS_VARIANT_OPTIONS: Array<{
  value: ShapeColorsVariant;
  label: string;
  hint?: string;
}> = [
  {
    value: "electric-pop",
    label: "Electric pop",
    hint: "Full-saturation neon — spring green, electric violet, azure, hot magenta, laser yellow",
  },
  {
    value: "tropical-punch",
    label: "Tropical punch",
    hint: "Juicy vivid hues — jade, orchid, turquoise, coral, mango",
  },
  {
    value: "hyper-citrus",
    label: "Hyper citrus",
    hint: "High-energy acid brights — lime, ultraviolet, aqua, watermelon, zest",
  },
  {
    value: "ultra-jewel",
    label: "Ultra jewel",
    hint: "Luminous saturated gemstones — emerald, amethyst, sapphire, ruby, citrine",
  },
  {
    value: "muted-jewel",
    label: "Muted jewel",
    hint: "Desaturated gem tones — sage, dusty plum, petrol, rouge dust, brass",
  },
  {
    value: "earth-clay",
    label: "Earth clay",
    hint: "Warm organic palette — olive, clay mauve, terracotta, ochre",
  },
  {
    value: "ink-slate",
    label: "Ink slate",
    hint: "Cool professional tones — slate green, ink indigo, steel, pewter gold",
  },
  {
    value: "editorial-pop",
    label: "Editorial pop",
    hint: "Rich controlled accents — emerald, royal, deep cyan, crimson, burnt amber",
  },
  {
    value: "soft-mist",
    label: "Soft mist",
    hint: "Foggy pastels with grey undertones — mist sage, lavender fog, powder blue",
  },
];

export const SHAPE_COLORS_BASELINE = {
  value: SHAPE_COLORS_BASELINE_SCHEME,
  label: "Neon bright",
  hint: "Original proto-shapes palette before color exploration",
};

export const DEFAULT_SHAPE_COLORS_VARIANT: ShapeColorsVariant =
  SHAPE_COLORS_VARIANT_OPTIONS[0].value;

const COMPONENT_ID_PREFIX = "shape-colors-explorer";
const VARIANT_TABS_ID_PREFIX = "shape-colors-variant-tabs";
const STORAGE_KEY_PREFIX = "home-page-shape-colors";

const renderers = buildDesignExplorationRenderers<ShapeColorsVariant>(
  SHAPE_COLORS_VARIANT_OPTIONS,
  (variant) => (
    <DesignExplorationVariantPreviewShell layout="overlay">
      <ShapeColorsPreviewBlock variant={variant} />
    </DesignExplorationVariantPreviewShell>
  ),
  SHAPE_COLORS_BASELINE,
);

export function buildShapeColorsDesignExplorationConfig(
  variant: ShapeColorsVariant,
  onVariantChange: (next: ShapeColorsVariant) => void,
): DesignExplorationConfig<ShapeColorsVariant> {
  return {
    componentIdPrefix: COMPONENT_ID_PREFIX,
    variantTabsIdPrefix: VARIANT_TABS_ID_PREFIX,
    storageKeyPrefix: STORAGE_KEY_PREFIX,
    variant,
    onVariantChange,
    options: SHAPE_COLORS_VARIANT_OPTIONS,
    baseline: SHAPE_COLORS_BASELINE,
    defaultVariant: DEFAULT_SHAPE_COLORS_VARIANT,
    renderers,
    brief: {
      titleDefault: "Shape color schemes",
      descriptionDefault:
        "The current proto-shapes palette feels a bit baby-like. Explore more mature color directions for the interactive background shapes while keeping the same layout and motion.",
    },
    context: {
      label: "Palettes",
      panelId: "shape-colors",
      defaultExpanded: true,
      data: SHAPE_COLORS_CONTEXT,
      render: (data) => {
        const context = data as typeof SHAPE_COLORS_CONTEXT;
        return (
          <div className="flex flex-col gap-4 text-sm">
            {context.palettes.map((palette) => (
              <div key={palette.id} className="flex flex-col gap-2">
                <p className="text-foreground font-medium">{palette.label}</p>
                <div className="flex flex-wrap gap-2">
                  {palette.colors.map((color) => (
                    <div
                      key={`${palette.id}-${color.id}`}
                      className="flex flex-col items-center gap-1"
                    >
                      <span
                        className="size-7 rounded-full ring-1 ring-black/10"
                        style={{
                          backgroundColor: `rgb(${color.rgb.join(", ")})`,
                        }}
                      />
                      <span className="text-muted-foreground text-[10px]">
                        {color.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      },
    },
    variantsSection: {
      title: "Color directions",
      description:
        "Each variant remaps the five proto color slots. Shape positions, textures, and physics stay the same.",
    },
    mobbin: {
      references: MOBBIN_REFERENCES,
      title: "Mobbin references",
      imagePathForReference: (id) => `/prototypes/mobbin-references/${id}.webp`,
    },
    variantTabAriaLabel: "shape color scheme",
    briefConfigFilePath:
      "src/prototypes/home-page/_components/shape-colors-design-exploration-config.tsx",
  };
}

export function renderShapeColorsVariant(
  variant: ShapeColorsVariant,
): ReactNode {
  return renderers[variant]();
}
