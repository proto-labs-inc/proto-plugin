import { getPrototypeCaptureViewport } from "./annotation-target";
import type { AnnotationBoundingBox, CaptureViewport, CommentAnnotationFields } from "./types";

type ViewportNormalizeInput = Pick<
  CommentAnnotationFields,
  "boundingBox" | "isFixed" | "viewportBoundingBox" | "captureViewport"
>;

export function normalizeAnnotationViewport(annotation: ViewportNormalizeInput): {
  captureViewport: CaptureViewport | undefined;
  viewportBoundingBox: AnnotationBoundingBox | undefined;
} {
  const captureViewport =
    annotation.captureViewport ??
    (typeof window !== "undefined" ? getPrototypeCaptureViewport() : undefined);

  const viewportBoundingBox =
    annotation.viewportBoundingBox ??
    (annotation.boundingBox && captureViewport
      ? {
          x: annotation.boundingBox.x,
          y: annotation.isFixed
            ? annotation.boundingBox.y
            : annotation.boundingBox.y - captureViewport.scrollY,
          width: annotation.boundingBox.width,
          height: annotation.boundingBox.height,
        }
      : undefined);

  return { captureViewport, viewportBoundingBox };
}
