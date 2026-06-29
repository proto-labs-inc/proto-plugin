const BASE_POINTS = 4;
const SHAPE_SCALE = 0.7;

/**
 * Relative starting positions for the eight particles. The front face (0–3) and
 * back face (4–7) begin partially collapsed (matching the original p5 sketch);
 * the springs then pull them apart into an isometric cube.
 */
const SHAPE_OFFSETS = [
  { x: 150 * SHAPE_SCALE, y: 100 * SHAPE_SCALE },
  { x: 100 * SHAPE_SCALE, y: 50 * SHAPE_SCALE },
  { x: 100 * SHAPE_SCALE, y: 0 },
  { x: 150 * SHAPE_SCALE, y: 0 },
  { x: 100 * SHAPE_SCALE, y: 50 * SHAPE_SCALE },
  { x: 0, y: 50 * SHAPE_SCALE },
  { x: 0, y: 0 },
  { x: 100 * SHAPE_SCALE, y: 0 },
] as const;

const COLOR1: [number, number, number] = [110, 16, 250];

const SPRING_CONSTANT = 0.1;
const BASE_REST_LENGTH = 100 * SHAPE_SCALE;
const GRAVITY_Y = 0.3;
const DAMPING = 0.96;
const BASE_MARGIN = 20;
const DOT_SCALE = 1 / 0.8;
const WEB_SCALE = 1;
const DOT_RADIUS = (12 * DOT_SCALE) / 2;
const INV_SQRT2 = 1 / Math.SQRT2;
/** Hit area is much larger than the visible handle so corners are easy to grab. */
export const PARTICLE_PICK_RADIUS = Math.max(DOT_RADIUS * 6, 32);
export const PARTICLE_PICK_RADIUS_TOUCH = 48;

export type SpringsCubeInput = {
  pointerX: number;
  pointerY: number;
  pointerDown: boolean;
};

type ParticleKind = "basePoint" | "edgePoint";

class Particle {
  px = 0;
  py = 0;
  vx = 0;
  vy = 0;
  mass = 1;
  damping = DAMPING;
  bFixed = false;
  bLimitVelocities = true;
  bPeriodicBoundaries = true;
  bHardBoundaries = false;
  isEdgePoint = false;

  constructor(kind: ParticleKind) {
    this.isEdgePoint = kind === "edgePoint";
  }

  set(x: number, y: number) {
    this.px = x;
    this.py = y;
    this.vx = 0;
    this.vy = 0;
    this.damping = DAMPING;
    this.mass = 1;
  }

  addForce(fx: number, fy: number) {
    this.vx += fx / this.mass;
    this.vy += fy / this.mass;
  }

  update(width: number, height: number, margin: number) {
    if (this.bFixed) return;

    this.vx *= this.damping;
    this.vy *= this.damping;
    this.limitVelocities();
    this.px += this.vx;
    this.py += this.vy;
    this.handleBoundaries(width, height, margin);
  }

  limitVelocities() {
    if (!this.bLimitVelocities) return;

    const speed = Math.hypot(this.vx, this.vy);
    const maxSpeed = 10;
    if (speed > maxSpeed) {
      this.vx *= maxSpeed / speed;
      this.vy *= maxSpeed / speed;
    }
  }

  handleBoundaries(width: number, height: number, margin: number) {
    if (this.bPeriodicBoundaries) {
      const maxX = width - margin;
      const maxY = height - margin;

      if (this.px > maxX) {
        this.px = maxX;
        this.vx = 0;
      } else if (this.px < margin) {
        this.px = margin;
        this.vx = 0;
      }

      if (this.py > maxY) {
        this.py = maxY;
        this.vy = 0;
      } else if (this.py < margin) {
        this.py = margin;
        this.vy = 0;
      }
    } else if (this.bHardBoundaries) {
      if (this.px >= width) this.vx = Math.abs(this.vx) * -1;
      if (this.px <= 0) this.vx = Math.abs(this.vx);
      if (this.py >= height) this.vy = Math.abs(this.vy) * -1;
      if (this.py <= 0) this.vy = Math.abs(this.vy);
    }
  }
}

export type SpringsCubeSimulation = {
  particles: Particle[];
  width: number;
  height: number;
  restLength: number;
  margin: number;
  frameCount: number;
  clicked: boolean;
  grabbedIndex: number;
  lastGrabbedIndex: number;
};

function getShapeOrigin(
  width: number,
  height: number,
  centerX: number,
  centerY: number,
) {
  const centroidX =
    SHAPE_OFFSETS.reduce((sum, offset) => sum + offset.x, 0) /
    SHAPE_OFFSETS.length;
  const centroidY =
    SHAPE_OFFSETS.reduce((sum, offset) => sum + offset.y, 0) /
    SHAPE_OFFSETS.length;

  return {
    x: centerX - centroidX,
    y: centerY - centroidY,
  };
}

export function createSpringsCubeSimulation(
  width: number,
  height: number,
  centerX: number = width / 2,
  centerY: number = height / 2,
): SpringsCubeSimulation {
  const origin = getShapeOrigin(width, height, centerX, centerY);
  const particles: Particle[] = [];

  for (let i = 0; i < BASE_POINTS * 2; i++) {
    const kind: ParticleKind = i < BASE_POINTS ? "basePoint" : "edgePoint";
    const offset = SHAPE_OFFSETS[i]!;
    const particle = new Particle(kind);
    particle.set(origin.x + offset.x, origin.y + offset.y);
    particles.push(particle);
  }

  return {
    particles,
    width,
    height,
    restLength: BASE_REST_LENGTH,
    margin: BASE_MARGIN,
    frameCount: 0,
    clicked: false,
    grabbedIndex: -1,
    lastGrabbedIndex: 0,
  };
}

export function updateSpringsCubeSimulationBounds(
  sim: SpringsCubeSimulation,
  width: number,
  height: number,
) {
  sim.width = width;
  sim.height = height;
}

export function pickClosestParticle(
  sim: SpringsCubeSimulation,
  x: number,
  y: number,
  pickRadius = PARTICLE_PICK_RADIUS,
) {
  let grabbedIndex = -1;
  let closestDist = Infinity;

  for (let i = 0; i < sim.particles.length; i++) {
    const dx = x - sim.particles[i].px;
    const dy = y - sim.particles[i].py;
    const dist = Math.hypot(dx, dy);
    if (dist < closestDist) {
      closestDist = dist;
      grabbedIndex = i;
    }
  }

  if (closestDist > pickRadius) {
    grabbedIndex = -1;
  }

  sim.grabbedIndex = grabbedIndex;
  if (grabbedIndex > -1) {
    sim.lastGrabbedIndex = grabbedIndex;
  }
}

function applySpringForce(
  sim: SpringsCubeSimulation,
  p: Particle,
  q: Particle,
  factor: number,
) {
  const dx = p.px - q.px;
  const dy = p.py - q.py;
  const dh = factor * Math.hypot(dx, dy) * WEB_SCALE;

  if (dh <= 1) return;

  const distention = dh - sim.restLength;
  const restorativeForce = SPRING_CONSTANT * distention;
  const fx = (dx / dh) * restorativeForce;
  const fy = (dy / dh) * restorativeForce;
  p.addForce(-fx, -fy);
  q.addForce(fx, fy);
}

function drawSpring(
  ctx: CanvasRenderingContext2D,
  p: Particle,
  q: Particle,
  visibility: number,
) {
  ctx.strokeStyle = `rgba(${COLOR1[0]}, ${COLOR1[1]}, ${COLOR1[2]}, ${visibility})`;
  ctx.beginPath();
  ctx.moveTo(p.px, p.py);
  ctx.lineTo(q.px, q.py);
  ctx.stroke();
}

function applySpringForces(sim: SpringsCubeSimulation) {
  const { particles } = sim;

  for (let i = 0; i < BASE_POINTS; i++) {
    const a = particles[i];
    const b = particles[(i + 1) % BASE_POINTS];
    const c = particles[i + BASE_POINTS];

    applySpringForce(sim, a, b, 1);
    applySpringForce(sim, a, c, 1);
  }

  for (let i = BASE_POINTS; i < BASE_POINTS + 3; i++) {
    const a = particles[i];
    const b = particles[i + 1];
    applySpringForce(sim, a, b, 1);
  }

  applySpringForce(sim, particles[0], particles[2], INV_SQRT2);
  applySpringForce(sim, particles[4], particles[3], INV_SQRT2);
  applySpringForce(sim, particles[6], particles[4], INV_SQRT2);
  applySpringForce(sim, particles[2], particles[5], INV_SQRT2);
  applySpringForce(sim, particles[7], particles[2], 2.5);
  applySpringForce(sim, particles[4], particles[1], 2.5);
  applySpringForce(sim, particles[6], particles[3], 0.8);
  applySpringForce(sim, particles[5], particles[0], 0.8);
  applySpringForce(sim, particles[6], particles[0], 0.6);
  applySpringForce(sim, particles[5], particles[3], 0.6);
  applySpringForce(sim, particles[7], particles[4], 1);
}

function fillPolygon(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  indices: number[],
  alpha: number,
) {
  ctx.fillStyle = `rgba(${COLOR1[0]}, ${COLOR1[1]}, ${COLOR1[2]}, ${alpha})`;
  ctx.beginPath();
  const first = particles[indices[0]!];
  ctx.moveTo(first.px, first.py);
  for (let i = 1; i < indices.length; i++) {
    const particle = particles[indices[i]!];
    ctx.lineTo(particle.px, particle.py);
  }
  ctx.closePath();
  ctx.fill();
}

function springVisible(
  pIndex: number,
  qIndex: number,
  factor: number,
): number {
  const isHiddenDiagonal =
    (pIndex === 5 || qIndex === 5) && (pIndex === 1 || qIndex === 1);
  if (isHiddenDiagonal) return 0;
  return factor === 1 ? 1 : 0;
}

export function stepSpringsCubeSimulation(
  sim: SpringsCubeSimulation,
  input: SpringsCubeInput,
) {
  sim.frameCount += 1;

  applySpringForces(sim);

  for (const particle of sim.particles) {
    particle.addForce(0, GRAVITY_Y);
    particle.update(sim.width, sim.height, sim.margin);
  }

  if (input.pointerDown && sim.grabbedIndex > -1) {
    const grabbed = sim.particles[sim.grabbedIndex];
    grabbed.px = input.pointerX;
    grabbed.py = input.pointerY;
    grabbed.vx = 0;
    grabbed.vy = 0;
  }
}

export type DrawSpringsSimulationOptions = {
  /** Paint the white background before drawing. Disable when sharing a canvas. */
  clearBackground?: boolean;
  /** Render the "Grab a point!" idle hint. Disable when sharing a canvas. */
  showHint?: boolean;
};

export function drawSpringsCubeSimulation(
  ctx: CanvasRenderingContext2D,
  sim: SpringsCubeSimulation,
  options: DrawSpringsSimulationOptions = {},
) {
  const { clearBackground = true, showHint = true } = options;
  const { width, height, particles, margin } = sim;

  if (clearBackground) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  fillPolygon(ctx, particles, [2, 3, 7, 1], 100 / 255);
  fillPolygon(ctx, particles, [7, 1, 4], 100 / 255);
  fillPolygon(ctx, particles, [6, 7, 4, 5], 100 / 255);
  fillPolygon(ctx, particles, [7, 3, 0, 4], 50 / 255);
  fillPolygon(ctx, particles, [7, 1, 2, 6], 50 / 255);

  ctx.lineWidth = 1;

  for (let i = 0; i < BASE_POINTS; i++) {
    const a = particles[i];
    const b = particles[(i + 1) % BASE_POINTS];
    const c = particles[i + BASE_POINTS];

    drawSpring(ctx, a, b, springVisible(i, (i + 1) % BASE_POINTS, 1));
    drawSpring(ctx, a, c, 1);
  }

  for (let i = BASE_POINTS; i < BASE_POINTS + 3; i++) {
    const a = particles[i];
    const b = particles[i + 1];
    drawSpring(ctx, a, b, 1);
  }

  drawSpring(ctx, particles[0], particles[2], 0);
  drawSpring(ctx, particles[4], particles[3], 0);
  drawSpring(ctx, particles[6], particles[4], 0);
  drawSpring(ctx, particles[2], particles[5], 0);
  drawSpring(ctx, particles[7], particles[2], 0);
  drawSpring(ctx, particles[4], particles[1], 0);
  drawSpring(ctx, particles[6], particles[3], 0);
  drawSpring(ctx, particles[5], particles[0], 0);
  drawSpring(ctx, particles[6], particles[0], 0);
  drawSpring(ctx, particles[5], particles[3], 0);
  drawSpring(ctx, particles[7], particles[4], 1);

  const dotRadius = DOT_RADIUS;
  for (let i = 0; i < particles.length; i++) {
    if (i === 1) continue;

    const particle = particles[i];
    ctx.strokeStyle = `rgb(${COLOR1[0]}, ${COLOR1[1]}, ${COLOR1[2]})`;
    ctx.fillStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(particle.px, particle.py, dotRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  if (showHint && !sim.clicked && sim.frameCount > 80) {
    const alpha = Math.min(1, (sim.frameCount - 80) / 30) * 0.3;
    ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`;
    ctx.font = "20px Avenir, system-ui, sans-serif";
    ctx.fillText("Grab a point!", margin, height - margin);
  }
}

export type SpringsCubeDisplayLayout = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export function computeSpringsCubeDisplayLayout(): SpringsCubeDisplayLayout {
  return { scale: 1, offsetX: 0, offsetY: 0 };
}

export function mapCanvasPointToSimulation(canvasX: number, canvasY: number) {
  return { x: canvasX, y: canvasY };
}
