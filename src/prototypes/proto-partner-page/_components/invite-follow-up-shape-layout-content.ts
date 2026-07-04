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

const INVITE_SHAPE_LAYOUTS: Record<
  InviteFollowUpShapeLayoutVariant,
  Record<(typeof INVITE_SHAPE_IDENTITIES)[number]["id"], ShapePlacement>
> = {
  "staggered-shelf": {
    "invite-prism": { restFloorFactor: 0.78, xFactor: 0.14, yFactor: 0.35 },
    "invite-pentagon": { restFloorFactor: 0.84, xFactor: 0.72, yFactor: 0.35 },
    "invite-square": { restFloorFactor: 0.9, xFactor: 0.48, yFactor: 0.35 },
    "invite-cube": { restFloorFactor: 0.95, xFactor: 0.26, yFactor: 0.35 },
    "invite-triangle": { restFloorFactor: 0.99, xFactor: 0.86, yFactor: 0.35 },
  },
  "bottom-line": {
    "invite-prism": { restFloorFactor: 0.97, xFactor: 0.1, yFactor: 0.35 },
    "invite-pentagon": { restFloorFactor: 0.97, xFactor: 0.28, yFactor: 0.35 },
    "invite-square": { restFloorFactor: 0.97, xFactor: 0.5, yFactor: 0.35 },
    "invite-cube": { restFloorFactor: 0.97, xFactor: 0.72, yFactor: 0.35 },
    "invite-triangle": { restFloorFactor: 0.97, xFactor: 0.9, yFactor: 0.35 },
  },
  "scatter-field": {
    "invite-prism": { restFloorFactor: 0.72, xFactor: 0.12, yFactor: 0.25 },
    "invite-pentagon": { restFloorFactor: 0.8, xFactor: 0.78, yFactor: 0.3 },
    "invite-square": { restFloorFactor: 0.88, xFactor: 0.35, yFactor: 0.28 },
    "invite-cube": { restFloorFactor: 0.94, xFactor: 0.58, yFactor: 0.32 },
    "invite-triangle": { restFloorFactor: 0.98, xFactor: 0.9, yFactor: 0.35 },
  },
  "wave-rise": {
    "invite-prism": { restFloorFactor: 0.92, xFactor: 0.1, yFactor: 0.35 },
    "invite-pentagon": { restFloorFactor: 0.82, xFactor: 0.3, yFactor: 0.35 },
    "invite-square": { restFloorFactor: 0.97, xFactor: 0.5, yFactor: 0.35 },
    "invite-cube": { restFloorFactor: 0.85, xFactor: 0.7, yFactor: 0.35 },
    "invite-triangle": { restFloorFactor: 0.96, xFactor: 0.9, yFactor: 0.35 },
  },
  "arc-shelf": {
    "invite-prism": { restFloorFactor: 0.88, xFactor: 0.1, yFactor: 0.35 },
    "invite-pentagon": { restFloorFactor: 0.92, xFactor: 0.25, yFactor: 0.35 },
    "invite-square": { restFloorFactor: 0.98, xFactor: 0.5, yFactor: 0.35 },
    "invite-cube": { restFloorFactor: 0.92, xFactor: 0.75, yFactor: 0.35 },
    "invite-triangle": { restFloorFactor: 0.88, xFactor: 0.9, yFactor: 0.35 },
  },
  "left-cluster": {
    "invite-prism": { restFloorFactor: 0.9, xFactor: 0.1, yFactor: 0.35 },
    "invite-pentagon": { restFloorFactor: 0.82, xFactor: 0.72, yFactor: 0.35 },
    "invite-square": { restFloorFactor: 0.97, xFactor: 0.28, yFactor: 0.35 },
    "invite-cube": { restFloorFactor: 0.94, xFactor: 0.18, yFactor: 0.35 },
    "invite-triangle": { restFloorFactor: 0.96, xFactor: 0.88, yFactor: 0.35 },
  },
  "deep-edge": {
    "invite-prism": { restFloorFactor: 0.985, xFactor: 0.12, yFactor: 0.4 },
    "invite-pentagon": { restFloorFactor: 0.988, xFactor: 0.3, yFactor: 0.4 },
    "invite-square": { restFloorFactor: 0.992, xFactor: 0.5, yFactor: 0.4 },
    "invite-cube": { restFloorFactor: 0.995, xFactor: 0.7, yFactor: 0.4 },
    "invite-triangle": { restFloorFactor: 0.998, xFactor: 0.88, yFactor: 0.4 },
  },
  "gallery-float": {
    "invite-prism": { restFloorFactor: 0.68, xFactor: 0.28, yFactor: 0.22 },
    "invite-pentagon": { restFloorFactor: 0.76, xFactor: 0.75, yFactor: 0.28 },
    "invite-square": { restFloorFactor: 0.85, xFactor: 0.45, yFactor: 0.25 },
    "invite-cube": { restFloorFactor: 0.92, xFactor: 0.16, yFactor: 0.3 },
    "invite-triangle": { restFloorFactor: 0.96, xFactor: 0.82, yFactor: 0.32 },
  },
  "wide-corners": {
    "invite-prism": { restFloorFactor: 0.93, xFactor: 0.08, yFactor: 0.35 },
    "invite-pentagon": { restFloorFactor: 0.93, xFactor: 0.85, yFactor: 0.35 },
    "invite-square": { restFloorFactor: 0.95, xFactor: 0.5, yFactor: 0.35 },
    "invite-cube": { restFloorFactor: 0.97, xFactor: 0.15, yFactor: 0.35 },
    "invite-triangle": { restFloorFactor: 0.98, xFactor: 0.92, yFactor: 0.35 },
  },
  "stepped-terrace": {
    "invite-prism": { restFloorFactor: 0.86, xFactor: 0.12, yFactor: 0.35 },
    "invite-pentagon": { restFloorFactor: 0.89, xFactor: 0.32, yFactor: 0.35 },
    "invite-square": { restFloorFactor: 0.92, xFactor: 0.52, yFactor: 0.35 },
    "invite-cube": { restFloorFactor: 0.95, xFactor: 0.7, yFactor: 0.35 },
    "invite-triangle": { restFloorFactor: 0.98, xFactor: 0.88, yFactor: 0.35 },
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

/** Mobile-only placement tweaks layered on each layout variant. */
const MOBILE_INVITE_SHAPE_PLACEMENT_OVERRIDES: Partial<
  Record<InviteShapeId, Partial<ShapePlacement>>
> = {
  // Pink pentagon — smaller accent above the copy blurb.
  "invite-pentagon": {
    visualScale: 0.78,
    restFloorFactor: 0.22,
    yFactor: 0.22,
  },
  // Gold cube — left shelf; inset x avoids wall bounce.
  "invite-cube": {
    restFloorFactor: 0.93,
    yFactor: 0.38,
    xFactor: 0.11,
    restFloorSpreadAdjust: 0.02,
  },
  // Green triangle — settle lower alongside the cube.
  "invite-triangle": {
    restFloorFactor: 0.99,
    yFactor: 0.38,
    restFloorSpreadAdjust: 0.03,
  },
};

/** Desktop-only placement tweaks layered on each layout variant. */
const DESKTOP_INVITE_SHAPE_PLACEMENT_OVERRIDES: Partial<
  Record<InviteShapeId, Partial<ShapePlacement>>
> = {
  // Purple prism and pink pentagon — float above the copy blurb.
  "invite-prism": {
    restFloorFactor: 0.26,
    yFactor: 0.26,
  },
  "invite-pentagon": {
    restFloorFactor: 0.3,
    yFactor: 0.3,
  },
  // Gold cube and teal square — nudge upward from the bottom cluster.
  "invite-cube": {
    restFloorFactor: 0.8,
    yFactor: 0.2,
  },
  "invite-square": {
    restFloorFactor: 0.72,
    yFactor: 0.16,
  },
  // Green triangle — lift its floor without moving the other shelves.
  "invite-triangle": {
    restFloorSpreadAdjust: 0.06,
  },
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
    ...(mobile
      ? MOBILE_INVITE_SHAPE_PLACEMENT_OVERRIDES[identity.id]
      : DESKTOP_INVITE_SHAPE_PLACEMENT_OVERRIDES[identity.id]),
  }));
}
