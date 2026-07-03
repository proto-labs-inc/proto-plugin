import {
  drawParticlesWithShadow,
  drawTexturedFace,
  getShapeHandleDotOutlineWidth,
  getShapeHandleDotRadius,
  getShapeNormalizedRenderScale,
  SHAPE_DOT_OUTLINE_WIDTH,
  SHAPE_HANDLE_DOT_RADIUS,
  SHAPE_SPRING_LINE_WIDTH,
  SHAPE_TEXTURE_ANCHORS,
  withShapeRenderScale,
  type ProtoTextureId,
  type TextureEmanationCorner,
} from "./shape-textures";
import {
  clampParticleWithSimulationBoundaries,
  type SpringsSimulationBoundaries,
} from "./springs-simulation-boundaries";

const BASE_POINTS = 4;

const SHAPE_OFFSETS = [
  { x: 0, y: 0 },
  { x: 50, y: 50 },
  { x: 100, y: 100 },
  { x: 150, y: 150 },
  { x: 175, y: 175 },
] as const;

const COLOR1: [number, number, number] = [12, 214, 118];

const SPRING_CONSTANT = 0.1;
const BASE_REST_LENGTH = 100;
const GRAVITY_Y = 0.3;
const DAMPING = 0.96;
const BASE_MARGIN = 20;
const WEB_SCALE = 1;
const DOT_RADIUS = SHAPE_HANDLE_DOT_RADIUS;
/** Hit area is much larger than the visible handle so corners are easy to grab. */
export const PARTICLE_PICK_RADIUS = Math.max(DOT_RADIUS * 6, 32);
export const PARTICLE_PICK_RADIUS_TOUCH = 48;

export type SpringsTriangleInput = {
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

  update(
    width: number,
    height: number,
    boundaries: SpringsSimulationBoundaries,
    physicsScale = 1,
  ) {
    if (this.bFixed) return;

    this.vx *= this.damping;
    this.vy *= this.damping;
    this.limitVelocities(physicsScale);
    this.px += this.vx;
    this.py += this.vy;
    this.handleBoundaries(width, height, boundaries);
  }

  limitVelocities(physicsScale = 1) {
    if (!this.bLimitVelocities) return;

    const speed = Math.hypot(this.vx, this.vy);
    const maxSpeed = 10 * physicsScale;
    if (speed > maxSpeed) {
      this.vx *= maxSpeed / speed;
      this.vy *= maxSpeed / speed;
    }
  }

  handleBoundaries(
    width: number,
    height: number,
    boundaries: SpringsSimulationBoundaries,
  ) {
    if (this.bPeriodicBoundaries) {
      clampParticleWithSimulationBoundaries(this, width, height, boundaries);
    } else if (this.bHardBoundaries) {
      if (this.px >= width) this.vx = Math.abs(this.vx) * -1;
      if (this.px <= 0) this.vx = Math.abs(this.vx);
      if (this.py >= height) this.vy = Math.abs(this.vy) * -1;
      if (this.py <= 0) this.vy = Math.abs(this.vy);
    }
  }
}

export type SpringsTriangleSimulation = {
  particles: Particle[];
  width: number;
  height: number;
  restLength: number;
  physicsScale: number;
  margin: number;
  floorInset?: number;
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

export function createSpringsTriangleSimulation(
  width: number,
  height: number,
  centerX: number = width / 2,
  centerY: number = height / 2,
): SpringsTriangleSimulation {
  const origin = getShapeOrigin(width, height, centerX, centerY);
  const particles: Particle[] = [];

  for (let i = 0; i < BASE_POINTS + 1; i++) {
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
    physicsScale: 1,
    margin: BASE_MARGIN,
    frameCount: 0,
    clicked: false,
    grabbedIndex: -1,
    lastGrabbedIndex: 0,
  };
}

export function updateSpringsTriangleSimulationBounds(
  sim: SpringsTriangleSimulation,
  width: number,
  height: number,
) {
  sim.width = width;
  sim.height = height;
}

export function pickClosestParticle(
  sim: SpringsTriangleSimulation,
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
  sim: SpringsTriangleSimulation,
  p: Particle,
  q: Particle,
  factor: number,
) {
  const dx = p.px - q.px;
  const dy = p.py - q.py;
  const dh = factor * Math.hypot(dx, dy) * WEB_SCALE;

  if (dh <= sim.physicsScale) return;

  const distention = dh - sim.restLength;
  const restorativeForce = SPRING_CONSTANT * distention;
  const fx = (dx / dh) * restorativeForce;
  const fy = (dy / dh) * restorativeForce;
  p.addForce(-fx, -fy);
  q.addForce(fx, fy);
}

type DrawColor = [number, number, number];

function drawSpring(
  ctx: CanvasRenderingContext2D,
  p: Particle,
  q: Particle,
  visibility: number,
  color: DrawColor = COLOR1,
) {
  ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${visibility})`;
  ctx.beginPath();
  ctx.moveTo(p.px, p.py);
  ctx.lineTo(q.px, q.py);
  ctx.stroke();
}

function applySpringForces(sim: SpringsTriangleSimulation) {
  const { particles } = sim;

  for (let i = 0; i < BASE_POINTS; i++) {
    const a = particles[i];
    const b = particles[(i + 1) % BASE_POINTS];
    const c = particles[BASE_POINTS];
    const isBackBaseEdge = i === 1 || i === 3;

    applySpringForce(sim, a, b, isBackBaseEdge ? 1.28 : 1.14);
    applySpringForce(sim, a, c, 0.85);
  }

  applySpringForce(sim, particles[2], particles[0], 1.86);
  applySpringForce(sim, particles[1], particles[3], 1.86);
}

function fillPolygon(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  indices: number[],
  alpha: number,
  color: DrawColor = COLOR1,
) {
  ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
  ctx.beginPath();
  const first = particles[indices[0]];
  ctx.moveTo(first.px, first.py);
  for (let i = 1; i < indices.length; i++) {
    const particle = particles[indices[i]];
    ctx.lineTo(particle.px, particle.py);
  }
  ctx.closePath();
  ctx.fill();
}

export function stepSpringsTriangleSimulation(
  sim: SpringsTriangleSimulation,
  input: SpringsTriangleInput,
) {
  sim.frameCount += 1;

  applySpringForces(sim);

  for (const particle of sim.particles) {
    particle.addForce(0, GRAVITY_Y * sim.physicsScale);
    particle.update(
      sim.width,
      sim.height,
      { margin: sim.margin, floorInset: sim.floorInset },
      sim.physicsScale,
    );
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
  color?: DrawColor;
  texture?: ProtoTextureId;
  /** Scale handle dots relative to the default radius (e.g. partner-page layout scale). */
  dotScale?: number;
  renderScale?: number;
  textureEmanationCorner?: TextureEmanationCorner;
};

export function drawSpringsTriangleSimulation(
  ctx: CanvasRenderingContext2D,
  sim: SpringsTriangleSimulation,
  options: DrawSpringsSimulationOptions = {},
) {
  const {
    clearBackground = true,
    showHint = true,
    color = COLOR1,
    texture,
    dotScale = 1,
    renderScale = 1,
    textureEmanationCorner,
  } = options;
  const { width, height, particles, margin } = sim;
  const normalizedSize = getShapeNormalizedRenderScale(sim.physicsScale);

  if (clearBackground) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  if (texture) {
    const anchors = SHAPE_TEXTURE_ANCHORS.triangle!;
    const faceBase = {
      particles,
      texture,
      color,
      canvasWidth: width,
      canvasHeight: height,
      textureEmanationCorner,
      renderScale,
      ...anchors,
    };
    drawTexturedFace(ctx, { ...faceBase, indices: [0, 1, 3, 2] });
    drawTexturedFace(ctx, { ...faceBase, indices: [0, 1, 4] });
    drawTexturedFace(ctx, { ...faceBase, indices: [2, 3, 4] });
  } else {
    fillPolygon(ctx, particles, [0, 1, 3, 2], 50 / 255, color);
    fillPolygon(ctx, particles, [0, 1, 4], 100 / 255, color);
    fillPolygon(ctx, particles, [2, 3, 4], 100 / 255, color);
  }

  ctx.lineWidth = withShapeRenderScale(SHAPE_SPRING_LINE_WIDTH, normalizedSize);

  for (let i = 0; i < BASE_POINTS; i++) {
    const a = particles[i];
    const b = particles[(i + 1) % BASE_POINTS];
    const c = particles[BASE_POINTS];

    drawSpring(ctx, a, b, i === 0 || i === 2 ? 1 : 0, color);
    drawSpring(ctx, a, c, 1, color);
  }

  drawSpring(ctx, particles[2], particles[0], 1, color);
  drawSpring(ctx, particles[1], particles[3], 1, color);

  const dotRadius = getShapeHandleDotRadius(dotScale, normalizedSize);
  if (texture) {
    drawParticlesWithShadow(ctx, particles, dotRadius, color, normalizedSize);
  } else {
    for (const particle of particles) {
      ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      ctx.fillStyle = "#ffffff";
      ctx.lineWidth = getShapeHandleDotOutlineWidth(normalizedSize);
      ctx.beginPath();
      ctx.arc(particle.px, particle.py, dotRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  if (showHint && !sim.clicked && sim.frameCount > 80) {
    const alpha = Math.min(1, (sim.frameCount - 80) / 30) * 0.3;
    ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`;
    ctx.font = "20px Avenir, system-ui, sans-serif";
    ctx.fillText("Grab a point!", margin, height - margin);
  }
}

export type SpringsTriangleDisplayLayout = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export function computeSpringsTriangleDisplayLayout(): SpringsTriangleDisplayLayout {
  return { scale: 1, offsetX: 0, offsetY: 0 };
}

export function mapCanvasPointToSimulation(canvasX: number, canvasY: number) {
  return { x: canvasX, y: canvasY };
}
