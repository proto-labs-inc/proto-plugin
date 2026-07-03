"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  getProtoColor,
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
import {
  contributorShapeToSlotConfig,
  HOME_PAGE_CONTRIBUTOR_SHAPES,
  type HomePageContributorShape,
} from "./home-page-contributor-shapes";
import { readSubmittedContributorShapes } from "../../proto-partner-page/_components/submitted-proto-shapes";
import { bindSpringsCanvasPointerHandlers } from "../../proto-shapes/springs-canvas-pointer";
import {
  DRAG_ATTRIBUTION_TOOLTIP_CLASS,
  updateDragAttributionTooltipElement,
} from "../../proto-shapes/springs-drag-attribution-tooltip";
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

export type FixedShapeSlotConfig = {
  id: string;
  shapeId: ProtoShapeId;
  colorId: ProtoColorId;
  textureId: ProtoTextureId;
  visualScale: number;
  restFloorFactor: number;
  xFactor: number;
  yFactor: number;
  /** Partner mode only — lifts this shape's floor without shifting other shelves. */
  restFloorSpreadAdjust?: number;
  /** Drop this slot instead of warm-start / center-pop. Overrides config entrance. */
  entranceDrop?: boolean;
  /** Launch from the bottom edge toward a high shelf — for slots above midline. */
  entranceDropFromBottom?: boolean;
  /** Shown in a tooltip above this shape while it is dragged. */
  attributionLabel?: string;
};

export type MultiShapeSpringsPhysicsMode = "background" | "partner";

export type MultiShapeSpringsCanvasConfig = {
  shapeCount: number;
  seed: number;
  gridCols: number;
  minRestFloorFactor: number;
  maxRestFloorFactor: number;
  minVisualScale: number;
  maxVisualScale: number;
  backgroundShapeScale: number;
  colorMode: "home-palette" | "proto-colors";
  /**
   * `partner` matches PartnerShapeCanvas: plain spring step with per-shape shelf
   * floors plus screen-edge walls — no per-particle floor clamp or square
   * self-collision stack.
   * `background` enables shelf stacking physics for dense multi-shape scenes.
   */
  physicsMode?: MultiShapeSpringsPhysicsMode;
  /** When set, renders exactly these slots with no random generation. */
  fixedSlots?: readonly FixedShapeSlotConfig[];
  /** Drop shapes from above their slots instead of warm-starting in place. */
  entranceDrop?: boolean;
  /**
   * Collapse warm-started shapes to the vertical center, then let springs pop
   * them open — same reveal as PartnerShapeCanvas on the customize page.
   */
  entranceCenterPop?: boolean;
  /** Stagger per-shape reveal on entrance (seconds). Requires entranceDrop or entranceCenterPop. */
  shapeEntranceStagger?: number;
  /**
   * Fallback label for the drag-attribution tooltip. Per-slot `attributionLabel`
   * takes precedence when set.
   */
  dragAttributionLabel?: string;
};

export const HOME_PAGE_SHAPES_CONFIG: MultiShapeSpringsCanvasConfig = {
  shapeCount: 24,
  seed: 0x1a2b3c4d,
  gridCols: 8,
  minRestFloorFactor: 0.12,
  maxRestFloorFactor: 0.995,
  minVisualScale: 0.3,
  maxVisualScale: 1.4,
  backgroundShapeScale: 0.72,
  colorMode: "home-palette",
  physicsMode: "background",
};
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
  restFloorSpreadAdjust?: number;
  entranceDrop?: boolean;
  entranceDropFromBottom?: boolean;
  attributionLabel?: string;
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

function generateUniqueRestFloorFactors(
  count: number,
  random: () => number,
  config: MultiShapeSpringsCanvasConfig,
) {
  const factors = Array.from({ length: count }, (_, index) => {
    const t = count <= 1 ? 0.5 : index / (count - 1);
    return (
      config.minRestFloorFactor +
      t * (config.maxRestFloorFactor - config.minRestFloorFactor)
    );
  });
  shuffleWithRandom(factors, random);
  return factors;
}

function fixedSlotToConfig(
  slot: FixedShapeSlotConfig,
  colorScheme: ShapeColorsVariant,
  colorMode: MultiShapeSpringsCanvasConfig["colorMode"],
): ShapeSlotConfig {
  return {
    id: slot.id,
    shapeId: slot.shapeId,
    color:
      colorMode === "proto-colors"
        ? getProtoColor(slot.colorId).rgb
        : getHomeShapePaletteColor(slot.colorId, colorScheme),
    textureId: slot.textureId,
    visualScale: slot.visualScale,
    restFloorFactor: slot.restFloorFactor,
    xFactor: slot.xFactor,
    yFactor: slot.yFactor,
    restFloorSpreadAdjust: slot.restFloorSpreadAdjust,
    entranceDrop: slot.entranceDrop,
    entranceDropFromBottom: slot.entranceDropFromBottom,
    attributionLabel: slot.attributionLabel,
  };
}

function generateShapeSlotConfigs(
  config: MultiShapeSpringsCanvasConfig,
  colorScheme: ShapeColorsVariant,
  contributorShapes: HomePageContributorShape[] = [],
): ShapeSlotConfig[] {
  if (config.fixedSlots?.length) {
    return config.fixedSlots.map((slot) =>
      fixedSlotToConfig(slot, colorScheme, config.colorMode),
    );
  }

  const random = createSeededRandom(config.seed);
  const slots: ShapeSlotConfig[] = [];
  const textures = [...PROTO_TEXTURES];
  const restFloorFactors = generateUniqueRestFloorFactors(
    config.shapeCount,
    random,
    config,
  );

  for (let index = 0; index < config.shapeCount; index += 1) {
    const col = index % config.gridCols;
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
      color:
        config.colorMode === "proto-colors"
          ? getProtoColor(colorId).rgb
          : getHomeShapePaletteColor(colorId, colorScheme),
      textureId: pickRandom(textures, random),
      visualScale:
        config.minVisualScale +
        random() * (config.maxVisualScale - config.minVisualScale),
      restFloorFactor: restFloorFactors[index]!,
      xFactor: 0.04 + ((col + 0.5) / config.gridCols) * 0.92,
      yFactor: 0.02 + random() * 0.08,
    });
  }

  const contributorSlots = contributorShapes.map(contributorShapeToSlotConfig);
  return [...contributorSlots, ...slots];
}

function getSlotLayout(
  shapeId: ProtoShapeId,
  visualScale: number,
  backgroundShapeScale: number,
) {
  return getPrototypeShapeLayoutScales({
    layoutShapeScale: backgroundShapeScale,
    visualScale,
    isThreePartShape: shapeId === "square",
  });
}

function resolveShapeMargin(
  shapeId: ProtoShapeId,
  visualScale: number,
  backgroundShapeScale: number,
) {
  const { dotScale, normalizedRenderScale } = getSlotLayout(
    shapeId,
    visualScale,
    backgroundShapeScale,
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

/** Bottom inset that raises each shape's floor to its shelf layer. */
function getShelfSimulationMargin(
  cssHeight: number,
  restFloorFactor: number,
  renderMargin: number,
) {
  return Math.ceil(cssHeight * (1 - restFloorFactor) + renderMargin);
}

function getSlotRestFloorFactorRange(
  slots: readonly Pick<ShapeSlotConfig, "restFloorFactor">[],
) {
  if (slots.length === 0) {
    return { min: 1, max: 1 };
  }
  return {
    min: Math.min(...slots.map((slot) => slot.restFloorFactor)),
    max: Math.max(...slots.map((slot) => slot.restFloorFactor)),
  };
}

/**
 * Stretch shelf spacing from the original top layer down to a flush bottom,
 * keeping the highest shelf where the layout authored it.
 */
function spreadRestFloorFactor(
  restFloorFactor: number,
  minRestFloorFactor: number,
  maxRestFloorFactor: number,
) {
  const span = maxRestFloorFactor - minRestFloorFactor;
  if (span <= 0) return 1;
  const t = (restFloorFactor - minRestFloorFactor) / span;
  return minRestFloorFactor + t * (1 - minRestFloorFactor);
}

function applySlotSimulationMargin(
  slot: ShapeSlotConfig,
  sim: SpringsSimulation,
  cssHeight: number,
  backgroundShapeScale: number,
  physicsMode: MultiShapeSpringsPhysicsMode,
  restFloorFactorRange = { min: 1, max: 1 },
) {
  const renderMargin = resolveShapeMargin(
    slot.shapeId,
    slot.visualScale,
    backgroundShapeScale,
  );
  if (physicsMode === "partner") {
    const spreadFloorFactor = spreadRestFloorFactor(
      slot.restFloorFactor,
      restFloorFactorRange.min,
      restFloorFactorRange.max,
    );
    const adjustedSpreadFloorFactor = Math.max(
      restFloorFactorRange.min,
      spreadFloorFactor - (slot.restFloorSpreadAdjust ?? 0),
    );
    sim.margin = renderMargin;
    sim.floorInset = getShelfSimulationMargin(
      cssHeight,
      adjustedSpreadFloorFactor,
      renderMargin,
    );
    return;
  }

  sim.margin = renderMargin;
  sim.floorInset = undefined;
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

function resolveSquareSelfCollisions(
  sim: SpringsSquareSimulation,
  pinned: readonly CollidableParticle[] = [],
) {
  resolveSelfCollisions(
    sim.particles,
    {
      particles: sim.particles,
      edges: SQUARE_COLLISION_EDGES,
    },
    SQUARE_SPRING_PAIRS,
    pinned,
  );
}

/** Block horizontal shove from self-collisions while a square rests on its floor layer. */
function lockSquareFloorHorizontalDrift(
  sim: SpringsSquareSimulation,
  floorY: number,
  preCollisionPx: readonly number[],
  pinned: readonly CollidableParticle[] = [],
) {
  const pinnedSet = new Set(pinned);

  for (let index = 0; index < sim.particles.length; index += 1) {
    const particle = sim.particles[index]!;
    if (pinnedSet.has(particle)) continue;
    if (particle.py >= floorY - FLOOR_CONTACT_EPSILON) {
      particle.px = preCollisionPx[index]!;
      particle.vx = 0;
    }
  }
}

function resolveSquareSelfCollisionsWithFloorLock(
  sim: SpringsSquareSimulation,
  floorY: number,
  pinned: readonly CollidableParticle[] = [],
) {
  const preCollisionPx = sim.particles.map((particle) => particle.px);
  resolveSquareSelfCollisions(sim, pinned);
  lockSquareFloorHorizontalDrift(sim, floorY, preCollisionPx, pinned);
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

function updateDragAttributionTooltip(
  tooltip: HTMLDivElement | null,
  labelEl: HTMLSpanElement | null,
  shapes: ShapeSlot[],
  grabbedId: string | null,
  pointerDown: boolean,
  globalLabel: string | undefined,
) {
  if (!grabbedId || !pointerDown) {
    if (tooltip) tooltip.style.display = "none";
    return;
  }

  const slot = shapes.find((entry) => entry.id === grabbedId);
  if (!slot?.sim) {
    if (tooltip) tooltip.style.display = "none";
    return;
  }

  const slotLabel = slot.attributionLabel;
  const label = slotLabel ?? globalLabel;
  updateDragAttributionTooltipElement(
    tooltip,
    labelEl,
    getSimulationCentroid(slot.sim),
    label,
    Boolean(slotLabel),
  );
}

/** Matches PartnerShapeCanvas — tiny cluster so springs distend on the first live frames. */
const INITIAL_POP_COLLAPSE_FACTOR = 0.04;
/** Shelves above this factor collapse at the bottom edge so springs distend upward. */
const CENTER_POP_MIDLINE_FACTOR = 0.5;
const BOTTOM_POP_COLLAPSE_Y_FACTOR = 0.97;

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

type ShapeSimulationEntrance = {
  drop?: boolean;
  dropFromBottom?: boolean;
  centerPop?: boolean;
};

function resolveSlotEntrance(
  slot: Pick<ShapeSlotConfig, "entranceDrop" | "entranceDropFromBottom">,
  config: MultiShapeSpringsCanvasConfig,
) {
  const dropFromBottom = slot.entranceDropFromBottom ?? false;
  const drop =
    dropFromBottom || (slot.entranceDrop ?? config.entranceDrop ?? false);
  return {
    drop,
    dropFromBottom,
    centerPop: drop ? false : (config.entranceCenterPop ?? false),
  };
}

function slotUsesStaggeredEntrance(
  slot: ShapeSlotConfig,
  config: MultiShapeSpringsCanvasConfig,
) {
  const { drop, centerPop } = resolveSlotEntrance(slot, config);
  return (
    drop ||
    centerPop ||
    (config.entranceDrop ?? false) ||
    (config.entranceCenterPop ?? false)
  );
}

function launchShapeFromBottom(
  sim: SpringsSimulation,
  targetFloorY: number,
) {
  const centroid = getSimulationCentroid(sim);
  const launchVy = -Math.max(14, Math.min(30, (centroid.y - targetFloorY) * 0.14));
  for (const particle of sim.particles) {
    particle.vy = launchVy;
  }
}

function warmStartSimulation(
  runtime: ShapeRuntime,
  sim: SpringsSimulation,
  floorY: number,
  shapeId: ProtoShapeId,
  physicsMode: MultiShapeSpringsPhysicsMode,
) {
  const idleInput: PointerInput = {
    pointerX: 0,
    pointerY: 0,
    pointerDown: false,
  };

  if (physicsMode === "partner") {
    for (let i = 0; i < WARM_START_FRAMES; i += 1) {
      runtime.step(sim, idleInput);
    }
    return;
  }

  for (let i = 0; i < WARM_START_FRAMES; i += 1) {
    runtime.step(sim, idleInput);
    if (shapeId === "square") {
      resolveSquareSelfCollisionsWithFloorLock(
        sim as SpringsSquareSimulation,
        floorY,
      );
    }
    enforceShapeFloor(sim, floorY);
  }
}

function createShapeSimulation(
  slot: ShapeSlotConfig,
  cssWidth: number,
  cssHeight: number,
  backgroundShapeScale: number,
  physicsMode: MultiShapeSpringsPhysicsMode,
  entrance: ShapeSimulationEntrance = {},
  restFloorFactorRange = { min: 1, max: 1 },
) {
  const { drop = false, dropFromBottom = false, centerPop = false } = entrance;
  const runtime = SHAPE_RUNTIMES[slot.shapeId];
  const spawnX = cssWidth * slot.xFactor;
  const spawnY = dropFromBottom
    ? cssHeight * BOTTOM_POP_COLLAPSE_Y_FACTOR
    : cssHeight * (drop ? Math.max(0.02, slot.yFactor - 0.22) : slot.yFactor);
  const sim = runtime.create(cssWidth, cssHeight, spawnX, spawnY);
  scaleSpringsSimulationAroundCentroid(
    sim,
    getSlotLayout(slot.shapeId, slot.visualScale, backgroundShapeScale)
      .shapeScale,
  );
  applySlotSimulationMargin(
    slot,
    sim,
    cssHeight,
    backgroundShapeScale,
    physicsMode,
    restFloorFactorRange,
  );
  if (!drop) {
    const floorY = getRestFloorY(
      cssHeight,
      slot.restFloorFactor,
      resolveShapeMargin(slot.shapeId, slot.visualScale, backgroundShapeScale),
    );
    warmStartSimulation(runtime, sim, floorY, slot.shapeId, physicsMode);
    if (centerPop) {
      const collapseYFactor =
        slot.restFloorFactor <= CENTER_POP_MIDLINE_FACTOR
          ? BOTTOM_POP_COLLAPSE_Y_FACTOR
          : CENTER_POP_MIDLINE_FACTOR;
      collapseShapeForPop(
        sim,
        cssWidth * slot.xFactor,
        cssHeight * collapseYFactor,
      );
    }
  } else if (dropFromBottom) {
    const floorY = getRestFloorY(
      cssHeight,
      slot.restFloorFactor,
      resolveShapeMargin(slot.shapeId, slot.visualScale, backgroundShapeScale),
    );
    launchShapeFromBottom(sim, floorY);
  }
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

function distanceToGrabbed(sim: SpringsSimulation, x: number, y: number) {
  if (sim.grabbedIndex < 0) return Infinity;
  const particle = sim.particles[sim.grabbedIndex];
  return Math.hypot(x - particle.px, y - particle.py);
}

type HomePageShapesBackgroundProps = {
  colorScheme?: ShapeColorsVariant;
  /** Forces a remount when the exploration preview switches variants. */
  previewKey?: string;
  config?: MultiShapeSpringsCanvasConfig;
  className?: string;
  componentId?: string;
  ariaLabel?: string;
};

export function HomePageShapesBackground({
  colorScheme = SHAPE_COLORS_BASELINE_SCHEME,
  previewKey,
  config = HOME_PAGE_SHAPES_CONFIG,
  className = "absolute inset-0 z-10 overflow-hidden bg-transparent",
  componentId = "home-page-shapes-background",
  ariaLabel = "Interactive proto shapes background",
}: HomePageShapesBackgroundProps = {}) {
  const [contributorShapes, setContributorShapes] = useState(
    HOME_PAGE_CONTRIBUTOR_SHAPES,
  );

  useEffect(() => {
    if (config.colorMode !== "home-palette") return;

    const submitted = readSubmittedContributorShapes();
    const merged = [...HOME_PAGE_CONTRIBUTOR_SHAPES];

    for (const shape of submitted) {
      if (!merged.some((entry) => entry.id === shape.id)) {
        merged.push(shape);
      }
    }

    setContributorShapes(merged);
  }, [config.colorMode, previewKey]);

  const slotConfigs = useMemo(
    () =>
      generateShapeSlotConfigs(
        config,
        colorScheme,
        config.colorMode === "home-palette" ? contributorShapes : [],
      ),
    [colorScheme, config, contributorShapes],
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragTooltipRef = useRef<HTMLDivElement>(null);
  const dragTooltipLabelRef = useRef<HTMLSpanElement>(null);
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
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const entranceStartedAtMs = performance.now();

    const tryCreateSlotSimulation = (
      slot: ShapeSlot,
      slotIndex: number,
      cssWidth: number,
      cssHeight: number,
    ) => {
      if (slot.sim) return;

      const currentConfig = configRef.current;
      const physicsMode = currentConfig.physicsMode ?? "background";
      const { drop, dropFromBottom, centerPop } = resolveSlotEntrance(
        slot,
        currentConfig,
      );

      if (slotUsesStaggeredEntrance(slot, currentConfig)) {
        const revealAt =
          entranceStartedAtMs +
          slotIndex * (currentConfig.shapeEntranceStagger ?? 0) * 1000;
        if (performance.now() < revealAt) return;
      }

      slot.sim = createShapeSimulation(
        slot,
        cssWidth,
        cssHeight,
        currentConfig.backgroundShapeScale,
        physicsMode,
        { drop, dropFromBottom, centerPop },
        getSlotRestFloorFactorRange(shapesRef.current),
      );
    };

    const resize = () => {
      const cssWidth = Math.max(1, Math.floor(container.clientWidth));
      const cssHeight = Math.max(1, Math.floor(container.clientHeight));
      const dpr = setupHiDpiCanvas(canvas, cssWidth, cssHeight);
      sizeRef.current = { cssWidth, cssHeight, dpr };
      const backgroundShapeScale = configRef.current.backgroundShapeScale;
      const physicsMode = configRef.current.physicsMode ?? "background";

      if (cssHeight < MIN_VALID_CANVAS_HEIGHT) {
        for (const slot of shapesRef.current) {
          slot.sim = null;
        }
        return;
      }

      const restFloorFactorRange = getSlotRestFloorFactorRange(
        shapesRef.current,
      );

      for (const slot of shapesRef.current) {
        if (slot.sim) {
          SHAPE_RUNTIMES[slot.shapeId].updateBounds(
            slot.sim,
            cssWidth,
            cssHeight,
          );
          applySlotSimulationMargin(
            slot,
            slot.sim,
            cssHeight,
            backgroundShapeScale,
            physicsMode,
            restFloorFactorRange,
          );
        } else if (!slotUsesStaggeredEntrance(slot, configRef.current)) {
          slot.sim = createShapeSimulation(
            slot,
            cssWidth,
            cssHeight,
            backgroundShapeScale,
            physicsMode,
            resolveSlotEntrance(slot, configRef.current),
            restFloorFactorRange,
          );
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
      const backgroundShapeScale = configRef.current.backgroundShapeScale;
      const physicsMode = configRef.current.physicsMode ?? "background";

      if (cssHeight >= MIN_VALID_CANVAS_HEIGHT) {
        for (let index = 0; index < shapes.length; index += 1) {
          tryCreateSlotSimulation(
            shapes[index]!,
            index,
            cssWidth,
            cssHeight,
          );
        }
      }

      for (const slot of shapes) {
        if (!slot.sim) continue;

        const isGrabbed = grabbedId === slot.id && inputRef.current.pointerDown;
        SHAPE_RUNTIMES[slot.shapeId].step(slot.sim, {
          ...inputRef.current,
          pointerDown: isGrabbed,
        });
      }

      if (physicsMode === "background") {
        for (const slot of shapes) {
          if (!slot.sim) continue;

          const isGrabbed = grabbedId === slot.id && inputRef.current.pointerDown;
          const margin = resolveShapeMargin(
            slot.shapeId,
            slot.visualScale,
            backgroundShapeScale,
          );
          const floorY = getRestFloorY(cssHeight, slot.restFloorFactor, margin);
          const pinned: CollidableParticle[] =
            isGrabbed && slot.sim.grabbedIndex > -1
              ? [slot.sim.particles[slot.sim.grabbedIndex]!]
              : [];

          if (slot.shapeId === "square") {
            resolveSquareSelfCollisionsWithFloorLock(
              slot.sim as SpringsSquareSimulation,
              floorY,
              pinned,
            );
          }

          enforceShapeFloor(slot.sim, floorY, pinned);
        }
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
        const { dotScale, renderScale } = getSlotLayout(
          slot.shapeId,
          slot.visualScale,
          backgroundShapeScale,
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

      updateDragAttributionTooltip(
        dragTooltipRef.current,
        dragTooltipLabelRef.current,
        shapes,
        grabbedId,
        inputRef.current.pointerDown,
        configRef.current.dragAttributionLabel,
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
  }, [slotConfigs]);

  return (
    <PrototypeComponent id={componentId} className={className}>
      <div
        key={previewKey}
        ref={containerRef}
        className="absolute inset-0 min-h-0 min-w-0 touch-none"
        aria-label={ariaLabel}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block touch-none select-none"
        />
        <div
          ref={dragTooltipRef}
          className={DRAG_ATTRIBUTION_TOOLTIP_CLASS}
          aria-hidden
        >
          <span ref={dragTooltipLabelRef} />
        </div>
      </div>
    </PrototypeComponent>
  );
}
