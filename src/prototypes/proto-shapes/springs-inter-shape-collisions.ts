export type CollidableParticle = {
  px: number;
  py: number;
  vx: number;
  vy: number;
  mass: number;
  bFixed?: boolean;
};

/** Match visible handle radius: (12 / 0.8) / 2 */
const COLLISION_RADIUS = 7.5;
const SEGMENT_COLLISION_RADIUS = 7.5;
const SOLVER_ITERATIONS = 6;
/** Upper particle takes most of the vertical separation when stacking. */
const STACK_UPPER_BIAS = 0.78;
const RESTITUTION = 0.08;
const FRICTION = 0.35;

export type CollisionSurface = {
  particles: CollidableParticle[];
  edges: readonly (readonly [number, number])[];
};

function closestPointOnSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
) {
  const abx = bx - ax;
  const aby = by - ay;
  const lengthSq = abx * abx + aby * aby;

  if (lengthSq < 0.001) {
    return { x: ax, y: ay, t: 0 };
  }

  const t = Math.max(
    0,
    Math.min(1, ((px - ax) * abx + (py - ay) * aby) / lengthSq),
  );

  return {
    x: ax + abx * t,
    y: ay + aby * t,
    t,
  };
}

function separateParticleFromSegment(
  particle: CollidableParticle,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  pinned: ReadonlySet<CollidableParticle>,
) {
  if (pinned.has(particle) || particle.bFixed) return;

  const closest = closestPointOnSegment(
    particle.px,
    particle.py,
    ax,
    ay,
    bx,
    by,
  );
  const dx = particle.px - closest.x;
  const dy = particle.py - closest.y;
  const distSq = dx * dx + dy * dy;

  if (distSq >= SEGMENT_COLLISION_RADIUS * SEGMENT_COLLISION_RADIUS) return;

  let dist = Math.sqrt(distSq);
  let nx: number;
  let ny: number;

  if (dist < 0.001) {
    const segLen = Math.hypot(bx - ax, by - ay) || 1;
    nx = -(by - ay) / segLen;
    ny = (bx - ax) / segLen;
    dist = 0.001;
  } else {
    nx = dx / dist;
    ny = dy / dist;
  }

  const overlap = SEGMENT_COLLISION_RADIUS - dist;
  particle.px += nx * overlap;
  particle.py += ny * overlap;

  const velNormal = particle.vx * nx + particle.vy * ny;
  if (velNormal < 0) {
    particle.vx -= velNormal * nx * (1 + RESTITUTION);
    particle.vy -= velNormal * ny * (1 + RESTITUTION);
  }

  if (ny < -0.45 && particle.vy > 0) {
    particle.vy *= 0.35;
  }
}

function resolveSegmentPair(
  movingParticles: CollidableParticle[],
  surface: CollisionSurface,
  pinned: ReadonlySet<CollidableParticle>,
) {
  const { particles, edges } = surface;

  for (const particle of movingParticles) {
    for (const [startIndex, endIndex] of edges) {
      const start = particles[startIndex];
      const end = particles[endIndex];
      if (!start || !end) continue;
      separateParticleFromSegment(
        particle,
        start.px,
        start.py,
        end.px,
        end.py,
        pinned,
      );
    }
  }
}

function resolveGroupSurfaces(
  groupA: CollidableParticle[],
  groupB: CollidableParticle[],
  surfacesA: CollisionSurface | undefined,
  surfacesB: CollisionSurface | undefined,
  pinned: ReadonlySet<CollidableParticle>,
) {
  if (surfacesA) {
    resolveSegmentPair(groupB, surfacesA, pinned);
  }
  if (surfacesB) {
    resolveSegmentPair(groupA, surfacesB, pinned);
  }
}

function separatePair(
  a: CollidableParticle,
  b: CollidableParticle,
  pinned: ReadonlySet<CollidableParticle>,
) {
  if (a.bFixed && b.bFixed) return;

  const dx = b.px - a.px;
  const dy = b.py - a.py;
  const distSq = dx * dx + dy * dy;
  const minDist = COLLISION_RADIUS * 2;

  if (distSq >= minDist * minDist) return;

  let dist = Math.sqrt(distSq);
  let nx: number;
  let ny: number;

  if (dist < 0.001) {
    nx = 0;
    ny = -1;
    dist = 0.001;
  } else {
    nx = dx / dist;
    ny = dy / dist;
  }

  const overlap = minDist - dist;
  const aPinned = pinned.has(a) || a.bFixed;
  const bPinned = pinned.has(b) || b.bFixed;

  let aMove = 0.5;
  let bMove = 0.5;

  const mostlyVertical = Math.abs(ny) > 0.45;
  const aAbove = a.py < b.py;

  if (mostlyVertical && aAbove) {
    aMove = STACK_UPPER_BIAS;
    bMove = 1 - STACK_UPPER_BIAS;
  } else if (mostlyVertical && !aAbove) {
    aMove = 1 - STACK_UPPER_BIAS;
    bMove = STACK_UPPER_BIAS;
  }

  if (aPinned && bPinned) return;

  if (aPinned) {
    b.px += nx * overlap;
    b.py += ny * overlap;
  } else if (bPinned) {
    a.px -= nx * overlap;
    a.py -= ny * overlap;
  } else {
    const totalMass = a.mass + b.mass;
    const aShare = (b.mass / totalMass) * aMove;
    const bShare = (a.mass / totalMass) * bMove;
    a.px -= nx * overlap * aShare;
    a.py -= ny * overlap * aShare;
    b.px += nx * overlap * bShare;
    b.py += ny * overlap * bShare;
  }

  if (aPinned || bPinned) return;

  const relVx = b.vx - a.vx;
  const relVy = b.vy - a.vy;
  const relVelNormal = relVx * nx + relVy * ny;

  if (relVelNormal >= 0) return;

  const invMassSum = 1 / a.mass + 1 / b.mass;
  const impulse = (-(1 + RESTITUTION) * relVelNormal) / invMassSum;

  a.vx -= (impulse / a.mass) * nx;
  a.vy -= (impulse / a.mass) * ny;
  b.vx += (impulse / b.mass) * nx;
  b.vy += (impulse / b.mass) * ny;

  const relVelTangent = relVx * -ny + relVy * nx;
  const frictionImpulse =
    (-relVelTangent * FRICTION) / invMassSum;

  a.vx -= (frictionImpulse / a.mass) * -ny;
  a.vy -= (frictionImpulse / a.mass) * nx;
  b.vx += (frictionImpulse / b.mass) * -ny;
  b.vy += (frictionImpulse / b.mass) * nx;

  if (mostlyVertical) {
    const upper = aAbove ? a : b;
    const lower = aAbove ? b : a;
    if (upper.vy > 0 && upper.py < lower.py + COLLISION_RADIUS) {
      upper.vy *= 0.35;
    }
  }
}

function resolveGroupPair(
  groupA: CollidableParticle[],
  groupB: CollidableParticle[],
  pinned: ReadonlySet<CollidableParticle>,
  skipPairs?: ReadonlySet<string>,
) {
  for (let i = 0; i < groupA.length; i++) {
    for (let j = 0; j < groupB.length; j++) {
      if (groupA === groupB) {
        if (j <= i) continue;
        if (skipPairs?.has(pairKey(i, j))) continue;
      }
      separatePair(groupA[i]!, groupB[j]!, pinned);
    }
  }
}

function pairKey(a: number, b: number) {
  return a < b ? `${a},${b}` : `${b},${a}`;
}

function resolveSelfSegmentCollisions(
  particles: CollidableParticle[],
  edges: CollisionSurface["edges"],
  pinned: ReadonlySet<CollidableParticle>,
) {
  for (let particleIndex = 0; particleIndex < particles.length; particleIndex++) {
    const particle = particles[particleIndex]!;
    for (const [startIndex, endIndex] of edges) {
      if (startIndex === particleIndex || endIndex === particleIndex) continue;
      const start = particles[startIndex];
      const end = particles[endIndex];
      if (!start || !end) continue;
      separateParticleFromSegment(
        particle,
        start.px,
        start.py,
        end.px,
        end.py,
        pinned,
      );
    }
  }
}

/** Let disconnected parts of one shape stack on each other (e.g. linked pyramids). */
export function resolveSelfCollisions(
  particles: CollidableParticle[],
  surface: CollisionSurface,
  springPairs: ReadonlySet<string>,
  pinned: CollidableParticle[] = [],
) {
  const pinnedSet = new Set(pinned);

  for (let iteration = 0; iteration < SOLVER_ITERATIONS; iteration++) {
    resolveGroupPair(particles, particles, pinnedSet, springPairs);
    resolveSelfSegmentCollisions(particles, surface.edges, pinnedSet);
  }
}

/** Push particles from different shapes apart so they can stack and support weight. */
export function resolveInterShapeCollisions(
  groups: CollidableParticle[][],
  pinned: CollidableParticle[] = [],
  surfaces: (CollisionSurface | undefined)[] = [],
) {
  const pinnedSet = new Set(pinned);

  for (let iteration = 0; iteration < SOLVER_ITERATIONS; iteration++) {
    for (let g = 0; g < groups.length; g++) {
      for (let h = g + 1; h < groups.length; h++) {
        resolveGroupPair(groups[g]!, groups[h]!, pinnedSet);
        resolveGroupSurfaces(
          groups[g]!,
          groups[h]!,
          surfaces[g],
          surfaces[h],
          pinnedSet,
        );
      }
    }
  }
}

export function getShapeStackDepth(particles: CollidableParticle[]) {
  let maxY = -Infinity;
  for (const particle of particles) {
    if (particle.py > maxY) maxY = particle.py;
  }
  return maxY;
}
