"use client";

import type {
  PrototypeStateCanvasConfig,
  PrototypeStateCanvasEdge,
  PrototypeStateCanvasNode,
} from "@prototype/lib/prototypes/prototype-state-canvas-types";
import {
  PROTOTYPE_STATE_CANVAS_MAX_SCALE,
  PROTOTYPE_STATE_NODE_PREVIEW_HEIGHT,
  PROTOTYPE_STATE_NODE_WIDTH,
  getStateCanvasNodeBodyHeight,
  getStateCanvasNodeHeight,
} from "@prototype/lib/prototypes/prototype-state-canvas-constants";
import { cn } from "@prototype/lib/utils";
import { Maximize2, Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  StateMapAnnotationTooltip,
  getStateMapAnnotationAnchor,
  type StateMapAnnotationTarget,
} from "./state-map-annotation-tooltip";
import {
  StateMapHighlightProvider,
  StateMapPreviewHighlightOverlay,
} from "./state-map-wireframe-highlight";
import styles from "./prototype-state-canvas-overlay.module.scss";

const NODE_WIDTH = PROTOTYPE_STATE_NODE_WIDTH;
const NODE_PREVIEW_HEIGHT = PROTOTYPE_STATE_NODE_PREVIEW_HEIGHT;
const NODE_BODY_HEIGHT = getStateCanvasNodeBodyHeight();
const CANVAS_INSET = 24;
const MIN_SCALE = 0.05;
const MAX_SCALE = PROTOTYPE_STATE_CANVAS_MAX_SCALE;
const ZOOM_WHEEL_SENSITIVITY = 0.003;
const ZOOM_MOMENTUM_DECAY = 5.5;
const ZOOM_MOMENTUM_STOP_VELOCITY = 0.02;
const MAX_ZOOM_VELOCITY = 5;
const ZOOM_BUTTON_FACTOR = 1.28;
const ANNOTATION_FADE_MS = 120;

function normalizeWheelDeltaY(
  event: WheelEvent,
  viewport: HTMLElement,
): number {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return event.deltaY * 16;
  }
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return event.deltaY * viewport.clientHeight;
  }
  return event.deltaY;
}

function isZoomWheelEvent(event: WheelEvent): boolean {
  return event.ctrlKey || event.metaKey;
}

type ViewTransform = {
  panX: number;
  panY: number;
  scale: number;
};

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function zoomAtPoint(
  transform: ViewTransform,
  clientX: number,
  clientY: number,
  viewport: HTMLElement,
  scaleFactor: number,
): ViewTransform {
  const rect = viewport.getBoundingClientRect();
  const viewportX = clientX - rect.left;
  const viewportY = clientY - rect.top;
  const canvasX = (viewportX - CANVAS_INSET - transform.panX) / transform.scale;
  const canvasY = (viewportY - CANVAS_INSET - transform.panY) / transform.scale;
  const nextScale = clampScale(transform.scale * scaleFactor);

  return {
    scale: nextScale,
    panX: viewportX - CANVAS_INSET - canvasX * nextScale,
    panY: viewportY - CANVAS_INSET - canvasY * nextScale,
  };
}

function centerTransformAtScale(
  viewport: HTMLElement,
  canvasWidth: number,
  canvasHeight: number,
  scale: number,
): ViewTransform {
  const clampedScale = clampScale(scale);
  const scaledWidth = canvasWidth * clampedScale;
  const scaledHeight = canvasHeight * clampedScale;

  return {
    scale: clampedScale,
    panX: (viewport.clientWidth - scaledWidth) / 2 - CANVAS_INSET,
    panY: (viewport.clientHeight - scaledHeight) / 2 - CANVAS_INSET,
  };
}

function fitTransformToViewport(
  viewport: HTMLElement,
  canvasWidth: number,
  canvasHeight: number,
): ViewTransform {
  const padding = 48;
  const scale = clampScale(
    Math.min(
      (viewport.clientWidth - padding) / canvasWidth,
      (viewport.clientHeight - padding) / canvasHeight,
    ),
  );

  return centerTransformAtScale(viewport, canvasWidth, canvasHeight, scale);
}

function getNodeHeight(node: PrototypeStateCanvasNode): number {
  return getStateCanvasNodeHeight(node.callouts);
}

type Point = { x: number; y: number };

function getNodeCenter(node: PrototypeStateCanvasNode): Point {
  const height = getNodeHeight(node);
  return {
    x: node.x + NODE_WIDTH / 2,
    y: node.y + height / 2,
  };
}

type AnchorSide = "left" | "right" | "top" | "bottom";

// Use side anchors only when the target is significantly more horizontal than vertical.
const HORIZONTAL_RATIO_THRESHOLD = 2.5;
const ARROW_INSET = 5;
const CORNER_RADIUS = 10;

function getAnchorSide(node: PrototypeStateCanvasNode, target: Point): AnchorSide {
  const center = getNodeCenter(node);
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  if (Math.abs(dx) > Math.abs(dy) * HORIZONTAL_RATIO_THRESHOLD) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "bottom" : "top";
}

function getNodeBodyCenterY(node: PrototypeStateCanvasNode): number {
  return node.y + NODE_BODY_HEIGHT / 2;
}

function getAnchorPoint(node: PrototypeStateCanvasNode, side: AnchorSide): Point {
  const center = getNodeCenter(node);
  const height = getNodeHeight(node);
  const bodyCenterY = getNodeBodyCenterY(node);
  switch (side) {
    // Side anchors use the card body center so row neighbors stay aligned
    // even when one node has nested-state callouts below the label.
    case "left": return { x: node.x, y: bodyCenterY };
    case "right": return { x: node.x + NODE_WIDTH, y: bodyCenterY };
    case "top": return { x: center.x, y: node.y };
    case "bottom": return { x: center.x, y: node.y + height };
  }
}

// Move a boundary point AWAY from the node so arrowhead tips land cleanly.
function insetFromNode(p: Point, side: AnchorSide, inset: number): Point {
  switch (side) {
    case "left": return { x: p.x - inset, y: p.y };
    case "right": return { x: p.x + inset, y: p.y };
    case "top": return { x: p.x, y: p.y - inset };
    case "bottom": return { x: p.x, y: p.y + inset };
  }
}

function buildEdgePath(
  from: PrototypeStateCanvasNode,
  to: PrototypeStateCanvasNode,
  insetBothEnds: boolean,
): string {
  const fromCenter = getNodeCenter(from);
  const toCenter = getNodeCenter(to);

  const fromSide = getAnchorSide(from, toCenter);
  const toSide = getAnchorSide(to, fromCenter);

  const rawStart = getAnchorPoint(from, fromSide);
  const rawEnd = getAnchorPoint(to, toSide);

  // Inset endpoints away from node boundaries so arrowheads sit just outside.
  const start = insetBothEnds ? insetFromNode(rawStart, fromSide, ARROW_INSET) : rawStart;
  const end = insetFromNode(rawEnd, toSide, ARROW_INSET);

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);

  // Near-straight paths: draw a plain line.
  if (adx < 4 || ady < 4) {
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }

  const sx = Math.sign(dx);
  const sy = Math.sign(dy);
  const r = Math.min(CORNER_RADIUS, adx / 2, ady / 2);

  const bothHorizontal =
    (fromSide === "left" || fromSide === "right") &&
    (toSide === "left" || toSide === "right");

  if (bothHorizontal) {
    // Horizontal-first elbow (side-to-side with vertical offset)
    const midX = start.x + dx / 2;
    return (
      `M ${start.x} ${start.y} ` +
      `L ${midX - sx * r} ${start.y} ` +
      `Q ${midX} ${start.y} ${midX} ${start.y + sy * r} ` +
      `L ${midX} ${end.y - sy * r} ` +
      `Q ${midX} ${end.y} ${midX + sx * r} ${end.y} ` +
      `L ${end.x} ${end.y}`
    );
  }

  // Vertical-first S-curve (top/bottom-anchored diagonal edges)
  const midY = start.y + dy / 2;
  return (
    `M ${start.x} ${start.y} ` +
    `L ${start.x} ${midY - sy * r} ` +
    `Q ${start.x} ${midY} ${start.x + sx * r} ${midY} ` +
    `L ${end.x - sx * r} ${midY} ` +
    `Q ${end.x} ${midY} ${end.x} ${midY + sy * r} ` +
    `L ${end.x} ${end.y}`
  );
}

function detectBidirectionalEdges<T extends string>(
  edges: PrototypeStateCanvasEdge<T>[],
): { uniqueEdges: PrototypeStateCanvasEdge<T>[]; bidirectionalKeys: Set<string> } {
  const allKeys = new Set(edges.map((e) => `${e.from}-->${e.to}`));
  const seen = new Set<string>();
  const uniqueEdges: PrototypeStateCanvasEdge<T>[] = [];
  const bidirectionalKeys = new Set<string>();

  for (const edge of edges) {
    const key = `${edge.from}-->${edge.to}`;
    const reverseKey = `${edge.to}-->${edge.from}`;
    if (seen.has(key) || seen.has(reverseKey)) continue;
    seen.add(key);
    seen.add(reverseKey);
    if (allKeys.has(reverseKey)) bidirectionalKeys.add(key);
    uniqueEdges.push(edge);
  }

  return { uniqueEdges, bidirectionalKeys };
}

function deriveCanvasSize<T extends string>(
  nodes: PrototypeStateCanvasNode<T>[],
  explicitWidth?: number,
  explicitHeight?: number,
) {
  const maxX = nodes.reduce((max, node) => Math.max(max, node.x + NODE_WIDTH), 0);
  const maxY = nodes.reduce(
    (max, node) => Math.max(max, node.y + getNodeHeight(node)),
    0,
  );
  return {
    width: explicitWidth ?? maxX + 80,
    height: explicitHeight ?? maxY + 80,
  };
}

type HoverAnnotationSource<T extends string> = {
  id: T;
  label: string;
  parentLabel?: string;
  annotation?: string;
  highlightRegions?: readonly string[];
};

function resolveNodePreviewId<T extends string>(
  node: PrototypeStateCanvasNode<T>,
  hoverTarget: StateMapAnnotationTarget | null,
): T {
  if (hoverTarget == null) return node.id;
  if (hoverTarget.id === node.id) return node.id;
  if (node.callouts?.some((callout) => callout.id === hoverTarget.id)) {
    return hoverTarget.id as T;
  }
  return node.id;
}

function resolveHoverAnnotationSource<T extends string>(
  node: PrototypeStateCanvasNode<T>,
  hoverTarget: StateMapAnnotationTarget | null,
): HoverAnnotationSource<T> | null {
  if (hoverTarget == null) return null;
  if (hoverTarget.id === node.id) {
    return {
      id: node.id,
      label: node.label,
      annotation: node.annotation,
      highlightRegions: node.highlightRegions,
    };
  }

  const callout = node.callouts?.find((entry) => entry.id === hoverTarget.id);
  if (!callout) return null;

  return {
    id: callout.id,
    label: callout.label,
    parentLabel: node.label,
    annotation: callout.annotation,
    highlightRegions: callout.highlightRegions,
  };
}

type PrototypeStateCanvasViewProps<T extends string> = {
  config: PrototypeStateCanvasConfig<T>;
  layout?: "page" | "overlay";
  backHref?: string;
  onClose?: () => void;
};

export function PrototypeStateCanvasView<T extends string>({
  config,
  layout = "overlay",
  backHref,
  onClose,
}: PrototypeStateCanvasViewProps<T>) {
  const {
    onStateSelect,
    nodes,
    edges,
    sections,
    renderWireframe,
    getHighlightRegions,
    canvasWidth,
    canvasHeight,
  } = config;

  const viewportRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ViewTransform>({ panX: 0, panY: 0, scale: 1 });
  const zoomVelocityRef = useRef(0);
  const zoomAnchorRef = useRef({ x: 0, y: 0 });
  const zoomMomentumFrameRef = useRef<number | null>(null);
  const zoomMomentumActiveRef = useRef(false);
  const lastZoomMomentumTimeRef = useRef(0);
  const lastZoomWheelTimeRef = useRef(0);
  const [transform, setTransform] = useState<ViewTransform>({
    panX: 0,
    panY: 0,
    scale: 1,
  });
  const [hoverTarget, setHoverTarget] = useState<StateMapAnnotationTarget | null>(
    null,
  );
  const [displayedAnnotation, setDisplayedAnnotation] = useState<{
    target: StateMapAnnotationTarget;
    nodeId: string;
  } | null>(null);
  const [annotationVisible, setAnnotationVisible] = useState(false);
  const annotationFadeFrameRef = useRef<number | null>(null);
  const annotationFadeTimerRef = useRef<number | null>(null);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const hoverDismissTimerRef = useRef<number | null>(null);
  const hasFitRef = useRef(false);

  const clearAnnotationFadeTimers = useCallback(() => {
    if (annotationFadeFrameRef.current != null) {
      cancelAnimationFrame(annotationFadeFrameRef.current);
      annotationFadeFrameRef.current = null;
    }
    if (annotationFadeTimerRef.current != null) {
      window.clearTimeout(annotationFadeTimerRef.current);
      annotationFadeTimerRef.current = null;
    }
  }, []);

  const clearHoverDismissTimer = useCallback(() => {
    if (hoverDismissTimerRef.current != null) {
      window.clearTimeout(hoverDismissTimerRef.current);
      hoverDismissTimerRef.current = null;
    }
  }, []);

  const clearHoverTarget = useCallback(() => {
    clearHoverDismissTimer();
    setHoverTarget(null);
    setActiveHighlightId(null);
  }, [clearHoverDismissTimer]);

  const scheduleHoverDismiss = useCallback(() => {
    clearHoverDismissTimer();
    hoverDismissTimerRef.current = window.setTimeout(() => {
      clearHoverTarget();
    }, 120);
  }, [clearHoverDismissTimer, clearHoverTarget]);

  const applyTransform = useCallback((next: ViewTransform) => {
    transformRef.current = next;
    setTransform(next);
  }, []);

  const stopZoomMomentum = useCallback(() => {
    zoomMomentumActiveRef.current = false;
    lastZoomMomentumTimeRef.current = 0;
    lastZoomWheelTimeRef.current = 0;
    if (zoomMomentumFrameRef.current != null) {
      cancelAnimationFrame(zoomMomentumFrameRef.current);
      zoomMomentumFrameRef.current = null;
    }
    zoomVelocityRef.current = 0;
  }, []);

  const stepZoomMomentum = useCallback(
    (timestamp: number) => {
      const viewport = viewportRef.current;
      if (!viewport || !zoomMomentumActiveRef.current) {
        zoomMomentumFrameRef.current = null;
        return;
      }

      if (lastZoomMomentumTimeRef.current === 0) {
        lastZoomMomentumTimeRef.current = timestamp;
        zoomMomentumFrameRef.current = requestAnimationFrame(stepZoomMomentum);
        return;
      }

      const dt = Math.min(48, timestamp - lastZoomMomentumTimeRef.current) / 1000;
      lastZoomMomentumTimeRef.current = timestamp;

      let velocity = zoomVelocityRef.current;
      if (Math.abs(velocity) < ZOOM_MOMENTUM_STOP_VELOCITY) {
        stopZoomMomentum();
        return;
      }

      const anchor = zoomAnchorRef.current;
      const next = zoomAtPoint(
        transformRef.current,
        anchor.x,
        anchor.y,
        viewport,
        Math.exp(velocity * dt),
      );
      applyTransform(next);

      velocity *= Math.exp(-ZOOM_MOMENTUM_DECAY * dt);
      zoomVelocityRef.current = Math.max(
        -MAX_ZOOM_VELOCITY,
        Math.min(MAX_ZOOM_VELOCITY, velocity),
      );
      zoomMomentumFrameRef.current = requestAnimationFrame(stepZoomMomentum);
    },
    [applyTransform, stopZoomMomentum],
  );

  const ensureZoomMomentumLoop = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (
      zoomMomentumActiveRef.current &&
      zoomMomentumFrameRef.current != null
    ) {
      return;
    }
    zoomMomentumActiveRef.current = true;
    lastZoomMomentumTimeRef.current = 0;
    zoomMomentumFrameRef.current = requestAnimationFrame(stepZoomMomentum);
  }, [stepZoomMomentum]);

  const addZoomImpulse = useCallback(
    (event: WheelEvent, viewport: HTMLElement) => {
      const deltaY = normalizeWheelDeltaY(event, viewport);
      const logDelta = -deltaY * ZOOM_WHEEL_SENSITIVITY;
      const now = event.timeStamp || performance.now();
      const elapsedMs = lastZoomWheelTimeRef.current
        ? Math.max(now - lastZoomWheelTimeRef.current, 8)
        : 16;
      lastZoomWheelTimeRef.current = now;

      const rate = (logDelta / elapsedMs) * 1000;
      zoomVelocityRef.current = Math.max(
        -MAX_ZOOM_VELOCITY,
        Math.min(
          MAX_ZOOM_VELOCITY,
          zoomVelocityRef.current * 0.35 + rate * 0.65,
        ),
      );
      zoomAnchorRef.current = { x: event.clientX, y: event.clientY };
      ensureZoomMomentumLoop();
    },
    [ensureZoomMomentumLoop],
  );

  const nodeMap = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes],
  );

  const { uniqueEdges, bidirectionalKeys } = useMemo(
    () => detectBidirectionalEdges(edges),
    [edges],
  );

  const size = useMemo(
    () => deriveCanvasSize(nodes, canvasWidth, canvasHeight),
    [canvasHeight, canvasWidth, nodes],
  );

  const hoverAnnotationNode = useMemo(() => {
    if (!hoverTarget) return null;
    return (
      nodes.find(
        (node) =>
          node.id === hoverTarget.id ||
          node.callouts?.some((callout) => callout.id === hoverTarget.id),
      ) ?? null
    );
  }, [hoverTarget, nodes]);

  const displayedAnnotationNode = useMemo(() => {
    if (!displayedAnnotation) return null;
    return nodeMap.get(displayedAnnotation.nodeId as T) ?? null;
  }, [displayedAnnotation, nodeMap]);

  const displayedAnnotationAnchor = useMemo(() => {
    if (!displayedAnnotationNode || !displayedAnnotation) return null;
    return getStateMapAnnotationAnchor(
      displayedAnnotationNode,
      displayedAnnotation.target.id,
    );
  }, [displayedAnnotation, displayedAnnotationNode]);

  useEffect(() => {
    if (hoverTarget && hoverAnnotationNode) {
      const nextNodeId = hoverAnnotationNode.id;
      const nextEntry = {
        target: hoverTarget,
        nodeId: nextNodeId,
      };

      if (
        displayedAnnotation?.nodeId === nextNodeId &&
        displayedAnnotation.target.id === hoverTarget.id
      ) {
        return;
      }

      const beginShow = () => {
        setDisplayedAnnotation(nextEntry);
        annotationFadeFrameRef.current = requestAnimationFrame(() => {
          annotationFadeFrameRef.current = requestAnimationFrame(() => {
            setAnnotationVisible(true);
            annotationFadeFrameRef.current = null;
          });
        });
      };

      if (displayedAnnotation?.nodeId === nextNodeId) {
        clearAnnotationFadeTimers();
        setDisplayedAnnotation(nextEntry);
        if (!annotationVisible) {
          beginShow();
        }
        return;
      }

      if (displayedAnnotation != null) {
        clearAnnotationFadeTimers();
        setAnnotationVisible(false);
        annotationFadeTimerRef.current = window.setTimeout(() => {
          annotationFadeTimerRef.current = null;
          beginShow();
        }, ANNOTATION_FADE_MS);
        return () => {
          if (annotationFadeTimerRef.current != null) {
            window.clearTimeout(annotationFadeTimerRef.current);
            annotationFadeTimerRef.current = null;
          }
        };
      }

      clearAnnotationFadeTimers();
      beginShow();
      return;
    }

    if (!displayedAnnotation) return;

    clearAnnotationFadeTimers();
    setAnnotationVisible(false);
    annotationFadeTimerRef.current = window.setTimeout(() => {
      setDisplayedAnnotation(null);
      annotationFadeTimerRef.current = null;
    }, ANNOTATION_FADE_MS);

    return () => {
      if (annotationFadeTimerRef.current != null) {
        window.clearTimeout(annotationFadeTimerRef.current);
        annotationFadeTimerRef.current = null;
      }
    };
  }, [
    annotationVisible,
    clearAnnotationFadeTimers,
    displayedAnnotation,
    hoverAnnotationNode,
    hoverTarget,
  ]);

  useEffect(() => {
    return () => clearAnnotationFadeTimers();
  }, [clearAnnotationFadeTimers]);

  const handleNodeSelect = useCallback(
    (id: T) => {
      setHoverTarget(null);
      setActiveHighlightId(null);
      onStateSelect(id);
      onClose?.();
    },
    [onClose, onStateSelect],
  );

  const showAnnotationForTarget = useCallback(
    (source: HoverAnnotationSource<T>, parentLabel?: string) => {
      const annotation = source.annotation?.trim();
      if (!annotation) return;

      clearHoverDismissTimer();
      setHoverTarget({
        id: source.id,
        label: source.label,
        parentLabel,
        annotation,
        highlightRegions: source.highlightRegions,
      });
    },
    [clearHoverDismissTimer],
  );

  useEffect(() => {
    return () => clearHoverDismissTimer();
  }, [clearHoverDismissTimer]);

  const fitToView = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    stopZoomMomentum();
    applyTransform(fitTransformToViewport(viewport, size.width, size.height));
  }, [applyTransform, size.height, size.width, stopZoomMomentum]);

  useEffect(() => {
    if (hasFitRef.current) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    if (viewport.clientWidth === 0 || viewport.clientHeight === 0) return;

    hasFitRef.current = true;
    stopZoomMomentum();
    applyTransform(fitTransformToViewport(viewport, size.width, size.height));
  }, [applyTransform, size.height, size.width, stopZoomMomentum]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (event: WheelEvent) => {
      if (isZoomWheelEvent(event)) {
        event.preventDefault();
        const deltaY = normalizeWheelDeltaY(event, viewport);
        const factor = Math.exp(-deltaY * ZOOM_WHEEL_SENSITIVITY);
        const next = zoomAtPoint(
          transformRef.current,
          event.clientX,
          event.clientY,
          viewport,
          factor,
        );
        applyTransform(next);
        addZoomImpulse(event, viewport);
        return;
      }

      stopZoomMomentum();
      event.preventDefault();
      applyTransform({
        ...transformRef.current,
        panX: transformRef.current.panX - event.deltaX,
        panY: transformRef.current.panY - event.deltaY,
      });
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener("wheel", handleWheel);
      stopZoomMomentum();
    };
  }, [addZoomImpulse, applyTransform, stopZoomMomentum]);

  const handleZoomBy = useCallback((factor: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    stopZoomMomentum();
    const rect = viewport.getBoundingClientRect();
    applyTransform(
      zoomAtPoint(
        transformRef.current,
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        viewport,
        factor,
      ),
    );
  }, [applyTransform, stopZoomMomentum]);

  return (
    <div
      className={cn(
        layout === "page" ? styles.page : styles.overlay,
      )}
      data-prototype-state-canvas
      data-prototype-comment-theme="light"
      role={layout === "page" ? undefined : "dialog"}
      aria-modal={layout === "page" ? undefined : "true"}
      aria-label="State map"
    >
      <div className={styles.header}>
        <div>
          <p className={styles.headerTitle}>State map</p>
          <p className={styles.headerHint}>
            Scroll to pan, pinch or ⌘ scroll to zoom. Click a state to preview it. Hover for planning notes.
          </p>
        </div>
        {layout === "page" && backHref ? (
          <Link
            href={backHref}
            className={styles.closeButton}
            aria-label="Back to prototype"
          >
            <X size={16} strokeWidth={2} />
          </Link>
        ) : onClose ? (
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close state map"
            onClick={onClose}
          >
            <X size={16} strokeWidth={2} />
          </button>
        ) : null}
      </div>

      <div ref={viewportRef} className={styles.canvasViewport}>
        <div className={styles.zoomControls}>
          <button
            type="button"
            className={styles.zoomButton}
            aria-label="Zoom out"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => handleZoomBy(1 / ZOOM_BUTTON_FACTOR)}
          >
            <Minus size={14} strokeWidth={2} aria-hidden />
          </button>
          <span className={styles.zoomLabel}>
            {Math.round(transform.scale * 100)}%
          </span>
          <button
            type="button"
            className={styles.zoomButton}
            aria-label="Zoom in"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => handleZoomBy(ZOOM_BUTTON_FACTOR)}
          >
            <Plus size={14} strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            className={styles.zoomButton}
            aria-label="Fit map to view"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={fitToView}
          >
            <Maximize2 size={14} strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div
          className={styles.canvasLayer}
          style={{
            width: size.width,
            height: size.height,
            transform: `translate(${transform.panX}px, ${transform.panY}px) scale(${transform.scale})`,
          }}
        >
          <svg
            className={styles.edges}
            width={size.width}
            height={size.height}
            overflow="visible"
            aria-hidden
          >
            <defs>
              <marker
                id="prototype-state-canvas-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <path d="M0,0 L8,4 L0,8 Z" className={styles.edgeArrowHead} />
              </marker>
              <marker
                id="prototype-state-canvas-arrow-start"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L8,4 L0,8 Z" className={styles.edgeArrowHead} />
              </marker>
            </defs>
            {uniqueEdges.map((edge: PrototypeStateCanvasEdge<T>) => {
              const from = nodeMap.get(edge.from);
              const to = nodeMap.get(edge.to);
              if (!from || !to) return null;
              const isBidirectional = bidirectionalKeys.has(`${edge.from}-->${edge.to}`);
              return (
                <path
                  key={`${edge.from}-${edge.to}`}
                  d={buildEdgePath(from, to, isBidirectional)}
                  className={styles.edge}
                  markerEnd="url(#prototype-state-canvas-arrow)"
                  markerStart={isBidirectional ? "url(#prototype-state-canvas-arrow-start)" : undefined}
                />
              );
            })}
          </svg>

          {sections?.map((section) => (
            <div
              key={section.label}
              className={styles.sectionLabel}
              style={{ top: section.y, left: 24 }}
            >
              {section.label}
            </div>
          ))}

          {nodes.map((node) => {
            const hoverSource = resolveHoverAnnotationSource(node, hoverTarget);
            const previewNodeId = resolveNodePreviewId(node, hoverTarget);
            const previewHighlights = getHighlightRegions?.(previewNodeId);
            const previewHighlightRect =
              activeHighlightId && previewHighlights
                ? previewHighlights[activeHighlightId]
                : undefined;
            const nodeHighlightActive =
              hoverSource != null &&
              (hoverTarget?.id === node.id ||
                node.callouts?.some((callout) => callout.id === hoverTarget?.id));

            return (
              <div
                key={node.id}
                className={styles.nodeGroup}
                style={{ left: node.x, top: node.y, width: NODE_WIDTH }}
              >
                <button
                  type="button"
                  className={styles.node}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => handleNodeSelect(node.id)}
                  onMouseEnter={() => {
                    showAnnotationForTarget({
                      id: node.id,
                      label: node.label,
                      annotation: node.annotation,
                      highlightRegions: node.highlightRegions,
                    });
                  }}
                  onMouseLeave={scheduleHoverDismiss}
                >
                  <div className={styles.nodePreview}>
                    <StateMapHighlightProvider
                      highlightId={nodeHighlightActive ? activeHighlightId : null}
                    >
                      <div
                        className={styles.nodePreviewContent}
                        data-prototype-wireframe-preview
                      >
                        {renderWireframe(previewNodeId)}
                        {previewHighlightRect ? (
                          <StateMapPreviewHighlightOverlay rect={previewHighlightRect} />
                        ) : null}
                      </div>
                    </StateMapHighlightProvider>
                  </div>
                  <div className={styles.nodeLabel}>
                    <span className={styles.nodeLabelText}>{node.label}</span>
                  </div>
                </button>

                {node.callouts?.length ? (
                  <div className={styles.calloutTray}>
                    {node.callouts.map((callout) => {
                      return (
                        <button
                          key={callout.id}
                          type="button"
                          className={styles.callout}
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={() => handleNodeSelect(callout.id)}
                          onMouseEnter={() => {
                            showAnnotationForTarget(
                              {
                                id: callout.id,
                                label: callout.label,
                                annotation: callout.annotation,
                                highlightRegions: callout.highlightRegions,
                              },
                              node.label,
                            );
                          }}
                          onMouseLeave={scheduleHoverDismiss}
                        >
                          <span className={styles.calloutLabel}>
                            {callout.label}
                          </span>
                          {callout.hint ? (
                            <span className={styles.calloutHint}>
                              {callout.hint}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}

          {displayedAnnotation && displayedAnnotationAnchor ? (
            <StateMapAnnotationTooltip
              target={displayedAnnotation.target}
              anchor={displayedAnnotationAnchor}
              visible={annotationVisible}
              activeHighlightId={activeHighlightId}
              onHighlightChange={setActiveHighlightId}
              onDismiss={scheduleHoverDismiss}
              onKeepOpen={clearHoverDismissTimer}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use PrototypeStateCanvasView on a dedicated route instead. */
export function PrototypeStateCanvasOverlay<T extends string>(
  props: PrototypeStateCanvasViewProps<T>,
) {
  return <PrototypeStateCanvasView {...props} layout="overlay" />;
}
