import { getElementClasses } from "./element-identification";
import type { CaptureViewport } from "./types";
import {
  getPortalRelativeClientRect,
  getPrototypeScreenshotRoot,
} from "@prototype/lib/tool-portal";

export const PROTOTYPE_TARGET_ATTR = "data-prototype-target";
const PROTOTYPE_SCREENSHOT_ROOT = "[data-prototype-screenshot]";

export type AnnotationPositionAnchor = "viewport" | "element";

export type AnnotationTargetFields = {
  /** Full id from data-prototype-target */
  targetId?: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
  isFixed?: boolean;
  /** % within the target element (0–100). Legacy annotations use viewport width % for x. */
  x?: number;
  /** % within the target element (0–100), or legacy absolute px from document/viewport top. */
  y?: number;
  /** New annotations anchor the marker relative to the clicked element. */
  positionAnchor?: AnnotationPositionAnchor;
  element?: string;
  cssClasses?: string;
  nearbyText?: string;
  selectedText?: string;
};

export type AnnotationTargetOptions = {
  visibleEventTypeIds?: number[];
};

type Box = { x: number; y: number; width: number; height: number };

export function getCommentsSidebarWidth(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    "--comments-sidebar-width",
  );
  const width = parseFloat(raw) || 400;
  return Math.min(width, window.innerWidth);
}

export function getCommentsSidebarInset(): number {
  const isOpen =
    document.documentElement.hasAttribute("data-comments-sidebar-open") ||
    document.documentElement.hasAttribute("data-prototype-review-sidebar-open");
  if (!isOpen) return 0;

  const isInline =
    document.documentElement.hasAttribute("data-comments-sidebar-inline") ||
    document.documentElement.hasAttribute("data-prototype-review-sidebar-inline") ||
    getPrototypeScreenshotRoot() != null;
  if (isInline) return 0;

  return getCommentsSidebarWidth();
}

export function deepElementFromPoint(x: number, y: number): HTMLElement | null {
  let element = document.elementFromPoint(x, y) as HTMLElement | null;
  if (!element) return null;

  while (element?.shadowRoot) {
    const deeper = element.shadowRoot.elementFromPoint(x, y) as HTMLElement | null;
    if (!deeper || deeper === element) break;
    element = deeper;
  }

  return element;
}

function getStoredViewportBox(
  annotation: AnnotationTargetFields,
  scrollY: number,
): Box | null {
  if (!annotation.boundingBox) return null;

  const bb = annotation.boundingBox;
  return {
    x: bb.x,
    y: annotation.isFixed ? bb.y : bb.y - scrollY,
    width: bb.width,
    height: bb.height,
  };
}

function getBoxOverlapRatio(a: Box, b: Box): number {
  const left = Math.max(a.x, b.x);
  const top = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  if (right <= left || bottom <= top) return 0;

  const intersection = (right - left) * (bottom - top);
  const minArea = Math.min(a.width * a.height, b.width * b.height);
  if (minArea <= 0) return 0;

  return intersection / minArea;
}

function boxesOverlap(a: Box, b: Box, minRatio = 0.3): boolean {
  return getBoxOverlapRatio(a, b) >= minRatio;
}

function isElementVisible(element: HTMLElement): boolean {
  if (!document.contains(element)) return false;
  if (element.hidden) return false;

  const rect = element.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return false;

  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;
  if (parseFloat(style.opacity) === 0) return false;

  return true;
}

function isEventTypeVisible(
  element: HTMLElement,
  visibleEventTypeIds?: number[],
): boolean {
  if (!visibleEventTypeIds) return true;

  const container = element.closest("[data-event-type-id]");
  if (!container) return true;

  const id = Number(container.getAttribute("data-event-type-id"));
  if (Number.isNaN(id)) return true;

  return visibleEventTypeIds.includes(id);
}

function classesMatch(storedClasses: string | undefined, element: HTMLElement): boolean {
  if (!storedClasses) return true;

  const expected = storedClasses
    .split(/,\s*/)
    .map((value) => value.trim())
    .filter(Boolean);
  if (expected.length === 0) return true;

  const actual = getElementClasses(element)
    .split(/,\s*/)
    .map((value) => value.trim())
    .filter(Boolean);

  return expected.some((className) => actual.includes(className));
}

function elementLabelMatches(storedElement: string | undefined, element: HTMLElement): boolean {
  if (!storedElement) return true;

  const stored = storedElement.toLowerCase();
  const text = element.textContent?.trim().toLowerCase() ?? "";
  const quoted = stored.match(/"([^"]+)"/)?.[1];

  if (quoted && text.includes(quoted)) return true;

  if (stored.includes("input") && element.tagName.toLowerCase() === "input") return true;
  if (stored.includes("button") && element.tagName.toLowerCase() === "button") return true;
  if (stored.includes("link") && element.tagName.toLowerCase() === "a") return true;

  const tag = element.tagName.toLowerCase();
  if (stored.startsWith(tag)) return true;

  return false;
}

function nearbyTextMatches(
  nearbyText: string | undefined,
  selectedText: string | undefined,
  element: HTMLElement,
): boolean {
  if (!nearbyText && !selectedText) return true;

  const haystack = element.textContent?.trim().toLowerCase() ?? "";
  if (selectedText && haystack.includes(selectedText.trim().toLowerCase())) return true;
  if (nearbyText && haystack.includes(nearbyText.trim().toLowerCase().slice(0, 40))) {
    return true;
  }

  return false;
}

function isAnnotationAgentRoot(element: HTMLElement): boolean {
  return Boolean(element.closest("[data-prototype-comment-root]") || element.closest("[data-annotation-marker]"));
}

function getElementsAtPoint(x: number, y: number): HTMLElement[] {
  const hits: HTMLElement[] = [];
  const seen = new Set<HTMLElement>();

  const add = (element: HTMLElement | null) => {
    if (!element || seen.has(element) || isAnnotationAgentRoot(element)) return;
    seen.add(element);
    hits.push(element);
  };

  add(deepElementFromPoint(x, y));

  for (const node of document.elementsFromPoint(x, y)) {
    if (!(node instanceof HTMLElement) || isAnnotationAgentRoot(node)) continue;
    add(node);
  }

  return hits;
}

function collectCandidates(hits: HTMLElement[]): HTMLElement[] {
  const candidates: HTMLElement[] = [];
  const seen = new Set<HTMLElement>();

  for (const hit of hits) {
    let current: HTMLElement | null = hit;

    for (let depth = 0; depth < 12 && current; depth += 1) {
      if (!seen.has(current)) {
        seen.add(current);
        candidates.push(current);
      }
      current = current.parentElement;
    }
  }

  return candidates;
}

function hasIdentityMatch(
  annotation: AnnotationTargetFields,
  element: HTMLElement,
): boolean {
  return (
    classesMatch(annotation.cssClasses, element) &&
    elementLabelMatches(annotation.element, element) &&
    nearbyTextMatches(annotation.nearbyText, annotation.selectedText, element)
  );
}

function getCandidateBoxScore(
  storedViewportBox: Box,
  element: HTMLElement,
  annotation: AnnotationTargetFields,
): number {
  const rect = element.getBoundingClientRect();
  const candidateBox = {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };

  const overlap = getBoxOverlapRatio(storedViewportBox, candidateBox);
  if (overlap < 0.3) return -1;

  const widthDiff =
    Math.abs(candidateBox.width - storedViewportBox.width) /
    Math.max(storedViewportBox.width, 1);
  const heightDiff =
    Math.abs(candidateBox.height - storedViewportBox.height) /
    Math.max(storedViewportBox.height, 1);
  const sizeScore = Math.max(0, 1 - (widthDiff + heightDiff) / 2);

  const storedCenterX = storedViewportBox.x + storedViewportBox.width / 2;
  const storedCenterY = storedViewportBox.y + storedViewportBox.height / 2;
  const candidateCenterX = candidateBox.x + candidateBox.width / 2;
  const candidateCenterY = candidateBox.y + candidateBox.height / 2;
  const positionPenalty =
    (Math.abs(candidateCenterX - storedCenterX) +
      Math.abs(candidateCenterY - storedCenterY)) /
    Math.max(storedViewportBox.width + storedViewportBox.height, 1);
  const positionScore = Math.max(0, 1 - positionPenalty);

  let score = overlap * 0.35 + sizeScore * 0.5 + positionScore * 0.15;
  if (hasIdentityMatch(annotation, element)) score += 0.35;

  return score;
}

function isValidAnnotationTarget(
  element: HTMLElement,
  annotation: AnnotationTargetFields,
  storedViewportBox: Box,
  options?: AnnotationTargetOptions,
): boolean {
  if (isAnnotationAgentRoot(element)) return false;
  if (!isElementVisible(element)) return false;
  if (!isEventTypeVisible(element, options?.visibleEventTypeIds)) return false;

  const rect = element.getBoundingClientRect();
  const candidateBox = {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };

  if (!boxesOverlap(storedViewportBox, candidateBox)) return false;

  const widthRatio = rect.width / storedViewportBox.width;
  const heightRatio = rect.height / storedViewportBox.height;
  if (widthRatio < 0.45 || heightRatio < 0.45) return false;

  if (hasIdentityMatch(annotation, element)) return true;

  // Reject ancestors that are much larger than the stored target unless overlap is very tight.
  if (widthRatio > 1.15 && heightRatio > 1.15) {
    return boxesOverlap(storedViewportBox, candidateBox, 0.85);
  }

  // Fall back to a tighter overlap when identity metadata is sparse.
  return boxesOverlap(storedViewportBox, candidateBox, 0.55);
}

function pickBestCandidate(
  annotation: AnnotationTargetFields,
  storedViewportBox: Box,
  centerX: number,
  options?: AnnotationTargetOptions,
): HTMLElement | null {
  const centerY = storedViewportBox.y + storedViewportBox.height / 2;
  const hits = getElementsAtPoint(centerX, centerY);
  if (hits.length === 0) return null;

  let best: HTMLElement | null = null;
  let bestScore = -1;

  for (const candidate of collectCandidates(hits)) {
    if (!isValidAnnotationTarget(candidate, annotation, storedViewportBox, options)) {
      continue;
    }

    const score = getCandidateBoxScore(storedViewportBox, candidate, annotation);
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best;
}

export function getPrototypeTargetElement(
  element: HTMLElement | null,
): HTMLElement | null {
  if (!element) return null;
  const anchor = element.closest(`[${PROTOTYPE_TARGET_ATTR}]`);
  return anchor instanceof HTMLElement ? anchor : null;
}

function getTargetIdFromElement(element: HTMLElement | null): string | null {
  const anchor = getPrototypeTargetElement(element);
  return anchor?.getAttribute(PROTOTYPE_TARGET_ATTR) ?? null;
}

export function resolveAnnotationTargetById(
  targetId: string,
): HTMLElement | null {
  const root = document.querySelector(PROTOTYPE_SCREENSHOT_ROOT);
  if (!root) return null;

  const el = root.querySelector(
    `[${PROTOTYPE_TARGET_ATTR}="${CSS.escape(targetId)}"]`,
  );
  if (!(el instanceof HTMLElement)) return null;
  if (!isElementVisible(el)) return null;
  return el;
}

export function isScrollableElement(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  const overflowY = style.overflowY;
  return (
    (overflowY === "auto" ||
      overflowY === "scroll" ||
      overflowY === "overlay") &&
    element.scrollHeight > element.clientHeight + 1
  );
}

/** Innermost scrollable ancestor of `element` inside the screenshot root. */
export function getScrollableAncestorForTarget(
  element: HTMLElement | null,
): HTMLElement | null {
  const root = getPrototypeScreenshotRoot();
  if (!element || !root) return null;

  let current: HTMLElement | null = element;
  let scrollable: HTMLElement | null = null;

  while (current && current !== root && root.contains(current)) {
    if (isScrollableElement(current)) {
      scrollable = current;
      break;
    }
    current = current.parentElement;
  }

  return scrollable;
}

function findPrimaryScrollContainer(root: HTMLElement): HTMLElement | null {
  const scrollables = [...root.querySelectorAll<HTMLElement>("*")].filter(
    isScrollableElement,
  );
  if (scrollables.length === 0) {
    return root;
  }

  const registered = scrollables.filter((element) =>
    element.hasAttribute(PROTOTYPE_TARGET_ATTR),
  );
  const candidates = registered.length > 0 ? registered : scrollables;

  return candidates.reduce((best, element) =>
    element.scrollHeight > best.scrollHeight ? element : best,
  );
}

export function getPrototypeScrollContainer(
  hint?: HTMLElement | null,
): HTMLElement | null {
  if (hint) {
    const ancestor = getScrollableAncestorForTarget(hint);
    if (ancestor) return ancestor;
  }

  const root = document.querySelector(PROTOTYPE_SCREENSHOT_ROOT);
  if (!(root instanceof HTMLElement)) return null;

  const labeled = root.querySelector(
    `[${PROTOTYPE_TARGET_ATTR}$="scroll-container"]`,
  );
  if (labeled instanceof HTMLElement && isScrollableElement(labeled)) {
    return labeled;
  }

  return findPrimaryScrollContainer(root);
}

/** Viewport size + scroll offsets at capture/restore time. */
export function getPrototypeCaptureViewport(
  hint?: HTMLElement | null,
): CaptureViewport {
  const screenshotRoot = getPrototypeScreenshotRoot();
  const scrollContainer = getPrototypeScrollContainer(hint);

  return {
    width: screenshotRoot?.clientWidth ?? window.innerWidth,
    height: screenshotRoot?.clientHeight ?? window.innerHeight,
    scrollY: window.scrollY,
    scrollTop: scrollContainer?.scrollTop ?? 0,
    scrollContainerTargetId:
      getTargetIdFromElement(scrollContainer) ?? undefined,
  };
}

export function resolveAnnotationScrollContainer(
  captureViewport: CaptureViewport | undefined,
  targetId?: string,
): HTMLElement | null {
  if (captureViewport?.scrollContainerTargetId) {
    const byId = resolveAnnotationTargetById(
      captureViewport.scrollContainerTargetId,
    );
    if (byId) return byId;
  }

  if (targetId) {
    const target = resolveAnnotationTargetById(targetId);
    const ancestor = getScrollableAncestorForTarget(target);
    if (ancestor) return ancestor;
  }

  return getPrototypeScrollContainer();
}

export function restoreAnnotationScrollPosition(
  captureViewport: CaptureViewport | undefined,
  options?: { targetId?: string },
): void {
  if (!captureViewport || typeof window === "undefined") return;

  const apply = () => {
    const scrollContainer = resolveAnnotationScrollContainer(
      captureViewport,
      options?.targetId,
    );

    if (scrollContainer && captureViewport.scrollTop != null) {
      scrollContainer.scrollTop = captureViewport.scrollTop;
    }

    if (captureViewport.scrollY > 0) {
      window.scrollTo({
        top: captureViewport.scrollY,
        left: 0,
        behavior: "auto",
      });
    }
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(apply);
  });

  const retryTimer = window.setInterval(apply, 50);
  window.setTimeout(() => window.clearInterval(retryTimer), 500);
}

export function resolveAnnotationTargetElement(
  annotation: AnnotationTargetFields,
  scrollY: number,
  options?: AnnotationTargetOptions,
): HTMLElement | null {
  if (annotation.targetId) {
    const byId = resolveAnnotationTargetById(annotation.targetId);
    if (byId) return byId;
  }

  if (!annotation.boundingBox) return null;

  const storedViewportBox = getStoredViewportBox(annotation, scrollY);
  if (!storedViewportBox) return null;

  const centerX = annotation.boundingBox.x + annotation.boundingBox.width / 2;
  const sidebarInset = getCommentsSidebarInset();

  // Coordinates were captured before the comments sidebar shifted the layout.
  const centerXs =
    sidebarInset > 0 ? [centerX - sidebarInset, centerX] : [centerX];

  let best: HTMLElement | null = null;
  let bestScore = -1;

  for (const x of centerXs) {
    const candidate = pickBestCandidate(annotation, storedViewportBox, x, options);
    if (!candidate) continue;

    const score = getCandidateBoxScore(storedViewportBox, candidate, annotation);
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  if (!best && sidebarInset === 0) {
    return pickBestCandidate(
      annotation,
      storedViewportBox,
      centerX + getCommentsSidebarWidth(),
      options,
    );
  }

  return best;
}

export function isAnnotationTargetMounted(
  annotation: AnnotationTargetFields,
  scrollY: number,
  options?: AnnotationTargetOptions,
): boolean {
  const element = resolveAnnotationTargetElement(annotation, scrollY, options);
  return element !== null && document.contains(element) && isElementVisible(element);
}

export function usesElementRelativePosition(
  annotation: AnnotationTargetFields,
): boolean {
  return annotation.positionAnchor === "element";
}

export function computeElementRelativeMarkerPosition(
  clientX: number,
  clientY: number,
  rect: Pick<DOMRect, "left" | "top" | "width" | "height">,
): { x: number; y: number } {
  const width = Math.max(rect.width, 1);
  const height = Math.max(rect.height, 1);

  return {
    x: ((clientX - rect.left) / width) * 100,
    y: ((clientY - rect.top) / height) * 100,
  };
}

export function computeElementCenterMarkerPosition(): { x: number; y: number } {
  return { x: 50, y: 50 };
}

export function getAnnotationClickOffset(
  annotation: AnnotationTargetFields,
  targetRect?: Pick<DOMRect, "width" | "height">,
): { offsetX: number; offsetY: number } | null {
  if (!annotation.boundingBox || annotation.x === undefined || annotation.y === undefined) {
    return null;
  }

  const bb = annotation.boundingBox;

  if (usesElementRelativePosition(annotation)) {
    const width = Math.max(targetRect?.width ?? bb.width, 1);
    const height = Math.max(targetRect?.height ?? bb.height, 1);
    return {
      offsetX: (annotation.x / 100) * width,
      offsetY: (annotation.y / 100) * height,
    };
  }

  return {
    offsetX: (annotation.x / 100) * window.innerWidth - bb.x,
    offsetY: annotation.y - bb.y,
  };
}


export function getAnnotationMarkerViewportPoint(
  annotation: AnnotationTargetFields & { x: number; y: number },
  targetElement: HTMLElement | null,
): { x: number; y: number } {
  if (
    targetElement &&
    document.contains(targetElement) &&
    annotation.boundingBox
  ) {
    const rect = targetElement.getBoundingClientRect();
    const offset = getAnnotationClickOffset(annotation, rect);
    if (offset) {
      return {
        x: rect.left + offset.offsetX,
        y: rect.top + offset.offsetY,
      };
    }
  }

  if (annotation.boundingBox && usesElementRelativePosition(annotation)) {
    const bb = annotation.boundingBox;
    const markerY = bb.y + (annotation.y / 100) * bb.height;
    return {
      x: bb.x + (annotation.x / 100) * bb.width,
      y: annotation.isFixed ? markerY : markerY - window.scrollY,
    };
  }

  return {
    x: (annotation.x / 100) * window.innerWidth,
    y: annotation.y,
  };
}

/** Marker style in browser viewport coordinates (for fixed overlays on document.body). */
export function getAnnotationMarkerPosition(
  annotation: AnnotationTargetFields & { x: number; y: number },
  targetElement: HTMLElement | null,
): { left: string; top: number } {
  const point = getAnnotationMarkerViewportPoint(annotation, targetElement);
  return {
    left: `${point.x}px`,
    top: point.y,
  };
}

/** Marker style relative to the prototype highlight portal (#prototype-viewport). */
export function getAnnotationMarkerPortalPosition(
  annotation: AnnotationTargetFields & { x: number; y: number },
  targetElement: HTMLElement | null,
  portal: HTMLElement | null,
): { left: string; top: number } {
  const point = getAnnotationMarkerViewportPoint(annotation, targetElement);
  if (!portal) {
    return { left: `${point.x}px`, top: point.y };
  }

  const relative = getPortalRelativeClientRect(
    { left: point.x, top: point.y, width: 0, height: 0 },
    portal,
  );
  return {
    left: `${relative.left}px`,
    top: relative.top,
  };
}

export function getElementRelativeMarkerStyle(
  annotation: AnnotationTargetFields & { x: number; y: number },
): { left: string; top: string } {
  return {
    left: `${annotation.x}%`,
    top: `${annotation.y}%`,
  };
}

export function getMarkerViewportPosition(
  annotation: AnnotationTargetFields & { x: number; y: number },
  targetElement?: HTMLElement | null,
): { x: number; y: number } {
  if (
    targetElement &&
    document.contains(targetElement) &&
    usesElementRelativePosition(annotation)
  ) {
    const rect = targetElement.getBoundingClientRect();
    return {
      x: rect.left + (annotation.x / 100) * rect.width,
      y: rect.top + (annotation.y / 100) * rect.height,
    };
  }

  return getAnnotationMarkerViewportPoint(
    annotation,
    targetElement ?? null,
  );
}

export function getAnnotationOutlineBox(
  annotation: AnnotationTargetFields & { boundingBox?: { x: number; y: number; width: number; height: number } },
  targetElement: HTMLElement | null,
  scrollY: number,
) {
  if (targetElement && document.contains(targetElement) && isElementVisible(targetElement)) {
    const rect = targetElement.getBoundingClientRect();
    return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
  }

  if (!annotation.boundingBox) return null;

  return {
    x: annotation.boundingBox.x,
    y: annotation.isFixed ? annotation.boundingBox.y : annotation.boundingBox.y - scrollY,
    width: annotation.boundingBox.width,
    height: annotation.boundingBox.height,
  };
}
