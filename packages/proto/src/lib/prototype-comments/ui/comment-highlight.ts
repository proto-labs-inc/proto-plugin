import type { AnnotationBoundingBox, CommentAnnotationFields } from "../core/types";

type HighlightInput = Pick<
  CommentAnnotationFields,
  "viewportBoundingBox" | "boundingBox" | "isFixed" | "captureViewport"
>;

export function getViewportBoundingBox(annotation: HighlightInput): AnnotationBoundingBox | null {
  if (annotation.viewportBoundingBox) {
    return annotation.viewportBoundingBox;
  }

  if (!annotation.boundingBox) return null;

  if (annotation.isFixed) {
    return annotation.boundingBox;
  }

  if (annotation.captureViewport) {
    return {
      x: annotation.boundingBox.x,
      y: annotation.boundingBox.y - annotation.captureViewport.scrollY,
      width: annotation.boundingBox.width,
      height: annotation.boundingBox.height,
    };
  }

  return null;
}

export function getCaptureAspectRatio(
  annotation: Pick<CommentAnnotationFields, "captureViewport">,
): string | undefined {
  const viewport = annotation.captureViewport;
  if (!viewport?.width || !viewport?.height) return undefined;
  return `${viewport.width} / ${viewport.height}`;
}

/** Centers the screenshot crop on the annotated element (sidebar card previews). */
export function getScreenshotObjectPosition(
  annotation: HighlightInput & Pick<CommentAnnotationFields, "captureViewport">,
): string {
  const box = getViewportBoundingBox(annotation);
  const viewport = annotation.captureViewport;
  if (!box || !viewport?.height) return "top";
  const centerY = ((box.y + box.height / 2) / viewport.height) * 100;
  return `50% ${centerY}%`;
}
