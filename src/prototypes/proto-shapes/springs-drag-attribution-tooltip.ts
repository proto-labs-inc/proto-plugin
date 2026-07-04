import {
  getShapeHandleDotOutlineWidth,
  getShapeHandleDotRadius,
  withShapeRenderScale,
} from "./shape-textures";

type Centroid = { x: number; y: number };

type CentroidParticle = { px: number; py: number };

/** Fallback offset for single-shape canvases without per-slot layout context. */
export const DRAG_ATTRIBUTION_TOOLTIP_OFFSET_Y = 72;

/** Gap above the shape top, scaled like spring strokes. */
const TOOLTIP_GAP_ABOVE_SHAPE = 22;

/**
 * Distance from shape centroid to tooltip bottom — clears the highest vertex,
 * handle dot, and outline, then adds a scaled gap.
 */
export function getDragAttributionTooltipOffsetY(
  particles: readonly CentroidParticle[],
  dotScale: number,
  normalizedRenderScale: number,
) {
  const centroid = getParticlesCentroid(particles);
  let minPy = Infinity;
  for (const particle of particles) {
    if (particle.py < minPy) minPy = particle.py;
  }

  const dotRadius = getShapeHandleDotRadius(dotScale, normalizedRenderScale);
  const dotOutline = getShapeHandleDotOutlineWidth(normalizedRenderScale) / 2;
  const shapeTop = minPy - dotRadius - dotOutline;
  const gap = withShapeRenderScale(
    TOOLTIP_GAP_ABOVE_SHAPE,
    normalizedRenderScale,
  );
  return centroid.y - shapeTop + gap;
}

export function getParticlesCentroid(
  particles: readonly CentroidParticle[],
): Centroid {
  let sumX = 0;
  let sumY = 0;
  for (const particle of particles) {
    sumX += particle.px;
    sumY += particle.py;
  }
  const count = particles.length;
  return { x: sumX / count, y: sumY / count };
}

export function formatDragAttributionText(
  label: string,
  slotSpecific: boolean,
): string {
  return slotSpecific ? label : `Created by ${label}`;
}

export function updateDragAttributionTooltipElement(
  tooltip: HTMLDivElement | null,
  labelEl: HTMLSpanElement | null,
  centroid: Centroid | null,
  label: string | undefined,
  slotSpecific: boolean,
  /** Canvas used for coordinate conversion — fixed positioning escapes parent z-index. */
  positionAnchor?: HTMLElement | null,
  offsetY = DRAG_ATTRIBUTION_TOOLTIP_OFFSET_Y,
  useFixedPosition = true,
) {
  if (!tooltip || !labelEl || !centroid || !label) {
    if (tooltip) tooltip.style.display = "none";
    return;
  }

  labelEl.textContent = formatDragAttributionText(label, slotSpecific);
  tooltip.style.display = "inline-flex";

  if (positionAnchor && useFixedPosition) {
    const rect = positionAnchor.getBoundingClientRect();
    const x = rect.left + centroid.x;
    const y = rect.top + centroid.y - offsetY;
    tooltip.style.position = "fixed";
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.style.transform = "translate(-50%, -100%)";
    return;
  }

  if (positionAnchor) {
    tooltip.style.position = "absolute";
    tooltip.style.left = `${centroid.x}px`;
    tooltip.style.top = `${centroid.y - offsetY}px`;
    tooltip.style.transform = "translate(-50%, -100%)";
    return;
  }

  tooltip.style.position = "absolute";
  tooltip.style.left = "0";
  tooltip.style.top = "0";
  tooltip.style.transform = `translate(${centroid.x}px, ${centroid.y - offsetY}px) translate(-50%, -100%)`;
}

export const DRAG_ATTRIBUTION_TOOLTIP_CLASS =
  "pointer-events-none z-[1060] whitespace-nowrap rounded-full border border-black/10 bg-white px-3 py-1.5 text-[11px] font-medium tracking-[-0.01em] text-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] max-sm:px-4 max-sm:py-2 max-sm:text-[13px]";

/** Rendered inside the shape canvas so copy highlights can mask it. */
export const DRAG_ATTRIBUTION_TOOLTIP_LAYERED_CLASS =
  "pointer-events-none absolute z-0 whitespace-nowrap rounded-full border border-black/10 bg-white px-3 py-1.5 text-[11px] font-medium tracking-[-0.01em] text-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] max-sm:px-4 max-sm:py-2 max-sm:text-[13px]";
