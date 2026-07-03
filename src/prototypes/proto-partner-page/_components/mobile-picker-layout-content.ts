import {
  DEFAULT_PROTO_COLOR_ID,
  DEFAULT_PROTO_SHAPE_ID,
  DEFAULT_PROTO_TEXTURE_ID,
  PROTO_COLORS,
  PROTO_SHAPES,
  PROTO_TEXTURE_OPTIONS,
} from "./proto-shape-content";

export type MobilePickerLayoutVariant =
  | "stacked-rows"
  | "sliding-grey-tabs"
  | "three-way-tabs"
  | "icon-rail"
  | "accordion"
  | "peek-bar"
  | "swipe-dots"
  | "step-wizard"
  | "scrubber-pills";

export const MOBILE_PICKER_LAYOUT_CONTEXT = {
  shapes: PROTO_SHAPES,
  colors: PROTO_COLORS.map(({ id, label }) => ({ id, label })),
  textures: PROTO_TEXTURE_OPTIONS.map(({ id, label }) => ({ id, label })),
  defaultShape: DEFAULT_PROTO_SHAPE_ID,
  defaultColor: DEFAULT_PROTO_COLOR_ID,
  defaultTexture: DEFAULT_PROTO_TEXTURE_ID,
} as const;

export const DEFAULT_MOBILE_PICKER_LAYOUT_VARIANT: MobilePickerLayoutVariant =
  "sliding-grey-tabs";

export const MOBILE_PICKER_SURFACE = "#f4f4f5";
export const MOBILE_PICKER_TOGGLE_TRACK = "#e4e4e7";
export const MOBILE_PICKER_TOGGLE_BORDER = "#d4d4d8";

/** Top edge of the mobile customize dock — shared on mobile and desktop. */
export const MOBILE_PICKER_DOCK_DIVIDER_CLASS = "bg-border h-0.5 w-full shrink-0";
export const MOBILE_PICKER_DOCK_BORDER_CLASS = "border-border border-t-2";

export type PickerSection = "shape" | "color" | "texture";

export const PICKER_SECTIONS: PickerSection[] = ["texture", "shape", "color"];

export const DEFAULT_PICKER_SECTION: PickerSection = PICKER_SECTIONS[0]!;

export const PICKER_SECTION_LABELS: Record<PickerSection, string> = {
  shape: "Shape",
  color: "Color",
  texture: "Texture",
};
