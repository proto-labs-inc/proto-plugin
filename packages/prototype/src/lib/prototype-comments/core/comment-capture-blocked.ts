import { closestCrossingShadow } from "./element-identification";

/** DOM regions where comment capture must not attach (plugin chrome, not prototype UI). */
export const COMMENT_CAPTURE_BLOCKED_SELECTORS = [
  "[data-feedback-toolbar]",
  "[data-comment-capture-toolbar]",
  "[data-prototype-review-trigger]",
  "[data-prototype-review-footer]",
  "[data-prototype-review-sidebar]",
  "[data-prototype-review-panel]",
  "[data-comments-sidebar]",
  "#prototype-comments-sidebar-root",
  "[data-annotation-popup]",
  "[data-annotation-marker]",
  "[data-prototype-share-hint]",
] as const;

export function isCommentCaptureBlockedTarget(target: HTMLElement): boolean {
  return COMMENT_CAPTURE_BLOCKED_SELECTORS.some(
    (selector) => closestCrossingShadow(target, selector) != null,
  );
}

/** CSS :not() chain for descendants that should not receive comment-mode crosshair. */
export function buildCommentCaptureCursorExclusionCss(): string {
  return COMMENT_CAPTURE_BLOCKED_SELECTORS.flatMap((selector) => [
    `:not(${selector})`,
    `:not(${selector} *)`,
  ]).join("");
}

/** Injected while comment/share capture is active. */
export function buildCommentCaptureCursorStyles(): string {
  const exclusions = buildCommentCaptureCursorExclusionCss();
  const blockedCursorReset = COMMENT_CAPTURE_BLOCKED_SELECTORS.map(
    (selector) => `${selector}, ${selector} *`,
  ).join(",\n");

  return `
    body ${exclusions}:not([data-prototype-comment-root]):not([data-prototype-comment-root] *) {
      cursor: crosshair !important;
    }
    ${blockedCursorReset} {
      cursor: auto !important;
    }
  `;
}
