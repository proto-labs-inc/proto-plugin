import type { FixedShapeSlotConfig } from "../../home-page/_components/home-page-shapes-background";
import type {
  ProtoColorId,
  ProtoShapeId,
  ProtoTextureId,
} from "./proto-shape-content";

export type InviteFollowUpShapeLayoutVariant =
  | "staggered-shelf"
  | "bottom-line"
  | "scatter-field"
  | "wave-rise"
  | "arc-shelf"
  | "left-cluster"
  | "deep-edge"
  | "gallery-float"
  | "wide-corners"
  | "stepped-terrace";

export const INVITE_FOLLOW_UP_SHAPE_LAYOUT_VARIANTS = [
  "staggered-shelf",
  "bottom-line",
  "scatter-field",
  "wave-rise",
  "arc-shelf",
  "left-cluster",
  "deep-edge",
  "gallery-float",
  "wide-corners",
  "stepped-terrace",
] as const satisfies readonly InviteFollowUpShapeLayoutVariant[];

type ShapeIdentity = {
  id: string;
  shapeId: ProtoShapeId;
  colorId: ProtoColorId;
  textureId: ProtoTextureId;
  visualScale: number;
};

type ShapePlacement = {
  restFloorFactor: number;
  xFactor: number;
  yFactor: number;
  /** Optional size override — used for mobile-only smaller accents. */
  visualScale?: number;
  /** Partner mode only — lifts this shape's floor without shifting other shelves. */
  restFloorSpreadAdjust?: number;
  /** Fall from above the slot instead of center-pop — keeps high-shelf shapes 3D. */
  entranceDrop?: boolean;
  /** Collapse and pop open at the shape's own resting spot — no drop or travel. */
  entrancePopInPlace?: boolean;
};

const INVITE_SHAPE_IDENTITIES = [
  {
    id: "invite-prism",
    shapeId: "prism",
    colorId: "purple",
    textureId: "Dots",
    visualScale: 1.08,
  },
  {
    id: "invite-pentagon",
    shapeId: "pentagon",
    colorId: "pink",
    textureId: "Gradient",
    visualScale: 1.02,
  },
  {
    id: "invite-square",
    shapeId: "square",
    colorId: "teal",
    textureId: "Rings",
    visualScale: 1.05,
  },
  {
    id: "invite-cube",
    shapeId: "cube",
    colorId: "gold",
    textureId: "Grid",
    visualScale: 1.08,
  },
  {
    id: "invite-triangle",
    shapeId: "triangle",
    colorId: "green",
    textureId: "Waves",
    visualScale: 1.1,
  },
] as const satisfies readonly ShapeIdentity[];

/**
 * Each layout places shapes around the centered copy blurb — typically 2 above
 * (~0.2–0.38 floor) and 3 below (~0.7–0.98). Variants differ in x/y rhythm, not
 * by collapsing everything onto the bottom edge.
 */
const INVITE_SHAPE_LAYOUTS: Record<
  InviteFollowUpShapeLayoutVariant,
  Record<(typeof INVITE_SHAPE_IDENTITIES)[number]["id"], ShapePlacement>
> = {
  // Diagonal steps from high-left down to low-right, wrapping the blurb.
  "staggered-shelf": {
    "invite-prism": { restFloorFactor: 0.22, xFactor: 0.12, yFactor: 0.24 },
    "invite-pentagon": { restFloorFactor: 0.36, xFactor: 0.78, yFactor: 0.3 },
    "invite-square": { restFloorFactor: 0.7, xFactor: 0.42, yFactor: 0.18 },
    "invite-cube": { restFloorFactor: 0.84, xFactor: 0.22, yFactor: 0.28 },
    "invite-triangle": { restFloorFactor: 0.97, xFactor: 0.86, yFactor: 0.34 },
  },
  // Even horizontal spacing; two float above, three share a lower shelf.
  "bottom-line": {
    "invite-prism": { restFloorFactor: 0.28, xFactor: 0.18, yFactor: 0.28 },
    "invite-pentagon": { restFloorFactor: 0.28, xFactor: 0.82, yFactor: 0.28 },
    "invite-square": { restFloorFactor: 0.94, xFactor: 0.22, yFactor: 0.35 },
    "invite-cube": { restFloorFactor: 0.94, xFactor: 0.5, yFactor: 0.35 },
    "invite-triangle": { restFloorFactor: 0.94, xFactor: 0.78, yFactor: 0.35 },
  },
  // Loose field above and below the blurb.
  "scatter-field": {
    "invite-prism": { restFloorFactor: 0.2, xFactor: 0.14, yFactor: 0.22 },
    "invite-pentagon": { restFloorFactor: 0.34, xFactor: 0.8, yFactor: 0.28 },
    "invite-square": { restFloorFactor: 0.62, xFactor: 0.38, yFactor: 0.2 },
    "invite-cube": { restFloorFactor: 0.82, xFactor: 0.18, yFactor: 0.3 },
    "invite-triangle": { restFloorFactor: 0.94, xFactor: 0.72, yFactor: 0.34 },
  },
  // Alternating high / low rests across the width.
  "wave-rise": {
    "invite-prism": { restFloorFactor: 0.26, xFactor: 0.1, yFactor: 0.26 },
    "invite-pentagon": { restFloorFactor: 0.86, xFactor: 0.3, yFactor: 0.32 },
    "invite-square": { restFloorFactor: 0.3, xFactor: 0.5, yFactor: 0.28 },
    "invite-cube": { restFloorFactor: 0.9, xFactor: 0.7, yFactor: 0.34 },
    "invite-triangle": { restFloorFactor: 0.24, xFactor: 0.9, yFactor: 0.24 },
  },
  // High edges, low center under the blurb.
  "arc-shelf": {
    "invite-prism": { restFloorFactor: 0.24, xFactor: 0.1, yFactor: 0.24 },
    "invite-pentagon": { restFloorFactor: 0.24, xFactor: 0.9, yFactor: 0.24 },
    "invite-square": { restFloorFactor: 0.92, xFactor: 0.5, yFactor: 0.34 },
    "invite-cube": { restFloorFactor: 0.72, xFactor: 0.26, yFactor: 0.22 },
    "invite-triangle": { restFloorFactor: 0.72, xFactor: 0.74, yFactor: 0.22 },
  },
  // Three on the left (stacked), two on the right — still above + below.
  "left-cluster": {
    "invite-prism": { restFloorFactor: 0.22, xFactor: 0.12, yFactor: 0.24 },
    "invite-square": { restFloorFactor: 0.7, xFactor: 0.24, yFactor: 0.2 },
    "invite-cube": { restFloorFactor: 0.92, xFactor: 0.14, yFactor: 0.34 },
    "invite-pentagon": { restFloorFactor: 0.3, xFactor: 0.78, yFactor: 0.28 },
    "invite-triangle": { restFloorFactor: 0.9, xFactor: 0.86, yFactor: 0.34 },
  },
  // Tight to the bottom edge, with two small accents still above the blurb.
  "deep-edge": {
    "invite-prism": { restFloorFactor: 0.32, xFactor: 0.16, yFactor: 0.3 },
    "invite-pentagon": { restFloorFactor: 0.32, xFactor: 0.84, yFactor: 0.3 },
    "invite-square": { restFloorFactor: 0.985, xFactor: 0.22, yFactor: 0.4 },
    "invite-cube": { restFloorFactor: 0.99, xFactor: 0.5, yFactor: 0.4 },
    "invite-triangle": { restFloorFactor: 0.995, xFactor: 0.78, yFactor: 0.4 },
  },
  // Default product look — two shapes above the copy blurb, three below.
  "gallery-float": {
    "invite-prism": { restFloorFactor: 0.26, xFactor: 0.28, yFactor: 0.26 },
    "invite-pentagon": { restFloorFactor: 0.3, xFactor: 0.75, yFactor: 0.3 },
    "invite-square": { restFloorFactor: 0.72, xFactor: 0.45, yFactor: 0.16 },
    "invite-cube": { restFloorFactor: 0.8, xFactor: 0.16, yFactor: 0.2 },
    "invite-triangle": {
      restFloorFactor: 0.96,
      xFactor: 0.82,
      yFactor: 0.32,
      restFloorSpreadAdjust: 0.06,
    },
  },
  // Frame the blurb from the four corners + one mid anchor.
  "wide-corners": {
    "invite-prism": { restFloorFactor: 0.2, xFactor: 0.1, yFactor: 0.22 },
    "invite-pentagon": { restFloorFactor: 0.22, xFactor: 0.88, yFactor: 0.24 },
    "invite-square": { restFloorFactor: 0.58, xFactor: 0.5, yFactor: 0.2 },
    "invite-cube": { restFloorFactor: 0.94, xFactor: 0.12, yFactor: 0.36 },
    "invite-triangle": { restFloorFactor: 0.96, xFactor: 0.9, yFactor: 0.36 },
  },
  // Terrace steps ascending visually toward the right (low → high).
  "stepped-terrace": {
    "invite-prism": { restFloorFactor: 0.94, xFactor: 0.12, yFactor: 0.34 },
    "invite-cube": { restFloorFactor: 0.78, xFactor: 0.3, yFactor: 0.28 },
    "invite-square": { restFloorFactor: 0.55, xFactor: 0.5, yFactor: 0.22 },
    "invite-pentagon": { restFloorFactor: 0.34, xFactor: 0.7, yFactor: 0.28 },
    "invite-triangle": { restFloorFactor: 0.22, xFactor: 0.88, yFactor: 0.24 },
  },
};

export const DEFAULT_INVITE_FOLLOW_UP_SHAPE_LAYOUT_VARIANT: InviteFollowUpShapeLayoutVariant =
  "gallery-float";

type InviteShapeId = (typeof INVITE_SHAPE_IDENTITIES)[number]["id"];

/** Purple prism and teal square — hidden on narrow viewports. */
const MOBILE_HIDDEN_INVITE_SHAPE_IDS = new Set<InviteShapeId>([
  "invite-prism",
  "invite-square",
]);

/**
 * Viewport-only tweaks that must NOT override layout x/y/floor — those belong
 * to each exploration variant in INVITE_SHAPE_LAYOUTS. Absolute position
 * overrides here made every layout look the same when switching explorations.
 */
const MOBILE_INVITE_SHAPE_VIEWPORT_TWEAKS: Partial<
  Record<InviteShapeId, Pick<ShapePlacement, "visualScale" | "restFloorSpreadAdjust">>
> = {
  "invite-pentagon": { visualScale: 0.78 },
  "invite-cube": { restFloorSpreadAdjust: 0.02 },
  "invite-triangle": { restFloorSpreadAdjust: 0.03 },
};

export type InviteFollowUpShapeSlotsOptions = {
  mobile?: boolean;
};

export function getInviteFollowUpShapeSlots(
  layout: InviteFollowUpShapeLayoutVariant = DEFAULT_INVITE_FOLLOW_UP_SHAPE_LAYOUT_VARIANT,
  options: InviteFollowUpShapeSlotsOptions = {},
): FixedShapeSlotConfig[] {
  const { mobile = false } = options;
  const placements = INVITE_SHAPE_LAYOUTS[layout];

  return INVITE_SHAPE_IDENTITIES.filter(
    (identity) => !mobile || !MOBILE_HIDDEN_INVITE_SHAPE_IDS.has(identity.id),
  ).map((identity) => ({
    ...identity,
    ...placements[identity.id],
    ...(mobile ? MOBILE_INVITE_SHAPE_VIEWPORT_TWEAKS[identity.id] : undefined),
  }));
}
