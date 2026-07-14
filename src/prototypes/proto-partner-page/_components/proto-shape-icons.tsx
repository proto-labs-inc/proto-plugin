"use client";

import { PrototypeComponent } from "proto-plugin";
import { cn } from "@/lib/cn";
import { useEffect, useRef } from "react";

import { drawTexturePreview } from "../../proto-shapes/shape-textures";
import type {
  ProtoColorId,
  ProtoRgb,
  ProtoShapeId,
  ProtoTextureId,
} from "./proto-shape-content";

type ProtoShapeIconProps = {
  shapeId: ProtoShapeId;
  color: ProtoRgb;
  className?: string;
  size?: number;
  disableColorTransition?: boolean;
};

export function ProtoShapeIcon({
  shapeId,
  color,
  className,
  size = 24,
  disableColorTransition = false,
}: ProtoShapeIconProps) {
  const stroke = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  const fill = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.18)`;

  return (
    <PrototypeComponent
      id="proto-shape-icons.proto-shape-icon"
      className={cn(
        className
          ? "flex size-full items-center justify-center"
          : "inline-flex",
      )}
    >
      <svg
        {...(className ? {} : { width: size, height: size })}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className={cn(
          "block shrink-0",
          !disableColorTransition &&
            "[&_path]:transition-[fill,stroke] [&_path]:duration-300 [&_path]:ease-out [&_polygon]:transition-[fill,stroke] [&_polygon]:duration-300 [&_polygon]:ease-out [&_rect]:transition-[fill,stroke] [&_rect]:duration-300 [&_rect]:ease-out",
          className,
        )}
      >
        {shapeId === "triangle" ? (
          <polygon
            points="12,4 20,18 4,18"
            fill={fill}
            stroke={stroke}
            strokeWidth="1"
            strokeLinejoin="round"
          />
        ) : null}
        {shapeId === "cube" ? (
          <>
            <path
              d="M6 9 L12 5 L18 9 L18 15 L12 19 L6 15 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1"
              strokeLinejoin="round"
            />
            <path
              d="M12 5 L12 19 M6 9 L18 15 M18 9 L6 15"
              stroke={stroke}
              strokeWidth="1"
              strokeOpacity="0.45"
            />
          </>
        ) : null}
        {shapeId === "pentagon" ? (
          <polygon
            points="12,3 20,9 17,19 7,19 4,9"
            fill={fill}
            stroke={stroke}
            strokeWidth="1"
            strokeLinejoin="round"
          />
        ) : null}
        {shapeId === "square" ? (
          <>
            <rect
              x="5"
              y="5"
              width="14"
              height="14"
              rx="1"
              fill={fill}
              stroke={stroke}
              strokeWidth="1"
            />
            <path
              d="M5 12 L19 12 M12 5 L12 19"
              stroke={stroke}
              strokeWidth="1"
              strokeOpacity="0.45"
            />
          </>
        ) : null}
        {shapeId === "prism" ? (
          <>
            <polygon
              points="6,8 12,4 18,8 18,16 12,20 6,16"
              fill={fill}
              stroke={stroke}
              strokeWidth="1"
              strokeLinejoin="round"
            />
            <path
              d="M6 8 L18 8 M6 16 L18 16"
              stroke={stroke}
              strokeWidth="1"
              strokeOpacity="0.45"
            />
          </>
        ) : null}
      </svg>
    </PrototypeComponent>
  );
}

type ColorSwatchProps = {
  colorId: ProtoColorId;
  rgb: ProtoRgb;
  selected?: boolean;
  size?: "sm" | "md" | "lg" | "mobile-md";
  className?: string;
};

const SWATCH_SIZES = {
  sm: "size-5",
  md: "size-6",
  lg: "size-8",
  "mobile-md": "size-7 sm:size-5",
} as const;

const PICKER_SELECTED_RING = "0 0 0 2px rgb(0 0 0 / 0.85)";
const PICKER_UNSELECTED_RING = "0 0 0 1px rgb(0 0 0 / 0.08)";

export function ProtoColorSwatch({
  rgb,
  selected = false,
  size = "md",
  className,
}: ColorSwatchProps) {
  return (
    <PrototypeComponent id="proto-shape-icons.proto-color-swatch">
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full ${SWATCH_SIZES[size]} ${className ?? ""}`}
        style={{
          backgroundColor: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
          transition: "background-color 300ms ease-out",
          boxShadow: selected ? PICKER_SELECTED_RING : PICKER_UNSELECTED_RING,
        }}
      />
    </PrototypeComponent>
  );
}

type TextureSwatchProps = {
  textureId: ProtoTextureId;
  color: ProtoRgb;
  selected?: boolean;
  bare?: boolean;
  size?: "sm" | "md" | "tile";
  className?: string;
};

const TEXTURE_SWATCH_SIZES = {
  sm: 20,
  md: 28,
  tile: 28,
} as const;

export function ProtoTextureSwatch({
  textureId,
  color,
  selected = false,
  bare = false,
  size = "md",
  className,
}: TextureSwatchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelSize = TEXTURE_SWATCH_SIZES[size];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(pixelSize * dpr);
    canvas.height = Math.round(pixelSize * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawTexturePreview(ctx, pixelSize, textureId, color);
  }, [textureId, color, pixelSize]);

  return (
    <PrototypeComponent
      id="proto-shape-icons.proto-texture-swatch"
      className="flex shrink-0 items-center justify-center"
    >
      <span
        className={cn(
          "inline-flex shrink-0 overflow-hidden rounded-md",
          className,
        )}
        style={{
          width: pixelSize,
          height: pixelSize,
          boxShadow: bare
            ? undefined
            : selected
              ? PICKER_SELECTED_RING
              : PICKER_UNSELECTED_RING,
        }}
      >
        <canvas
          ref={canvasRef}
          width={pixelSize}
          height={pixelSize}
          className="block size-full"
          aria-hidden
        />
      </span>
    </PrototypeComponent>
  );
}
