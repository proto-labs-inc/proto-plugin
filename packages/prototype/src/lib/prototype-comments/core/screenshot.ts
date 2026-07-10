// =============================================================================
// Drawing Screenshots
// =============================================================================
//
// Captures a DOM region with drawing strokes composited on top.
//
// Uses `modern-screenshot` (optional peer dep) for DOM-to-image capture.
// If not installed, falls back to stroke-only canvas capture.
//

// Cache the import result so we only try once
let _domCaptureModule: {
  domToCanvas: (node: Node, options?: Record<string, unknown>) => Promise<HTMLCanvasElement>;
  domToJpeg: (node: Node, options?: Record<string, unknown>) => Promise<string>;
} | null | undefined; // null = tried and failed, undefined = not tried yet

async function getDomCapture() {
  if (_domCaptureModule !== undefined) return _domCaptureModule;
  try {
    _domCaptureModule = await import("modern-screenshot");
    return _domCaptureModule;
  } catch {
    _domCaptureModule = null;
    return null;
  }
}

/**
 * Check whether DOM capture is available (modern-screenshot is installed).
 * Returns a cached result after the first check.
 */
export async function isDomCaptureAvailable(): Promise<boolean> {
  return (await getDomCapture()) !== null;
}

import {
  getCommentsSidebarInset,
  getPrototypeCaptureViewport,
} from "./annotation-target";
import {
  getPrototypeScreenshotRoot,
  PROTOTYPE_COMMENTS_SIDEBAR_ROOT_ID,
} from "@prototype/lib/tool-portal";
import type { CaptureViewport } from "./types";

type CaptureUiRestore = {
  restore: () => void;
};

/**
 * Hide feedback overlays and the comments sidebar during capture.
 */
async function prepareDomForCapture(): Promise<CaptureUiRestore> {
  // Map ensures each element is hidden/restored once. The review toolbar matches
  // both `[data-prototype-review-trigger]` and `[data-prototype-comment-root]`.
  const hidden = new Map<HTMLElement, string>();

  const hideElement = (el: Element) => {
    const html = el as HTMLElement;
    if (hidden.has(html)) return;
    hidden.set(html, html.style.visibility);
    html.style.visibility = "hidden";
  };

  const captureUiSelectors = [
    "[data-feedback-toolbar]",
    "[data-comment-capture-toolbar]",
    "[data-prototype-review-trigger]",
    "[data-prototype-controls]",
    "[data-annotation-marker]",
    "[data-annotation-popup]",
    "[data-comment-capture-overlay]",
    `#${PROTOTYPE_COMMENTS_SIDEBAR_ROOT_ID}`,
    "[data-comments-sidebar]",
    "[data-prototype-review-sidebar]",
  ];

  for (const selector of captureUiSelectors) {
    document.querySelectorAll(selector).forEach(hideElement);
  }

  document.querySelectorAll("[data-prototype-comment-root]").forEach(hideElement);

  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  return {
    restore: () => {
      hidden.forEach((visibility, el) => {
        el.style.visibility = visibility;
      });
    },
  };
}

function cropSidebarFromCanvas(
  source: HTMLCanvasElement,
  sidebarInset: number,
  scale: number,
): HTMLCanvasElement {
  if (sidebarInset <= 0) return source;

  const croppedWidth = Math.max(1, source.width - Math.round(sidebarInset * scale));
  if (croppedWidth >= source.width) return source;

  const cropped = document.createElement("canvas");
  cropped.width = croppedWidth;
  cropped.height = source.height;
  const ctx = cropped.getContext("2d");
  if (!ctx) return source;

  ctx.drawImage(source, 0, 0, croppedWidth, source.height, 0, 0, croppedWidth, source.height);
  return cropped;
}

function drawCanvasPreservingAspect(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  destWidth: number,
  destHeight: number,
) {
  const targetAspect = destWidth / destHeight;
  const sourceAspect = source.width / source.height;

  let sx = 0;
  let sy = 0;
  let sw = source.width;
  let sh = source.height;

  if (sourceAspect > targetAspect) {
    sw = source.height * targetAspect;
    sx = (source.width - sw) / 2;
  } else if (sourceAspect < targetAspect) {
    sh = source.width / targetAspect;
    sy = 0;
  }

  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, destWidth, destHeight);
}

export type ViewportScreenshotResult = {
  dataUrl: string;
  captureViewport: CaptureViewport;
};

/**
 * Capture the current viewport as a JPEG data URL.
 * Hides feedback overlays during capture and crops the comments sidebar from the result.
 */
export async function captureViewportScreenshot(
  quality = 0.85,
): Promise<ViewportScreenshotResult | null> {
  const mod = await getDomCapture();
  if (!mod) {
    console.warn("[prototype-comments] modern-screenshot is not installed; viewport capture skipped.");
    return null;
  }

  const screenshotRoot = getPrototypeScreenshotRoot();
  const sidebarInset = screenshotRoot ? 0 : getCommentsSidebarInset();
  const { restore } = await prepareDomForCapture();

  try {
    const captureTarget = screenshotRoot ?? document.documentElement;
    const viewportWidth = screenshotRoot
      ? screenshotRoot.clientWidth
      : window.innerWidth;
    const viewportHeight = screenshotRoot
      ? screenshotRoot.clientHeight
      : window.innerHeight;
    const contentWidth = Math.max(1, viewportWidth - sidebarInset);
    const maxWidth = 1200;
    const scale = Math.min(1, maxWidth / contentWidth);
    const captureViewport: CaptureViewport = {
      ...getPrototypeCaptureViewport(),
      width: screenshotRoot ? viewportWidth : contentWidth,
    };

    if (screenshotRoot) {
      const dataUrl = await mod.domToJpeg(captureTarget, {
        backgroundColor: "#ffffff",
        timeout: 5000,
        width: viewportWidth,
        height: viewportHeight,
        quality,
        scale,
      });

      return { dataUrl, captureViewport };
    }

    const outW = Math.round(contentWidth * scale);
    const outH = Math.round(viewportHeight * scale);

    const domCanvas = await mod.domToCanvas(captureTarget, {
      backgroundColor: "#ffffff",
      timeout: 5000,
      width: window.innerWidth,
      height: viewportHeight,
    });

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    drawCanvasPreservingAspect(ctx, domCanvas, outW, outH);

    const cropped = cropSidebarFromCanvas(canvas, sidebarInset, scale);
    return {
      dataUrl: cropped.toDataURL("image/jpeg", quality),
      captureViewport,
    };
  } catch (err) {
    console.warn("[prototype-comments] Viewport capture failed:", err);
    return null;
  } finally {
    restore();
  }
}


// ---------------------------------------------------------------------------
// Find capture target element
// ---------------------------------------------------------------------------

/**
 * Find the smallest DOM element that covers a given viewport region.
 * Uses elementsFromPoint to get all elements at the region center,
 * then picks the smallest one that fully contains the capture area.
 */
function findCaptureTarget(
  captureX: number,
  captureY: number,
  captureW: number,
  captureH: number,
): HTMLElement {
  const cx = captureX + captureW / 2;
  const cy = captureY + captureH / 2;

  // elementsFromPoint returns elements from most specific (smallest) to least
  const elements = document.elementsFromPoint(cx, cy);

  for (const el of elements) {
    if (!(el instanceof HTMLElement)) continue;
    // Skip prototype comment UI
    if (el.hasAttribute("data-prototype-comment-root")) continue;
    if (el.closest?.("[data-prototype-comment-root]")) continue;
    if (el.hasAttribute("data-comments-sidebar")) continue;
    if (el.closest?.("[data-comments-sidebar]")) continue;
    if (el.tagName === "CANVAS") continue;
    // Skip html/body — we want something more specific
    if (el === document.documentElement || el === document.body) continue;

    const rect = el.getBoundingClientRect();
    // Accept elements that cover at least ~90% of the capture region
    if (
      rect.left <= captureX + captureW * 0.1 &&
      rect.top <= captureY + captureH * 0.1 &&
      rect.right >= captureX + captureW * 0.9 &&
      rect.bottom >= captureY + captureH * 0.9
    ) {
      return el;
    }
  }

  return document.body;
}

// ---------------------------------------------------------------------------
// DOM capture (modern-screenshot)
// ---------------------------------------------------------------------------

/**
 * Capture a viewport region as a JPEG data URL using DOM-to-image.
 * Composites drawing strokes on top.
 *
 * Returns null if modern-screenshot is not installed or capture fails.
 */
export async function captureDomRegion(
  regionX: number,
  regionY: number,
  regionW: number,
  regionH: number,
  strokes: Array<{
    points: Array<{ x: number; y: number }>;
    color: string;
    fixed: boolean;
  }>,
  padding = 32,
  quality = 0.85,
): Promise<string | null> {
  const mod = await getDomCapture();
  if (!mod) return null;

  // Region to capture in viewport coords
  const captureX = Math.max(0, regionX - padding);
  const captureY = Math.max(0, regionY - padding);
  const captureW = regionW + padding * 2;
  const captureH = regionH + padding * 2;

  // Output size (capped)
  const maxDim = 600;
  const outScale = Math.min(1, maxDim / Math.max(captureW, captureH));
  const outW = Math.round(captureW * outScale);
  const outH = Math.round(captureH * outScale);
  if (outW < 1 || outH < 1) return null;

  const { restore } = await prepareDomForCapture();

  try {
    const target = findCaptureTarget(captureX, captureY, captureW, captureH);
    const targetRect = target.getBoundingClientRect();

    // Render the target element at 1:1 CSS pixel scale
    const domCanvas = await mod.domToCanvas(target, {
      backgroundColor: "#ffffff",
      timeout: 5000,
    });

    // domToCanvas renders the element's full scrollable content.
    // We need to map our viewport capture region to the domCanvas coords.
    //
    // For non-scrollable elements: domCanvas size ≈ targetRect size
    // For scrollable elements: domCanvas size ≈ scrollWidth × scrollHeight
    //
    // The offset within the canvas depends on whether the target has scrolled content.
    // Use the ratio of canvas size to actual element dimensions.
    const ratioX = domCanvas.width / (target.scrollWidth || targetRect.width);
    const ratioY = domCanvas.height / (target.scrollHeight || targetRect.height);

    // Convert viewport offset to element-content offset
    // targetRect.top is viewport-relative; for scrolled elements we need to add scrollTop
    const scrollLeft = target === document.body ? window.scrollX : target.scrollLeft;
    const scrollTop = target === document.body ? window.scrollY : target.scrollTop;

    const elContentX = (captureX - targetRect.left + scrollLeft) * ratioX;
    const elContentY = (captureY - targetRect.top + scrollTop) * ratioY;
    const cropW = captureW * ratioX;
    const cropH = captureH * ratioY;

    // Create output canvas and crop
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // White background in case crop extends beyond domCanvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outW, outH);

    ctx.drawImage(
      domCanvas,
      elContentX, elContentY, cropW, cropH,
      0, 0, outW, outH,
    );

    // Composite drawing strokes on top
    drawStrokesOnCanvas(ctx, strokes, captureX, captureY, outScale);

    return canvas.toDataURL("image/jpeg", quality);
  } catch (err) {
    console.warn("[prototype-comments] DOM capture failed:", err);
    return null;
  } finally {
    restore();
  }
}

// ---------------------------------------------------------------------------
// Stroke-only fallback
// ---------------------------------------------------------------------------

/**
 * Capture drawing strokes as a PNG data URL (fallback when DOM capture
 * isn't available). Renders strokes on a light background.
 */
export function captureDrawingStrokes(
  regionX: number,
  regionY: number,
  regionW: number,
  regionH: number,
  strokes: Array<{
    points: Array<{ x: number; y: number }>;
    color: string;
    fixed: boolean;
  }>,
  padding = 32,
): string | null {
  try {
    const captureX = Math.max(0, regionX - padding);
    const captureY = Math.max(0, regionY - padding);
    const captureW = regionW + padding * 2;
    const captureH = regionH + padding * 2;

    const maxDim = 400;
    const scale = Math.min(1, maxDim / Math.max(captureW, captureH));
    const outW = Math.round(captureW * scale);
    const outH = Math.round(captureH * scale);

    if (outW < 1 || outH < 1) return null;

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillRect(0, 0, outW, outH);

    drawStrokesOnCanvas(ctx, strokes, captureX, captureY, scale);

    return canvas.toDataURL("image/png");
  } catch (err) {
    console.warn("[prototype-comments] Stroke capture failed:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Shared: draw strokes onto a canvas
// ---------------------------------------------------------------------------

function drawStrokesOnCanvas(
  ctx: CanvasRenderingContext2D,
  strokes: Array<{
    points: Array<{ x: number; y: number }>;
    color: string;
    fixed: boolean;
  }>,
  originX: number,
  originY: number,
  scale: number,
) {
  const scrollY = window.scrollY;
  for (const stroke of strokes) {
    if (stroke.points.length < 2) continue;

    ctx.save();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = Math.max(2, 2.5 * scale);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    for (let i = 0; i < stroke.points.length; i++) {
      const p = stroke.points[i];
      const vx = p.x;
      const vy = stroke.fixed ? p.y : p.y - scrollY;
      const cx = (vx - originX) * scale;
      const cy = (vy - originY) * scale;

      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    ctx.restore();
  }
}
