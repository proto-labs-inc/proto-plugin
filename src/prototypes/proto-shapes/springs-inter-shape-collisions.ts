import { SHAPE_HANDLE_DOT_RADIUS } from "./shape-textures";

export type CollidableParticle = {
  px: number;
  py: number;
  vx: number;
  vy: number;
  mass: number;
  bFixed?: boolean;
};

/** Match visible handle radius for inter-shape collision padding. */
const COLLISION_RADIUS = SHAPE_HANDLE_DOT_RADIUS;
const SEGMENT_COLLISION_RADIUS = SHAPE_HANDLE_DOT_RADIUS;
const SOLVER_ITERATIONS = 6;
/** Wider contact for cross-shape edges/particles — keeps wireframes from hooking. */
const INTER_SHAPE_COLLISION_RADIUS = SHAPE_HANDLE_DOT_RADIUS * 1.65;
const INTER_SHAPE_SEGMENT_RADIUS = SHAPE_HANDLE_DOT_RADIUS * 1.9;
const INTER_SHAPE_EDGE_EDGE_RADIUS = SHAPE_HANDLE_DOT_RADIUS * 1.55;
const INTER_SHAPE_SOLVER_ITERATIONS = 8;
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
  segmentRadius = SEGMENT_COLLISION_RADIUS,
  positionsOnly = false,
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

  if (distSq >= segmentRadius * segmentRadius) return;

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

  const overlap = segmentRadius - dist;
  particle.px += nx * overlap;
  particle.py += ny * overlap;

  if (positionsOnly) return;

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
  segmentRadius = SEGMENT_COLLISION_RADIUS,
  positionsOnly = false,
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
        segmentRadius,
        positionsOnly,
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
  segmentRadius = SEGMENT_COLLISION_RADIUS,
  positionsOnly = false,
) {
  if (surfacesA) {
    resolveSegmentPair(groupB, surfacesA, pinned, segmentRadius, positionsOnly);
  }
  if (surfacesB) {
    resolveSegmentPair(groupA, surfacesB, pinned, segmentRadius, positionsOnly);
  }
}

function closestPointsOnSegments(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  dx: number,
  dy: number,
) {
  const abx = bx - ax;
  const aby = by - ay;
  const cdx = dx - cx;
  const cdy = dy - cy;
  const acx = ax - cx;
  const acy = ay - cy;

  const abLenSq = abx * abx + aby * aby;
  const cdLenSq = cdx * cdx + cdy * cdy;
  const eps = 0.001;

  let s = 0;
  let t = 0;

  if (abLenSq <= eps && cdLenSq <= eps) {
    return { pAx: ax, pAy: ay, pBx: cx, pBy: cy, s: 0, t: 0 };
  }

  if (abLenSq <= eps) {
    s = 0;
    t = Math.max(0, Math.min(1, -(acx * cdx + acy * cdy) / cdLenSq));
  } else if (cdLenSq <= eps) {
    t = 0;
    s = Math.max(0, Math.min(1, (acx * abx + acy * aby) / abLenSq));
  } else {
    const a = abLenSq;
    const b = abx * cdx + aby * cdy;
    const c = cdLenSq;
    const d = acx * abx + acy * aby;
    const e = -(acx * cdx + acy * cdy);
    const denom = a * c - b * b;

    if (Math.abs(denom) > eps) {
      s = Math.max(0, Math.min(1, (b * e - c * d) / denom));
    }
    t = (b * s + e) / c;
    if (t < 0) {
      t = 0;
      s = Math.max(0, Math.min(1, -d / a));
    } else if (t > 1) {
      t = 1;
      s = Math.max(0, Math.min(1, (b - d) / a));
    }
  }

  return {
    pAx: ax + abx * s,
    pAy: ay + aby * s,
    pBx: cx + cdx * t,
    pBy: cy + cdy * t,
    s,
    t,
  };
}

function pushParticleOffset(
  particle: CollidableParticle,
  nx: number,
  ny: number,
  amount: number,
  pinned: ReadonlySet<CollidableParticle>,
) {
  if (amount <= 0 || pinned.has(particle) || particle.bFixed) return;
  particle.px += nx * amount;
  particle.py += ny * amount;
}

/** Repel edges from different shapes so wireframes can't thread through each other. */
function resolveInterShapeSegmentPairs(
  surfaceA: CollisionSurface,
  surfaceB: CollisionSurface,
  pinned: ReadonlySet<CollidableParticle>,
  edgeRadius = INTER_SHAPE_EDGE_EDGE_RADIUS,
) {
  const { particles: particlesA, edges: edgesA } = surfaceA;
  const { particles: particlesB, edges: edgesB } = surfaceB;

  for (const [aStartIndex, aEndIndex] of edgesA) {
    const aStart = particlesA[aStartIndex];
    const aEnd = particlesA[aEndIndex];
    if (!aStart || !aEnd) continue;

    for (const [bStartIndex, bEndIndex] of edgesB) {
      const bStart = particlesB[bStartIndex];
      const bEnd = particlesB[bEndIndex];
      if (!bStart || !bEnd) continue;

      const { pAx, pAy, pBx, pBy, s, t } = closestPointsOnSegments(
        aStart.px,
        aStart.py,
        aEnd.px,
        aEnd.py,
        bStart.px,
        bStart.py,
        bEnd.px,
        bEnd.py,
      );

      const dx = pAx - pBx;
      const dy = pAy - pBy;
      const distSq = dx * dx + dy * dy;
      if (distSq >= edgeRadius * edgeRadius) continue;

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

      const overlap = edgeRadius - dist;
      const half = overlap * 0.5;

      pushParticleOffset(aStart, nx, ny, half * (1 - s), pinned);
      pushParticleOffset(aEnd, nx, ny, half * s, pinned);
      pushParticleOffset(bStart, -nx, -ny, half * (1 - t), pinned);
      pushParticleOffset(bEnd, -nx, -ny, half * t, pinned);
    }
  }
}

function separatePair(
  a: CollidableParticle,
  b: CollidableParticle,
  pinned: ReadonlySet<CollidableParticle>,
  collisionRadius = COLLISION_RADIUS,
  positionsOnly = false,
) {
  if (a.bFixed && b.bFixed) return;

  const dx = b.px - a.px;
  const dy = b.py - a.py;
  const distSq = dx * dx + dy * dy;
  const minDist = collisionRadius * 2;

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

  let aMove = positionsOnly ? 0.5 : 0.5;
  let bMove = positionsOnly ? 0.5 : 0.5;

  if (!positionsOnly) {
    const mostlyVertical = Math.abs(ny) > 0.45;
    const aAbove = a.py < b.py;

    if (mostlyVertical && aAbove) {
      aMove = STACK_UPPER_BIAS;
      bMove = 1 - STACK_UPPER_BIAS;
    } else if (mostlyVertical && !aAbove) {
      aMove = 1 - STACK_UPPER_BIAS;
      bMove = STACK_UPPER_BIAS;
    }
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

  if (positionsOnly || aPinned || bPinned) return;

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

  const mostlyVertical = Math.abs(ny) > 0.45;
  if (mostlyVertical) {
    const aAbove = a.py < b.py;
    const upper = aAbove ? a : b;
    const lower = aAbove ? b : a;
    if (upper.vy > 0 && upper.py < lower.py + collisionRadius) {
      upper.vy *= 0.35;
    }
  }
}

function resolveGroupPair(
  groupA: CollidableParticle[],
  groupB: CollidableParticle[],
  pinned: ReadonlySet<CollidableParticle>,
  skipPairs?: ReadonlySet<string>,
  collisionRadius = COLLISION_RADIUS,
  positionsOnly = false,
) {
  for (let i = 0; i < groupA.length; i++) {
    for (let j = 0; j < groupB.length; j++) {
      if (groupA === groupB) {
        if (j <= i) continue;
        if (skipPairs?.has(pairKey(i, j))) continue;
      }
      separatePair(
        groupA[i]!,
        groupB[j]!,
        pinned,
        collisionRadius,
        positionsOnly,
      );
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
  resolveInterShapeContact(groups, pinned, surfaces, false);
}

/**
 * Keep shapes from overlapping without exchanging momentum — each shape falls
 * on its own, edges simply can't pass through each other.
 */
export function resolveInterShapeNonOverlap(
  groups: CollidableParticle[][],
  pinned: CollidableParticle[] = [],
  surfaces: (CollisionSurface | undefined)[] = [],
) {
  resolveInterShapeContact(groups, pinned, surfaces, true);
}

function resolveInterShapeContact(
  groups: CollidableParticle[][],
  pinned: CollidableParticle[],
  surfaces: (CollisionSurface | undefined)[],
  positionsOnly: boolean,
) {
  const pinnedSet = new Set(pinned);

  for (let iteration = 0; iteration < INTER_SHAPE_SOLVER_ITERATIONS; iteration++) {
    for (let g = 0; g < groups.length; g++) {
      for (let h = g + 1; h < groups.length; h++) {
        resolveGroupPair(
          groups[g]!,
          groups[h]!,
          pinnedSet,
          undefined,
          INTER_SHAPE_COLLISION_RADIUS,
          positionsOnly,
        );
        resolveGroupSurfaces(
          groups[g]!,
          groups[h]!,
          surfaces[g],
          surfaces[h],
          pinnedSet,
          INTER_SHAPE_SEGMENT_RADIUS,
          positionsOnly,
        );
        const surfaceA = surfaces[g];
        const surfaceB = surfaces[h];
        if (surfaceA && surfaceB) {
          resolveInterShapeSegmentPairs(
            surfaceA,
            surfaceB,
            pinnedSet,
            INTER_SHAPE_EDGE_EDGE_RADIUS,
          );
        }
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
