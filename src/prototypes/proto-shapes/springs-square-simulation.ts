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

const J1_INDEX = 0;
const J2_INDEX = 1;
const LEFT_BASE = [2, 3, 4] as const;
const MIDDLE_APEX = 5;
const MIDDLE_BACK = 6;
const RIGHT_BASE = [7, 8, 9] as const;
const PARTICLE_COUNT = 10;
/** Tuned so the three-pyramid chain matches other shapes after warm start (~130px span). */
const SHAPE_SCALE = 0.46;

/** Three pyramids in a row; adjacent pairs meet at shared joint vertices. */
const PYRAMIDS = [
  { apex: J1_INDEX, base: LEFT_BASE },
  { apex: MIDDLE_APEX, base: [J1_INDEX, J2_INDEX, MIDDLE_BACK] as const },
  { apex: J2_INDEX, base: RIGHT_BASE },
] as const;

/** Three pyramids: outer pair point up, middle points down; J1/J2 sit on opposite top corners. */
const SHAPE_OFFSETS = [
  { x: 80 * SHAPE_SCALE, y: 60 * SHAPE_SCALE }, // 0 J1 — left inner joint
  { x: 220 * SHAPE_SCALE, y: 60 * SHAPE_SCALE }, // 1 J2 — right inner joint
  { x: 30 * SHAPE_SCALE, y: 160 * SHAPE_SCALE }, // 2 left outer base
  { x: 90 * SHAPE_SCALE, y: 160 * SHAPE_SCALE }, // 3
  { x: 30 * SHAPE_SCALE, y: 110 * SHAPE_SCALE }, // 4
  { x: 150 * SHAPE_SCALE, y: 160 * SHAPE_SCALE }, // 5 middle apex (down)
  { x: 150 * SHAPE_SCALE, y: 20 * SHAPE_SCALE }, // 6 middle back (top center)
  { x: 210 * SHAPE_SCALE, y: 160 * SHAPE_SCALE }, // 7 right outer base
  { x: 270 * SHAPE_SCALE, y: 160 * SHAPE_SCALE }, // 8
  { x: 270 * SHAPE_SCALE, y: 110 * SHAPE_SCALE }, // 9
] as const;

const COLOR1: [number, number, number] = [252, 56, 140];

const SPRING_CONSTANT = 0.1;
const BASE_REST_LENGTH = 100 * SHAPE_SCALE;
const GRAVITY_Y = 0.3;
const DAMPING = 0.96;
const BASE_MARGIN = 20;
const WEB_SCALE = 1;
const DOT_RADIUS = SHAPE_HANDLE_DOT_RADIUS;
export const PARTICLE_PICK_RADIUS = Math.max(DOT_RADIUS * 6, 32);
export const PARTICLE_PICK_RADIUS_TOUCH = 48;

export type SpringsSquareInput = {
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

export type SpringsSquareSimulation = {
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

export function createSpringsSquareSimulation(
  width: number,
  height: number,
  centerX: number = width / 2,
  centerY: number = height / 2,
): SpringsSquareSimulation {
  const origin = getShapeOrigin(centerX, centerY);
  const particles: Particle[] = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
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

export function updateSpringsSquareSimulationBounds(
  sim: SpringsSquareSimulation,
  width: number,
  height: number,
) {
  sim.width = width;
  sim.height = height;
}

export function pickClosestParticle(
  sim: SpringsSquareSimulation,
  x: number,
  y: number,
  pickRadius = PARTICLE_PICK_RADIUS,
) {
  let grabbedIndex = -1;
  let closestDist = Infinity;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
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
  sim: SpringsSquareSimulation,
  p: Particle,
  q: Particle,
) {
  const dx = p.px - q.px;
  const dy = p.py - q.py;
  const dh = Math.hypot(dx, dy) * WEB_SCALE;

  if (dh <= sim.physicsScale) return;

  const distention = dh - sim.restLength;
  const restorativeForce = SPRING_CONSTANT * distention;
  const fx = (dx / dh) * restorativeForce;
  const fy = (dy / dh) * restorativeForce;
  p.addForce(-fx, -fy);
  q.addForce(fx, fy);
}

function applyPyramidSprings(
  sim: SpringsSquareSimulation,
  apexIndex: number,
  baseIndices: readonly number[],
) {
  const { particles } = sim;
  const apex = particles[apexIndex]!;

  for (const baseIndex of baseIndices) {
    applySpringForce(sim, apex, particles[baseIndex]!);
  }

  for (let i = 0; i < baseIndices.length; i++) {
    const a = particles[baseIndices[i]!]!;
    const b = particles[baseIndices[(i + 1) % baseIndices.length]!]!;
    applySpringForce(sim, a, b);
  }
}

function applySpringForces(sim: SpringsSquareSimulation) {
  for (const pyramid of PYRAMIDS) {
    applyPyramidSprings(sim, pyramid.apex, pyramid.base);
  }
}

function buildSpringPairSet() {
  const pairs = new Set<string>();
  const addPair = (a: number, b: number) => {
    pairs.add(a < b ? `${a},${b}` : `${b},${a}`);
  };

  for (const pyramid of PYRAMIDS) {
    for (const baseIndex of pyramid.base) {
      addPair(pyramid.apex, baseIndex);
    }
    for (let i = 0; i < pyramid.base.length; i++) {
      addPair(pyramid.base[i]!, pyramid.base[(i + 1) % pyramid.base.length]!);
    }
  }

  return pairs;
}

/** Spring-connected pairs skip self-collision so joints can still fold. */
export const SQUARE_SPRING_PAIRS = buildSpringPairSet();

export const SQUARE_COLLISION_EDGES = [
  [2, 3],
  [3, 4],
  [4, 2],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 7],
  [1, 8],
  [1, 9],
  [7, 8],
  [8, 9],
  [9, 7],
  [0, 5],
  [5, 6],
  [6, 1],
  [5, 1],
  [5, 0],
  [6, 0],
  [6, 1],
] as const;

type DrawColor = [number, number, number];

function fillTriangle(
  ctx: CanvasRenderingContext2D,
  a: Particle,
  b: Particle,
  c: Particle,
  alpha: number,
  color: DrawColor = COLOR1,
) {
  ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
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
  color: DrawColor = COLOR1,
) {
  ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  ctx.beginPath();
  ctx.moveTo(p.px, p.py);
  ctx.lineTo(q.px, q.py);
  ctx.stroke();
}

function drawTexturedPyramidFaces(
  ctx: CanvasRenderingContext2D,
  apexIndex: number,
  baseIndices: readonly number[],
  particles: Particle[],
  texture: ProtoTextureId,
  color: DrawColor,
  canvasWidth: number,
  canvasHeight: number,
  textureEmanationCorner?: TextureEmanationCorner,
  renderScale = 1,
) {
  const anchors = SHAPE_TEXTURE_ANCHORS.square!;
  const faceBase = {
    particles,
    texture,
    color,
    canvasWidth,
    canvasHeight,
    backParticleIndex: anchors.backParticleIndex,
    gradientParticleIndices: [J1_INDEX, J2_INDEX],
    gradientWorldSpace: true,
    ringParticleIndex: anchors.ringParticleIndex,
    textureEmanationCorner,
    renderScale,
  };
  const [aIdx, bIdx, cIdx] = baseIndices;
  drawTexturedFace(ctx, { ...faceBase, indices: [apexIndex, aIdx!, bIdx!] });
  drawTexturedFace(ctx, { ...faceBase, indices: [apexIndex, bIdx!, cIdx!] });
  drawTexturedFace(ctx, { ...faceBase, indices: [apexIndex, cIdx!, aIdx!] });
  drawTexturedFace(ctx, { ...faceBase, indices: [aIdx!, bIdx!, cIdx!] });
}

function drawPyramidFaces(
  ctx: CanvasRenderingContext2D,
  apexIndex: number,
  baseIndices: readonly number[],
  particles: Particle[],
  color: DrawColor = COLOR1,
) {
  const apex = particles[apexIndex]!;
  const [a, b, c] = baseIndices.map((index) => particles[index]!);
  fillTriangle(ctx, apex, a, b, 100 / 255, color);
  fillTriangle(ctx, apex, b, c, 85 / 255, color);
  fillTriangle(ctx, apex, c, a, 75 / 255, color);
  fillTriangle(ctx, a, b, c, 50 / 255, color);
}

function drawPyramidSprings(
  ctx: CanvasRenderingContext2D,
  apexIndex: number,
  baseIndices: readonly number[],
  particles: Particle[],
  color: DrawColor = COLOR1,
) {
  const apex = particles[apexIndex]!;

  for (const baseIndex of baseIndices) {
    drawSpring(ctx, apex, particles[baseIndex]!, color);
  }

  for (let i = 0; i < baseIndices.length; i++) {
    const a = particles[baseIndices[i]!]!;
    const b = particles[baseIndices[(i + 1) % baseIndices.length]!]!;
    drawSpring(ctx, a, b, color);
  }
}

export function stepSpringsSquareSimulation(
  sim: SpringsSquareSimulation,
  input: SpringsSquareInput,
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

export function drawSpringsSquareSimulation(
  ctx: CanvasRenderingContext2D,
  sim: SpringsSquareSimulation,
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

  for (const pyramid of PYRAMIDS) {
    if (texture) {
      drawTexturedPyramidFaces(
        ctx,
        pyramid.apex,
        pyramid.base,
        particles,
        texture,
        color,
        width,
        height,
        textureEmanationCorner,
        renderScale,
      );
    } else {
      drawPyramidFaces(ctx, pyramid.apex, pyramid.base, particles, color);
    }
  }

  ctx.lineWidth = withShapeRenderScale(SHAPE_SPRING_LINE_WIDTH, normalizedSize);

  for (const pyramid of PYRAMIDS) {
    drawPyramidSprings(ctx, pyramid.apex, pyramid.base, particles, color);
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
