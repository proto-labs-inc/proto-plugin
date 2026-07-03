import {
  getProtoColor,
  type ProtoColorId,
  type ProtoShapeId,
  type ProtoTextureId,
} from "./proto-shape-content";
import type { ProtoShapeSelection } from "./proto-shape-customizer-block";
import type { HomePageContributorShape } from "../../home-page/_components/home-page-contributor-shapes";

const STORAGE_KEY = "proto-partner-submitted-shapes";

type StoredSubmittedShape = {
  id: string;
  contributorName: string;
  shapeId: ProtoShapeId;
  colorId: ProtoColorId;
  textureId: ProtoTextureId;
  submittedAt: number;
};

function readStoredShapes(): StoredSubmittedShape[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredSubmittedShape[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSubmittedProtoShape(
  selection: ProtoShapeSelection,
  contributorName = "Amelie",
) {
  if (typeof window === "undefined") return;

  const entry: StoredSubmittedShape = {
    id: `submitted-${contributorName.toLowerCase()}-${Date.now()}`,
    contributorName,
    shapeId: selection.shapeId,
    colorId: selection.colorId,
    textureId: selection.textureId,
    submittedAt: Date.now(),
  };

  const existing = readStoredShapes().filter(
    (shape) => shape.contributorName !== contributorName,
  );

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...existing, entry]),
    );
  } catch {
    // Ignore localStorage write failures in prototype preview.
  }
}

export function readSubmittedContributorShapes(): HomePageContributorShape[] {
  return readStoredShapes().map((shape, index) => ({
    id: shape.id,
    contributorName: shape.contributorName,
    shapeId: shape.shapeId,
    colorId: shape.colorId,
    textureId: shape.textureId,
    visualScale: 1.05,
    restFloorFactor: 0.52 + (index % 3) * 0.08,
    xFactor: 0.22 + (index % 4) * 0.18,
    yFactor: 0.04 + (index % 2) * 0.03,
  }));
}

export function selectionToContributorShape(
  selection: ProtoShapeSelection,
  contributorName = "Amelie",
): HomePageContributorShape {
  return {
    id: `preview-${contributorName.toLowerCase()}`,
    contributorName,
    shapeId: selection.shapeId,
    colorId: selection.colorId,
    textureId: selection.textureId,
    visualScale: 1.05,
    restFloorFactor: 0.58,
    xFactor: 0.74,
    yFactor: 0.06,
  };
}

export function getContributorShapeColor(shape: HomePageContributorShape) {
  return getProtoColor(shape.colorId).rgb;
}
