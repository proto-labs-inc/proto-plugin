"use client";

import { PrototypeComponent } from "proto-plugin";
import { useEffect, useRef } from "react";

import {
  createSpringsCubeSimulation,
  drawSpringsCubeSimulation,
  pickClosestParticle as pickClosestCubeParticle,
  stepSpringsCubeSimulation,
  updateSpringsCubeSimulationBounds,
  type SpringsCubeSimulation,
} from "../proto-shapes/springs-cube-simulation";
import {
  createSpringsPentagonSimulation,
  drawSpringsPentagonSimulation,
  pickClosestParticle as pickClosestPentagonParticle,
  stepSpringsPentagonSimulation,
  updateSpringsPentagonSimulationBounds,
  type SpringsPentagonSimulation,
} from "../proto-shapes/springs-pentagon-simulation";
import {
  createSpringsPrismSimulation,
  drawSpringsPrismSimulation,
  pickClosestParticle as pickClosestPrismParticle,
  stepSpringsPrismSimulation,
  updateSpringsPrismSimulationBounds,
  type SpringsPrismSimulation,
} from "../proto-shapes/springs-prism-simulation";
import {
  createSpringsSquareSimulation,
  drawSpringsSquareSimulation,
  pickClosestParticle as pickClosestSquareParticle,
  stepSpringsSquareSimulation,
  updateSpringsSquareSimulationBounds,
  type SpringsSquareSimulation,
} from "../proto-shapes/springs-square-simulation";
import {
  createSpringsTriangleSimulation,
  drawSpringsTriangleSimulation,
  PARTICLE_PICK_RADIUS,
  PARTICLE_PICK_RADIUS_TOUCH,
  pickClosestParticle as pickClosestTriangleParticle,
  stepSpringsTriangleSimulation,
  updateSpringsTriangleSimulationBounds,
  type SpringsTriangleSimulation,
} from "../proto-shapes/springs-triangle-simulation";

import {
  DEFAULT_PROTO_COLOR_ID,
  getProtoColor,
  type ProtoColorId,
  type ProtoRgb,
  type ProtoShapeId,
  type ProtoTextureId,
} from "./_components/proto-shape-content";
import { bindSpringsCanvasPointerHandlers } from "../proto-shapes/springs-canvas-pointer";
import {
  getDragAttributionTooltipOffsetY,
  getParticlesCentroid,
  updateDragAttributionTooltipElement,
} from "../proto-shapes/springs-drag-attribution-tooltip";
import { DragAttributionTooltipLayer } from "../proto-shapes/drag-attribution-tooltip-layer";
import {
  DEFAULT_PROTO_TEXTURE_ID,
  getShapeHandleDotOutlineWidth,
  getShapeHandleDotRadius,
  getPrototypeShapeLayoutScales,
  SHAPE_SPRING_LINE_WIDTH,
  withShapeRenderScale,
} from "../proto-shapes/shape-textures";
import { scaleSpringsSimulationAroundCentroid } from "../proto-shapes/springs-physics-scale";

type CanvasSize = {
  cssWidth: number;
  cssHeight: number;
  dpr: number;
};

type PointerInput = {
  pointerX: number;
  pointerY: number;
  pointerDown: boolean;
};

type SpringsSimulation =
  | SpringsTriangleSimulation
  | SpringsCubeSimulation
  | SpringsPentagonSimulation
  | SpringsPrismSimulation
  | SpringsSquareSimulation;

type ShapeRuntime = {
  create: (
    width: number,
    height: number,
    x: number,
    y: number,
  ) => SpringsSimulation;
  updateBounds: (sim: SpringsSimulation, width: number, height: number) => void;
  pick: (
    sim: SpringsSimulation,
    x: number,
    y: number,
    pickRadius: number,
  ) => void;
  step: (sim: SpringsSimulation, input: PointerInput) => void;
  draw: (
    ctx: CanvasRenderingContext2D,
    sim: SpringsSimulation,
    color: ProtoRgb,
    texture: ProtoTextureId,
    dotScale: number,
    renderScale: number,
  ) => void;
};

const SHAPE_RUNTIMES: Record<ProtoShapeId, ShapeRuntime> = {
  triangle: {
    create: (width, height, x, y) =>
      createSpringsTriangleSimulation(width, height, x, y),
    updateBounds: (sim, width, height) =>
      updateSpringsTriangleSimulationBounds(
        sim as SpringsTriangleSimulation,
        width,
        height,
      ),
    pick: (sim, x, y, pickRadius) =>
      pickClosestTriangleParticle(
        sim as SpringsTriangleSimulation,
        x,
        y,
        pickRadius,
      ),
    step: (sim, input) =>
      stepSpringsTriangleSimulation(sim as SpringsTriangleSimulation, input),
    draw: (ctx, sim, color, texture, dotScale, renderScale) =>
      drawSpringsTriangleSimulation(ctx, sim as SpringsTriangleSimulation, {
        clearBackground: false,
        showHint: false,
        color,
        texture,
        dotScale,
        renderScale,
      }),
  },
  cube: {
    create: (width, height, x, y) =>
      createSpringsCubeSimulation(width, height, x, y),
    updateBounds: (sim, width, height) =>
      updateSpringsCubeSimulationBounds(
        sim as SpringsCubeSimulation,
        width,
        height,
      ),
    pick: (sim, x, y, pickRadius) =>
      pickClosestCubeParticle(sim as SpringsCubeSimulation, x, y, pickRadius),
    step: (sim, input) =>
      stepSpringsCubeSimulation(sim as SpringsCubeSimulation, input),
    draw: (ctx, sim, color, texture, dotScale, renderScale) =>
      drawSpringsCubeSimulation(ctx, sim as SpringsCubeSimulation, {
        clearBackground: false,
        showHint: false,
        color,
        texture,
        dotScale,
        renderScale,
      }),
  },
  pentagon: {
    create: (width, height, x, y) =>
      createSpringsPentagonSimulation(width, height, x, y),
    updateBounds: (sim, width, height) =>
      updateSpringsPentagonSimulationBounds(
        sim as SpringsPentagonSimulation,
        width,
        height,
      ),
    pick: (sim, x, y, pickRadius) =>
      pickClosestPentagonParticle(
        sim as SpringsPentagonSimulation,
        x,
        y,
        pickRadius,
      ),
    step: (sim, input) =>
      stepSpringsPentagonSimulation(sim as SpringsPentagonSimulation, input),
    draw: (ctx, sim, color, texture, dotScale, renderScale) =>
      drawSpringsPentagonSimulation(ctx, sim as SpringsPentagonSimulation, {
        clearBackground: false,
        showHint: false,
        color,
        texture,
        dotScale,
        renderScale,
      }),
  },
  square: {
    create: (width, height, x, y) =>
      createSpringsSquareSimulation(width, height, x, y),
    updateBounds: (sim, width, height) =>
      updateSpringsSquareSimulationBounds(
        sim as SpringsSquareSimulation,
        width,
        height,
      ),
    pick: (sim, x, y, pickRadius) =>
      pickClosestSquareParticle(
        sim as SpringsSquareSimulation,
        x,
        y,
        pickRadius,
      ),
    step: (sim, input) =>
      stepSpringsSquareSimulation(sim as SpringsSquareSimulation, input),
    draw: (ctx, sim, color, texture, dotScale, renderScale) =>
      drawSpringsSquareSimulation(ctx, sim as SpringsSquareSimulation, {
        clearBackground: false,
        showHint: false,
        color,
        texture,
        dotScale,
        renderScale,
      }),
  },
  prism: {
    create: (width, height, x, y) =>
      createSpringsPrismSimulation(width, height, x, y),
    updateBounds: (sim, width, height) =>
      updateSpringsPrismSimulationBounds(
        sim as SpringsPrismSimulation,
        width,
        height,
      ),
    pick: (sim, x, y, pickRadius) =>
      pickClosestPrismParticle(sim as SpringsPrismSimulation, x, y, pickRadius),
    step: (sim, input) =>
      stepSpringsPrismSimulation(sim as SpringsPrismSimulation, input),
    draw: (ctx, sim, color, texture, dotScale, renderScale) =>
      drawSpringsPrismSimulation(ctx, sim as SpringsPrismSimulation, {
        clearBackground: false,
        showHint: false,
        color,
        texture,
        dotScale,
        renderScale,
      }),
  },
};

const COLOR_TRANSITION_SPEED = 0.16;

function lerpRgb(from: ProtoRgb, to: ProtoRgb, t: number): ProtoRgb {
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
    from[2] + (to[2] - from[2]) * t,
  ];
}

function rgbNearEqual(a: ProtoRgb, b: ProtoRgb, epsilon = 0.5): boolean {
  return (
    Math.abs(a[0] - b[0]) <= epsilon &&
    Math.abs(a[1] - b[1]) <= epsilon &&
    Math.abs(a[2] - b[2]) <= epsilon
  );
}

const PARTNER_MOBILE_MAX_WIDTH_QUERY = "(max-width: 639px)";
const MOBILE_SHAPE_SCALE = 1.35;
/** Give the protoshape more room on desktop invite/home layouts. */
const DESKTOP_SHAPE_SCALE = 1.75;
/** Vertical spawn / rest placement as a fraction of canvas height. */
const SHAPE_SPAWN_Y_FACTOR = 0.42;
/** Raise the gravity floor so settled shapes sit above the canvas bottom. */
const PARTNER_SHAPE_REST_FLOOR_FACTOR = 0.98;
const WARM_START_FRAMES = 120;
/**
 * If the sim is created while the canvas is shorter than this, the shape gets
 * clamped between the top and bottom margins into a flat horizontal line — and
 * a collinear line never recovers, because the springs only push along it. This
 * happens at mount/remount before layout settles, so we wait for a real height
 * and recreate the sim if it was last sized while too short.
 */
const MIN_VALID_CANVAS_HEIGHT = 120;

export function getIsMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(PARTNER_MOBILE_MAX_WIDTH_QUERY).matches;
}

export function subscribeToMobileViewport(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(PARTNER_MOBILE_MAX_WIDTH_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function isMobileViewport() {
  return getIsMobileViewport();
}

function getPartnerShapeLayout(
  cssHeight: number,
  shapeId: ProtoShapeId,
  visualScale = 1,
) {
  const mobile = isMobileViewport();
  const baseScale = mobile ? MOBILE_SHAPE_SCALE : DESKTOP_SHAPE_SCALE;
  const { shapeScale, dotScale, renderScale, normalizedRenderScale } =
    getPrototypeShapeLayoutScales({
      layoutShapeScale: baseScale,
      visualScale,
      isThreePartShape: shapeId === "square",
    });
  return {
    scale: shapeScale,
    dotScale,
    renderScale,
    normalizedRenderScale,
    spawnY: cssHeight * SHAPE_SPAWN_Y_FACTOR,
  };
}

function getSimulationCentroid(sim: SpringsSimulation) {
  let sumX = 0;
  let sumY = 0;
  for (const particle of sim.particles) {
    sumX += particle.px;
    sumY += particle.py;
  }
  const count = sim.particles.length;
  return { x: sumX / count, y: sumY / count };
}

type SimulationPose = {
  centroid: { x: number; y: number };
  angle: number;
  scale: number;
};

function getSimulationPose(sim: SpringsSimulation): SimulationPose {
  const centroid = getSimulationCentroid(sim);
  let sumXX = 0;
  let sumYY = 0;
  let sumXY = 0;
  let sumDistSq = 0;
  const count = sim.particles.length;

  for (const particle of sim.particles) {
    const dx = particle.px - centroid.x;
    const dy = particle.py - centroid.y;
    sumXX += dx * dx;
    sumYY += dy * dy;
    sumXY += dx * dy;
    sumDistSq += dx * dx + dy * dy;
  }

  return {
    centroid,
    angle: 0.5 * Math.atan2(2 * sumXY, sumXX - sumYY),
    scale: Math.sqrt(sumDistSq / count),
  };
}

function applySimulationPose(
  sim: SpringsSimulation,
  targetPose: SimulationPose,
  defaultPose: SimulationPose,
  preserveScale = true,
) {
  const rotation = targetPose.angle - defaultPose.angle;
  const scaleFactor =
    preserveScale && defaultPose.scale > 0
      ? targetPose.scale / defaultPose.scale
      : 1;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const currentCentroid = getSimulationCentroid(sim);
  const { x: targetX, y: targetY } = targetPose.centroid;

  for (const particle of sim.particles) {
    let dx = particle.px - currentCentroid.x;
    let dy = particle.py - currentCentroid.y;
    dx *= scaleFactor;
    dy *= scaleFactor;
    const rdx = dx * cos - dy * sin;
    const rdy = dx * sin + dy * cos;
    particle.px = targetX + rdx;
    particle.py = targetY + rdy;
    particle.vx = 0;
    particle.vy = 0;
  }

  if (scaleFactor !== 1) {
    sim.restLength *= scaleFactor;
    sim.physicsScale *= scaleFactor;
  }
}

function getShapeRestPoint(
  cssWidth: number,
  cssHeight: number,
  shapeId: ProtoShapeId,
) {
  const { spawnY } = getPartnerShapeLayout(cssHeight, shapeId);
  return {
    x: cssWidth * 0.5,
    y: spawnY,
  };
}

function warmStartSimulation(runtime: ShapeRuntime, sim: SpringsSimulation) {
  const idleInput: PointerInput = {
    pointerX: 0,
    pointerY: 0,
    pointerDown: false,
  };

  for (let i = 0; i < WARM_START_FRAMES; i += 1) {
    runtime.step(sim, idleInput);
  }
}

/**
 * Shrink the (already correctly-shaped) sim down to a near-point at the given
 * target, keeping the relative structure and leaving restLength alone. With dh
 * now far below restLength, the springs see a large distention and explode the
 * shape outward into its full form on the first live frames — a "pop" that
 * originates from the target location.
 */
const INITIAL_POP_COLLAPSE_FACTOR = 0.04;

function collapseShapeForPop(
  sim: SpringsSimulation,
  targetX: number,
  targetY: number,
) {
  const centroid = getSimulationCentroid(sim);
  for (const particle of sim.particles) {
    particle.px =
      targetX + (particle.px - centroid.x) * INITIAL_POP_COLLAPSE_FACTOR;
    particle.py =
      targetY + (particle.py - centroid.y) * INITIAL_POP_COLLAPSE_FACTOR;
    particle.vx = 0;
    particle.vy = 0;
  }
}

function resolveEffectiveShapeMargin(
  cssHeight: number,
  shapeId: ProtoShapeId,
  visualScale: number,
  dotBoost: number,
  shapeMargin?: number,
) {
  if (shapeMargin == null) return undefined;

  const { dotScale, normalizedRenderScale } = getPartnerShapeLayout(
    cssHeight,
    shapeId,
    visualScale,
  );
  const renderBleed =
    getShapeHandleDotRadius(dotScale * dotBoost, normalizedRenderScale) +
    getShapeHandleDotOutlineWidth(normalizedRenderScale) +
    withShapeRenderScale(SHAPE_SPRING_LINE_WIDTH, normalizedRenderScale) / 2;

  return Math.ceil(shapeMargin + renderBleed);
}

function getPartnerShapeFloorInset(cssHeight: number, margin: number) {
  return Math.ceil(cssHeight * (1 - PARTNER_SHAPE_REST_FLOOR_FACTOR) + margin);
}

function applyShapeMargin(
  sim: SpringsSimulation,
  cssHeight: number,
  shapeId: ProtoShapeId,
  visualScale: number,
  dotBoost: number,
  shapeMargin?: number,
) {
  const resolved = resolveEffectiveShapeMargin(
    cssHeight,
    shapeId,
    visualScale,
    dotBoost,
    shapeMargin,
  );
  if (resolved != null) {
    sim.margin = resolved;
  }
}

function applyPartnerShapePhysicsBounds(
  sim: SpringsSimulation,
  cssHeight: number,
  shapeId: ProtoShapeId,
  visualScale: number,
  dotBoost: number,
  shapeMargin: number | undefined,
  embedded: boolean,
) {
  applyShapeMargin(
    sim,
    cssHeight,
    shapeId,
    visualScale,
    dotBoost,
    shapeMargin,
  );
  sim.floorInset = embedded
    ? undefined
    : getPartnerShapeFloorInset(cssHeight, sim.margin);
}

type CreateSimulationOptions = {
  preservedPose?: SimulationPose | null;
  /** When false, only position + rotation carry over; scale stays at the new shape's default. */
  preserveScale?: boolean;
  /** Override sim boundary inset — smaller values let the shape travel closer to canvas edges. */
  shapeMargin?: number;
  embedded?: boolean;
};

function createSimulationAtSpawn(
  runtime: ShapeRuntime,
  cssWidth: number,
  cssHeight: number,
  shapeId: ProtoShapeId,
  spawnPoint: { x: number; y: number } | null,
  options: CreateSimulationOptions = {},
  visualScale = 1,
  dotBoost = 1,
) {
  const isInitialReveal = spawnPoint === null && !options.preservedPose;
  const spawn = spawnPoint ?? getShapeRestPoint(cssWidth, cssHeight, shapeId);
  const sim = runtime.create(cssWidth, cssHeight, spawn.x, spawn.y);
  const { scale } = getPartnerShapeLayout(cssHeight, shapeId, visualScale);
  scaleSpringsSimulationAroundCentroid(sim, scale);

  if (options.preservedPose) {
    warmStartSimulation(runtime, sim);
    const defaultPose = getSimulationPose(sim);
    applySimulationPose(
      sim,
      options.preservedPose,
      defaultPose,
      options.preserveScale ?? true,
    );
  } else if (isInitialReveal) {
    // Pre-settle into the resolved shape, then collapse it to a point at the
    // screen center so the springs pop it back open from the middle on the
    // first rendered frames.
    warmStartSimulation(runtime, sim);
    collapseShapeForPop(sim, cssWidth * 0.5, cssHeight * 0.5);
  } else {
    warmStartSimulation(runtime, sim);
  }

  applyPartnerShapePhysicsBounds(
    sim,
    cssHeight,
    shapeId,
    visualScale,
    dotBoost,
    options.shapeMargin,
    options.embedded ?? false,
  );
  return sim;
}

function setupHiDpiCanvas(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number,
) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  return dpr;
}

type PartnerShapeCanvasProps = {
  className?: string;
  shapeId?: ProtoShapeId;
  colorId?: ProtoColorId;
  textureId?: ProtoTextureId;
  color?: ProtoRgb;
  /** Skip opaque white clears so copy layered beneath stays visible. */
  transparentBackground?: boolean;
  /** Canvas fill color when not transparent. Defaults to white. */
  backgroundColor?: string;
  /** Uniform render scale — scales sim geometry, strokes, and dots together. */
  shapeScale?: number;
  /** Extra multiplier on handle dots when shapeScale is below 1. */
  shapeDotBoost?: number;
  /** Tighter boundary inset so the shape can reach closer to canvas edges. */
  shapeMargin?: number;
  /** Fill a positioned parent (e.g. submit-modal card inset). */
  embedded?: boolean;
  prototypeId?: string;
  /** Shown in a tooltip above the shape while it is dragged. */
  dragAttributionLabel?: string;
};

export function PartnerShapeCanvas({
  className,
  shapeId = "cube",
  colorId,
  textureId = DEFAULT_PROTO_TEXTURE_ID,
  color,
  transparentBackground = false,
  backgroundColor = "#ffffff",
  shapeScale = 1,
  shapeDotBoost = 1,
  shapeMargin,
  embedded = false,
  prototypeId = "partner-shape-canvas",
  dragAttributionLabel,
}: PartnerShapeCanvasProps) {
  const resolvedColor =
    color ?? getProtoColor(colorId ?? DEFAULT_PROTO_COLOR_ID).rgb;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragTooltipRef = useRef<HTMLDivElement>(null);
  const dragTooltipLabelRef = useRef<HTMLSpanElement>(null);
  const dragAttributionLabelRef = useRef(dragAttributionLabel);
  dragAttributionLabelRef.current = dragAttributionLabel;
  const simRef = useRef<SpringsSimulation | null>(null);
  const activeShapeRef = useRef<ProtoShapeId>(shapeId);
  const runtimeRef = useRef(SHAPE_RUNTIMES[shapeId]);
  const spawnPointRef = useRef<{ x: number; y: number } | null>(null);
  const preservedPoseRef = useRef<SimulationPose | null>(null);
  const targetColorRef = useRef<ProtoRgb>(resolvedColor);
  const displayColorRef = useRef<ProtoRgb>(resolvedColor);
  const sizeRef = useRef<CanvasSize>({ cssWidth: 1, cssHeight: 1, dpr: 1 });
  const inputRef = useRef<PointerInput>({
    pointerX: 0,
    pointerY: 0,
    pointerDown: false,
  });
  const rafRef = useRef<number | null>(null);
  const mobileLayoutRef = useRef(isMobileViewport());
  const shapeScaleRef = useRef(shapeScale);
  const shapeDotBoostRef = useRef(shapeDotBoost);
  const shapeMarginRef = useRef(shapeMargin);
  const embeddedRef = useRef(embedded);
  shapeScaleRef.current = shapeScale;
  shapeDotBoostRef.current = shapeDotBoost;
  shapeMarginRef.current = shapeMargin;
  embeddedRef.current = embedded;

  const buildCreateOptions = (
    options: CreateSimulationOptions = {},
  ): CreateSimulationOptions => ({
    ...options,
    shapeMargin: shapeMarginRef.current,
    embedded: embeddedRef.current,
  });

  const targetTextureRef = useRef<ProtoTextureId>(textureId);
  targetTextureRef.current = textureId;

  targetColorRef.current = resolvedColor;

  useEffect(() => {
    simRef.current = null;
    preservedPoseRef.current = null;
  }, [shapeScale, shapeMargin]);

  useEffect(() => {
    if (activeShapeRef.current === shapeId) return;

    const { cssWidth, cssHeight } = sizeRef.current;
    const oldSim = simRef.current;

    if (oldSim) {
      preservedPoseRef.current = getSimulationPose(oldSim);
      spawnPointRef.current = preservedPoseRef.current.centroid;
    }

    activeShapeRef.current = shapeId;
    runtimeRef.current = SHAPE_RUNTIMES[shapeId];
    // If the canvas isn't measured yet, leave the sim null; the resize handler
    // will create it with the new runtime once a real height is available.
    simRef.current =
      cssHeight < MIN_VALID_CANVAS_HEIGHT
        ? null
        : createSimulationAtSpawn(
            runtimeRef.current,
            cssWidth,
            cssHeight,
            shapeId,
            spawnPointRef.current,
            buildCreateOptions({
              preservedPose: preservedPoseRef.current,
              // Deformed/stretched particles inflate RMS scale; baking that into
              // restLength compounds on every switch and slowly grows the shape.
              preserveScale: false,
            }),
            shapeScaleRef.current,
            shapeDotBoostRef.current,
          );

    if (simRef.current) {
      preservedPoseRef.current = getSimulationPose(simRef.current);
    }

    inputRef.current.pointerDown = false;
  }, [shapeId]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const cssWidth = Math.max(1, Math.floor(container.clientWidth));
      const cssHeight = Math.max(1, Math.floor(container.clientHeight));
      const dpr = setupHiDpiCanvas(canvas, cssWidth, cssHeight);
      sizeRef.current = { cssWidth, cssHeight, dpr };

      // Don't run physics until the canvas has a real height; otherwise the
      // shape collapses to a flat line it can never recover from. Drop any sim
      // that was created while too short so it gets recreated cleanly.
      if (cssHeight < MIN_VALID_CANVAS_HEIGHT) {
        simRef.current = null;
        return;
      }

      const mobile = isMobileViewport();
      const mobileLayoutChanged = mobile !== mobileLayoutRef.current;
      mobileLayoutRef.current = mobile;

      if (mobileLayoutChanged && simRef.current) {
        preservedPoseRef.current = getSimulationPose(simRef.current);
        spawnPointRef.current = preservedPoseRef.current.centroid;
        simRef.current = createSimulationAtSpawn(
          runtimeRef.current,
          cssWidth,
          cssHeight,
          activeShapeRef.current,
          spawnPointRef.current,
          buildCreateOptions({ preservedPose: preservedPoseRef.current }),
          shapeScaleRef.current,
          shapeDotBoostRef.current,
        );
        return;
      }

      if (simRef.current) {
        runtimeRef.current.updateBounds(simRef.current, cssWidth, cssHeight);
        applyPartnerShapePhysicsBounds(
          simRef.current,
          cssHeight,
          activeShapeRef.current,
          shapeScaleRef.current,
          shapeDotBoostRef.current,
          shapeMarginRef.current,
          embeddedRef.current,
        );
      } else {
        simRef.current = createSimulationAtSpawn(
          runtimeRef.current,
          cssWidth,
          cssHeight,
          activeShapeRef.current,
          spawnPointRef.current,
          buildCreateOptions({ preservedPose: preservedPoseRef.current }),
          shapeScaleRef.current,
          shapeDotBoostRef.current,
        );
      }
    };

    const observer = new ResizeObserver(() => resize());
    observer.observe(container);
    resize();

    const pointerToCanvas = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        return { x: 0, y: 0 };
      }
      const x = ((clientX - rect.left) / rect.width) * sizeRef.current.cssWidth;
      const y =
        ((clientY - rect.top) / rect.height) * sizeRef.current.cssHeight;
      return { x, y };
    };

    const cleanupPointer = bindSpringsCanvasPointerHandlers(canvas, {
      onPointerDown: (event) => {
        const sim = simRef.current;
        if (!sim) return false;

        const { x, y } = pointerToCanvas(event.clientX, event.clientY);
        const pickRadius =
          event.pointerType === "touch"
            ? PARTICLE_PICK_RADIUS_TOUCH
            : PARTICLE_PICK_RADIUS;

        runtimeRef.current.pick(sim, x, y, pickRadius);
        if (sim.grabbedIndex < 0) return false;

        sim.clicked = true;
        inputRef.current.pointerX = x;
        inputRef.current.pointerY = y;
        inputRef.current.pointerDown = true;
        return true;
      },
      onPointerMove: (event) => {
        const { x, y } = pointerToCanvas(event.clientX, event.clientY);
        inputRef.current.pointerX = x;
        inputRef.current.pointerY = y;
      },
      onPointerEnd: () => {
        inputRef.current.pointerDown = false;
        const sim = simRef.current;
        if (sim) sim.grabbedIndex = -1;
      },
    });

    const frame = () => {
      const sim = simRef.current;
      const runtime = runtimeRef.current;
      const { cssWidth, cssHeight, dpr } = sizeRef.current;
      if (!sim) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      runtime.step(sim, inputRef.current);

      const targetColor = targetColorRef.current;
      const nextColor = rgbNearEqual(displayColorRef.current, targetColor)
        ? targetColor
        : lerpRgb(displayColorRef.current, targetColor, COLOR_TRANSITION_SPEED);
      displayColorRef.current = nextColor;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      if (transparentBackground) {
        ctx.clearRect(0, 0, cssWidth, cssHeight);
      } else {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, cssWidth, cssHeight);
      }

      const visualScale = shapeScaleRef.current;
      const { dotScale, renderScale, normalizedRenderScale } =
        getPartnerShapeLayout(
        cssHeight,
        activeShapeRef.current,
        visualScale,
      );
      const renderDotScale = dotScale * shapeDotBoostRef.current;

      runtime.draw(
        ctx,
        sim,
        displayColorRef.current,
        targetTextureRef.current,
        renderDotScale,
        renderScale,
      );

      const isDragging =
        inputRef.current.pointerDown && sim.grabbedIndex > -1;
      updateDragAttributionTooltipElement(
        dragTooltipRef.current,
        dragTooltipLabelRef.current,
        isDragging ? getParticlesCentroid(sim.particles) : null,
        dragAttributionLabelRef.current,
        false,
        canvas,
        isDragging
          ? getDragAttributionTooltipOffsetY(
              sim.particles,
              renderDotScale,
              normalizedRenderScale,
            )
          : undefined,
      );

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      observer.disconnect();
      cleanupPointer();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [transparentBackground, backgroundColor, shapeScale, shapeMargin]);

  return (
    <PrototypeComponent
      id={prototypeId}
      className={`${embedded ? "absolute inset-0 size-full min-h-0" : "relative flex min-h-0 flex-1 flex-col"} ${transparentBackground ? "bg-transparent" : ""} ${className ?? ""}`}
      style={transparentBackground ? undefined : { backgroundColor }}
    >
      <div
        ref={containerRef}
        className={`relative size-full min-h-0 touch-none ${transparentBackground ? "bg-transparent" : ""}`}
        style={transparentBackground ? undefined : { backgroundColor }}
        aria-label="Interactive proto shape"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block touch-none select-none"
        />
      </div>
      <DragAttributionTooltipLayer
        tooltipRef={dragTooltipRef}
        labelRef={dragTooltipLabelRef}
      />
    </PrototypeComponent>
  );
}
