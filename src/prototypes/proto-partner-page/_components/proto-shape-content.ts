export type ProtoShapeId =
  | "triangle"
  | "cube"
  | "pentagon"
  | "prism"
  | "square";

export type ProtoColorId = "green" | "purple" | "teal" | "pink" | "gold";

export type ProtoRgb = [number, number, number];

export type ProtoShapeOption = {
  id: ProtoShapeId;
  label: string;
};

export type ProtoColorOption = {
  id: ProtoColorId;
  label: string;
  rgb: ProtoRgb;
};

/** Five shapes from the proto-shapes prototype. Cube sits in the center slot. */
export const PROTO_SHAPES: ProtoShapeOption[] = [
  { id: "triangle", label: "Triangle" },
  { id: "pentagon", label: "Pentagon" },
  { id: "cube", label: "Cube" },
  { id: "square", label: "Square" },
  { id: "prism", label: "Prism" },
];

/** Five colors from the proto-shapes prototype. */
export const PROTO_COLORS: ProtoColorOption[] = [
  { id: "green", label: "Green", rgb: [43, 220, 120] },
  { id: "purple", label: "Purple", rgb: [110, 16, 250] },
  { id: "teal", label: "Teal", rgb: [40, 200, 200] },
  { id: "pink", label: "Pink", rgb: [255, 95, 155] },
  { id: "gold", label: "Gold", rgb: [255, 200, 50] },
];

export const DEFAULT_PROTO_SHAPE_ID: ProtoShapeId = "cube";
export const DEFAULT_PROTO_COLOR_ID: ProtoColorId = "green";

export function getProtoShape(id: ProtoShapeId): ProtoShapeOption {
  return PROTO_SHAPES.find((shape) => shape.id === id) ?? PROTO_SHAPES[0];
}

export function getProtoColor(id: ProtoColorId): ProtoColorOption {
  return PROTO_COLORS.find((color) => color.id === id) ?? PROTO_COLORS[0];
}

export type ProtoShapeCustomizerVariant =
  | "compact-nudge-inline"
  | "compact-nudge-text-first"
  | "compact-link-nudge"
  | "compact-minimal-dock"
  | "dual-row-reserved"
  | "dual-row-nudge-first"
  | "dual-row-columns"
  | "dual-row-lifted-card"
  | "segment-tabs"
  | "bottom-dock"
  | "floating-toolbar"
  | "dual-row"
  | "shape-carousel";

/** Bottom offset on the shape canvas so overlay controls do not cover the play area. */
export const PROTO_SHAPE_CUSTOMIZER_CANVAS_INSET: Partial<
  Record<ProtoShapeCustomizerVariant, string>
> = {
  "compact-minimal-dock": "bottom-[11.5rem] sm:bottom-[9rem]",
  "compact-nudge-inline": "bottom-[8.25rem]",
  "compact-nudge-text-first": "bottom-[8.25rem]",
  "compact-link-nudge": "bottom-[8rem]",
  "dual-row-reserved": "bottom-[12rem]",
  "dual-row-nudge-first": "bottom-[12rem]",
  "dual-row-columns": "bottom-[11.5rem]",
  "dual-row-lifted-card": "bottom-[13.5rem]",
  "bottom-dock": "bottom-[11rem]",
  "dual-row": "bottom-[12rem]",
  "shape-carousel": "bottom-[11.5rem]",
  "floating-toolbar": "bottom-[8.5rem]",
};

export function getProtoShapeCustomizerCanvasInset(
  variant: ProtoShapeCustomizerVariant,
  mode: "absolute" | "padding" = "absolute",
): string | undefined {
  const inset = PROTO_SHAPE_CUSTOMIZER_CANVAS_INSET[variant];
  if (!inset) return undefined;
  return mode === "padding" ? inset.replace(/^bottom-/, "pb-") : inset;
}

export const OVERLAY_PROTO_SHAPE_CUSTOMIZER_VARIANTS = [
  "compact-nudge-inline",
  "compact-nudge-text-first",
  "compact-link-nudge",
  "compact-minimal-dock",
  "bottom-dock",
  "floating-toolbar",
  "dual-row",
  "dual-row-reserved",
  "dual-row-nudge-first",
  "dual-row-columns",
  "dual-row-lifted-card",
  "shape-carousel",
] as const satisfies readonly ProtoShapeCustomizerVariant[];

export function isOverlayProtoShapeCustomizerVariant(
  variant: ProtoShapeCustomizerVariant,
): variant is (typeof OVERLAY_PROTO_SHAPE_CUSTOMIZER_VARIANTS)[number] {
  return (
    OVERLAY_PROTO_SHAPE_CUSTOMIZER_VARIANTS as readonly ProtoShapeCustomizerVariant[]
  ).includes(variant);
}

export const PROTO_SHAPE_CUSTOMIZER_CONTEXT = {
  shapes: PROTO_SHAPES,
  colors: PROTO_COLORS.map(({ id, label }) => ({ id, label })),
  defaultShape: DEFAULT_PROTO_SHAPE_ID,
  defaultColor: DEFAULT_PROTO_COLOR_ID,
} as const;
