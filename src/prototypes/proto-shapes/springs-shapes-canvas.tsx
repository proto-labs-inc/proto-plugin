"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { useEffect, useRef } from "react";

import {
  createSpringsPentagonSimulation,
  drawSpringsPentagonSimulation,
  pickClosestParticle as pickClosestPentagonParticle,
  stepSpringsPentagonSimulation,
  updateSpringsPentagonSimulationBounds,
  type SpringsPentagonSimulation,
} from "./springs-pentagon-simulation";
import {
  createSpringsTriangleSimulation,
  drawSpringsTriangleSimulation,
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

type GrabbedShape = "triangle" | "pentagon" | null;

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

function distanceToGrabbed(
  sim: SpringsTriangleSimulation | SpringsPentagonSimulation,
  x: number,
  y: number,
) {
  if (sim.grabbedIndex < 0) return Infinity;
  const particle = sim.particles[sim.grabbedIndex];
  return Math.hypot(x - particle.px, y - particle.py);
}

export function SpringsShapesCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const triangleRef = useRef<SpringsTriangleSimulation | null>(null);
  const pentagonRef = useRef<SpringsPentagonSimulation | null>(null);
  const grabbedShapeRef = useRef<GrabbedShape>(null);
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

      if (triangleRef.current) {
        updateSpringsTriangleSimulationBounds(
          triangleRef.current,
          cssWidth,
          cssHeight,
        );
      } else {
        triangleRef.current = createSpringsTriangleSimulation(
          cssWidth,
          cssHeight,
          cssWidth * 0.32,
          cssHeight / 2,
        );
      }

      if (pentagonRef.current) {
        updateSpringsPentagonSimulationBounds(
          pentagonRef.current,
          cssWidth,
          cssHeight,
        );
      } else {
        pentagonRef.current = createSpringsPentagonSimulation(
          cssWidth,
          cssHeight,
          cssWidth * 0.68,
          cssHeight / 2,
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
      const y = ((clientY - rect.top) / rect.height) * sizeRef.current.cssHeight;
      return { x, y };
    };

    const onPointerDown = (event: PointerEvent) => {
      const triangle = triangleRef.current;
      const pentagon = pentagonRef.current;
      if (!triangle || !pentagon) return;

      const { x, y } = pointerToCanvas(event.clientX, event.clientY);

      pickClosestTriangleParticle(triangle, x, y);
      pickClosestPentagonParticle(pentagon, x, y);

      const triangleDist = distanceToGrabbed(triangle, x, y);
      const pentagonDist = distanceToGrabbed(pentagon, x, y);

      if (triangleDist === Infinity && pentagonDist === Infinity) {
        grabbedShapeRef.current = null;
        return;
      }

      if (triangleDist <= pentagonDist) {
        pentagon.grabbedIndex = -1;
        grabbedShapeRef.current = "triangle";
        triangle.clicked = true;
      } else {
        triangle.grabbedIndex = -1;
        grabbedShapeRef.current = "pentagon";
        pentagon.clicked = true;
      }

      clickedRef.current = true;
      event.preventDefault();
      container.setPointerCapture(event.pointerId);
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
      if (container.hasPointerCapture(event.pointerId)) {
        container.releasePointerCapture(event.pointerId);
      }
      inputRef.current.pointerDown = false;
      grabbedShapeRef.current = null;
      if (triangleRef.current) triangleRef.current.grabbedIndex = -1;
      if (pentagonRef.current) pentagonRef.current.grabbedIndex = -1;
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", endPointer);
    container.addEventListener("pointercancel", endPointer);

    const frame = () => {
      const triangle = triangleRef.current;
      const pentagon = pentagonRef.current;
      const { cssWidth, cssHeight, dpr } = sizeRef.current;
      if (!triangle || !pentagon) return;

      const grabbed = grabbedShapeRef.current;
      stepSpringsTriangleSimulation(triangle, {
        ...inputRef.current,
        pointerDown: inputRef.current.pointerDown && grabbed === "triangle",
      });
      stepSpringsPentagonSimulation(pentagon, {
        ...inputRef.current,
        pointerDown: inputRef.current.pointerDown && grabbed === "pentagon",
      });

      frameCountRef.current += 1;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      drawSpringsTriangleSimulation(ctx, triangle, {
        clearBackground: false,
        showHint: false,
      });
      drawSpringsPentagonSimulation(ctx, pentagon, {
        clearBackground: false,
        showHint: false,
      });

      if (!clickedRef.current && frameCountRef.current > 80) {
        const alpha = Math.min(1, (frameCountRef.current - 80) / 30) * 0.3;
        ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`;
        ctx.font = "20px Avenir, system-ui, sans-serif";
        ctx.fillText("Grab a point!", 20, cssHeight - 20);
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      observer.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", endPointer);
      container.removeEventListener("pointercancel", endPointer);
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
        <canvas ref={canvasRef} className="absolute inset-0 block" />
      </div>
    </PrototypeComponent>
  );
}
