import {
  getProtoColor,
  type ProtoColorId,
  type ProtoRgb,
  type ProtoShapeId,
  type ProtoTextureId,
} from "../../proto-partner-page/_components/proto-shape-content";

export type HomePageContributorShape = {
  id: string;
  contributorName: string;
  shapeId: ProtoShapeId;
  colorId: ProtoColorId;
  textureId: ProtoTextureId;
  visualScale: number;
  restFloorFactor: number;
  xFactor: number;
  yFactor: number;
};

/** Design-partner shapes pinned on the home page background. */
export const HOME_PAGE_CONTRIBUTOR_SHAPES: HomePageContributorShape[] = [
  {
    id: "claude-prism",
    contributorName: "Claude",
    shapeId: "prism",
    colorId: "teal",
    textureId: "Rings",
    visualScale: 1.12,
    restFloorFactor: 0.7,
    xFactor: 0.28,
    yFactor: 0.05,
  },
];

export function contributorShapeToSlotConfig(
  shape: HomePageContributorShape,
): {
  id: string;
  shapeId: ProtoShapeId;
  color: ProtoRgb;
  textureId: ProtoTextureId;
  visualScale: number;
  restFloorFactor: number;
  xFactor: number;
  yFactor: number;
  attributionLabel: string;
} {
  return {
    id: shape.id,
    shapeId: shape.shapeId,
    color: getProtoColor(shape.colorId).rgb,
    textureId: shape.textureId,
    visualScale: shape.visualScale,
    restFloorFactor: shape.restFloorFactor,
    xFactor: shape.xFactor,
    yFactor: shape.yFactor,
    attributionLabel: shape.contributorName,
  };
}
