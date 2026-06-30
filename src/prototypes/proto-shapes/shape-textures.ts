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

export type ShapeTextureColor = [number, number, number];

/** Scale spring strokes and dot metrics for smaller preview renders. */
export function withShapeRenderScale(value: number, renderScale = 1) {
  return value * renderScale;
}

/** Spring edge strokes on canvas-drawn proto shapes. */
export const SHAPE_SPRING_LINE_WIDTH = 1.5;
/** Outline stroke around handle dots. */
export const SHAPE_DOT_OUTLINE_WIDTH = 1.5;
/** Visible radius of draggable handle dots (12px diameter at 0.8 web scale). */
export const SHAPE_HANDLE_DOT_RADIUS = (12 * (1 / 0.8)) / 2;

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
  const radius = jointSpan * 1.45;

  for (const joint of [j1, j2]) {
    const g = ctx.createRadialGradient(
      joint.px,
      joint.py,
      0,
      joint.px,
      joint.py,
      radius,
    );
    g.addColorStop(0, rgb(cr, cg, cb, 255));
    g.addColorStop(0.2, rgb(cr, cg, cb, 190));
    g.addColorStop(0.45, rgb(cr, cg, cb, 55));
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
) {
  const s = r * 1.8;
  const cover = s * 1.7;
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
    ctx.fillStyle = rgb(pr, pg, pb, 255);
    ctx.fillRect(-cover, -cover, cover * 2, cover * 2);
    const bands = 8;
    const bandH = (s * 2) / bands;
    for (let i = 0; i < bands; i++) {
      const y = -s + i * bandH;
      ctx.fillStyle = rgb(cr, cg, cb, i % 2 ? 150 : 235);
      ctx.beginPath();
      ctx.moveTo(-cover, y);
      for (let x = -cover; x <= cover; x += 6) {
        ctx.lineTo(x, y + Math.sin(x / 16 + i) * bandH * 0.45);
      }
      for (let x = cover; x >= -cover; x -= 6) {
        ctx.lineTo(x, y + bandH + Math.sin(x / 16 + i) * bandH * 0.45);
      }
      ctx.closePath();
      ctx.fill();
    }
  } else if (texture === "Rings") {
    const maxRad = cover * 2.4;
    const step = Math.max(6, s / 9);
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
    const gap = 18;
    for (let x = -cover; x <= cover; x += gap) {
      for (let y = -cover; y <= cover; y += gap) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (texture === "Grid") {
    ctx.fillStyle = rgb(cr, cg, cb, 60);
    ctx.fillRect(-cover, -cover, cover * 2, cover * 2);
    ctx.strokeStyle = rgb(cr, cg, cb, 235);
    ctx.lineWidth = 2;
    const gap = 18;
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
  ringParticleIndex: number;
  opacity?: number;
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
  );
  ctx.restore();
}

export function drawParticlesWithShadow(
  ctx: CanvasRenderingContext2D,
  particles: ShapeTextureParticle[],
  dotRadius: number,
  color: ShapeTextureColor,
) {
  for (const particle of particles) {
    ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    ctx.fillStyle = "#ffffff";
    ctx.lineWidth = SHAPE_DOT_OUTLINE_WIDTH;
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
