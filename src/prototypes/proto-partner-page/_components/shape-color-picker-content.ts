import {
  DEFAULT_PROTO_COLOR_ID,
  DEFAULT_PROTO_SHAPE_ID,
  DEFAULT_PROTO_TEXTURE_ID,
  PROTO_COLORS,
  PROTO_SHAPES,
  PROTO_TEXTURE_OPTIONS,
} from "./proto-shape-content";

export type ShapeColorPickerVariant =
  | "ring-gradient"
  | "list-radio"
  | "stamp-outlined"
  | "neon-glow"
  | "minimal-underline"
  | "material-tonal"
  | "combo-mini"
  | "pill-labels"
  | "segmented-icons"
  | "filled-silhouette"
  | "labeled-tiles";

export const SHAPE_COLOR_PICKER_CONTEXT = {
  shapes: PROTO_SHAPES,
  colors: PROTO_COLORS.map(({ id, label }) => ({ id, label })),
  textures: PROTO_TEXTURE_OPTIONS.map(({ id, label }) => ({ id, label })),
  defaultShape: DEFAULT_PROTO_SHAPE_ID,
  defaultColor: DEFAULT_PROTO_COLOR_ID,
  defaultTexture: DEFAULT_PROTO_TEXTURE_ID,
} as const;

export const DEFAULT_SHAPE_COLOR_PICKER_VARIANT: ShapeColorPickerVariant =
  "labeled-tiles";
