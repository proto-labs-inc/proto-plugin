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

const BASE_POINTS = 5;

/**
 * Relative starting positions for the six particles. The five base points plus
 * the apex begin collapsed along a diagonal line (matching the original p5
 * sketch); the springs then pull them apart into a pentagon-with-apex shape.
 */
const SHAPE_OFFSETS = [
  { x: 0, y: 0 },
  { x: 50, y: 50 },
  { x: 100, y: 100 },
  { x: 150, y: 150 },
  { x: 200, y: 200 },
  { x: 250, y: 250 },
] as const;

const COLOR1: [number, number, number] = [16, 196, 226];

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

export type SpringsPentagonInput = {
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

export type SpringsPentagonSimulation = {
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

export function createSpringsPentagonSimulation(
  width: number,
  height: number,
  centerX: number = width / 2,
  centerY: number = height / 2,
): SpringsPentagonSimulation {
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

export function updateSpringsPentagonSimulationBounds(
  sim: SpringsPentagonSimulation,
  width: number,
  height: number,
) {
  sim.width = width;
  sim.height = height;
}

export function pickClosestParticle(
  sim: SpringsPentagonSimulation,
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
  sim: SpringsPentagonSimulation,
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

/**
 * Spring connections mirror the original sketch: the five base points form a
 * closed ring (p[i] -> p[(i + 1) % BASE_POINTS]) and every base point connects
 * to the apex (p[BASE_POINTS]) like spokes of a wheel.
 */
function applySpringForces(sim: SpringsPentagonSimulation) {
  const { particles } = sim;
  const apex = particles[BASE_POINTS];

  for (let i = 0; i < BASE_POINTS; i++) {
    const a = particles[i];
    const b = particles[(i + 1) % BASE_POINTS];

    applySpringForce(sim, a, b);
    applySpringForce(sim, a, apex);
  }
}

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

export function stepSpringsPentagonSimulation(
  sim: SpringsPentagonSimulation,
  input: SpringsPentagonInput,
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

export function drawSpringsPentagonSimulation(
  ctx: CanvasRenderingContext2D,
  sim: SpringsPentagonSimulation,
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
  const apex = particles[BASE_POINTS];
  const normalizedSize = getShapeNormalizedRenderScale(sim.physicsScale);

  if (clearBackground) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  if (texture) {
    const anchors = SHAPE_TEXTURE_ANCHORS.pentagon!;
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
    for (let i = 0; i < BASE_POINTS; i++) {
      drawTexturedFace(ctx, {
        ...faceBase,
        indices: [i, (i + 1) % BASE_POINTS, BASE_POINTS],
      });
    }
  } else {
    const faceAlpha = 75 / 255;
    for (let i = 0; i < BASE_POINTS; i++) {
      const a = particles[i];
      const b = particles[(i + 1) % BASE_POINTS];
      fillTriangle(ctx, a, b, apex, faceAlpha, color);
    }
  }

  ctx.lineWidth = withShapeRenderScale(SHAPE_SPRING_LINE_WIDTH, normalizedSize);

  for (let i = 0; i < BASE_POINTS; i++) {
    const a = particles[i];
    const b = particles[(i + 1) % BASE_POINTS];

    drawSpring(ctx, a, b, 1, color);
    drawSpring(ctx, a, apex, 1, color);
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

export type SpringsPentagonDisplayLayout = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export function computeSpringsPentagonDisplayLayout(): SpringsPentagonDisplayLayout {
  return { scale: 1, offsetX: 0, offsetY: 0 };
}

export function mapCanvasPointToSimulation(canvasX: number, canvasY: number) {
  return { x: canvasX, y: canvasY };
}
