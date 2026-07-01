import {
  PROTO_COLORS,
  type ProtoColorId,
  type ProtoRgb,
} from "../../proto-partner-page/_components/proto-shape-content";

export type ShapeColorsVariant =
  | "electric-pop"
  | "tropical-punch"
  | "hyper-citrus"
  | "ultra-jewel"
  | "muted-jewel"
  | "earth-clay"
  | "ink-slate"
  | "editorial-pop"
  | "soft-mist"
  | "neon-bright";

/** Pre-exploration palette — original proto-shapes colors. */
export const SHAPE_COLORS_BASELINE_SCHEME: ShapeColorsVariant = "neon-bright";

/** Pre-exploration palette — original proto-shapes colors. */
const NEON_BRIGHT_COLORS: Record<ProtoColorId, ProtoRgb> = {
  green: [43, 220, 120],
  purple: [110, 16, 250],
  teal: [40, 200, 200],
  pink: [255, 95, 155],
  gold: [255, 200, 50],
};

export const SHAPE_COLOR_PALETTES: Record<
  ShapeColorsVariant,
  Record<ProtoColorId, ProtoRgb>
> = {
  "neon-bright": NEON_BRIGHT_COLORS,
  "electric-pop": {
    green: [12, 214, 118],
    purple: [122, 48, 244],
    teal: [16, 196, 226],
    pink: [252, 56, 140],
    gold: [252, 192, 40],
  },
  "tropical-punch": {
    green: [30, 215, 130],
    purple: [190, 70, 245],
    teal: [20, 210, 195],
    pink: [255, 90, 105],
    gold: [255, 165, 40],
  },
  "hyper-citrus": {
    green: [130, 230, 40],
    purple: [180, 60, 250],
    teal: [40, 210, 190],
    pink: [255, 70, 120],
    gold: [255, 190, 30],
  },
  "ultra-jewel": {
    green: [0, 195, 130],
    purple: [110, 40, 230],
    teal: [0, 175, 205],
    pink: [225, 45, 110],
    gold: [240, 175, 35],
  },
  "muted-jewel": {
    green: [62, 118, 92],
    purple: [98, 78, 132],
    teal: [58, 108, 118],
    pink: [152, 98, 108],
    gold: [152, 118, 72],
  },
  "earth-clay": {
    green: [88, 108, 72],
    purple: [120, 88, 92],
    teal: [108, 120, 108],
    pink: [168, 112, 88],
    gold: [148, 120, 72],
  },
  "ink-slate": {
    green: [68, 92, 88],
    purple: [72, 68, 112],
    teal: [72, 92, 108],
    pink: [112, 88, 96],
    gold: [108, 96, 72],
  },
  "editorial-pop": {
    green: [28, 148, 88],
    purple: [88, 48, 168],
    teal: [24, 132, 148],
    pink: [168, 48, 88],
    gold: [168, 112, 32],
  },
  "soft-mist": {
    green: [128, 148, 132],
    purple: [132, 124, 148],
    teal: [124, 140, 148],
    pink: [148, 128, 132],
    gold: [148, 136, 112],
  },
};

export function getHomeShapePaletteColor(
  colorId: ProtoColorId,
  scheme: ShapeColorsVariant,
): ProtoRgb {
  return SHAPE_COLOR_PALETTES[scheme][colorId];
}

export const SHAPE_COLORS_CONTEXT = {
  palettes: (Object.keys(SHAPE_COLOR_PALETTES) as ShapeColorsVariant[]).map(
    (id) => ({
      id,
      label:
        id === "neon-bright"
          ? "Neon bright"
          : id
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" "),
      colors: PROTO_COLORS.map((color) => ({
        id: color.id,
        label: color.label,
        rgb: SHAPE_COLOR_PALETTES[id][color.id],
      })),
    }),
  ),
};
