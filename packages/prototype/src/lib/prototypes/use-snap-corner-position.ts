"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

export type SnapCorner =
  | "top-left"
  | "top-center"
  | "top-right"
  | "left-center"
  | "right-center"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

const DRAG_THRESHOLD_PX = 10;
const SNAP_PADDING_PX = 16;
const CORNER_INSET_PX = 16;

const SNAP_CORNERS: readonly SnapCorner[] = [
  "top-left",
  "top-center",
  "top-right",
  "left-center",
  "right-center",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

type Position = { left: number; top: number };

export function isSnapCorner(value: string): value is SnapCorner {
  return (SNAP_CORNERS as readonly string[]).includes(value);
}

function getNearestCorner(
  centerX: number,
  centerY: number,
  containerWidth: number,
  containerHeight: number,
): SnapCorner {
  const centerAnchorX = containerWidth / 2;
  const centerAnchorY = containerHeight / 2;
  const edgeX = SNAP_PADDING_PX;
  const edgeRightX = containerWidth - SNAP_PADDING_PX;
  const edgeY = SNAP_PADDING_PX;
  const edgeBottomY = containerHeight - SNAP_PADDING_PX;

  const anchors: { corner: SnapCorner; x: number; y: number }[] = [
    { corner: "top-left", x: edgeX, y: edgeY },
    { corner: "top-center", x: centerAnchorX, y: edgeY },
    { corner: "top-right", x: edgeRightX, y: edgeY },
    { corner: "left-center", x: edgeX, y: centerAnchorY },
    { corner: "right-center", x: edgeRightX, y: centerAnchorY },
    { corner: "bottom-left", x: edgeX, y: edgeBottomY },
    { corner: "bottom-center", x: centerAnchorX, y: edgeBottomY },
    { corner: "bottom-right", x: edgeRightX, y: edgeBottomY },
  ];

  let nearest = anchors[0]!;
  let nearestDistance = Infinity;

  for (const anchor of anchors) {
    const distance = Math.hypot(centerX - anchor.x, centerY - anchor.y);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = anchor;
    }
  }

  return nearest.corner;
}

function clampPosition(
  position: Position,
  containerWidth: number,
  containerHeight: number,
  elementWidth: number,
  elementHeight: number,
  padding: number,
): Position {
  const maxLeft = Math.max(padding, containerWidth - elementWidth - padding);
  const maxTop = Math.max(padding, containerHeight - elementHeight - padding);

  return {
    left: Math.min(Math.max(position.left, padding), maxLeft),
    top: Math.min(Math.max(position.top, padding), maxTop),
  };
}

function getRelativePosition(
  container: Element,
  element: HTMLElement,
): Position {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  return {
    left: elementRect.left - containerRect.left,
    top: elementRect.top - containerRect.top,
  };
}

/** Pixel position matching prototype-review-chrome corner classes (1rem inset). */
export function getCornerPosition(
  corner: SnapCorner,
  containerWidth: number,
  containerHeight: number,
  elementWidth: number,
  elementHeight: number,
  inset = CORNER_INSET_PX,
): Position {
  const maxLeft = containerWidth - elementWidth - inset;
  const maxTop = containerHeight - elementHeight - inset;
  const centerLeft = (containerWidth - elementWidth) / 2;
  const centerTop = (containerHeight - elementHeight) / 2;

  switch (corner) {
    case "top-left":
      return { left: inset, top: inset };
    case "top-center":
      return { left: centerLeft, top: inset };
    case "top-right":
      return { left: maxLeft, top: inset };
    case "left-center":
      return { left: inset, top: centerTop };
    case "right-center":
      return { left: maxLeft, top: centerTop };
    case "bottom-left":
      return { left: inset, top: maxTop };
    case "bottom-center":
      return { left: centerLeft, top: maxTop };
    case "bottom-right":
      return { left: maxLeft, top: maxTop };
  }
}

type UseSnapCornerPositionOptions = {
  container: Element | null;
  elementRef: React.RefObject<HTMLElement | null>;
  initialCorner?: SnapCorner;
  persistCorner?: (corner: SnapCorner) => void;
  readPersistedCorner?: () => SnapCorner | null;
};

export function useSnapCornerPosition({
  container,
  elementRef,
  initialCorner = "bottom-right",
  persistCorner,
  readPersistedCorner,
}: UseSnapCornerPositionOptions) {
  const [corner, setCorner] = useState<SnapCorner>(() => {
    const persisted = readPersistedCorner?.();
    return persisted && isSnapCorner(persisted) ? persisted : initialCorner;
  });
  const [dragPosition, setDragPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [snapPosition, setSnapPosition] = useState<Position | null>(null);
  const [isSnapping, setIsSnapping] = useState(false);
  const pendingSnapCornerRef = useRef<SnapCorner | null>(null);
  const snapTargetScheduledRef = useRef(false);

  const dragStateRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    originLeft: number;
    originTop: number;
    didDrag: boolean;
  } | null>(null);
  const lastDragPositionRef = useRef<Position | null>(null);
  const didDragRef = useRef(false);

  useEffect(() => {
    const persisted = readPersistedCorner?.();
    if (persisted && isSnapCorner(persisted)) {
      setCorner(persisted);
    }
  }, [readPersistedCorner]);

  const completeSnap = useCallback(() => {
    const nextCorner = pendingSnapCornerRef.current;
    pendingSnapCornerRef.current = null;
    snapTargetScheduledRef.current = false;
    setIsSnapping(false);
    setSnapPosition(null);

    if (nextCorner) {
      setCorner(nextCorner);
      persistCorner?.(nextCorner);
    }
  }, [persistCorner]);

  useEffect(() => {
    if (!isSnapping || snapTargetScheduledRef.current) {
      return;
    }
    if (!container || !elementRef.current) {
      return;
    }

    const nextCorner = pendingSnapCornerRef.current;
    if (!nextCorner) return;

    snapTargetScheduledRef.current = true;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      completeSnap();
      return;
    }

    const elementWidth = elementRef.current.offsetWidth;
    const elementHeight = elementRef.current.offsetHeight;
    const target = getCornerPosition(
      nextCorner,
      container.clientWidth,
      container.clientHeight,
      elementWidth,
      elementHeight,
    );

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSnapPosition(target);
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [isSnapping, container, elementRef, completeSnap]);

  useEffect(() => {
    if (!isSnapping || !elementRef.current) return;

    const element = elementRef.current;
    let didComplete = false;

    const finishOnce = () => {
      if (didComplete) return;
      didComplete = true;
      completeSnap();
    };

    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== element) return;
      if (event.propertyName !== "left" && event.propertyName !== "top") {
        return;
      }
      finishOnce();
    };

    const fallbackTimer = window.setTimeout(finishOnce, 350);

    element.addEventListener("transitionend", handleTransitionEnd);
    return () => {
      window.clearTimeout(fallbackTimer);
      element.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [isSnapping, elementRef, completeSnap]);

  const handleBarPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!container || !elementRef.current) return;
      if (event.button !== 0) return;

      didDragRef.current = false;

      const origin = getRelativePosition(container, elementRef.current);
      dragStateRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        originLeft: origin.left,
        originTop: origin.top,
        didDrag: false,
      };

      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [container, elementRef],
  );

  const handleBarPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      if (!container || !elementRef.current) return;

      const deltaX = event.clientX - dragState.startClientX;
      const deltaY = event.clientY - dragState.startClientY;

      if (!dragState.didDrag) {
        if (Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD_PX) {
          return;
        }

        dragState.didDrag = true;
        didDragRef.current = true;
        setIsDragging(true);
      }

      const padding = 16;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const elementWidth = elementRef.current.offsetWidth;
      const elementHeight = elementRef.current.offsetHeight;

      const nextPosition = clampPosition(
        {
          left: dragState.originLeft + deltaX,
          top: dragState.originTop + deltaY,
        },
        containerWidth,
        containerHeight,
        elementWidth,
        elementHeight,
        padding,
      );

      lastDragPositionRef.current = nextPosition;
      setDragPosition(nextPosition);
    },
    [container, elementRef],
  );

  const finishDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) return;

      const didDrag = dragState.didDrag;
      dragStateRef.current = null;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      setIsDragging(false);

      if (!didDrag || !container || !elementRef.current) {
        lastDragPositionRef.current = null;
        setDragPosition(null);
        return;
      }

      const currentPosition =
        lastDragPositionRef.current ??
        getRelativePosition(container, elementRef.current);
      lastDragPositionRef.current = null;
      const elementWidth = elementRef.current.offsetWidth;
      const elementHeight = elementRef.current.offsetHeight;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const centerX = currentPosition.left + elementWidth / 2;
      const centerY = currentPosition.top + elementHeight / 2;
      const nextCorner = getNearestCorner(
        centerX,
        centerY,
        containerWidth,
        containerHeight,
      );

      pendingSnapCornerRef.current = nextCorner;
      setDragPosition(null);
      setSnapPosition(currentPosition);
      setIsSnapping(true);
    },
    [container, elementRef],
  );

  const handleBarPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      finishDrag(event);
    },
    [finishDrag],
  );

  const handleBarPointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      finishDrag(event);
    },
    [finishDrag],
  );

  const wasDragGesture = useCallback(() => {
    const wasDrag = didDragRef.current;
    didDragRef.current = false;
    return wasDrag;
  }, []);

  const freePosition = isDragging ? dragPosition : isSnapping ? snapPosition : null;
  const useFreePosition = Boolean(freePosition);

  return {
    corner,
    dragPosition,
    freePosition,
    isDragging,
    isSnapping,
    useFreePosition,
    onBarPointerCancel: handleBarPointerCancel,
    onBarPointerDown: handleBarPointerDown,
    onBarPointerMove: handleBarPointerMove,
    onBarPointerUp: handleBarPointerUp,
    wasDragGesture,
  };
}
