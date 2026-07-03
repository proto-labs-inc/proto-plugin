type Centroid = { x: number; y: number };

type CentroidParticle = { px: number; py: number };

export const DRAG_ATTRIBUTION_TOOLTIP_OFFSET_Y = 36;

export function getParticlesCentroid(particles: readonly CentroidParticle[]): Centroid {
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
  return slotSpecific ? label : `by ${label}`;
}

export function updateDragAttributionTooltipElement(
  tooltip: HTMLDivElement | null,
  labelEl: HTMLSpanElement | null,
  centroid: Centroid | null,
  label: string | undefined,
  slotSpecific: boolean,
) {
  if (!tooltip || !labelEl || !centroid || !label) {
    if (tooltip) tooltip.style.display = "none";
    return;
  }

  labelEl.textContent = formatDragAttributionText(label, slotSpecific);
  tooltip.style.display = "";
  tooltip.style.transform = `translate(${centroid.x}px, ${centroid.y - DRAG_ATTRIBUTION_TOOLTIP_OFFSET_Y}px) translate(-50%, -100%)`;
}

export const DRAG_ATTRIBUTION_TOOLTIP_CLASS =
  "pointer-events-none absolute left-0 top-0 z-20 hidden whitespace-nowrap rounded-full bg-[#1e1e1e] px-2.5 py-1 text-[11px] font-medium tracking-[-0.01em] text-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.28),0_0_0_1px_#333]";
