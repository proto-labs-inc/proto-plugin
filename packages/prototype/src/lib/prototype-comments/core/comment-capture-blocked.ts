import { closestCrossingShadow } from "./element-identification";
import { buildSidebarInteractivePointerCss } from "@prototype/lib/platform-ui/sidebar-interactive-cursor";

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
  "#prototype-chrome-root",
  "[data-prototype-tool-overlay-root]",
  "[data-annotation-popup]",
  "[data-annotation-marker]",
  "[data-prototype-share-hint]",
] as const;

export function isCommentCaptureBlockedTarget(target: HTMLElement): boolean {
  return COMMENT_CAPTURE_BLOCKED_SELECTORS.some(
    (selector) => closestCrossingShadow(target, selector) != null,
  );
}

/** Radix outside-dismiss events that land on plugin chrome must not close viewport-scoped product overlays. */
export function preventDismissOnPrototypePluginChrome(event: {
  preventDefault: () => void;
  target: EventTarget | null;
}): void {
  if (event.target instanceof HTMLElement && isCommentCaptureBlockedTarget(event.target)) {
    event.preventDefault();
  }
}

/** Plugin chrome where interacting should exit comment mode (not the prototype canvas). */
export const COMMENT_MODE_CHROME_SELECTORS = [
  "[data-prototype-review-trigger]",
  "[data-prototype-review-sidebar]",
  "[data-prototype-review-panel]",
  "[data-feedback-toolbar]",
  "[data-comment-capture-toolbar]",
  "[data-comments-sidebar]",
  "#prototype-comments-sidebar-root",
] as const;

export const COMMENT_MODE_TOGGLE_SELECTOR = "[data-prototype-comment-mode-toggle]";

export function isCommentModeChromeInteraction(target: HTMLElement): boolean {
  if (closestCrossingShadow(target, COMMENT_MODE_TOGGLE_SELECTOR) != null) {
    return false;
  }
  return COMMENT_MODE_CHROME_SELECTORS.some(
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
    ${buildSidebarInteractivePointerCss({ important: true })}
  `;
}
