"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { useEffect, useMemo, useRef } from "react";

import {
  PROTO_COLORS,
  PROTO_SHAPES,
  type ProtoColorId,
  type ProtoRgb,
  type ProtoShapeId,
  type ProtoTextureId,
} from "../../proto-partner-page/_components/proto-shape-content";
import {
  getHomeShapePaletteColor,
  SHAPE_COLORS_BASELINE_SCHEME,
  type ShapeColorsVariant,
} from "./shape-colors-content";
import { bindSpringsCanvasPointerHandlers } from "../../proto-shapes/springs-canvas-pointer";
import {
  createSpringsCubeSimulation,
  drawSpringsCubeSimulation,
  pickClosestParticle as pickClosestCubeParticle,
  stepSpringsCubeSimulation,
  updateSpringsCubeSimulationBounds,
  type SpringsCubeSimulation,
} from "../../proto-shapes/springs-cube-simulation";
import {
  resolveSelfCollisions,
  type CollidableParticle,
} from "../../proto-shapes/springs-inter-shape-collisions";
import {
  createSpringsPentagonSimulation,
  drawSpringsPentagonSimulation,
  pickClosestParticle as pickClosestPentagonParticle,
  stepSpringsPentagonSimulation,
  updateSpringsPentagonSimulationBounds,
  type SpringsPentagonSimulation,
} from "../../proto-shapes/springs-pentagon-simulation";
import {
  createSpringsPrismSimulation,
  drawSpringsPrismSimulation,
  pickClosestParticle as pickClosestPrismParticle,
  stepSpringsPrismSimulation,
  updateSpringsPrismSimulationBounds,
  type SpringsPrismSimulation,
} from "../../proto-shapes/springs-prism-simulation";
import {
  createSpringsSquareSimulation,
  drawSpringsSquareSimulation,
  pickClosestParticle as pickClosestSquareParticle,
  SQUARE_COLLISION_EDGES,
  SQUARE_SPRING_PAIRS,
  stepSpringsSquareSimulation,
  updateSpringsSquareSimulationBounds,
  type SpringsSquareSimulation,
} from "../../proto-shapes/springs-square-simulation";
import {
  createSpringsTriangleSimulation,
  drawSpringsTriangleSimulation,
  PARTICLE_PICK_RADIUS,
  PARTICLE_PICK_RADIUS_TOUCH,
  pickClosestParticle as pickClosestTriangleParticle,
  stepSpringsTriangleSimulation,
  updateSpringsTriangleSimulationBounds,
  type SpringsTriangleSimulation,
} from "../../proto-shapes/springs-triangle-simulation";
import {
  PROTO_TEXTURES,
  getShapeHandleDotOutlineWidth,
  getShapeHandleDotRadius,
  getPrototypeShapeLayoutScales,
  SHAPE_SPRING_LINE_WIDTH,
  withShapeRenderScale,
} from "../../proto-shapes/shape-textures";
import { scaleSpringsSimulationAroundCentroid } from "../../proto-shapes/springs-physics-scale";

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
  collisionEdges: readonly (readonly [number, number])[];
};

const TRIANGLE_COLLISION_EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [0, 4],
  [1, 4],
  [2, 4],
  [3, 4],
  [2, 0],
  [1, 3],
] as const;

const CUBE_COLLISION_EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
  [4, 5],
  [5, 6],
  [6, 7],
  [0, 2],
  [4, 3],
  [6, 4],
  [2, 5],
  [7, 2],
  [4, 1],
] as const;

const PENTAGON_COLLISION_EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 0],
  [0, 5],
  [1, 5],
  [2, 5],
  [3, 5],
  [4, 5],
] as const;

const PRISM_COLLISION_EDGES = [
  [0, 1],
  [1, 2],
  [2, 0],
  [3, 4],
  [4, 5],
  [5, 3],
  [0, 3],
  [1, 4],
  [2, 5],
] as const;

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
    collisionEdges: TRIANGLE_COLLISION_EDGES,
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
    collisionEdges: CUBE_COLLISION_EDGES,
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
    collisionEdges: PENTAGON_COLLISION_EDGES,
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
    collisionEdges: SQUARE_COLLISION_EDGES,
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
    collisionEdges: PRISM_COLLISION_EDGES,
  },
};

const WARM_START_FRAMES = 90;
const MIN_VALID_CANVAS_HEIGHT = 120;
/** Downscale clutter shapes on the home background; dots stay at partner scale. */
const HOME_BACKGROUND_SHAPE_SCALE = 0.72;
const SHAPE_COUNT = 24;
const SHAPE_SEED = 0x1a2b3c4d;
const GRID_COLS = 8;
const MIN_VISUAL_SCALE = 0.3;
const MAX_VISUAL_SCALE = 1.4;
/** 0 = top of canvas, 1 = bottom edge. */
const MIN_REST_FLOOR_FACTOR = 0.12;
const MAX_REST_FLOOR_FACTOR = 0.995;
/** Particles within this distance of the floor count as resting on it. */
const FLOOR_CONTACT_EPSILON = 1.5;
/** Horizontal velocity multiplier per frame for particles resting on the floor. */
const FLOOR_FRICTION = 0.82;
/** Horizontal speed below which a floor-contact particle is snapped to still. */
const FLOOR_VX_SLEEP = 0.08;

type ShapeSlotConfig = {
  id: string;
  shapeId: ProtoShapeId;
  color: ProtoRgb;
  textureId: ProtoTextureId;
  visualScale: number;
  /** Resting floor as a fraction of canvas height — each shape gets its own layer. */
  restFloorFactor: number;
  xFactor: number;
  yFactor: number;
};

type ShapeSlot = ShapeSlotConfig & {
  sim: SpringsSimulation | null;
};

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function pickRandom<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]!;
}

function shuffleWithRandom<T>(items: T[], random: () => number) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex]!, items[index]!];
  }
}

function generateUniqueRestFloorFactors(count: number, random: () => number) {
  const factors = Array.from({ length: count }, (_, index) => {
    const t = count <= 1 ? 0.5 : index / (count - 1);
    return (
      MIN_REST_FLOOR_FACTOR +
      t * (MAX_REST_FLOOR_FACTOR - MIN_REST_FLOOR_FACTOR)
    );
  });
  shuffleWithRandom(factors, random);
  return factors;
}

function generateShapeSlotConfigs(
  count: number,
  seed: number,
  colorScheme: ShapeColorsVariant,
): ShapeSlotConfig[] {
  const random = createSeededRandom(seed);
  const slots: ShapeSlotConfig[] = [];
  const textures = [...PROTO_TEXTURES];
  const restFloorFactors = generateUniqueRestFloorFactors(count, random);

  for (let index = 0; index < count; index += 1) {
    const col = index % GRID_COLS;
    const colorId = pickRandom(
      PROTO_COLORS.map((color) => color.id),
      random,
    ) as ProtoColorId;

    slots.push({
      id: String(index),
      shapeId: pickRandom(
        PROTO_SHAPES.map((shape) => shape.id),
        random,
      ),
      color: getHomeShapePaletteColor(colorId, colorScheme),
      textureId: textures[index % textures.length]!,
      visualScale:
        MIN_VISUAL_SCALE + random() * (MAX_VISUAL_SCALE - MIN_VISUAL_SCALE),
      restFloorFactor: restFloorFactors[index]!,
      xFactor: 0.04 + ((col + 0.5) / GRID_COLS) * 0.92,
      yFactor: 0.02 + random() * 0.08,
    });
  }

  return slots;
}

function getHomeSlotLayout(shapeId: ProtoShapeId, visualScale: number) {
  return getPrototypeShapeLayoutScales({
    layoutShapeScale: HOME_BACKGROUND_SHAPE_SCALE,
    visualScale,
    isThreePartShape: shapeId === "square",
  });
}

function resolveShapeMargin(shapeId: ProtoShapeId, visualScale: number) {
  const { dotScale, normalizedRenderScale } = getHomeSlotLayout(
    shapeId,
    visualScale,
  );
  const renderBleed =
    getShapeHandleDotRadius(dotScale, normalizedRenderScale) +
    getShapeHandleDotOutlineWidth(normalizedRenderScale) +
    withShapeRenderScale(SHAPE_SPRING_LINE_WIDTH, normalizedRenderScale) / 2;

  return Math.ceil(4 + renderBleed);
}

function getRestFloorY(
  cssHeight: number,
  restFloorFactor: number,
  margin: number,
) {
  return cssHeight * restFloorFactor - margin;
}

/**
 * Rest the shape on its layer using a per-particle floor, mirroring the natural
 * canvas boundary. Particles at or below the floor are clamped, downward
 * velocity is removed, and horizontal velocity is damped so resting shapes
 * (especially multi-part squares) don't drift from self-collision impulses.
 */
function enforceShapeFloor(
  sim: SpringsSimulation,
  floorY: number,
  pinned: readonly CollidableParticle[] = [],
) {
  const pinnedSet = new Set(pinned);

  for (const particle of sim.particles) {
    if (pinnedSet.has(particle)) continue;

    const onFloor = particle.py >= floorY - FLOOR_CONTACT_EPSILON;
    if (!onFloor) continue;

    if (particle.py > floorY) {
      particle.py = floorY;
    }
    if (particle.vy > 0) {
      particle.vy = 0;
    }

    particle.vx *= FLOOR_FRICTION;
    if (Math.abs(particle.vx) < FLOOR_VX_SLEEP) {
      particle.vx = 0;
    }
  }
}

function resolveSquareSelfCollisions(sim: SpringsSquareSimulation) {
  resolveSelfCollisions(
    sim.particles,
    {
      particles: sim.particles,
      edges: SQUARE_COLLISION_EDGES,
    },
    SQUARE_SPRING_PAIRS,
  );
}

function warmStartSimulation(
  runtime: ShapeRuntime,
  sim: SpringsSimulation,
  floorY: number,
  shapeId: ProtoShapeId,
) {
  const idleInput: PointerInput = {
    pointerX: 0,
    pointerY: 0,
    pointerDown: false,
  };

  for (let i = 0; i < WARM_START_FRAMES; i += 1) {
    runtime.step(sim, idleInput);
    if (shapeId === "square") {
      resolveSquareSelfCollisions(sim as SpringsSquareSimulation);
    }
    enforceShapeFloor(sim, floorY);
  }
}

function createShapeSimulation(
  slot: ShapeSlotConfig,
  cssWidth: number,
  cssHeight: number,
) {
  const runtime = SHAPE_RUNTIMES[slot.shapeId];
  const spawnX = cssWidth * slot.xFactor;
  const spawnY = cssHeight * slot.yFactor;
  const sim = runtime.create(cssWidth, cssHeight, spawnX, spawnY);
  scaleSpringsSimulationAroundCentroid(
    sim,
    getHomeSlotLayout(slot.shapeId, slot.visualScale).shapeScale,
  );
  sim.margin = resolveShapeMargin(slot.shapeId, slot.visualScale);
  const floorY = getRestFloorY(cssHeight, slot.restFloorFactor, sim.margin);
  warmStartSimulation(runtime, sim, floorY, slot.shapeId);
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

function distanceToGrabbed(sim: SpringsSimulation, x: number, y: number) {
  if (sim.grabbedIndex < 0) return Infinity;
  const particle = sim.particles[sim.grabbedIndex];
  return Math.hypot(x - particle.px, y - particle.py);
}

type HomePageShapesBackgroundProps = {
  colorScheme?: ShapeColorsVariant;
  /** Forces a remount when the exploration preview switches variants. */
  previewKey?: string;
};

export function HomePageShapesBackground({
  colorScheme = SHAPE_COLORS_BASELINE_SCHEME,
  previewKey,
}: HomePageShapesBackgroundProps = {}) {
  const slotConfigs = useMemo(
    () => generateShapeSlotConfigs(SHAPE_COUNT, SHAPE_SEED, colorScheme),
    [colorScheme],
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapesRef = useRef<ShapeSlot[]>(
    slotConfigs.map((config) => ({ ...config, sim: null })),
  );

  useEffect(() => {
    shapesRef.current = slotConfigs.map((config) => {
      const existing = shapesRef.current.find((slot) => slot.id === config.id);
      return {
        ...config,
        sim: existing?.sim ?? null,
      };
    });
  }, [slotConfigs]);
  const grabbedShapeIdRef = useRef<string | null>(null);
  const sizeRef = useRef<CanvasSize>({ cssWidth: 1, cssHeight: 1, dpr: 1 });
  const inputRef = useRef<PointerInput>({
    pointerX: 0,
    pointerY: 0,
    pointerDown: false,
  });
  const rafRef = useRef<number | null>(null);

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

      if (cssHeight < MIN_VALID_CANVAS_HEIGHT) {
        for (const slot of shapesRef.current) {
          slot.sim = null;
        }
        return;
      }

      for (const slot of shapesRef.current) {
        if (slot.sim) {
          SHAPE_RUNTIMES[slot.shapeId].updateBounds(
            slot.sim,
            cssWidth,
            cssHeight,
          );
          slot.sim.margin = resolveShapeMargin(slot.shapeId, slot.visualScale);
        } else {
          slot.sim = createShapeSimulation(slot, cssWidth, cssHeight);
        }
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
        const shapes = shapesRef.current;
        const { x, y } = pointerToCanvas(event.clientX, event.clientY);
        const basePickRadius =
          event.pointerType === "touch"
            ? PARTICLE_PICK_RADIUS_TOUCH
            : PARTICLE_PICK_RADIUS;

        let closestId: string | null = null;
        let closestDist = Infinity;

        for (const slot of shapes) {
          if (!slot.sim) continue;
          const runtime = SHAPE_RUNTIMES[slot.shapeId];
          const pickRadius = basePickRadius * Math.max(0.9, slot.visualScale);
          runtime.pick(slot.sim, x, y, pickRadius);
          const dist = distanceToGrabbed(slot.sim, x, y);
          if (dist < closestDist) {
            closestDist = dist;
            closestId = slot.id;
          }
        }

        if (!closestId || closestDist === Infinity) {
          grabbedShapeIdRef.current = null;
          return false;
        }

        for (const slot of shapes) {
          if (!slot.sim) continue;
          if (slot.id === closestId) {
            slot.sim.clicked = true;
          } else {
            slot.sim.grabbedIndex = -1;
          }
        }

        grabbedShapeIdRef.current = closestId;
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
        grabbedShapeIdRef.current = null;
        for (const slot of shapesRef.current) {
          if (slot.sim) slot.sim.grabbedIndex = -1;
        }
      },
    });

    const frame = () => {
      const shapes = shapesRef.current;
      const { cssWidth, cssHeight, dpr } = sizeRef.current;
      const grabbedId = grabbedShapeIdRef.current;

      for (const slot of shapes) {
        if (!slot.sim) continue;

        const isGrabbed = grabbedId === slot.id && inputRef.current.pointerDown;
        SHAPE_RUNTIMES[slot.shapeId].step(slot.sim, {
          ...inputRef.current,
          pointerDown: isGrabbed,
        });
      }

      for (const slot of shapes) {
        if (slot.shapeId !== "square" || !slot.sim) continue;
        const squarePinned =
          grabbedId === slot.id &&
          inputRef.current.pointerDown &&
          slot.sim.grabbedIndex > -1
            ? [slot.sim.particles[slot.sim.grabbedIndex]!]
            : [];
        resolveSelfCollisions(
          slot.sim.particles,
          {
            particles: slot.sim.particles,
            edges: SQUARE_COLLISION_EDGES,
          },
          SQUARE_SPRING_PAIRS,
          squarePinned,
        );
      }

      for (const slot of shapes) {
        if (!slot.sim) continue;

        const isGrabbed = grabbedId === slot.id && inputRef.current.pointerDown;
        const margin = resolveShapeMargin(slot.shapeId, slot.visualScale);
        const floorY = getRestFloorY(cssHeight, slot.restFloorFactor, margin);
        const pinned: CollidableParticle[] =
          isGrabbed && slot.sim.grabbedIndex > -1
            ? [slot.sim.particles[slot.sim.grabbedIndex]!]
            : [];
        enforceShapeFloor(slot.sim, floorY, pinned);
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      const drawOrder = [...shapes].sort((a, b) => {
        const aGrabbed = grabbedId === a.id;
        const bGrabbed = grabbedId === b.id;
        if (aGrabbed !== bGrabbed) return aGrabbed ? 1 : -1;
        return a.restFloorFactor - b.restFloorFactor;
      });

      for (const slot of drawOrder) {
        if (!slot.sim) continue;
        const runtime = SHAPE_RUNTIMES[slot.shapeId];
        const { dotScale, renderScale } = getHomeSlotLayout(
          slot.shapeId,
          slot.visualScale,
        );
        runtime.draw(
          ctx,
          slot.sim,
          slot.color,
          slot.textureId,
          dotScale,
          renderScale,
        );
      }

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
  }, [slotConfigs]);

  return (
    <PrototypeComponent
      id="home-page-shapes-background"
      className="absolute inset-0 z-10 overflow-hidden bg-transparent"
    >
      <div
        key={previewKey}
        ref={containerRef}
        className="relative size-full touch-none"
        aria-label="Interactive proto shapes background"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block touch-none select-none"
        />
      </div>
    </PrototypeComponent>
  );
}
