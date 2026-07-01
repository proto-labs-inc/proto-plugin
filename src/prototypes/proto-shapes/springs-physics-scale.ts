type ScalableParticle = { px: number; py: number };

export type SpringsPhysicsSimulation = {
  particles: ScalableParticle[];
  restLength: number;
  physicsScale: number;
};

export function getSimulationCentroid(sim: SpringsPhysicsSimulation) {
  let sumX = 0;
  let sumY = 0;
  for (const particle of sim.particles) {
    sumX += particle.px;
    sumY += particle.py;
  }
  const count = sim.particles.length;
  return { x: sumX / count, y: sumY / count };
}

/** Scale geometry and gravity together so smaller shapes don't sag more. */
export function scaleSpringsSimulationAroundCentroid(
  sim: SpringsPhysicsSimulation,
  scale: number,
) {
  if (scale === 1) return;

  const centroid = getSimulationCentroid(sim);
  for (const particle of sim.particles) {
    particle.px = centroid.x + (particle.px - centroid.x) * scale;
    particle.py = centroid.y + (particle.py - centroid.y) * scale;
  }
  sim.restLength *= scale;
  sim.physicsScale *= scale;
}
