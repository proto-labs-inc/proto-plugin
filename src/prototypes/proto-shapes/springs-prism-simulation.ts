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

const BASE_POINTS = 3;
const SHAPE_SCALE = 0.75;

/** Triangular prism in isometric projection (front + back triangle). */
const SHAPE_OFFSETS = [
  { x: 75 * SHAPE_SCALE, y: 0 },
  { x: 0, y: 65 * SHAPE_SCALE },
  { x: 150 * SHAPE_SCALE, y: 65 * SHAPE_SCALE },
  { x: 100 * SHAPE_SCALE, y: 40 * SHAPE_SCALE },
  { x: 25 * SHAPE_SCALE, y: 105 * SHAPE_SCALE },
  { x: 175 * SHAPE_SCALE, y: 105 * SHAPE_SCALE },
] as const;

const COLOR1: [number, number, number] = [252, 192, 40];

const SPRING_CONSTANT = 0.1;
const BASE_REST_LENGTH = 100 * SHAPE_SCALE;
const GRAVITY_Y = 0.3;
const DAMPING = 0.96;
const BASE_MARGIN = 20;
const WEB_SCALE = 1;
const DOT_RADIUS = SHAPE_HANDLE_DOT_RADIUS;
export const PARTICLE_PICK_RADIUS = Math.max(DOT_RADIUS * 6, 32);
export const PARTICLE_PICK_RADIUS_TOUCH = 48;

export type SpringsPrismInput = {
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

    const speed = Math.hypot(this.vx, this.vy);
    const maxSpeed = 10 * physicsScale;
    if (speed > maxSpeed) {
      this.vx *= maxSpeed / speed;
      this.vy *= maxSpeed / speed;
    }

    this.px += this.vx;
    this.py += this.vy;
    clampParticleWithSimulationBoundaries(this, width, height, boundaries);
  }
}

export type SpringsPrismSimulation = {
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

function getShapeOrigin(centerX: number, centerY: number) {
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

export function createSpringsPrismSimulation(
  width: number,
  height: number,
  centerX: number = width / 2,
  centerY: number = height / 2,
): SpringsPrismSimulation {
  const origin = getShapeOrigin(centerX, centerY);
  const particles: Particle[] = [];

  for (let i = 0; i < BASE_POINTS * 2; i++) {
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
    physicsScale: 1,
    margin: BASE_MARGIN,
    frameCount: 0,
    clicked: false,
    grabbedIndex: -1,
    lastGrabbedIndex: 0,
  };
}

export function updateSpringsPrismSimulationBounds(
  sim: SpringsPrismSimulation,
  width: number,
  height: number,
) {
  sim.width = width;
  sim.height = height;
}

export function pickClosestParticle(
  sim: SpringsPrismSimulation,
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
  sim: SpringsPrismSimulation,
  p: Particle,
  q: Particle,
  factor = 1,
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

function applySpringForces(sim: SpringsPrismSimulation) {
  const { particles } = sim;

  for (let i = 0; i < BASE_POINTS; i++) {
    const front = particles[i];
    const back = particles[i + BASE_POINTS];
    const next = particles[(i + 1) % BASE_POINTS];
    const nextBack = particles[((i + 1) % BASE_POINTS) + BASE_POINTS];

    applySpringForce(sim, front, next);
    applySpringForce(sim, back, nextBack);
    applySpringForce(sim, front, back);
  }
}

type DrawColor = [number, number, number];

function fillPolygon(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  indices: number[],
  alpha: number,
  color: DrawColor = COLOR1,
) {
  ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
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

export function stepSpringsPrismSimulation(
  sim: SpringsPrismSimulation,
  input: SpringsPrismInput,
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
  clearBackground?: boolean;
  showHint?: boolean;
  color?: DrawColor;
  texture?: ProtoTextureId;
  /** Scale handle dots relative to the default radius (e.g. partner-page layout scale). */
  dotScale?: number;
  renderScale?: number;
  textureEmanationCorner?: TextureEmanationCorner;
};

export function drawSpringsPrismSimulation(
  ctx: CanvasRenderingContext2D,
  sim: SpringsPrismSimulation,
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
    const anchors = SHAPE_TEXTURE_ANCHORS.prism!;
    const faceBase = {
      particles,
      texture,
      color,
      canvasWidth: width,
      canvasHeight: height,
      backParticleIndex: anchors.backParticleIndex,
      gradientParticleIndices: [0, 3],
      ringParticleIndex: anchors.ringParticleIndex,
      textureEmanationCorner,
      renderScale,
    };
    drawTexturedFace(ctx, { ...faceBase, indices: [0, 1, 4, 3] });
    drawTexturedFace(ctx, { ...faceBase, indices: [1, 2, 5, 4] });
    drawTexturedFace(ctx, { ...faceBase, indices: [2, 0, 3, 5] });
    drawTexturedFace(ctx, { ...faceBase, indices: [0, 1, 2] });
    drawTexturedFace(ctx, { ...faceBase, indices: [3, 4, 5] });
  } else {
    fillPolygon(ctx, particles, [0, 1, 4, 3], 100 / 255, color);
    fillPolygon(ctx, particles, [1, 2, 5, 4], 100 / 255, color);
    fillPolygon(ctx, particles, [2, 0, 3, 5], 75 / 255, color);
    fillPolygon(ctx, particles, [0, 1, 2], 50 / 255, color);
    fillPolygon(ctx, particles, [3, 4, 5], 50 / 255, color);
  }

  ctx.lineWidth = withShapeRenderScale(SHAPE_SPRING_LINE_WIDTH, normalizedSize);

  for (let i = 0; i < BASE_POINTS; i++) {
    const front = particles[i];
    const back = particles[i + BASE_POINTS];
    const next = particles[(i + 1) % BASE_POINTS];

    drawSpring(ctx, front, next, 1, color);
    drawSpring(ctx, back, particles[((i + 1) % BASE_POINTS) + BASE_POINTS], 1, color);
    drawSpring(ctx, front, back, 1, color);
  }

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
