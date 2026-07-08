"use client";

import { PrototypeComponent } from "proto-plugin";
import { cn } from "@/lib/cn";
import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

import {
  drawCanvasTextureEmanation,
  type CanvasTextureEmanationRegion,
  type ProtoTextureId,
  type ShapeTextureColor,
} from "../../proto-shapes/shape-textures";
import type { ProtoShapeSelection } from "./proto-shape-customizer-block";
import { DEFAULT_PROTO_TEXTURE_ID, getProtoColor } from "./proto-shape-content";

const CARD_BASE = "#ffffff";

type SubmitModalCardTextureBackgroundProps = {
  selection: ProtoShapeSelection;
  className?: string;
  style?: CSSProperties;
  backgroundColor?: string;
  emanationRegion?: CanvasTextureEmanationRegion;
  /** Scales drawn texture alpha; defaults to full strength. */
  textureIntensity?: number;
  children: ReactNode;
};

export function SubmitModalCardTextureBackground({
  selection,
  className,
  style,
  backgroundColor = CARD_BASE,
  emanationRegion = "card",
  textureIntensity = 1,
  children,
}: SubmitModalCardTextureBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { rgb } = getProtoColor(selection.colorId);
  const colorRef = useRef<ShapeTextureColor>(rgb);
  const textureRef = useRef<ProtoTextureId>(selection.textureId);
  const backgroundRef = useRef(backgroundColor);
  const regionRef = useRef(emanationRegion);
  const intensityRef = useRef(textureIntensity);
  colorRef.current = rgb;
  textureRef.current = selection.textureId;
  backgroundRef.current = backgroundColor;
  regionRef.current = emanationRegion;
  intensityRef.current = textureIntensity;
  const showTexture = selection.textureId !== DEFAULT_PROTO_TEXTURE_ID;

  useEffect(() => {
    if (!showTexture) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const paint = () => {
      const cssWidth = Math.max(1, Math.floor(container.clientWidth));
      const cssHeight = Math.max(1, Math.floor(container.clientHeight));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = backgroundRef.current;
      ctx.fillRect(0, 0, cssWidth, cssHeight);
      drawCanvasTextureEmanation(
        ctx,
        cssWidth,
        cssHeight,
        textureRef.current,
        colorRef.current,
        "bottom-right",
        backgroundRef.current,
        { region: regionRef.current, intensity: intensityRef.current },
      );
    };

    const observer = new ResizeObserver(paint);
    observer.observe(container);
    paint();

    return () => observer.disconnect();
  }, [
    selection.colorId,
    selection.textureId,
    backgroundColor,
    emanationRegion,
    textureIntensity,
    showTexture,
  ]);

  return (
    <PrototypeComponent id="submit-modal-card-texture-background">
      <div
        ref={containerRef}
        className={cn("relative overflow-hidden", className)}
        style={{ backgroundColor, ...style }}
      >
        {showTexture ? (
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 block size-full"
            aria-hidden
          />
        ) : null}
        <div className="relative z-10 flex h-full min-h-0 flex-col">{children}</div>
      </div>
    </PrototypeComponent>
  );
}
