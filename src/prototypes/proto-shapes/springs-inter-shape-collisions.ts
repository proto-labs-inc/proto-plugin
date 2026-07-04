import { SHAPE_HANDLE_DOT_RADIUS } from "./shape-textures";

export type CollidableParticle = {
  px: number;
  py: number;
  vx: number;
  vy: number;
  mass: number;
  bFixed?: boolean;
};

/** Match visible handle radius for collision padding. */
const COLLISION_RADIUS = SHAPE_HANDLE_DOT_RADIUS;
const SEGMENT_COLLISION_RADIUS = SHAPE_HANDLE_DOT_RADIUS;
const SOLVER_ITERATIONS = 6;
/**
 * Inter-shape contact runs slightly wider than self-contact so wireframe edges
 * from different shapes keep a small cushion and can't hook through each other.
 */
const INTER_SHAPE_COLLISION_RADIUS = SHAPE_HANDLE_DOT_RADIUS * 1.2;
const INTER_SHAPE_SEGMENT_RADIUS = SHAPE_HANDLE_DOT_RADIUS * 1.3;
const INTER_SHAPE_SOLVER_ITERATIONS = 6;
/** Extra slack added to each shape's bounding radius during broad-phase culling. */
const BROAD_PHASE_MARGIN = SHAPE_HANDLE_DOT_RADIUS * 3;
/** Upper particle takes most of the vertical separation when stacking. */
const STACK_UPPER_BIAS = 0.78;
const RESTITUTION = 0.08;
const FRICTION = 0.35;

/**
 * Sequential-impulse settings for the convex-hull pile solver. Contacts are
 * inelastic (no bounce), warm-started from the previous frame, and corrected
 * positionally with a small slop so resting shapes stay visibly touching
 * instead of drifting apart or jittering.
 */
const HULL_VELOCITY_ITERATIONS = 8;
const HULL_RESTITUTION = 0;
/**
 * Low friction on purpose: shapes should slide down each other's slopes and
 * settle into the gaps (a dense pile) instead of "arching" — sticking to a
 * neighbour's near-vertical side and leaving air pockets underneath.
 */
const HULL_FRICTION = 0.12;
const HULL_POSITION_BETA = 0.6;
/** Overlap left uncorrected so stacked hulls keep a firm, touching contact. */
const HULL_PENETRATION_SLOP = SHAPE_HANDLE_DOT_RADIUS * 0.5;
/**
 * Shrink each shape's collision footprint toward its centroid so neighbours are
 * allowed to overlap slightly and pack tightly — filling the triangular
 * interstitial gaps that convex bodies otherwise leave between them. 1 = no
 * inset; smaller = shapes nestle deeper into each other.
 */
const SHAPE_COLLISION_INSET = 0.82;
/** A neighbour moving faster than this wakes a sleeping shape it comes near. */
const STACK_INTER_WAKE_SPEED = 1.2;

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
) {
  if (surfacesA) {
    resolveSegmentPair(groupB, surfacesA, pinned, segmentRadius);
  }
  if (surfacesB) {
    resolveSegmentPair(groupA, surfacesB, pinned, segmentRadius);
  }
}

function separatePair(
  a: CollidableParticle,
  b: CollidableParticle,
  pinned: ReadonlySet<CollidableParticle>,
  collisionRadius = COLLISION_RADIUS,
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
  const frictionImpulse = (-relVelTangent * FRICTION) / invMassSum;

  a.vx -= (frictionImpulse / a.mass) * -ny;
  a.vy -= (frictionImpulse / a.mass) * nx;
  b.vx += (frictionImpulse / b.mass) * -ny;
  b.vy += (frictionImpulse / b.mass) * nx;

  if (mostlyVertical) {
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
) {
  for (let i = 0; i < groupA.length; i++) {
    for (let j = 0; j < groupB.length; j++) {
      if (groupA === groupB) {
        if (j <= i) continue;
        if (skipPairs?.has(pairKey(i, j))) continue;
      }
      separatePair(groupA[i]!, groupB[j]!, pinned, collisionRadius);
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

type BoundingCircle = { cx: number; cy: number; r: number };

/** Cheap broad-phase bound: centroid plus distance to the farthest particle. */
function computeBoundingCircle(particles: CollidableParticle[]): BoundingCircle {
  if (particles.length === 0) return { cx: 0, cy: 0, r: 0 };

  let sumX = 0;
  let sumY = 0;
  for (const particle of particles) {
    sumX += particle.px;
    sumY += particle.py;
  }
  const cx = sumX / particles.length;
  const cy = sumY / particles.length;

  let maxDistSq = 0;
  for (const particle of particles) {
    const dx = particle.px - cx;
    const dy = particle.py - cy;
    const distSq = dx * dx + dy * dy;
    if (distSq > maxDistSq) maxDistSq = distSq;
  }

  return { cx, cy, r: Math.sqrt(maxDistSq) };
}

/**
 * Push particles from different shapes apart so they can stack and support
 * weight. A bounding-circle broad phase skips shape pairs that are nowhere near
 * each other, so the expensive particle/edge loops only run for real contacts.
 */
export function resolveInterShapeCollisions(
  groups: CollidableParticle[][],
  pinned: CollidableParticle[] = [],
  surfaces: (CollisionSurface | undefined)[] = [],
) {
  const pinnedSet = new Set(pinned);

  for (let iteration = 0; iteration < INTER_SHAPE_SOLVER_ITERATIONS; iteration++) {
    const circles = groups.map(computeBoundingCircle);

    for (let g = 0; g < groups.length; g++) {
      for (let h = g + 1; h < groups.length; h++) {
        const circleA = circles[g]!;
        const circleB = circles[h]!;
        const dx = circleA.cx - circleB.cx;
        const dy = circleA.cy - circleB.cy;
        const reach = circleA.r + circleB.r + BROAD_PHASE_MARGIN;
        if (dx * dx + dy * dy > reach * reach) continue;

        resolveGroupPair(
          groups[g]!,
          groups[h]!,
          pinnedSet,
          undefined,
          INTER_SHAPE_COLLISION_RADIUS,
        );
        resolveGroupSurfaces(
          groups[g]!,
          groups[h]!,
          surfaces[g],
          surfaces[h],
          pinnedSet,
          INTER_SHAPE_SEGMENT_RADIUS,
        );
      }
    }
  }
}

/** One convex piece of a shape (or a whole convex shape), in world space. */
export type ShapeFaceSet = readonly (readonly number[])[];

type ConvexBody = {
  particles: CollidableParticle[];
  cx: number;
  cy: number;
  r: number;
  immovable: boolean;
};

type HullShape = ConvexBody & {
  hull: { x: number; y: number }[];
};

type FaceBody = ConvexBody & {
  faces: { x: number; y: number }[][];
};

/** Andrew's monotone chain — returns the CCW convex hull of the given points. */
function convexHull(points: { x: number; y: number }[]) {
  if (points.length < 3) return points.slice();

  const sorted = points
    .slice()
    .sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));

  const cross = (
    o: { x: number; y: number },
    a: { x: number; y: number },
    b: { x: number; y: number },
  ) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower: { x: number; y: number }[] = [];
  for (const p of sorted) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0
    ) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: { x: number; y: number }[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i]!;
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0
    ) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

function buildHullShape(
  particles: CollidableParticle[],
  pinned: ReadonlySet<CollidableParticle>,
): HullShape {
  let cx = 0;
  let cy = 0;
  for (const p of particles) {
    cx += p.px;
    cy += p.py;
  }
  cx /= particles.length;
  cy /= particles.length;

  let r = 0;
  let immovable = false;
  const points: { x: number; y: number }[] = [];
  for (const p of particles) {
    points.push({ x: p.px, y: p.py });
    const dist = Math.hypot(p.px - cx, p.py - cy);
    if (dist > r) r = dist;
    if (p.bFixed || pinned.has(p)) immovable = true;
  }

  return { particles, hull: convexHull(points), cx, cy, r, immovable };
}

function projectHull(
  hull: { x: number; y: number }[],
  ax: number,
  ay: number,
) {
  let min = Infinity;
  let max = -Infinity;
  for (const p of hull) {
    const d = p.x * ax + p.y * ay;
    if (d < min) min = d;
    if (d > max) max = d;
  }
  return { min, max };
}

/** Minimum translation vector separating two convex hulls, or null if apart. */
function hullMinimumTranslation(
  hullA: { x: number; y: number }[],
  hullB: { x: number; y: number }[],
) {
  let bestDepth = Infinity;
  let bestNx = 0;
  let bestNy = 0;

  const testAxesOf = (hull: { x: number; y: number }[]) => {
    for (let i = 0; i < hull.length; i++) {
      const p1 = hull[i]!;
      const p2 = hull[(i + 1) % hull.length]!;
      let ax = -(p2.y - p1.y);
      let ay = p2.x - p1.x;
      const len = Math.hypot(ax, ay) || 1;
      ax /= len;
      ay /= len;

      const projA = projectHull(hullA, ax, ay);
      const projB = projectHull(hullB, ax, ay);
      const overlap =
        Math.min(projA.max, projB.max) - Math.max(projA.min, projB.min);
      if (overlap <= 0) return false;
      if (overlap < bestDepth) {
        bestDepth = overlap;
        bestNx = ax;
        bestNy = ay;
      }
    }
    return true;
  };

  if (!testAxesOf(hullA)) return null;
  if (!testAxesOf(hullB)) return null;
  return { nx: bestNx, ny: bestNy, depth: bestDepth };
}

function averageVelocity(particles: CollidableParticle[]) {
  let vx = 0;
  let vy = 0;
  for (const p of particles) {
    vx += p.vx;
    vy += p.vy;
  }
  return { vx: vx / particles.length, vy: vy / particles.length };
}

/** Persistent per-frame contact impulse, keyed by the two shapes' particle arrays. */
type PairImpulse = {
  n: number;
  t: number;
  nx: number;
  ny: number;
  frame: number;
};

const hullContactCache = new WeakMap<
  CollidableParticle[],
  WeakMap<CollidableParticle[], PairImpulse>
>();
let hullSolveFrame = 0;

function getPairImpulse(
  a: CollidableParticle[],
  b: CollidableParticle[],
): PairImpulse {
  let inner = hullContactCache.get(a);
  if (!inner) {
    inner = new WeakMap();
    hullContactCache.set(a, inner);
  }
  let rec = inner.get(b);
  if (!rec) {
    rec = { n: 0, t: 0, nx: 0, ny: 0, frame: -1 };
    inner.set(b, rec);
  }
  return rec;
}

type HullContact = {
  a: ConvexBody;
  b: ConvexBody;
  nx: number;
  ny: number;
  depth: number;
  invA: number;
  invB: number;
  invSum: number;
  cache: PairImpulse;
  nAccum: number;
  tAccum: number;
};

/** Apply a normal + tangent impulse to both bodies (rigidly, along the contact frame). */
function applyContactImpulse(c: HullContact, dn: number, dt: number) {
  const tx = -c.ny;
  const ty = c.nx;
  const ix = dn * c.nx + dt * tx;
  const iy = dn * c.ny + dt * ty;
  if (c.invA > 0) {
    for (const p of c.a.particles) {
      p.vx -= ix * c.invA;
      p.vy -= iy * c.invA;
    }
  }
  if (c.invB > 0) {
    for (const p of c.b.particles) {
      p.vx += ix * c.invB;
      p.vy += iy * c.invB;
    }
  }
}

/** One sequential-impulse pass: solve the normal push-out, then clamped friction. */
function solveContactVelocity(c: HullContact) {
  const avgA = averageVelocity(c.a.particles);
  const avgB = averageVelocity(c.b.particles);
  const rvx = avgB.vx - avgA.vx;
  const rvy = avgB.vy - avgA.vy;

  const relVn = rvx * c.nx + rvy * c.ny;
  const lambdaN = (-(1 + HULL_RESTITUTION) * relVn) / c.invSum;
  const oldN = c.nAccum;
  c.nAccum = Math.max(oldN + lambdaN, 0);
  const dN = c.nAccum - oldN;

  const tx = -c.ny;
  const ty = c.nx;
  const relVt = rvx * tx + rvy * ty;
  const lambdaT = -relVt / c.invSum;
  const maxT = HULL_FRICTION * c.nAccum;
  const oldT = c.tAccum;
  c.tAccum = Math.max(-maxT, Math.min(maxT, oldT + lambdaT));
  const dT = c.tAccum - oldT;

  applyContactImpulse(c, dN, dT);
}

/** Contact normal (oriented A→B) and penetration depth, or null if apart. */
function hullContactManifold(a: HullShape, b: HullShape) {
  const mtv =
    a.hull.length >= 3 && b.hull.length >= 3
      ? hullMinimumTranslation(a.hull, b.hull)
      : null;

  if (mtv) {
    let { nx, ny } = mtv;
    if ((b.cx - a.cx) * nx + (b.cy - a.cy) * ny < 0) {
      nx = -nx;
      ny = -ny;
    }
    return { nx, ny, depth: mtv.depth };
  }

  // Degenerate hull (collinear points): fall back to circle-vs-circle.
  const dx = b.cx - a.cx;
  const dy = b.cy - a.cy;
  const distSq = dx * dx + dy * dy;
  const minDist = a.r + b.r;
  if (distSq >= minDist * minDist) return null;
  const dist = Math.sqrt(distSq) || 0.001;
  return { nx: dx / dist, ny: dy / dist, depth: minDist - dist };
}

/**
 * Inter-shape collision that treats each shape as its convex hull. Convex
 * bodies can't interlock, so shapes stack and slide off each other instead of
 * getting stuck together — while the springs still render the soft-body wobble.
 *
 * Uses a Box2D-style sequential-impulse solver: gather contacts once (behind a
 * bounding-circle broad phase), warm-start from last frame's accumulated
 * impulses, iterate inelastic normal + Coulomb friction impulses, then apply a
 * Baumgarte position correction that leaves a small slop so resting shapes stay
 * firmly touching rather than bouncing apart.
 */
export function resolveInterShapeHullCollisions(
  groups: CollidableParticle[][],
  pinned: CollidableParticle[] = [],
) {
  const pinnedSet = new Set(pinned);
  hullSolveFrame++;

  const shapes = groups.map((particles) => buildHullShape(particles, pinnedSet));
  const contacts: HullContact[] = [];

  for (let g = 0; g < shapes.length; g++) {
    for (let h = g + 1; h < shapes.length; h++) {
      const a = shapes[g]!;
      const b = shapes[h]!;
      if (a.immovable && b.immovable) continue;

      const dx = a.cx - b.cx;
      const dy = a.cy - b.cy;
      const reach = a.r + b.r + BROAD_PHASE_MARGIN;
      if (dx * dx + dy * dy > reach * reach) continue;

      const man = hullContactManifold(a, b);
      if (!man) continue;

      const invA = a.immovable ? 0 : 1 / a.particles.length;
      const invB = b.immovable ? 0 : 1 / b.particles.length;
      const invSum = invA + invB;
      if (invSum === 0) continue;

      const cache = getPairImpulse(groups[g]!, groups[h]!);
      // Drop stale warm-start data if the pair wasn't in contact last frame or
      // the contact normal has flipped since.
      if (
        cache.frame !== hullSolveFrame - 1 ||
        cache.nx * man.nx + cache.ny * man.ny < 0
      ) {
        cache.n = 0;
        cache.t = 0;
      }
      cache.nx = man.nx;
      cache.ny = man.ny;
      cache.frame = hullSolveFrame;

      contacts.push({
        a,
        b,
        nx: man.nx,
        ny: man.ny,
        depth: man.depth,
        invA,
        invB,
        invSum,
        cache,
        nAccum: cache.n,
        tAccum: cache.t,
      });
    }
  }

  for (const c of contacts) {
    applyContactImpulse(c, c.nAccum, c.tAccum);
  }

  for (let it = 0; it < HULL_VELOCITY_ITERATIONS; it++) {
    for (const c of contacts) {
      solveContactVelocity(c);
    }
  }

  for (const c of contacts) {
    c.cache.n = c.nAccum;
    c.cache.t = c.tAccum;
  }

  for (const c of contacts) {
    const correction =
      Math.max(c.depth - HULL_PENETRATION_SLOP, 0) * HULL_POSITION_BETA;
    if (correction <= 0) continue;
    const moveA = correction * (c.invA / c.invSum);
    const moveB = correction * (c.invB / c.invSum);
    for (const p of c.a.particles) {
      p.px -= c.nx * moveA;
      p.py -= c.ny * moveA;
    }
    for (const p of c.b.particles) {
      p.px += c.nx * moveB;
      p.py += c.ny * moveB;
    }
  }
}

function buildFaceBody(
  particles: CollidableParticle[],
  faceSet: ShapeFaceSet,
  pinned: ReadonlySet<CollidableParticle>,
): FaceBody {
  let cx = 0;
  let cy = 0;
  for (const p of particles) {
    cx += p.px;
    cy += p.py;
  }
  cx /= particles.length;
  cy /= particles.length;

  let r = 0;
  let immovable = false;
  for (const p of particles) {
    const dist = Math.hypot(p.px - cx, p.py - cy);
    if (dist > r) r = dist;
    if (p.bFixed || pinned.has(p)) immovable = true;
  }

  const faces: { x: number; y: number }[][] = [];
  for (const face of faceSet) {
    if (face.length < 3) continue;
    const poly: { x: number; y: number }[] = [];
    for (const idx of face) {
      const p = particles[idx];
      if (p)
        poly.push({
          x: cx + (p.px - cx) * SHAPE_COLLISION_INSET,
          y: cy + (p.py - cy) * SHAPE_COLLISION_INSET,
        });
    }
    if (poly.length >= 3) faces.push(poly);
  }

  return { particles, faces, cx, cy, r, immovable };
}

/**
 * Deepest overlapping face-pair between two shapes → a contact normal (oriented
 * A→B) and penetration depth, or null if apart. Each shape is a convex
 * decomposition, so a piece sitting inside another shape's concave notch
 * overlaps nothing and the shapes nest instead of interlocking.
 */
function faceContactManifold(a: FaceBody, b: FaceBody) {
  let bestDepth = 0;
  let bestNx = 0;
  let bestNy = 0;
  for (const faceA of a.faces) {
    for (const faceB of b.faces) {
      const mtv = hullMinimumTranslation(faceA, faceB);
      if (mtv && mtv.depth > bestDepth) {
        bestDepth = mtv.depth;
        bestNx = mtv.nx;
        bestNy = mtv.ny;
      }
    }
  }

  if (bestDepth > 0) {
    let nx = bestNx;
    let ny = bestNy;
    if ((b.cx - a.cx) * nx + (b.cy - a.cy) * ny < 0) {
      nx = -nx;
      ny = -ny;
    }
    return { nx, ny, depth: bestDepth };
  }

  // Empty decomposition (no faces): fall back to circle-vs-circle.
  if (a.faces.length === 0 || b.faces.length === 0) {
    const dx = b.cx - a.cx;
    const dy = b.cy - a.cy;
    const distSq = dx * dx + dy * dy;
    const minDist = a.r + b.r;
    if (distSq >= minDist * minDist) return null;
    const dist = Math.sqrt(distSq) || 0.001;
    return { nx: dx / dist, ny: dy / dist, depth: minDist - dist };
  }

  return null;
}

/**
 * Inter-shape collision that treats each shape as its set of convex faces
 * (a free convex decomposition, since the draw code already tiles every shape
 * with convex polygons). Shapes rest tight against each other and nest into
 * concave gaps without ever interlocking, and `SHAPE_COLLISION_INSET` shrinks
 * each footprint so neighbours overlap slightly and pack densely.
 *
 * Uses the same Box2D-style sequential-impulse solver as the hull path:
 * contacts gathered once behind a bounding-circle broad phase, warm-started
 * from last frame, iterated with inelastic normal + Coulomb friction impulses,
 * then a Baumgarte position correction with slop so the pile stays put.
 */
export function resolveInterShapeFaceCollisions(
  groups: CollidableParticle[][],
  faceSets: ShapeFaceSet[],
  pinned: CollidableParticle[] = [],
  sleeping?: boolean[],
  onWake?: (groupIndex: number) => void,
) {
  const pinnedSet = new Set(pinned);
  hullSolveFrame++;

  const shapes = groups.map((particles, i) => {
    const body = buildFaceBody(particles, faceSets[i] ?? [], pinnedSet);
    // A sleeping shape is a frozen, immovable anchor so its neighbours settle
    // against something solid instead of endlessly nudging it (and shivering).
    if (sleeping?.[i]) body.immovable = true;
    return body;
  });

  // Average speed per shape — used to decide whether a moving neighbour should
  // wake a sleeping one on contact.
  const speeds =
    sleeping && onWake
      ? groups.map((particles) => {
          const v = averageVelocity(particles);
          return Math.hypot(v.vx, v.vy);
        })
      : null;

  const contacts: HullContact[] = [];

  for (let g = 0; g < shapes.length; g++) {
    for (let h = g + 1; h < shapes.length; h++) {
      const a = shapes[g]!;
      const b = shapes[h]!;

      const dx = a.cx - b.cx;
      const dy = a.cy - b.cy;
      const reach = a.r + b.r + BROAD_PHASE_MARGIN;
      if (dx * dx + dy * dy > reach * reach) continue;

      // Wake a sleeping shape when a genuinely moving neighbour comes near.
      if (speeds && sleeping && onWake) {
        const gAsleep = sleeping[g] ?? false;
        const hAsleep = sleeping[h] ?? false;
        if (gAsleep && !hAsleep && speeds[h]! > STACK_INTER_WAKE_SPEED) {
          onWake(g);
        } else if (hAsleep && !gAsleep && speeds[g]! > STACK_INTER_WAKE_SPEED) {
          onWake(h);
        }
      }

      if (a.immovable && b.immovable) continue;

      const man = faceContactManifold(a, b);
      if (!man) continue;

      const invA = a.immovable ? 0 : 1 / a.particles.length;
      const invB = b.immovable ? 0 : 1 / b.particles.length;
      const invSum = invA + invB;
      if (invSum === 0) continue;

      const cache = getPairImpulse(groups[g]!, groups[h]!);
      if (
        cache.frame !== hullSolveFrame - 1 ||
        cache.nx * man.nx + cache.ny * man.ny < 0
      ) {
        cache.n = 0;
        cache.t = 0;
      }
      cache.nx = man.nx;
      cache.ny = man.ny;
      cache.frame = hullSolveFrame;

      contacts.push({
        a,
        b,
        nx: man.nx,
        ny: man.ny,
        depth: man.depth,
        invA,
        invB,
        invSum,
        cache,
        nAccum: cache.n,
        tAccum: cache.t,
      });
    }
  }

  for (const c of contacts) {
    applyContactImpulse(c, c.nAccum, c.tAccum);
  }

  for (let it = 0; it < HULL_VELOCITY_ITERATIONS; it++) {
    for (const c of contacts) {
      solveContactVelocity(c);
    }
  }

  for (const c of contacts) {
    c.cache.n = c.nAccum;
    c.cache.t = c.tAccum;
  }

  for (const c of contacts) {
    const correction =
      Math.max(c.depth - HULL_PENETRATION_SLOP, 0) * HULL_POSITION_BETA;
    if (correction <= 0) continue;
    const moveA = correction * (c.invA / c.invSum);
    const moveB = correction * (c.invB / c.invSum);
    for (const p of c.a.particles) {
      p.px -= c.nx * moveA;
      p.py -= c.ny * moveA;
    }
    for (const p of c.b.particles) {
      p.px += c.nx * moveB;
      p.py += c.ny * moveB;
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
