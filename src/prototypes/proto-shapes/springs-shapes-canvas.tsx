"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { useEffect, useRef } from "react";

import { bindSpringsCanvasPointerHandlers } from "./springs-canvas-pointer";
import {
  createSpringsSquareSimulation,
  drawSpringsSquareSimulation,
  pickClosestParticle as pickClosestSquareParticle,
  SQUARE_COLLISION_EDGES,
  SQUARE_SPRING_PAIRS,
  stepSpringsSquareSimulation,
  updateSpringsSquareSimulationBounds,
  type SpringsSquareSimulation,
} from "./springs-square-simulation";
import {
  createSpringsCubeSimulation,
  drawSpringsCubeSimulation,
  pickClosestParticle as pickClosestCubeParticle,
  stepSpringsCubeSimulation,
  updateSpringsCubeSimulationBounds,
  type SpringsCubeSimulation,
} from "./springs-cube-simulation";
import {
  createSpringsPentagonSimulation,
  drawSpringsPentagonSimulation,
  pickClosestParticle as pickClosestPentagonParticle,
  stepSpringsPentagonSimulation,
  updateSpringsPentagonSimulationBounds,
  type SpringsPentagonSimulation,
} from "./springs-pentagon-simulation";
import {
  createSpringsPrismSimulation,
  drawSpringsPrismSimulation,
  pickClosestParticle as pickClosestPrismParticle,
  stepSpringsPrismSimulation,
  updateSpringsPrismSimulationBounds,
  type SpringsPrismSimulation,
} from "./springs-prism-simulation";
import {
  getShapeStackDepth,
  resolveInterShapeCollisions,
  resolveSelfCollisions,
  type CollidableParticle,
  type CollisionSurface,
} from "./springs-inter-shape-collisions";
import {
  createSpringsTriangleSimulation,
  drawSpringsTriangleSimulation,
  PARTICLE_PICK_RADIUS,
  PARTICLE_PICK_RADIUS_TOUCH,
  pickClosestParticle as pickClosestTriangleParticle,
  stepSpringsTriangleSimulation,
  updateSpringsTriangleSimulationBounds,
  type SpringsTriangleSimulation,
} from "./springs-triangle-simulation";

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

type ShapeId =
  | "triangle"
  | "cube"
  | "pentagon"
  | "prism"
  | "square";

type ShapeSlot = {
  id: ShapeId;
  sim: SpringsSimulation | null;
  xFactor: number;
  yFactor: number;
  create: (width: number, height: number, x: number, y: number) => SpringsSimulation;
  updateBounds: (sim: SpringsSimulation, width: number, height: number) => void;
  pick: (
    sim: SpringsSimulation,
    x: number,
    y: number,
    pickRadius: number,
  ) => void;
  step: (sim: SpringsSimulation, input: PointerInput) => void;
  draw: (ctx: CanvasRenderingContext2D, sim: SpringsSimulation) => void;
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

function createShapeSlots(): ShapeSlot[] {
  return [
    {
      id: "triangle",
      sim: null,
      xFactor: 0.17,
      yFactor: 0.33,
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
        stepSpringsTriangleSimulation(
          sim as SpringsTriangleSimulation,
          input,
        ),
      draw: (ctx, sim) =>
        drawSpringsTriangleSimulation(ctx, sim as SpringsTriangleSimulation, {
          clearBackground: false,
          showHint: false,
        }),
      collisionEdges: TRIANGLE_COLLISION_EDGES,
    },
    {
      id: "cube",
      sim: null,
      xFactor: 0.5,
      yFactor: 0.33,
      create: (width, height, x, y) =>
        createSpringsCubeSimulation(width, height, x, y),
      updateBounds: (sim, width, height) =>
        updateSpringsCubeSimulationBounds(
          sim as SpringsCubeSimulation,
          width,
          height,
        ),
      pick: (sim, x, y, pickRadius) =>
        pickClosestCubeParticle(
          sim as SpringsCubeSimulation,
          x,
          y,
          pickRadius,
        ),
      step: (sim, input) =>
        stepSpringsCubeSimulation(sim as SpringsCubeSimulation, input),
      draw: (ctx, sim) =>
        drawSpringsCubeSimulation(ctx, sim as SpringsCubeSimulation, {
          clearBackground: false,
          showHint: false,
        }),
      collisionEdges: CUBE_COLLISION_EDGES,
    },
    {
      id: "pentagon",
      sim: null,
      xFactor: 0.83,
      yFactor: 0.33,
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
        stepSpringsPentagonSimulation(
          sim as SpringsPentagonSimulation,
          input,
        ),
      draw: (ctx, sim) =>
        drawSpringsPentagonSimulation(ctx, sim as SpringsPentagonSimulation, {
          clearBackground: false,
          showHint: false,
        }),
      collisionEdges: PENTAGON_COLLISION_EDGES,
    },
    {
      id: "square",
      sim: null,
      xFactor: 0.33,
      yFactor: 0.67,
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
        stepSpringsSquareSimulation(
          sim as SpringsSquareSimulation,
          input,
        ),
      draw: (ctx, sim) =>
        drawSpringsSquareSimulation(ctx, sim as SpringsSquareSimulation, {
          clearBackground: false,
          showHint: false,
        }),
      collisionEdges: SQUARE_COLLISION_EDGES,
    },
    {
      id: "prism",
      sim: null,
      xFactor: 0.67,
      yFactor: 0.67,
      create: (width, height, x, y) =>
        createSpringsPrismSimulation(width, height, x, y),
      updateBounds: (sim, width, height) =>
        updateSpringsPrismSimulationBounds(
          sim as SpringsPrismSimulation,
          width,
          height,
        ),
      pick: (sim, x, y, pickRadius) =>
        pickClosestPrismParticle(
          sim as SpringsPrismSimulation,
          x,
          y,
          pickRadius,
        ),
      step: (sim, input) =>
        stepSpringsPrismSimulation(sim as SpringsPrismSimulation, input),
      draw: (ctx, sim) =>
        drawSpringsPrismSimulation(ctx, sim as SpringsPrismSimulation, {
          clearBackground: false,
          showHint: false,
        }),
      collisionEdges: PRISM_COLLISION_EDGES,
    },
  ];
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

export function SpringsShapesCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapesRef = useRef<ShapeSlot[]>(createShapeSlots());
  const grabbedShapeIdRef = useRef<ShapeId | null>(null);
  const sizeRef = useRef<CanvasSize>({ cssWidth: 1, cssHeight: 1, dpr: 1 });
  const inputRef = useRef<PointerInput>({
    pointerX: 0,
    pointerY: 0,
    pointerDown: false,
  });
  const frameCountRef = useRef(0);
  const clickedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const resize = () => {
      const cssWidth = Math.max(1, Math.floor(container.clientWidth));
      const cssHeight = Math.max(1, Math.floor(container.clientHeight));
      const dpr = setupHiDpiCanvas(canvas, cssWidth, cssHeight);
      sizeRef.current = { cssWidth, cssHeight, dpr };

      for (const slot of shapesRef.current) {
        const centerX = cssWidth * slot.xFactor;
        const centerY = cssHeight * slot.yFactor;

        if (slot.sim) {
          slot.updateBounds(slot.sim, cssWidth, cssHeight);
        } else {
          slot.sim = slot.create(cssWidth, cssHeight, centerX, centerY);
        }
      }
    };

    const observer = new ResizeObserver(() => resize());
    observer.observe(container);
    resize();

    const prefersCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

    const pointerToCanvas = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        return { x: 0, y: 0 };
      }
      const x = ((clientX - rect.left) / rect.width) * sizeRef.current.cssWidth;
      const y = ((clientY - rect.top) / rect.height) * sizeRef.current.cssHeight;
      return { x, y };
    };

    const cleanupPointer = bindSpringsCanvasPointerHandlers(canvas, {
      onPointerDown: (event) => {
        const shapes = shapesRef.current;
        const { x, y } = pointerToCanvas(event.clientX, event.clientY);
        const pickRadius =
          event.pointerType === "touch"
            ? PARTICLE_PICK_RADIUS_TOUCH
            : PARTICLE_PICK_RADIUS;

        let closestId: ShapeId | null = null;
        let closestDist = Infinity;

        for (const slot of shapes) {
          if (!slot.sim) continue;
          slot.pick(slot.sim, x, y, pickRadius);
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
        clickedRef.current = true;
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
        slot.step(slot.sim, {
          ...inputRef.current,
          pointerDown:
            inputRef.current.pointerDown && grabbedId === slot.id,
        });
      }

      const particleGroups: CollidableParticle[][] = [];
      const collisionSurfaces: (CollisionSurface | undefined)[] = [];
      const pinnedParticles: CollidableParticle[] = [];

      for (const slot of shapes) {
        if (!slot.sim) continue;
        particleGroups.push(slot.sim.particles);
        collisionSurfaces.push({
          particles: slot.sim.particles,
          edges: slot.collisionEdges,
        });
        if (
          grabbedId === slot.id &&
          inputRef.current.pointerDown &&
          slot.sim.grabbedIndex > -1
        ) {
          pinnedParticles.push(slot.sim.particles[slot.sim.grabbedIndex]!);
        }
      }

      resolveInterShapeCollisions(
        particleGroups,
        pinnedParticles,
        collisionSurfaces,
      );

      for (const slot of shapes) {
        if (slot.id !== "square" || !slot.sim) continue;
        const squarePinned =
          grabbedId === "square" &&
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

      frameCountRef.current += 1;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      const drawOrder = [...shapes].sort((a, b) => {
        if (!a.sim || !b.sim) return 0;
        const aGrabbed = grabbedId === a.id;
        const bGrabbed = grabbedId === b.id;
        if (aGrabbed !== bGrabbed) return aGrabbed ? 1 : -1;
        return getShapeStackDepth(a.sim.particles) - getShapeStackDepth(b.sim.particles);
      });

      for (const slot of drawOrder) {
        if (slot.sim) slot.draw(ctx, slot.sim);
      }

      if (!clickedRef.current && frameCountRef.current > 80) {
        const alpha = Math.min(1, (frameCountRef.current - 80) / 30) * 0.3;
        ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`;
        ctx.font = "20px Avenir, system-ui, sans-serif";
        ctx.fillText(
          prefersCoarsePointer ? "Tap a point!" : "Grab a point!",
          20,
          cssHeight - 20,
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
  }, []);

  return (
    <PrototypeComponent
      id="springs-shapes-canvas"
      className="relative flex min-h-0 flex-1 flex-col"
    >
      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 touch-none"
        aria-label="Interactive springs shapes sketch"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block touch-none select-none"
        />
      </div>
    </PrototypeComponent>
  );
}
