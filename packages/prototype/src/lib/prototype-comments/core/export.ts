import type { CommentAnnotation } from "./types";

export function formatAnnotationWithState<TState>(
  annotation: CommentAnnotation<TState>,
  formatState?: (state: TState & { capturedAt: string; route: string }) => string,
): string {
  const lines = [
    `### ${annotation.element}: ${annotation.comment}`,
    "",
    `- **Route:** ${annotation.interactionState.route}`,
    `- **Captured at:** ${annotation.interactionState.capturedAt}`,
  ];

  if (annotation.screenshot) {
    lines.push("", "Screenshot captured at comment time (base64 JPEG attached to annotation).");
  }

  if (formatState) {
    lines.push("", formatState(annotation.interactionState));
  } else {
    lines.push("", "```json", JSON.stringify(annotation.interactionState, null, 2), "```");
  }

  return lines.join("\n");
}

export function formatAllAnnotations<TState>(
  annotations: CommentAnnotation<TState>[],
  formatState?: (state: TState & { capturedAt: string; route: string }) => string,
): string {
  if (annotations.length === 0) return "";
  return annotations
    .map((annotation) => formatAnnotationWithState(annotation, formatState))
    .join("\n\n---\n\n");
}
