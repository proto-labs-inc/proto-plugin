"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
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
import { DEFAULT_PROTO_TEXTURE_ID } from "../proto-shapes/shape-textures";

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
    draw: (ctx, sim, color, texture, dotScale) =>
      drawSpringsTriangleSimulation(ctx, sim as SpringsTriangleSimulation, {
        clearBackground: false,
        showHint: false,
        color,
        texture,
        dotScale,
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
    draw: (ctx, sim, color, texture, dotScale) =>
      drawSpringsCubeSimulation(ctx, sim as SpringsCubeSimulation, {
        clearBackground: false,
        showHint: false,
        color,
        texture,
        dotScale,
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
    draw: (ctx, sim, color, texture, dotScale) =>
      drawSpringsPentagonSimulation(ctx, sim as SpringsPentagonSimulation, {
        clearBackground: false,
        showHint: false,
        color,
        texture,
        dotScale,
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
    draw: (ctx, sim, color, texture, dotScale) =>
      drawSpringsSquareSimulation(ctx, sim as SpringsSquareSimulation, {
        clearBackground: false,
        showHint: false,
        color,
        texture,
        dotScale,
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
    draw: (ctx, sim, color, texture, dotScale) =>
      drawSpringsPrismSimulation(ctx, sim as SpringsPrismSimulation, {
        clearBackground: false,
        showHint: false,
        color,
        texture,
        dotScale,
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

const MOBILE_MAX_WIDTH_QUERY = "(max-width: 639px)";
/** Three-pyramid chain is wide; keep it smaller on narrow viewports. */
const MOBILE_THREE_PART_SHAPE_SCALE = 0.9;
const MOBILE_SHAPE_SCALE = 1;
/** Give the protoshape more room on desktop invite/home layouts. */
const DESKTOP_SHAPE_SCALE = 1.38;
/** Handle dots grow less than the shape so they stay visually balanced. */
const DESKTOP_DOT_SCALE = 1.12;
/** Match proto-shapes vertical placement (yFactor 0.33). */
const SHAPE_SPAWN_Y_FACTOR = 0.33;
const WARM_START_FRAMES = 120;
/**
 * If the sim is created while the canvas is shorter than this, the shape gets
 * clamped between the top and bottom margins into a flat horizontal line — and
 * a collinear line never recovers, because the springs only push along it. This
 * happens at mount/remount before layout settles, so we wait for a real height
 * and recreate the sim if it was last sized while too short.
 */
const MIN_VALID_CANVAS_HEIGHT = 120;

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOBILE_MAX_WIDTH_QUERY).matches;
}

function getPartnerShapeLayout(cssHeight: number, shapeId: ProtoShapeId) {
  const mobile = isMobileViewport();
  const mobileScale =
    shapeId === "square" ? MOBILE_THREE_PART_SHAPE_SCALE : MOBILE_SHAPE_SCALE;
  return {
    scale: mobile ? mobileScale : DESKTOP_SHAPE_SCALE,
    dotScale: mobile ? mobileScale : DESKTOP_DOT_SCALE,
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
  }
}

function scaleSimulationAroundCentroid(sim: SpringsSimulation, scale: number) {
  if (scale === 1) return;

  const centroid = getSimulationCentroid(sim);
  for (const particle of sim.particles) {
    particle.px = centroid.x + (particle.px - centroid.x) * scale;
    particle.py = centroid.y + (particle.py - centroid.y) * scale;
  }
  sim.restLength *= scale;
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

type CreateSimulationOptions = {
  preservedPose?: SimulationPose | null;
  /** When false, only position + rotation carry over; scale stays at the new shape's default. */
  preserveScale?: boolean;
};

function createSimulationAtSpawn(
  runtime: ShapeRuntime,
  cssWidth: number,
  cssHeight: number,
  shapeId: ProtoShapeId,
  spawnPoint: { x: number; y: number } | null,
  options: CreateSimulationOptions = {},
) {
  const isInitialReveal = spawnPoint === null && !options.preservedPose;
  const spawn = spawnPoint ?? getShapeRestPoint(cssWidth, cssHeight, shapeId);
  const sim = runtime.create(cssWidth, cssHeight, spawn.x, spawn.y);
  const { scale } = getPartnerShapeLayout(cssHeight, shapeId);
  scaleSimulationAroundCentroid(sim, scale);

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

  return sim;
}

function setupHiDpiCanvas(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number,
) {
  const dpr = window.devicePixelRatio || 1;
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
};

export function PartnerShapeCanvas({
  className,
  shapeId = "cube",
  colorId,
  textureId = DEFAULT_PROTO_TEXTURE_ID,
  color,
  transparentBackground = false,
}: PartnerShapeCanvasProps) {
  const resolvedColor = color ?? getProtoColor(colorId ?? DEFAULT_PROTO_COLOR_ID).rgb;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  const targetTextureRef = useRef<ProtoTextureId>(textureId);
  targetTextureRef.current = textureId;

  targetColorRef.current = resolvedColor;

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
            {
              preservedPose: preservedPoseRef.current,
              // Deformed/stretched particles inflate RMS scale; baking that into
              // restLength compounds on every switch and slowly grows the shape.
              preserveScale: false,
            },
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
          { preservedPose: preservedPoseRef.current },
        );
        return;
      }

      if (simRef.current) {
        runtimeRef.current.updateBounds(simRef.current, cssWidth, cssHeight);
      } else {
        simRef.current = createSimulationAtSpawn(
          runtimeRef.current,
          cssWidth,
          cssHeight,
          activeShapeRef.current,
          spawnPointRef.current,
          { preservedPose: preservedPoseRef.current },
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

    const onPointerDown = (event: PointerEvent) => {
      const sim = simRef.current;
      if (!sim) return;

      const { x, y } = pointerToCanvas(event.clientX, event.clientY);
      const pickRadius =
        event.pointerType === "touch"
          ? PARTICLE_PICK_RADIUS_TOUCH
          : PARTICLE_PICK_RADIUS;

      runtimeRef.current.pick(sim, x, y, pickRadius);
      if (sim.grabbedIndex < 0) return;

      sim.clicked = true;
      event.preventDefault();
      canvas.setPointerCapture(event.pointerId);
      inputRef.current.pointerX = x;
      inputRef.current.pointerY = y;
      inputRef.current.pointerDown = true;
    };

    const onPointerMove = (event: PointerEvent) => {
      const { x, y } = pointerToCanvas(event.clientX, event.clientY);
      inputRef.current.pointerX = x;
      inputRef.current.pointerY = y;
    };

    const endPointer = (event: PointerEvent) => {
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      inputRef.current.pointerDown = false;
      const sim = simRef.current;
      if (sim) sim.grabbedIndex = -1;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", endPointer);
    canvas.addEventListener("pointercancel", endPointer);

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
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, cssWidth, cssHeight);
      }

      const { dotScale } = getPartnerShapeLayout(
        cssHeight,
        activeShapeRef.current,
      );

      runtime.draw(
        ctx,
        sim,
        displayColorRef.current,
        targetTextureRef.current,
        dotScale,
      );

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", endPointer);
      canvas.removeEventListener("pointercancel", endPointer);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [transparentBackground]);

  return (
    <PrototypeComponent
      id="partner-shape-canvas"
      className={`relative flex min-h-0 flex-1 flex-col ${transparentBackground ? "bg-transparent" : "bg-white"} ${className ?? ""}`}
    >
      <div
        ref={containerRef}
        className={`relative min-h-0 flex-1 touch-none ${transparentBackground ? "bg-transparent" : "bg-white"}`}
        aria-label="Interactive proto shape"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block touch-none select-none"
        />
      </div>
    </PrototypeComponent>
  );
}
