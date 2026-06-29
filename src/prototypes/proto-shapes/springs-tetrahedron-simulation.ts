const BASE_POINTS = 4;
const SHAPE_SCALE = 1;

/** Isometric tetrahedron: apex plus triangular base. */
const SHAPE_OFFSETS = [
  { x: 75 * SHAPE_SCALE, y: 0 },
  { x: 0, y: 65 * SHAPE_SCALE },
  { x: 150 * SHAPE_SCALE, y: 65 * SHAPE_SCALE },
  { x: 75 * SHAPE_SCALE, y: 130 * SHAPE_SCALE },
] as const;

const COLOR1: [number, number, number] = [255, 130, 50];

const SPRING_CONSTANT = 0.1;
const BASE_REST_LENGTH = 100 * SHAPE_SCALE;
const GRAVITY_Y = 0.3;
const DAMPING = 0.96;
const BASE_MARGIN = 20;
const DOT_SCALE = 1 / 0.8;
const WEB_SCALE = 1;
const DOT_RADIUS = (12 * DOT_SCALE) / 2;
export const PARTICLE_PICK_RADIUS = Math.max(DOT_RADIUS * 6, 32);
export const PARTICLE_PICK_RADIUS_TOUCH = 48;

export type SpringsTetrahedronInput = {
  pointerX: number;
  pointerY: number;
  pointerDown: boolean;
};

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

    const speed = Math.hypot(this.vx, this.vy);
    const maxSpeed = 10;
    if (speed > maxSpeed) {
      this.vx *= maxSpeed / speed;
      this.vy *= maxSpeed / speed;
    }

    this.px += this.vx;
    this.py += this.vy;

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
  }
}

export type SpringsTetrahedronSimulation = {
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

export function createSpringsTetrahedronSimulation(
  width: number,
  height: number,
  centerX: number = width / 2,
  centerY: number = height / 2,
): SpringsTetrahedronSimulation {
  const origin = getShapeOrigin(centerX, centerY);
  const particles: Particle[] = [];

  for (let i = 0; i < BASE_POINTS; i++) {
    const offset = SHAPE_OFFSETS[i]!;
    const particle = new Particle();
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

export function updateSpringsTetrahedronSimulationBounds(
  sim: SpringsTetrahedronSimulation,
  width: number,
  height: number,
) {
  sim.width = width;
  sim.height = height;
}

export function pickClosestParticle(
  sim: SpringsTetrahedronSimulation,
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
  sim: SpringsTetrahedronSimulation,
  p: Particle,
  q: Particle,
  factor = 1,
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

function applySpringForces(sim: SpringsTetrahedronSimulation) {
  const { particles } = sim;

  applySpringForce(sim, particles[0], particles[1]);
  applySpringForce(sim, particles[0], particles[2]);
  applySpringForce(sim, particles[0], particles[3]);
  applySpringForce(sim, particles[1], particles[2]);
  applySpringForce(sim, particles[2], particles[3]);
  applySpringForce(sim, particles[3], particles[1]);
}

function fillTriangle(
  ctx: CanvasRenderingContext2D,
  a: Particle,
  b: Particle,
  c: Particle,
  alpha: number,
) {
  ctx.fillStyle = `rgba(${COLOR1[0]}, ${COLOR1[1]}, ${COLOR1[2]}, ${alpha})`;
  ctx.beginPath();
  ctx.moveTo(a.px, a.py);
  ctx.lineTo(b.px, b.py);
  ctx.lineTo(c.px, c.py);
  ctx.closePath();
  ctx.fill();
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

export function stepSpringsTetrahedronSimulation(
  sim: SpringsTetrahedronSimulation,
  input: SpringsTetrahedronInput,
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
  clearBackground?: boolean;
  showHint?: boolean;
};

export function drawSpringsTetrahedronSimulation(
  ctx: CanvasRenderingContext2D,
  sim: SpringsTetrahedronSimulation,
  options: DrawSpringsSimulationOptions = {},
) {
  const { clearBackground = true, showHint = true } = options;
  const { width, height, particles, margin } = sim;
  const [a, b, c, d] = particles;

  if (clearBackground) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  fillTriangle(ctx, a, b, c, 100 / 255);
  fillTriangle(ctx, a, c, d, 75 / 255);
  fillTriangle(ctx, a, d, b, 75 / 255);
  fillTriangle(ctx, b, d, c, 50 / 255);

  ctx.lineWidth = 1;

  drawSpring(ctx, a, b, 1);
  drawSpring(ctx, a, c, 1);
  drawSpring(ctx, a, d, 1);
  drawSpring(ctx, b, c, 0);
  drawSpring(ctx, c, d, 1);
  drawSpring(ctx, d, b, 1);

  const dotRadius = DOT_RADIUS;
  for (const particle of particles) {
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
