export const PROTO_TEXTURES = [
  "Solid",
  "Gradient",
  "Waves",
  "Rings",
  "Dots",
  "Grid",
] as const;

export type ProtoTextureId = (typeof PROTO_TEXTURES)[number];

export const DEFAULT_PROTO_TEXTURE_ID: ProtoTextureId = "Solid";

/** Canvas corner where card-preview textures are strongest and fade outward. */
export type TextureEmanationCorner =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

export type ShapeTextureColor = [number, number, number];

/** How much spring strokes outpace shape shrink (0 = scale with shape). */
export const SHAPE_STROKE_RATE = .8;
/** How much handle dot radius outpaces shape shrink (0 = scale with shape). */
export const SHAPE_DOT_RATE = 0.25;
/** How much handle dot outline outpaces shape shrink (0 = scale with shape). */
export const SHAPE_DOT_OUTLINE_RATE = 0.25;

/** Shape size relative to the partner-page reference layout. */
export function getShapeNormalizedRenderScale(physicsScale: number) {
  return physicsScale / REFERENCE_PROTOTYPE_SHAPE_SCALE;
}

function getShapeMetricRenderScale(
  normalizedShapeSize: number,
  rate: number,
) {
  const safe = Math.max(normalizedShapeSize, 1e-3);
  return Math.pow(safe, 1 - rate);
}

export function getShapeStrokeRenderScale(normalizedShapeSize: number) {
  return getShapeMetricRenderScale(normalizedShapeSize, SHAPE_STROKE_RATE);
}

export function getShapeDotRenderScale(normalizedShapeSize: number) {
  return getShapeMetricRenderScale(normalizedShapeSize, SHAPE_DOT_RATE);
}

export function getShapeDotOutlineRenderScale(normalizedShapeSize: number) {
  return getShapeMetricRenderScale(normalizedShapeSize, SHAPE_DOT_OUTLINE_RATE);
}

/** Scale spring strokes from normalized shape size. */
export function withShapeRenderScale(value: number, normalizedShapeSize = 1) {
  return value * getShapeStrokeRenderScale(normalizedShapeSize);
}

/** Scale handle-dot radius from normalized shape size. */
export function withShapeDotRenderScale(value: number, normalizedShapeSize = 1) {
  return value * getShapeDotRenderScale(normalizedShapeSize);
}

/** Scale handle-dot outline from normalized shape size. */
export function withShapeDotOutlineRenderScale(
  value: number,
  normalizedShapeSize = 1,
) {
  return value * getShapeDotOutlineRenderScale(normalizedShapeSize);
}

/** Spring edge strokes on canvas-drawn proto shapes. */
export const SHAPE_SPRING_LINE_WIDTH = 1.5;
/** Outline stroke around handle dots. */
export const SHAPE_DOT_OUTLINE_WIDTH = 1.5;
/** Global multiplier for draggable handle dots across all prototypes. */
export const SHAPE_DOT_SIZE_SCALE = 1.056;
/** Visible radius of draggable handle dots in canvas coordinates. */
export const SHAPE_HANDLE_DOT_RADIUS = (12 / 0.8 / 2) * SHAPE_DOT_SIZE_SCALE;

/** Reference layout scales from proto-partner-page (desktop). */
export const REFERENCE_PROTOTYPE_SHAPE_SCALE = 1.75;
export const REFERENCE_PROTOTYPE_DOT_SCALE = 1.12;
/** Dot scale divided by shape layout scale — keeps handle size consistent. */
export const SHAPE_HANDLE_DOT_TO_SHAPE_RATIO =
  REFERENCE_PROTOTYPE_DOT_SCALE / REFERENCE_PROTOTYPE_SHAPE_SCALE;

export function getShapeHandleDotScaleForShapeScale(shapeScale: number) {
  return shapeScale * SHAPE_HANDLE_DOT_TO_SHAPE_RATIO;
}

/** Three-pyramid chain reads smaller at the same base span. */
export const THREE_PART_SHAPE_SCALE = 1.2;

export type PrototypeShapeLayoutScales = {
  shapeScale: number;
  dotScale: number;
  /** Linear scale for texture pattern density. */
  renderScale: number;
  /** Normalized shape size for spring strokes and handle dots. */
  normalizedRenderScale: number;
};

type PrototypeShapeLayoutOptions = {
  /** Base layout scale before per-slot visualScale (e.g. 1.75 partner desktop). */
  layoutShapeScale: number;
  visualScale?: number;
  dotBoost?: number;
  isThreePartShape?: boolean;
};

/**
 * The single source of truth for shape + dot + stroke sizing across every
 * prototype.
 *
 * `renderScale` is the linear shape size relative to the partner-page reference
 * and drives texture pattern density. Spring strokes use
 * {@link getShapeStrokeRenderScale}; handle dots scale linearly via
 * {@link getShapeDotRenderScale}.
 */
export function getPrototypeShapeLayoutScales({
  layoutShapeScale,
  visualScale = 1,
  dotBoost = 1,
  isThreePartShape = false,
}: PrototypeShapeLayoutOptions): PrototypeShapeLayoutScales {
  const shapeScale =
    layoutShapeScale *
    visualScale *
    (isThreePartShape ? THREE_PART_SHAPE_SCALE : 1);
  const normalizedRenderScale = shapeScale / REFERENCE_PROTOTYPE_SHAPE_SCALE;

  return {
    shapeScale,
    dotScale: REFERENCE_PROTOTYPE_DOT_SCALE * dotBoost,
    renderScale: (layoutShapeScale * visualScale) / REFERENCE_PROTOTYPE_SHAPE_SCALE,
    normalizedRenderScale,
  };
}

export function getShapeHandleDotRadius(dotScale = 1, normalizedShapeSize = 1) {
  return withShapeDotRenderScale(
    SHAPE_HANDLE_DOT_RADIUS * dotScale,
    normalizedShapeSize,
  );
}

export function getShapeHandleDotOutlineWidth(normalizedShapeSize = 1) {
  return withShapeDotOutlineRenderScale(
    SHAPE_DOT_OUTLINE_WIDTH * SHAPE_DOT_SIZE_SCALE,
    normalizedShapeSize,
  );
}

/** Matches Solid fill — full-strength color in swatches and previews. */
const SHAPE_PREVIEW_ALPHA = 235;

export type ShapeTextureParticle = { px: number; py: number };

function rgb(r: number, g: number, b: number, a = 255) {
  return `rgba(${r},${g},${b},${a / 255})`;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mixRgb(
  color: ShapeTextureColor,
  target: ShapeTextureColor | "white" | "black",
  t: number,
): ShapeTextureColor {
  const [tr, tg, tb] =
    target === "white"
      ? ([255, 255, 255] as const)
      : target === "black"
        ? ([0, 0, 0] as const)
        : target;
  return [
    Math.round(lerp(color[0], tr, t)),
    Math.round(lerp(color[1], tg, t)),
    Math.round(lerp(color[2], tb, t)),
  ];
}

function textureShades(color: ShapeTextureColor) {
  return {
    pale: mixRgb(color, "white", 0.68),
    ringAlt: mixRgb(color, "white", 0.88),
  };
}

function shapeGeometry(pts: ShapeTextureParticle[]) {
  let cx = 0;
  let cy = 0;
  for (const p of pts) {
    cx += p.px;
    cy += p.py;
  }
  cx /= pts.length;
  cy /= pts.length;
  const angle = Math.atan2(pts[0]!.py - cy, pts[0]!.px - cx);
  let r = 0;
  for (const p of pts) {
    r += Math.hypot(p.px - cx, p.py - cy);
  }
  r /= pts.length;
  return { cx, cy, angle, r };
}

function particleLocalOnFace(
  particle: ShapeTextureParticle,
  cx: number,
  cy: number,
  angle: number,
) {
  const dx = particle.px - cx;
  const dy = particle.py - cy;
  return {
    x: dx * Math.cos(-angle) - dy * Math.sin(-angle),
    y: dx * Math.sin(-angle) + dy * Math.cos(-angle),
  };
}

function pathShape(
  ctx: CanvasRenderingContext2D,
  parts: ShapeTextureParticle[],
  indices: number[],
) {
  ctx.beginPath();
  ctx.moveTo(parts[indices[0]!]!.px, parts[indices[0]!]!.py);
  for (let i = 1; i < indices.length; i++) {
    ctx.lineTo(parts[indices[i]!]!.px, parts[indices[i]!]!.py);
  }
  ctx.closePath();
}

function fillLinearAnchorGradient(
  ctx: CanvasRenderingContext2D,
  cover: number,
  color: ShapeTextureColor,
  anchor: { x: number; y: number },
) {
  const [cr, cg, cb] = color;
  const { x: ax, y: ay } = anchor;
  const alen = Math.hypot(ax, ay) || 1;
  const ux = ax / alen;
  const uy = ay / alen;
  const span = Math.max(cover * 1.75, alen * 2.8);
  const g = ctx.createLinearGradient(-ux * span, -uy * span, ax, ay);
  g.addColorStop(0, rgb(cr, cg, cb, 0));
  g.addColorStop(0.58, rgb(cr, cg, cb, 6));
  g.addColorStop(0.82, rgb(cr, cg, cb, 72));
  g.addColorStop(0.94, rgb(cr, cg, cb, 185));
  g.addColorStop(1, rgb(cr, cg, cb, 255));
  ctx.fillStyle = g;
  ctx.fillRect(-cover, -cover, cover * 2, cover * 2);
}

/** Deep color at each joint, fading outward in canvas space (covers outer pyramids). */
function fillWorldJointEmanationGradient(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  color: ShapeTextureColor,
  j1: ShapeTextureParticle,
  j2: ShapeTextureParticle,
) {
  const [cr, cg, cb] = color;
  const jointSpan = Math.hypot(j2.px - j1.px, j2.py - j1.py) || 1;
  const radius = jointSpan * 1.22;

  for (const joint of [j1, j2]) {
    const g = ctx.createRadialGradient(
      joint.px,
      joint.py,
      0,
      joint.px,
      joint.py,
      radius,
    );
    g.addColorStop(0, rgb(cr, cg, cb, 210));
    g.addColorStop(0.18, rgb(cr, cg, cb, 130));
    g.addColorStop(0.38, rgb(cr, cg, cb, 32));
    g.addColorStop(1, rgb(cr, cg, cb, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
}

function fillDualAnchorGradient(
  ctx: CanvasRenderingContext2D,
  cover: number,
  color: ShapeTextureColor,
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  const [cr, cg, cb] = color;
  const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
  g.addColorStop(0, rgb(cr, cg, cb, 255));
  g.addColorStop(0.3, rgb(cr, cg, cb, 80));
  g.addColorStop(0.5, rgb(cr, cg, cb, 0));
  g.addColorStop(0.7, rgb(cr, cg, cb, 80));
  g.addColorStop(1, rgb(cr, cg, cb, 255));
  ctx.fillStyle = g;
  ctx.fillRect(-cover, -cover, cover * 2, cover * 2);
}

function fillRadialAnchorGradient(
  ctx: CanvasRenderingContext2D,
  cover: number,
  color: ShapeTextureColor,
  center: { x: number; y: number },
  pronounced = false,
) {
  const [cr, cg, cb] = color;
  const radius = cover * (pronounced ? 1.05 : 1.35);
  const g = ctx.createRadialGradient(
    center.x,
    center.y,
    0,
    center.x,
    center.y,
    radius,
  );
  if (pronounced) {
    g.addColorStop(0, rgb(cr, cg, cb, 255));
    g.addColorStop(0.22, rgb(cr, cg, cb, 220));
    g.addColorStop(0.48, rgb(cr, cg, cb, 140));
    g.addColorStop(0.72, rgb(cr, cg, cb, 50));
    g.addColorStop(1, rgb(cr, cg, cb, 0));
  } else {
    g.addColorStop(0, rgb(cr, cg, cb, 255));
    g.addColorStop(0.42, rgb(cr, cg, cb, 120));
    g.addColorStop(0.72, rgb(cr, cg, cb, 24));
    g.addColorStop(1, rgb(cr, cg, cb, 0));
  }
  ctx.fillStyle = g;
  ctx.fillRect(-cover, -cover, cover * 2, cover * 2);
}

function getTextureEmanationCornerPoint(
  canvasWidth: number,
  canvasHeight: number,
  corner: TextureEmanationCorner,
) {
  switch (corner) {
    case "bottom-right":
      return { x: canvasWidth, y: canvasHeight };
    case "bottom-left":
      return { x: 0, y: canvasHeight };
    case "top-right":
      return { x: canvasWidth, y: 0 };
    case "top-left":
      return { x: 0, y: 0 };
  }
}

function parseCssColorChannels(color: string): [number, number, number] {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return [
        Number.parseInt(hex[0]! + hex[0], 16),
        Number.parseInt(hex[1]! + hex[1], 16),
        Number.parseInt(hex[2]! + hex[2], 16),
      ];
    }
    return [
      Number.parseInt(hex.slice(0, 2), 16),
      Number.parseInt(hex.slice(2, 4), 16),
      Number.parseInt(hex.slice(4, 6), 16),
    ];
  }

  const match = color.match(/rgba?\(([^)]+)\)/);
  if (match) {
    const [r, g, b] = match[1]!
      .split(",")
      .map((part) => Number.parseFloat(part.trim()));
    return [r ?? 255, g ?? 255, b ?? 255];
  }

  return [255, 255, 255];
}

/** Card inset — full-canvas texture wash anchored at a corner. */
export type CanvasTextureEmanationRegion = "card" | "footer";

export type CanvasTextureEmanationOptions = {
  region?: CanvasTextureEmanationRegion;
  /** Scales texture alpha; use below 1 for quieter washes (e.g. CTA buttons). */
  intensity?: number;
};

/** Footer title band — keep pattern textures quieter than the shape above. */
const FOOTER_NON_GRADIENT_TEXTURE_OPACITY = 0.38;

function getEmanationMetrics(
  width: number,
  height: number,
  region: CanvasTextureEmanationRegion,
) {
  const minDim = Math.min(width, height);
  if (region === "footer") {
    return {
      textureRadius: minDim * 0.52,
      fadeRadius: Math.hypot(width, height) * 1.05,
      // Footer uses a horizontal mask; the radial value is unused.
      maskRadius: Math.hypot(width, height),
      textureCompact: false,
    };
  }
  return {
    textureRadius: minDim * 0.13,
    fadeRadius: Math.hypot(width, height) * 0.5,
    // Keep card texture a tight cluster in the corner — it must not bleed into
    // the shape canvas layered on top.
    maskRadius: minDim * 0.34,
    textureCompact: true,
  };
}

function applyFooterEmanationMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  backgroundRgb: [number, number, number],
) {
  const [br, bg, bb] = backgroundRgb;
  const mask = ctx.createLinearGradient(0, 0, width, 0);
  mask.addColorStop(0, rgb(br, bg, bb, 255));
  mask.addColorStop(0.28, rgb(br, bg, bb, 255));
  mask.addColorStop(0.48, rgb(br, bg, bb, 220));
  mask.addColorStop(0.62, rgb(br, bg, bb, 155));
  mask.addColorStop(0.74, rgb(br, bg, bb, 85));
  mask.addColorStop(0.86, rgb(br, bg, bb, 30));
  mask.addColorStop(1, rgb(br, bg, bb, 0));
  ctx.fillStyle = mask;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Paint a repeating texture across the ENTIRE layer so there is never a
 * rectangular tile boundary. The caller then dissolves it with an alpha mask.
 */
function paintEmanationTextureLayer(
  ctx: CanvasRenderingContext2D,
  texture: ProtoTextureId,
  width: number,
  height: number,
  color: ShapeTextureColor,
  anchorX: number,
  anchorY: number,
  region: CanvasTextureEmanationRegion,
) {
  const [cr, cg, cb] = color;
  const shades = textureShades(color);
  const compact = region === "card";
  const minDim = Math.min(width, height);

  if (texture === "Solid") {
    ctx.fillStyle = rgb(cr, cg, cb, SHAPE_PREVIEW_ALPHA);
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (texture === "Waves") {
    // Card previews use a small, dense pattern concentrated in the corner;
    // the footer uses larger bands that read across the band.
    const bandH = region === "footer" ? height / 3.2 : minDim * 0.055;
    const amp = bandH * 0.45;
    const wavelength = region === "footer" ? 34 : 14;
    const step = compact ? 5 : 6;
    let i = 0;
    for (let y = -bandH; y < height + bandH; y += bandH, i++) {
      ctx.fillStyle = rgb(cr, cg, cb, i % 2 ? 150 : 235);
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= width; x += step) {
        ctx.lineTo(x, y + Math.sin(x / wavelength + i) * amp);
      }
      for (let x = width; x >= 0; x -= step) {
        ctx.lineTo(x, y + bandH + Math.sin(x / wavelength + i) * amp);
      }
      ctx.closePath();
      ctx.fill();
    }
    return;
  }

  if (texture === "Dots") {
    ctx.fillStyle = rgb(cr, cg, cb, 55);
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = rgb(cr, cg, cb, 235);
    const gap = compact ? 11 : 16;
    const dotRadius = (compact ? 2.5 : 4) * SHAPE_DOT_SIZE_SCALE;
    for (let x = gap / 2; x <= width; x += gap) {
      for (let y = gap / 2; y <= height; y += gap) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    return;
  }

  if (texture === "Grid") {
    ctx.fillStyle = rgb(cr, cg, cb, 55);
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = rgb(cr, cg, cb, 235);
    ctx.lineWidth = compact ? 1.25 : 2;
    const gap = compact ? 11 : 16;
    ctx.beginPath();
    for (let x = gap / 2; x <= width; x += gap) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = gap / 2; y <= height; y += gap) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
    return;
  }

  if (texture === "Rings") {
    const [rr, rg, rb] = shades.ringAlt;
    const step = compact ? 8 : 12;
    const maxRad = Math.hypot(width, height);
    const radii: number[] = [];
    for (let rad = maxRad; rad > 0; rad -= step) {
      radii.push(rad);
    }
    for (let i = 0; i < radii.length; i++) {
      const outer = radii[i]!;
      const inner = i + 1 < radii.length ? radii[i + 1]! : 0;
      ctx.fillStyle = i % 2 ? rgb(cr, cg, cb, 165) : rgb(rr, rg, rb, 48);
      ctx.beginPath();
      ctx.arc(anchorX, anchorY, outer, 0, Math.PI * 2);
      if (inner > 0) {
        ctx.arc(anchorX, anchorY, inner, 0, Math.PI * 2, true);
      }
      ctx.fill("evenodd");
    }
    return;
  }
}

/** White alpha mask concentrating the texture near the emanation corner. */
function applyEmanationAlphaMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  anchorX: number,
  anchorY: number,
  maskRadius: number,
  region: CanvasTextureEmanationRegion,
) {
  ctx.globalCompositeOperation = "destination-in";

  if (region === "footer") {
    // Full-height on the right, dissolving smoothly toward the title on the left.
    const mask = ctx.createLinearGradient(0, 0, width, 0);
    mask.addColorStop(0, "rgba(255,255,255,0)");
    mask.addColorStop(0.34, "rgba(255,255,255,0)");
    mask.addColorStop(0.52, "rgba(255,255,255,0.4)");
    mask.addColorStop(0.72, "rgba(255,255,255,0.82)");
    mask.addColorStop(0.9, "rgba(255,255,255,1)");
    mask.addColorStop(1, "rgba(255,255,255,1)");
    ctx.fillStyle = mask;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Tight cluster in the corner so it does not bleed into the shape canvas.
    const mask = ctx.createRadialGradient(
      anchorX,
      anchorY,
      0,
      anchorX,
      anchorY,
      maskRadius,
    );
    mask.addColorStop(0, "rgba(255,255,255,1)");
    mask.addColorStop(0.32, "rgba(255,255,255,1)");
    mask.addColorStop(0.6, "rgba(255,255,255,0.5)");
    mask.addColorStop(0.82, "rgba(255,255,255,0.15)");
    mask.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = mask;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.globalCompositeOperation = "source-over";
}

export function drawCanvasTextureEmanation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  texture: ProtoTextureId,
  color: ShapeTextureColor,
  corner: TextureEmanationCorner,
  backgroundColor = "#ffffff",
  options: CanvasTextureEmanationOptions = {},
) {
  const region = options.region ?? "card";
  const intensity = options.intensity ?? 1;
  const { fadeRadius, maskRadius } = getEmanationMetrics(width, height, region);
  const [br, bg, bb] = parseCssColorChannels(backgroundColor);
  const { x, y } = getTextureEmanationCornerPoint(width, height, corner);
  const [cr, cg, cb] = color;

  if (texture === "Gradient") {
    const g = ctx.createRadialGradient(x, y, 0, x, y, fadeRadius);
    if (region === "footer") {
      g.addColorStop(0, rgb(cr, cg, cb, Math.round(215 * intensity)));
      g.addColorStop(0.38, rgb(cr, cg, cb, Math.round(145 * intensity)));
      g.addColorStop(0.58, rgb(cr, cg, cb, Math.round(72 * intensity)));
      g.addColorStop(0.76, rgb(cr, cg, cb, Math.round(22 * intensity)));
      g.addColorStop(0.9, rgb(br, bg, bb, 0));
      g.addColorStop(1, rgb(br, bg, bb, 0));
    } else {
      g.addColorStop(0, rgb(cr, cg, cb, 235));
      g.addColorStop(0.16, rgb(cr, cg, cb, 170));
      g.addColorStop(0.34, rgb(cr, cg, cb, 88));
      g.addColorStop(0.5, rgb(cr, cg, cb, 28));
      g.addColorStop(0.62, rgb(cr, cg, cb, 0));
      g.addColorStop(1, rgb(br, bg, bb, 0));
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    if (region === "footer") {
      applyFooterEmanationMask(ctx, width, height, [br, bg, bb]);
    }
    return;
  }

  // Render the repeating texture into an offscreen layer that fills the whole
  // canvas, then dissolve it with an alpha mask so it fades out with no hard
  // rectangular edge. The transparent areas reveal the background already
  // painted onto the destination canvas by the caller.
  const transform = ctx.getTransform();
  const dpr = transform.a || 1;
  const layer = document.createElement("canvas");
  layer.width = Math.max(1, Math.round(width * dpr));
  layer.height = Math.max(1, Math.round(height * dpr));
  const lctx = layer.getContext("2d");
  if (!lctx) return;
  lctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  paintEmanationTextureLayer(lctx, texture, width, height, color, x, y, region);
  applyEmanationAlphaMask(lctx, width, height, x, y, maskRadius, region);

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (region === "footer") {
    ctx.globalAlpha = FOOTER_NON_GRADIENT_TEXTURE_OPACITY * intensity;
  }
  ctx.drawImage(layer, 0, 0);
  ctx.restore();
}

function fillFadeToInnerGradient(
  ctx: CanvasRenderingContext2D,
  cover: number,
  color: ShapeTextureColor,
  fade: { x: number; y: number },
  innerPoints: { x: number; y: number }[],
) {
  const [cr, cg, cb] = color;
  const inner =
    innerPoints.length === 1
      ? innerPoints[0]!
      : {
          x: innerPoints.reduce((sum, p) => sum + p.x, 0) / innerPoints.length,
          y: innerPoints.reduce((sum, p) => sum + p.y, 0) / innerPoints.length,
        };
  const g = ctx.createLinearGradient(fade.x, fade.y, inner.x, inner.y);
  g.addColorStop(0, rgb(cr, cg, cb, 0));
  g.addColorStop(0.5, rgb(cr, cg, cb, 8));
  g.addColorStop(0.78, rgb(cr, cg, cb, 90));
  g.addColorStop(1, rgb(cr, cg, cb, 255));
  ctx.fillStyle = g;
  ctx.fillRect(-cover, -cover, cover * 2, cover * 2);
}

/** Draw a filled texture centered at the local origin. */
export function drawTextureLocal(
  ctx: CanvasRenderingContext2D,
  texture: ProtoTextureId,
  r: number,
  gradientLocals: { x: number; y: number }[],
  ringsLocal: { x: number; y: number },
  color: ShapeTextureColor,
  gradientFadeLocal?: { x: number; y: number },
  gradientRadialCenterLocal?: { x: number; y: number },
  gradientRadialPronounced?: boolean,
  compact = false,
  renderScale = 1,
) {
  const s = r * (compact ? 1.35 : 1.8);
  const cover = s * (compact ? 1.25 : 1.7);
  const [cr, cg, cb] = color;
  const shades = textureShades(color);

  if (texture === "Solid") {
    ctx.fillStyle = rgb(cr, cg, cb, SHAPE_PREVIEW_ALPHA);
    ctx.fillRect(-cover, -cover, cover * 2, cover * 2);
  } else if (texture === "Gradient") {
    if (gradientRadialCenterLocal) {
      fillRadialAnchorGradient(
        ctx,
        cover,
        color,
        gradientRadialCenterLocal,
        gradientRadialPronounced,
      );
    } else if (gradientFadeLocal) {
      fillFadeToInnerGradient(
        ctx,
        cover,
        color,
        gradientFadeLocal,
        gradientLocals,
      );
    } else if (gradientLocals.length > 1) {
      fillDualAnchorGradient(
        ctx,
        cover,
        color,
        gradientLocals[0]!,
        gradientLocals[1]!,
      );
    } else {
      fillLinearAnchorGradient(ctx, cover, color, gradientLocals[0]!);
    }
  } else if (texture === "Waves") {
    const [pr, pg, pb] = shades.pale;
    ctx.fillStyle = rgb(pr, pg, pb, compact ? 0 : 255);
    if (!compact) {
      ctx.fillRect(-cover, -cover, cover * 2, cover * 2);
    }
    const bands = compact ? 11 : 8;
    const bandH = (compact ? r * 1.35 : s * 2) / bands;
    for (let i = 0; i < bands; i++) {
      const y = compact ? -i * bandH : -s + i * bandH;
      ctx.fillStyle = rgb(cr, cg, cb, i % 2 ? 150 : 235);
      ctx.beginPath();
      ctx.moveTo(-cover, y);
      for (let x = -cover; x <= cover; x += compact ? 5 : 6) {
        ctx.lineTo(
          x,
          y +
            Math.sin(x / (compact ? 9 : 16) + i) *
              bandH *
              (compact ? 0.35 : 0.45),
        );
      }
      for (let x = cover; x >= -cover; x -= compact ? 5 : 6) {
        ctx.lineTo(
          x,
          y +
            bandH +
            Math.sin(x / (compact ? 9 : 16) + i) *
              bandH *
              (compact ? 0.35 : 0.45),
        );
      }
      ctx.closePath();
      ctx.fill();
    }
  } else if (texture === "Rings") {
    const maxRad = compact ? r * 1.55 : cover * 2.4;
    const step = compact ? Math.max(4, r / 5.5) : Math.max(6, s / 9);
    const radii: number[] = [];
    for (let rad = maxRad; rad > 0; rad -= step) {
      radii.push(rad);
    }
    for (let i = 0; i < radii.length; i++) {
      const outer = radii[i]!;
      const inner = i + 1 < radii.length ? radii[i + 1]! : 0;
      const [rr, rg, rb] = shades.ringAlt;
      ctx.fillStyle = i % 2 ? rgb(cr, cg, cb, 165) : rgb(rr, rg, rb, 48);
      ctx.beginPath();
      ctx.arc(ringsLocal.x, ringsLocal.y, outer, 0, Math.PI * 2);
      if (inner > 0) {
        ctx.arc(ringsLocal.x, ringsLocal.y, inner, 0, Math.PI * 2, true);
      }
      ctx.fill("evenodd");
    }
  } else if (texture === "Dots") {
    ctx.fillStyle = rgb(cr, cg, cb, 60);
    ctx.fillRect(-cover, -cover, cover * 2, cover * 2);
    ctx.fillStyle = rgb(cr, cg, cb, 235);
    const gap = (compact ? 11 : 18) * renderScale;
    const dotRadius =
      (compact ? 2.5 : 4) * SHAPE_DOT_SIZE_SCALE * renderScale;
    for (let x = -cover; x <= cover; x += gap) {
      for (let y = -cover; y <= cover; y += gap) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (texture === "Grid") {
    ctx.fillStyle = rgb(cr, cg, cb, 60);
    ctx.fillRect(-cover, -cover, cover * 2, cover * 2);
    ctx.strokeStyle = rgb(cr, cg, cb, 235);
    ctx.lineWidth =
      (compact ? 1.25 : 2) * getShapeStrokeRenderScale(renderScale);
    const gap = (compact ? 11 : 18) * renderScale;
    ctx.beginPath();
    for (let x = -cover; x <= cover; x += gap) {
      ctx.moveTo(x, -cover);
      ctx.lineTo(x, cover);
    }
    for (let y = -cover; y <= cover; y += gap) {
      ctx.moveTo(-cover, y);
      ctx.lineTo(cover, y);
    }
    ctx.stroke();
  }
}

export function getTextureFaceOpacity(
  texture: ProtoTextureId,
  isQuad: boolean,
): number {
  if (texture === "Rings") return isQuad ? 0.55 : 0.65;
  return isQuad ? 0.4 : 0.5;
}

export type DrawTexturedFaceParams = {
  particles: ShapeTextureParticle[];
  indices: number[];
  /** Vertices used for gradient orientation; defaults to `indices`. */
  geometryIndices?: number[];
  texture: ProtoTextureId;
  color: ShapeTextureColor;
  canvasWidth: number;
  canvasHeight: number;
  backParticleIndex: number;
  /** Gradient hotspots; when omitted, uses `backParticleIndex` only. */
  gradientParticleIndices?: number[];
  /** Face vertex that stays transparent — gradient flows inward from here. */
  gradientFadeParticleIndex?: number;
  /** Pin gradient to particle positions in canvas space (same field on every face). */
  gradientWorldSpace?: boolean;
  /** Radial gradient origin — color is strongest here and fades toward face edges. */
  gradientRadialCenterParticleIndex?: number;
  /** Tighter, higher-contrast radial falloff (cube hub). */
  gradientRadialPronounced?: boolean;
  /** Card previews — texture is strongest at this canvas corner and fades out. */
  textureEmanationCorner?: TextureEmanationCorner;
  ringParticleIndex: number;
  opacity?: number;
  /** Single per-shape scale so pattern density tracks the shape like everything else. */
  renderScale?: number;
};

export function drawTexturedFace(
  ctx: CanvasRenderingContext2D,
  params: DrawTexturedFaceParams,
) {
  const {
    particles: parts,
    indices,
    texture,
    color,
    canvasWidth,
    canvasHeight,
    backParticleIndex,
    ringParticleIndex,
  } = params;
  const isQuad = indices.length === 4;
  const opacity = params.opacity ?? getTextureFaceOpacity(texture, isQuad);
  const geomIndices = params.geometryIndices ?? indices;
  const pts = geomIndices.map((i) => parts[i]!);

  ctx.save();
  pathShape(ctx, parts, indices);
  ctx.clip();
  ctx.globalAlpha = opacity;

  const gradientIndices = params.gradientParticleIndices ?? [backParticleIndex];

  if (
    texture === "Gradient" &&
    params.gradientWorldSpace &&
    gradientIndices.length >= 2
  ) {
    fillWorldJointEmanationGradient(
      ctx,
      canvasWidth,
      canvasHeight,
      color,
      parts[gradientIndices[0]!]!,
      parts[gradientIndices[1]!]!,
    );
    ctx.restore();
    return;
  }

  const { cx, cy, angle, r } = shapeGeometry(pts);
  const ring = parts[ringParticleIndex]!;
  const rdx = ring.px - cx;
  const rdy = ring.py - cy;
  const ringsLocal = {
    x: rdx * Math.cos(-angle) - rdy * Math.sin(-angle),
    y: rdx * Math.sin(-angle) + rdy * Math.cos(-angle),
  };
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  const onFaceIndices = gradientIndices.filter((index) =>
    indices.includes(index),
  );
  const activeIndices =
    onFaceIndices.length > 0 ? onFaceIndices : [gradientIndices[0]!];
  const gradientLocals = activeIndices.map((index) =>
    particleLocalOnFace(parts[index]!, cx, cy, angle),
  );
  const gradientFadeLocal =
    params.gradientFadeParticleIndex !== undefined
      ? particleLocalOnFace(
          parts[params.gradientFadeParticleIndex]!,
          cx,
          cy,
          angle,
        )
      : undefined;
  const gradientRadialCenterLocal =
    params.gradientRadialCenterParticleIndex !== undefined
      ? particleLocalOnFace(
          parts[params.gradientRadialCenterParticleIndex]!,
          cx,
          cy,
          angle,
        )
      : undefined;
  drawTextureLocal(
    ctx,
    texture,
    r,
    gradientLocals,
    ringsLocal,
    color,
    gradientFadeLocal,
    gradientRadialCenterLocal,
    params.gradientRadialPronounced,
    false,
    params.renderScale ?? 1,
  );
  ctx.restore();

  ctx.restore();
}

export function drawParticlesWithShadow(
  ctx: CanvasRenderingContext2D,
  particles: ShapeTextureParticle[],
  dotRadius: number,
  color: ShapeTextureColor,
  normalizedShapeSize = 1,
) {
  const outlineWidth = getShapeHandleDotOutlineWidth(normalizedShapeSize);

  for (const particle of particles) {
    ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    ctx.fillStyle = "#ffffff";
    ctx.lineWidth = outlineWidth;
    ctx.beginPath();
    ctx.arc(particle.px, particle.py, dotRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

/** Render a texture preview into a square canvas (for picker swatches). */
export function drawTexturePreview(
  ctx: CanvasRenderingContext2D,
  size: number,
  texture: ProtoTextureId,
  color: ShapeTextureColor,
) {
  const r = size * 0.28;
  ctx.save();
  ctx.translate(size / 2, size / 2);
  drawTextureLocal(
    ctx,
    texture,
    r,
    [{ x: r * 0.85, y: r * 0.85 }],
    { x: -r * 0.3, y: -r * 0.3 },
    color,
  );
  ctx.restore();
}

export const SHAPE_TEXTURE_ANCHORS: Record<
  string,
  {
    backParticleIndex: number;
    ringParticleIndex: number;
    gradientRadialCenterParticleIndex?: number;
    gradientRadialPronounced?: boolean;
  }
> = {
  /** Apex — farthest from the triangular base. */
  triangle: { backParticleIndex: 4, ringParticleIndex: 0 },
  /** Inner hub where the three depth lines meet. */
  cube: {
    backParticleIndex: 7,
    ringParticleIndex: 7,
    gradientRadialCenterParticleIndex: 7,
    gradientRadialPronounced: true,
  },
  /** Hub spoke — center apex connected to every base vertex. */
  pentagon: { backParticleIndex: 5, ringParticleIndex: 0 },
  /** Front/back top centers — dual gradient in draw call. */
  prism: { backParticleIndex: 0, ringParticleIndex: 0 },
  /** Shared inner joints J1/J2 — dual gradient in draw call. */
  square: { backParticleIndex: 0, ringParticleIndex: 0 },
};
