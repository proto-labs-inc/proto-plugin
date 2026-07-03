export type SpringsSimulationBoundaries = {
  margin: number;
  /** When set, the bottom uses this inset; sides and top use `margin`. */
  floorInset?: number;
};

export function clampParticleWithSimulationBoundaries(
  particle: { px: number; py: number; vx: number; vy: number },
  width: number,
  height: number,
  boundaries: SpringsSimulationBoundaries,
) {
  const edgeMargin = boundaries.margin;
  const maxX = width - edgeMargin;
  const maxY =
    boundaries.floorInset != null
      ? height - boundaries.floorInset
      : height - edgeMargin;

  if (particle.px > maxX) {
    particle.px = maxX;
    particle.vx = 0;
  } else if (particle.px < edgeMargin) {
    particle.px = edgeMargin;
    particle.vx = 0;
  }

  if (particle.py > maxY) {
    particle.py = maxY;
    particle.vy = 0;
  } else if (particle.py < edgeMargin) {
    particle.py = edgeMargin;
    particle.vy = 0;
  }
}
