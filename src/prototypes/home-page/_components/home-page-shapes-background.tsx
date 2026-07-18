"use client";

import { PrototypeComponent } from "proto-plugin";
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
import {
  PARTNER_FADE_UP_DURATION,
  PARTNER_SHAPE_REVEAL_DELAY_EXTRA,
} from "../../proto-partner-page/_components/partner-page-motion";
import { HOME_PAGE_BODY_ENTRANCE_DELAY } from "./home-page-shapes-constants";
import { pickUniqueCreatorNames } from "./home-page-shape-creator-names";
import { readSubmittedContributorShapes } from "../../proto-partner-page/_components/submitted-proto-shapes";
import { bindSpringsCanvasPointerHandlers } from "../../proto-shapes/springs-canvas-pointer";
import {
  getDragAttributionTooltipOffsetY,
  updateDragAttributionTooltipElement,
} from "../../proto-shapes/springs-drag-attribution-tooltip";
import { DragAttributionTooltipLayer } from "../../proto-shapes/drag-attribution-tooltip-layer";
import {
  createSpringsCubeSimulation,
  drawSpringsCubeSimulation,
  pickClosestParticle as pickClosestCubeParticle,
  stepSpringsCubeSimulation,
  updateSpringsCubeSimulationBounds,
  type SpringsCubeSimulation,
} from "../../proto-shapes/springs-cube-simulation";
import {
  getShapeStackDepth,
  resolveInterShapeFaceCollisions,
  resolveSelfCollisions,
  type CollidableParticle,
  type ShapeFaceSet,
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
  collisionFaces: readonly (readonly number[])[];
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

// Convex faces per shape (mirrors each shape's draw code, which already tiles it
// with convex polygons). Used for per-face SAT so shapes rest tight and nest
// into each other's concave gaps without interlocking.
const TRIANGLE_COLLISION_FACES = [
  [0, 1, 3, 2],
  [0, 1, 4],
  [2, 3, 4],
] as const;

const CUBE_COLLISION_FACES = [
  [2, 3, 7, 1],
  [7, 1, 4],
  [6, 7, 4, 5],
  [7, 3, 0, 4],
  [7, 1, 2, 6],
] as const;

const PENTAGON_COLLISION_FACES = [
  [0, 1, 5],
  [1, 2, 5],
  [2, 3, 5],
  [3, 4, 5],
  [4, 0, 5],
] as const;

const PRISM_COLLISION_FACES = [
  [0, 1, 4, 3],
  [1, 2, 5, 4],
  [2, 0, 3, 5],
  [0, 1, 2],
  [3, 4, 5],
] as const;

const SQUARE_COLLISION_FACES = [
  [0, 2, 3],
  [0, 3, 4],
  [0, 4, 2],
  [2, 3, 4],
  [5, 0, 1],
  [5, 1, 6],
  [5, 6, 0],
  [0, 1, 6],
  [1, 7, 8],
  [1, 8, 9],
  [1, 9, 7],
  [7, 8, 9],
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
    collisionFaces: TRIANGLE_COLLISION_FACES,
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
    collisionFaces: CUBE_COLLISION_FACES,
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
    collisionFaces: PENTAGON_COLLISION_FACES,
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
    collisionFaces: SQUARE_COLLISION_FACES,
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
    collisionFaces: PRISM_COLLISION_FACES,
  },
};

const WARM_START_FRAMES = 90;
const MIN_VALID_CANVAS_HEIGHT = 120;
/**
 * Stack sleeping: a settled shape stops shivering once it's barely moved for a
 * while. It's then frozen (velocities zeroed, step skipped) and treated as an
 * immovable anchor so its neighbours also calm down, until a grab or a
 * fast-moving neighbour wakes it.
 */
/** Per-frame centroid movement below which a shape counts as "barely moving". */
const STACK_SLEEP_MOVE = 1.0;
const STACK_SLEEP_FRAMES = 30;
/** Stack-drop spawn band — spread shapes vertically so they don't tangle on spawn. */
const STACK_DROP_SPAWN_Y_MIN = 0.02;
const STACK_DROP_SPAWN_Y_MAX = 0.42;

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
  /** Collapse and pop open at the shape's own resting spot — no drop or travel. */
  entrancePopInPlace?: boolean;
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
   * floors plus screen-edge walls.
   * `background` uses the same shelf floors for squares; other shapes also get
   * a per-particle floor clamp after each step.
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
  /**
   * Collapse warm-started shapes at their own resting spot and pop open there —
   * no vertical or horizontal travel. Applies to every slot unless a slot opts
   * out with its own entrance.
   */
  entrancePopInPlace?: boolean;
  /** Pause before the first shape entrance (seconds). */
  shapeEntranceDelay?: number;
  /** Stagger per-shape reveal on entrance (seconds). Requires entranceDrop or entranceCenterPop. */
  shapeEntranceStagger?: number;
  /**
   * Fallback label for the drag-attribution tooltip. Per-slot `attributionLabel`
   * takes precedence when set.
   */
  dragAttributionLabel?: string;
  /**
   * Scale shapes up and keep colors saturated toward the bottom shelf; shrink
   * and lighten them toward the top.
   */
  depthGradient?: boolean;
  /**
   * Shared bottom floor with inter-shape collisions so shapes fall and stack
   * like the proto-shapes canvas.
   */
  pileUp?: boolean;
};

export function homePageShapeEntranceDelayS() {
  return (
    HOME_PAGE_BODY_ENTRANCE_DELAY +
    PARTNER_FADE_UP_DURATION +
    PARTNER_SHAPE_REVEAL_DELAY_EXTRA
  );
}

export const HOME_PAGE_SHAPES_CONFIG: MultiShapeSpringsCanvasConfig = {
  shapeCount: 30,
  seed: 0x1a2b3c4d,
  gridCols: 8,
  minRestFloorFactor: 0.08,
  maxRestFloorFactor: 0.995,
  minVisualScale: 1,
  maxVisualScale: 1.5,
  backgroundShapeScale: 0.72,
  colorMode: "home-palette",
  physicsMode: "partner",
  entranceDrop: true,
  pileUp: true,
  shapeEntranceDelay: homePageShapeEntranceDelayS(),
  shapeEntranceStagger: 0,
  depthGradient: false,
};

/** Desktop home layout — current authored shape size. */
const HOME_PAGE_LARGE_MIN_WIDTH = 1200;
/** Matches partner-page mobile viewport (`sm` breakpoint minus one). */
const HOME_PAGE_MOBILE_MAX_WIDTH = 639;
/** Multipliers on `backgroundShapeScale` below the large breakpoint. */
const HOME_PAGE_SHAPE_SCALE_MEDIUM = 0.78;
const HOME_PAGE_SHAPE_SCALE_MOBILE = 0.6;

export function resolveHomePageBackgroundShapeScale(
  cssWidth: number,
  baseScale: number,
) {
  if (cssWidth >= HOME_PAGE_LARGE_MIN_WIDTH) return baseScale;
  if (cssWidth > HOME_PAGE_MOBILE_MAX_WIDTH) {
    return baseScale * HOME_PAGE_SHAPE_SCALE_MEDIUM;
  }
  return baseScale * HOME_PAGE_SHAPE_SCALE_MOBILE;
}
/** Blend toward white at the top shelf when depthGradient is enabled. */
const DEPTH_TOP_COLOR_LIGHTEN = 0.78;
/** Canvas alpha at the top shelf — bottom shapes stay fully opaque. */
const DEPTH_TOP_DRAW_ALPHA = 0.38;
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
  entrancePopInPlace?: boolean;
  attributionLabel?: string;
};

type ShapeSlot = ShapeSlotConfig & {
  sim: SpringsSimulation | null;
  /** Consecutive frames the centroid has stayed within the sleep radius. */
  stillFrames?: number;
  /** Frozen once settled so it stops shivering; wakes on grab or impact. */
  asleep?: boolean;
  /** Anchor centroid the shape is being measured against while settling. */
  lastCx?: number;
  lastCy?: number;
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

function getShapeShelfDepthT(
  restFloorFactor: number,
  minRestFloorFactor: number,
  maxRestFloorFactor: number,
) {
  const span = maxRestFloorFactor - minRestFloorFactor;
  if (span <= 0) return 1;
  return Math.min(
    1,
    Math.max(0, (restFloorFactor - minRestFloorFactor) / span),
  );
}

function getDepthVisualScale(
  depthT: number,
  config: MultiShapeSpringsCanvasConfig,
  baseScale = 1,
) {
  const shelfScale =
    config.minVisualScale +
    depthT * (config.maxVisualScale - config.minVisualScale);
  return shelfScale * baseScale;
}

function getDepthAdjustedColor(color: ProtoRgb, depthT: number): ProtoRgb {
  const lighten = (1 - depthT) * DEPTH_TOP_COLOR_LIGHTEN;
  return [
    Math.round(color[0] + (255 - color[0]) * lighten),
    Math.round(color[1] + (255 - color[1]) * lighten),
    Math.round(color[2] + (255 - color[2]) * lighten),
  ];
}

function getDepthDrawAlpha(depthT: number) {
  return DEPTH_TOP_DRAW_ALPHA + depthT * (1 - DEPTH_TOP_DRAW_ALPHA);
}

function applyDepthGradientToSlot<
  T extends Pick<ShapeSlotConfig, "color" | "restFloorFactor" | "visualScale">,
>(
  slot: T,
  config: MultiShapeSpringsCanvasConfig,
  baseVisualScale = 1,
): T {
  if (!config.depthGradient) return slot;

  const depthT = getShapeShelfDepthT(
    slot.restFloorFactor,
    config.minRestFloorFactor,
    config.maxRestFloorFactor,
  );

  return {
    ...slot,
    visualScale: getDepthVisualScale(depthT, config, baseVisualScale),
    color: getDepthAdjustedColor(slot.color, depthT),
  };
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
    entrancePopInPlace: slot.entrancePopInPlace,
    attributionLabel: slot.attributionLabel,
  };
}

function resolveSharedStackPhysics(config: MultiShapeSpringsCanvasConfig) {
  return Boolean(
    config.pileUp ||
      (config.entranceDrop &&
        !config.entrancePopInPlace &&
        !config.entranceCenterPop),
  );
}

function normalizeSlotForPileUp(
  slot: ShapeSlotConfig,
  config: MultiShapeSpringsCanvasConfig,
): ShapeSlotConfig {
  if (!resolveSharedStackPhysics(config)) return slot;
  return { ...slot, restFloorFactor: config.maxRestFloorFactor };
}

function generateShapeSlotConfigs(
  config: MultiShapeSpringsCanvasConfig,
  colorScheme: ShapeColorsVariant,
  contributorShapes: HomePageContributorShape[] = [],
): ShapeSlotConfig[] {
  if (config.fixedSlots?.length) {
    return config.fixedSlots.map((slot) =>
      normalizeSlotForPileUp(
        fixedSlotToConfig(slot, colorScheme, config.colorMode),
        config,
      ),
    );
  }

  // Fresh randomness on every generation so the layout differs each page load.
  const runtimeSeed =
    (config.seed ^ ((Math.random() * 0xffffffff) >>> 0)) >>> 0;
  const random = createSeededRandom(runtimeSeed);
  const nameRandom = createSeededRandom(runtimeSeed ^ 0x6e616d65);
  const slots: ShapeSlotConfig[] = [];
  const textures = [...PROTO_TEXTURES];
  const restFloorFactors = generateUniqueRestFloorFactors(
    config.shapeCount,
    random,
    config,
  );
  const creatorNames = pickUniqueCreatorNames(
    config.shapeCount,
    nameRandom,
    contributorShapes.map((shape) => shape.contributorName),
  );

  for (let index = 0; index < config.shapeCount; index += 1) {
    const col = index % config.gridCols;
    const colorId = pickRandom(
      PROTO_COLORS.map((color) => color.id),
      random,
    ) as ProtoColorId;

    const restFloorFactor = restFloorFactors[index]!;
    const baseColor =
      config.colorMode === "proto-colors"
        ? getProtoColor(colorId).rgb
        : getHomeShapePaletteColor(colorId, colorScheme);
    const scaleJitter = config.depthGradient ? 0.9 + random() * 0.2 : 1;

    slots.push(
      applyDepthGradientToSlot(
        {
          id: String(index),
          shapeId: pickRandom(
            PROTO_SHAPES.map((shape) => shape.id),
            random,
          ),
          color: baseColor,
          textureId: pickRandom(textures, random),
          visualScale:
            config.minVisualScale +
            random() * (config.maxVisualScale - config.minVisualScale),
          restFloorFactor,
          xFactor:
            0.02 +
            ((col + 0.5) / config.gridCols) * 0.96 +
            (random() - 0.5) * 0.06,
          yFactor: resolveSharedStackPhysics(config)
            ? STACK_DROP_SPAWN_Y_MIN +
              random() * (STACK_DROP_SPAWN_Y_MAX - STACK_DROP_SPAWN_Y_MIN)
            : 0.02 + random() * 0.08,
          attributionLabel: creatorNames[index]!,
        },
        config,
        scaleJitter,
      ),
    );
  }

  const contributorSlots = contributorShapes.map((shape) =>
    normalizeSlotForPileUp(
      applyDepthGradientToSlot(
        contributorShapeToSlotConfig(shape),
        config,
        shape.visualScale,
      ),
      config,
    ),
  );
  return [
    ...contributorSlots,
    ...slots.map((slot) => normalizeSlotForPileUp(slot, config)),
  ];
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
  sharedStackPhysics = false,
) {
  const renderMargin = resolveShapeMargin(
    slot.shapeId,
    slot.visualScale,
    backgroundShapeScale,
  );
  if (sharedStackPhysics) {
    sim.margin = renderMargin;
    sim.floorInset = undefined;
    return;
  }
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
  if (slot.shapeId === "square") {
    sim.floorInset = getShelfSimulationMargin(
      cssHeight,
      slot.restFloorFactor,
      renderMargin,
    );
  } else {
    sim.floorInset = undefined;
  }
}

/**
 * Rest non-square shapes on their shelf layer using a per-particle floor.
 * Squares use floorInset instead — same approach as invite follow-up.
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

function updateShapeAttributionTooltip(
  tooltip: HTMLDivElement | null,
  labelEl: HTMLSpanElement | null,
  shapes: ShapeSlot[],
  activeShapeId: string | null,
  globalLabel: string | undefined,
  positionAnchor: HTMLElement | null,
  backgroundShapeScale: number,
  useFixedTooltipPosition = true,
) {
  if (!activeShapeId) {
    if (tooltip) tooltip.style.display = "none";
    return;
  }

  const slot = shapes.find((entry) => entry.id === activeShapeId);
  const label = slot?.attributionLabel ?? globalLabel;
  if (!slot?.sim || !label) {
    if (tooltip) tooltip.style.display = "none";
    return;
  }

  const { dotScale, normalizedRenderScale } = getSlotLayout(
    slot.shapeId,
    slot.visualScale,
    backgroundShapeScale,
  );

  updateDragAttributionTooltipElement(
    tooltip,
    labelEl,
    getSimulationCentroid(slot.sim),
    label,
    false,
    positionAnchor,
    getDragAttributionTooltipOffsetY(
      slot.sim.particles,
      dotScale,
      normalizedRenderScale,
    ),
    useFixedTooltipPosition,
  );
}

/** Matches PartnerShapeCanvas — tiny cluster so springs distend on the first live frames. */
const INITIAL_POP_COLLAPSE_FACTOR = 0.04;
/**
 * Minimum gap kept between an in-place pop's collapse point and the shape's
 * floor. The smallest shapes settle with their centroid only a pixel or two
 * above the floor, so collapsing to the centroid would still glue them to the
 * boundary and flatten them. Lifting the collapse point ensures every shape
 * reopens in free space before gravity settles it onto its shelf.
 */
const POP_IN_PLACE_MIN_FLOOR_GAP = 32;
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
  popInPlace?: boolean;
};

function resolveSlotEntrance(
  slot: Pick<
    ShapeSlotConfig,
    "entranceDrop" | "entranceDropFromBottom" | "entrancePopInPlace"
  >,
  config: MultiShapeSpringsCanvasConfig,
) {
  const dropFromBottom = slot.entranceDropFromBottom ?? false;
  const drop =
    dropFromBottom || (slot.entranceDrop ?? config.entranceDrop ?? false);
  const popInPlace = drop
    ? false
    : (slot.entrancePopInPlace ?? config.entrancePopInPlace ?? false);
  return {
    drop,
    dropFromBottom,
    popInPlace,
    centerPop: drop ? false : popInPlace || (config.entranceCenterPop ?? false),
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
    (config.entranceCenterPop ?? false) ||
    (config.shapeEntranceDelay ?? 0) > 0 ||
    (config.shapeEntranceStagger ?? 0) > 0
  );
}

function launchShapeFromBottom(sim: SpringsSimulation, targetFloorY: number) {
  const centroid = getSimulationCentroid(sim);
  const launchVy = -Math.max(
    14,
    Math.min(30, (centroid.y - targetFloorY) * 0.14),
  );
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
    if (shapeId !== "square") {
      enforceShapeFloor(sim, floorY);
    }
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
  sharedStackPhysics = false,
) {
  const {
    drop = false,
    dropFromBottom = false,
    centerPop = false,
    popInPlace = false,
  } = entrance;
  const runtime = SHAPE_RUNTIMES[slot.shapeId];
  const spawnX = cssWidth * slot.xFactor;
  const spawnY = dropFromBottom
    ? cssHeight * BOTTOM_POP_COLLAPSE_Y_FACTOR
    : drop
      ? sharedStackPhysics
        ? cssHeight * slot.yFactor
        : cssHeight * Math.max(0.02, slot.yFactor - 0.22)
      : cssHeight * slot.restFloorFactor;
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
    sharedStackPhysics,
  );
  if (!drop) {
    const floorY = getRestFloorY(
      cssHeight,
      slot.restFloorFactor,
      resolveShapeMargin(slot.shapeId, slot.visualScale, backgroundShapeScale),
    );
    warmStartSimulation(runtime, sim, floorY, slot.shapeId, physicsMode);
    if (centerPop) {
      if (popInPlace) {
        // Collapse in free space above the shape's floor rather than onto the
        // floor line. Popping open while pinned to the floor boundary lets the
        // boundary clamp zero out downward velocity every frame, biasing the
        // reopening horizontal until the shape locks into a flat, collinear
        // line it can never recover from. Reopening in free space (like the
        // center pop below) lets it distend into its full 3D form, then settle
        // onto its shelf. Tiny shapes settle with their centroid barely above
        // the floor, so clamp the collapse point up by a minimum gap.
        const centroid = getSimulationCentroid(sim);
        const collapseY = Math.min(
          centroid.y,
          floorY - POP_IN_PLACE_MIN_FLOOR_GAP,
        );
        collapseShapeForPop(sim, centroid.x, collapseY);
      } else {
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

function findShapeAtPoint(
  shapes: readonly ShapeSlot[],
  x: number,
  y: number,
  pointerType: string,
) {
  const basePickRadius =
    pointerType === "touch" ? PARTICLE_PICK_RADIUS_TOUCH : PARTICLE_PICK_RADIUS;

  let closestId: string | null = null;
  let closestDist = Infinity;

  for (const slot of shapes) {
    if (!slot.sim) continue;

    const runtime = SHAPE_RUNTIMES[slot.shapeId];
    const pickRadius = basePickRadius * Math.max(0.9, slot.visualScale);
    const previousGrabbedIndex = slot.sim.grabbedIndex;
    runtime.pick(slot.sim, x, y, pickRadius);
    const dist = distanceToGrabbed(slot.sim, x, y);
    slot.sim.grabbedIndex = previousGrabbedIndex;

    if (dist < closestDist) {
      closestDist = dist;
      closestId = slot.id;
    }
  }

  if (!closestId || closestDist === Infinity) {
    return null;
  }

  return closestId;
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

    setContributorShapes((current) => {
      if (
        current.length === merged.length &&
        current.every(
          (shape, index) =>
            shape.id === merged[index]?.id &&
            shape.contributorName === merged[index]?.contributorName,
        )
      ) {
        return current;
      }
      return merged;
    });
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
    slotConfigs.map((config) => ({
      ...config,
      sim: null,
    })),
  );

  useEffect(() => {
    shapesRef.current = slotConfigs.map((config) => {
      const existing = shapesRef.current.find((slot) => slot.id === config.id);
      const sim =
        existing?.sim && existing.shapeId === config.shapeId
          ? existing.sim
          : null;
      return {
        ...config,
        sim,
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
  const backgroundShapeScaleRef = useRef(config.backgroundShapeScale);
  configRef.current = config;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    if (resolveSharedStackPhysics(configRef.current)) {
      for (const slot of shapesRef.current) {
        slot.sim = null;
      }
    }

    const entranceStartedAtMs = performance.now();
    const pileUpStaggerOrder = new Map<string, number>();
    if (resolveSharedStackPhysics(configRef.current)) {
      [...shapesRef.current]
        .sort((a, b) => a.xFactor - b.xFactor)
        .forEach((slot, orderIndex) => {
          pileUpStaggerOrder.set(slot.id, orderIndex);
        });
    }

    const tryCreateSlotSimulation = (
      slot: ShapeSlot,
      slotIndex: number,
      cssWidth: number,
      cssHeight: number,
    ) => {
      if (slot.sim) return;

      const currentConfig = configRef.current;
      const physicsMode = currentConfig.physicsMode ?? "background";
      const staggerIndex = resolveSharedStackPhysics(currentConfig)
        ? (pileUpStaggerOrder.get(slot.id) ?? slotIndex)
        : slotIndex;

      if (slotUsesStaggeredEntrance(slot, currentConfig)) {
        const revealAt =
          entranceStartedAtMs +
          (currentConfig.shapeEntranceDelay ?? 0) * 1000 +
          staggerIndex * (currentConfig.shapeEntranceStagger ?? 0) * 1000;
        if (performance.now() < revealAt) return;
      }

      slot.sim = createShapeSimulation(
        slot,
        cssWidth,
        cssHeight,
        backgroundShapeScaleRef.current,
        physicsMode,
        resolveSlotEntrance(slot, currentConfig),
        getSlotRestFloorFactorRange(shapesRef.current),
        resolveSharedStackPhysics(currentConfig),
      );
    };

    const resize = () => {
      const cssWidth = Math.max(1, Math.floor(container.clientWidth));
      const cssHeight = Math.max(1, Math.floor(container.clientHeight));
      const dpr = setupHiDpiCanvas(canvas, cssWidth, cssHeight);
      sizeRef.current = { cssWidth, cssHeight, dpr };
      const previousBackgroundShapeScale = backgroundShapeScaleRef.current;
      const backgroundShapeScale = resolveHomePageBackgroundShapeScale(
        cssWidth,
        configRef.current.backgroundShapeScale,
      );
      backgroundShapeScaleRef.current = backgroundShapeScale;
      const physicsMode = configRef.current.physicsMode ?? "background";

      if (
        previousBackgroundShapeScale > 0 &&
        previousBackgroundShapeScale !== backgroundShapeScale
      ) {
        const scaleRatio = backgroundShapeScale / previousBackgroundShapeScale;
        for (const slot of shapesRef.current) {
          if (!slot.sim) continue;
          scaleSpringsSimulationAroundCentroid(slot.sim, scaleRatio);
        }
      }

      if (cssHeight < MIN_VALID_CANVAS_HEIGHT) {
        for (const slot of shapesRef.current) {
          slot.sim = null;
        }
        return;
      }

      const restFloorFactorRange = getSlotRestFloorFactorRange(
        shapesRef.current,
      );

      for (let index = 0; index < shapesRef.current.length; index += 1) {
        const slot = shapesRef.current[index]!;
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
            resolveSharedStackPhysics(configRef.current),
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
            resolveSharedStackPhysics(configRef.current),
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
        const closestId = findShapeAtPoint(shapes, x, y, event.pointerType);

        if (!closestId) {
          grabbedShapeIdRef.current = null;
          return false;
        }

        const winningSlot = shapes.find((slot) => slot.id === closestId);
        if (winningSlot?.sim) {
          const pickRadius =
            event.pointerType === "touch"
              ? PARTICLE_PICK_RADIUS_TOUCH
              : PARTICLE_PICK_RADIUS;
          const scaledRadius =
            pickRadius * Math.max(0.9, winningSlot.visualScale);
          SHAPE_RUNTIMES[winningSlot.shapeId].pick(
            winningSlot.sim,
            x,
            y,
            scaledRadius,
          );
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
      const backgroundShapeScale = backgroundShapeScaleRef.current;
      const physicsMode = configRef.current.physicsMode ?? "background";

      if (cssHeight >= MIN_VALID_CANVAS_HEIGHT) {
        for (let index = 0; index < shapes.length; index += 1) {
          tryCreateSlotSimulation(shapes[index]!, index, cssWidth, cssHeight);
        }
      }

      const sharedStackPhysics = resolveSharedStackPhysics(configRef.current);

      if (sharedStackPhysics) {
        for (const slot of shapes) {
          if (!slot.sim) continue;
          slot.sim.floorInset = undefined;
        }
      }

      for (const slot of shapes) {
        if (!slot.sim) continue;

        const isGrabbed = grabbedId === slot.id && inputRef.current.pointerDown;
        if (isGrabbed && slot.asleep) {
          slot.asleep = false;
          slot.stillFrames = 0;
        }
        // Frozen settled shapes skip integration entirely so they can't shiver.
        if (sharedStackPhysics && slot.asleep) continue;
        SHAPE_RUNTIMES[slot.shapeId].step(slot.sim, {
          ...inputRef.current,
          pointerDown: isGrabbed,
        });
      }

      if (sharedStackPhysics) {
        const particleGroups: CollidableParticle[][] = [];
        const faceSets: ShapeFaceSet[] = [];
        const pinnedParticles: CollidableParticle[] = [];
        const sleeping: boolean[] = [];
        const activeSlots: ShapeSlot[] = [];

        for (const slot of shapes) {
          if (!slot.sim) continue;
          activeSlots.push(slot);
          particleGroups.push(slot.sim.particles);
          faceSets.push(SHAPE_RUNTIMES[slot.shapeId].collisionFaces);
          sleeping.push(slot.asleep ?? false);
          if (
            grabbedId === slot.id &&
            inputRef.current.pointerDown &&
            slot.sim.grabbedIndex > -1
          ) {
            pinnedParticles.push(slot.sim.particles[slot.sim.grabbedIndex]!);
          }
        }

        resolveInterShapeFaceCollisions(
          particleGroups,
          faceSets,
          pinnedParticles,
          sleeping,
          (groupIndex) => {
            const woken = activeSlots[groupIndex];
            if (woken) {
              woken.asleep = false;
              woken.stillFrames = 0;
            }
          },
        );

        for (const slot of activeSlots) {
          if (!slot.sim || slot.asleep) continue;

          const centroid = getSimulationCentroid(slot.sim);
          const isGrabbed =
            grabbedId === slot.id && inputRef.current.pointerDown;
          const moved =
            slot.lastCx === undefined
              ? Infinity
              : Math.hypot(centroid.x - slot.lastCx, centroid.y - slot.lastCy!);
          slot.lastCx = centroid.x;
          slot.lastCy = centroid.y;

          // Reset the timer whenever the shape moves meaningfully or is grabbed;
          // slow creep and in-place bounce below the threshold settle to sleep.
          if (isGrabbed || moved >= STACK_SLEEP_MOVE) {
            slot.stillFrames = 0;
            continue;
          }

          slot.stillFrames = (slot.stillFrames ?? 0) + 1;
          if (slot.stillFrames >= STACK_SLEEP_FRAMES) {
            slot.asleep = true;
            for (const particle of slot.sim.particles) {
              particle.vx = 0;
              particle.vy = 0;
            }
          }
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
      } else if (physicsMode === "background") {
        for (const slot of shapes) {
          if (!slot.sim) continue;

          const isGrabbed =
            grabbedId === slot.id && inputRef.current.pointerDown;
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

          if (slot.shapeId !== "square") {
            enforceShapeFloor(slot.sim, floorY, pinned);
          }
        }
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      const drawOrder = [...shapes].sort((a, b) => {
        const aGrabbed = grabbedId === a.id;
        const bGrabbed = grabbedId === b.id;
        if (aGrabbed !== bGrabbed) return aGrabbed ? 1 : -1;
        if (sharedStackPhysics) {
          if (!a.sim || !b.sim) return 0;
          return (
            getShapeStackDepth(a.sim.particles) -
            getShapeStackDepth(b.sim.particles)
          );
        }
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
        const currentConfig = configRef.current;
        if (currentConfig.depthGradient) {
          const depthT = getShapeShelfDepthT(
            slot.restFloorFactor,
            currentConfig.minRestFloorFactor,
            currentConfig.maxRestFloorFactor,
          );
          ctx.globalAlpha = getDepthDrawAlpha(depthT);
        }
        runtime.draw(
          ctx,
          slot.sim,
          slot.color,
          slot.textureId,
          dotScale,
          renderScale,
        );
        ctx.globalAlpha = 1;
      }

      const tooltipShapeId =
        inputRef.current.pointerDown && grabbedId ? grabbedId : null;

      updateShapeAttributionTooltip(
        dragTooltipRef.current,
        dragTooltipLabelRef.current,
        shapes,
        tooltipShapeId,
        configRef.current.dragAttributionLabel,
        containerRef.current,
        backgroundShapeScale,
        false,
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
        <DragAttributionTooltipLayer
          tooltipRef={dragTooltipRef}
          labelRef={dragTooltipLabelRef}
          portaled={false}
        />
      </div>
    </PrototypeComponent>
  );
}
