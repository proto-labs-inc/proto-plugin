"use client";

import { PrototypeStateCanvasView } from "@prototype/components/prototypes/prototype-state-canvas-overlay";
import { usePrototypeReview } from "@prototype/lib/prototypes/prototype-review-context";
import { usePersistedLocalString } from "@prototype/lib/prototypes/use-persisted-local-state";
import { usePrototypeToolTheme } from "@prototype/lib/prototypes/use-prototype-tool-theme";
import {
  getPrototypePreviewStage,
  getPrototypeToolOverlayRoot,
} from "@prototype/lib/tool-portal";
import { cn } from "@prototype/lib/utils";
import { Maximize2 } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

import styles from "./prototype-mini-state-map.module.scss";

const FLY_DURATION_MS = 320;
const FLY_EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)";
/** Below portaled review menus (prototype-floating-pill.module.scss z-index: 1051). */
const MINI_STATE_MAP_Z_INDEX = 1;
const MINI_MAP_WIDTH_PX = 280;
const MINI_MAP_HEIGHT_PX = 200;
const MINI_MAP_STAGE_INSET_PX = 16;
const MINI_MAP_BOTTOM_PX = 48;
const MINI_MAP_CORNER_STORAGE_KEY = "prototype-review:mini-state-map-corner";

type MiniMapCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const MINI_MAP_CORNERS: MiniMapCorner[] = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];

function isMiniMapCorner(value: string): value is MiniMapCorner {
  return (MINI_MAP_CORNERS as string[]).includes(value);
}

type FlyDirection = "minimize" | "restore";

type FlyState = {
  direction: FlyDirection;
};

export type PrototypeMiniStateMapHandle = {
  minimize: () => void;
};

type PrototypeMiniStateMapProps = {
  minimized: boolean;
  onExpand: () => void;
  onMinimize: () => void;
  onRestoreComplete?: () => void;
  restoring?: boolean;
  minimizeTargetRef: RefObject<HTMLElement | null>;
  hoverPanelProps?: {
    onPointerEnter: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerLeave: () => void;
  };
};

function useOnStateMapPage(stateMapPagePath: string | null): boolean {
  const pathname = usePathname();

  if (stateMapPagePath != null) {
    return pathname.startsWith(stateMapPagePath);
  }

  return /\/prototypes\/[^/]+\/states\/?$/.test(pathname);
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function getMiniMapCornerRect(
  corner: MiniMapCorner,
  tabElement: HTMLElement | null,
): DOMRect | null {
  const stage = getPrototypePreviewStage();
  if (!stage) return null;

  const stageRect = stage.getBoundingClientRect();
  const width = Math.min(
    MINI_MAP_WIDTH_PX,
    Math.max(0, stageRect.width - MINI_MAP_STAGE_INSET_PX * 2),
  );
  const height = MINI_MAP_HEIGHT_PX;
  const inset = MINI_MAP_STAGE_INSET_PX;

  let left = stageRect.left + inset;
  let top = stageRect.top + inset;

  switch (corner) {
    case "top-left":
      break;
    case "top-right":
      left = stageRect.right - inset - width;
      break;
    case "bottom-left":
      top = stageRect.bottom - MINI_MAP_BOTTOM_PX - height;
      if (tabElement) {
        const tabRect = tabElement.getBoundingClientRect();
        left = tabRect.left + tabRect.width / 2 - width / 2;
        const minLeft = stageRect.left + inset;
        const maxLeft = stageRect.right - inset - width;
        left = Math.min(Math.max(left, minLeft), maxLeft);
      }
      break;
    case "bottom-right":
      left = stageRect.right - inset - width;
      top = stageRect.bottom - MINI_MAP_BOTTOM_PX - height;
      break;
  }

  return new DOMRect(left, top, width, height);
}

function getAnchorTransform(anchor: DOMRect, target: DOMRect): string {
  const scaleX = target.width / anchor.width;
  const scaleY = target.height / anchor.height;
  const translateX =
    target.left + target.width / 2 - (anchor.left + anchor.width / 2);
  const translateY =
    target.top + target.height / 2 - (anchor.top + anchor.height / 2);
  return `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
}

function startFlyAnimation(setFlyActive: (value: boolean) => void) {
  setFlyActive(false);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setFlyActive(true);
    });
  });
}

export const PrototypeMiniStateMap = forwardRef<
  PrototypeMiniStateMapHandle,
  PrototypeMiniStateMapProps
>(function PrototypeMiniStateMap(
  {
    minimized,
    onExpand,
    onMinimize,
    onRestoreComplete,
    restoring = false,
    minimizeTargetRef,
    hoverPanelProps,
  },
  ref,
) {
  const review = usePrototypeReview();
  const { commentTheme } = usePrototypeToolTheme();
  const onStateMapPage = useOnStateMapPage(review.stateCanvasPagePath);
  const { value: storedCorner } =
    usePersistedLocalString(MINI_MAP_CORNER_STORAGE_KEY, "bottom-left");
  const corner: MiniMapCorner = isMiniMapCorner(storedCorner)
    ? storedCorner
    : "bottom-left";
  const [mounted, setMounted] = useState(false);
  const [restRect, setRestRect] = useState<DOMRect | null>(null);
  const [flyState, setFlyState] = useState<FlyState | null>(null);
  const [flyActive, setFlyActive] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const restoreStartedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const syncRestRect = useCallback(() => {
    setRestRect(getMiniMapCornerRect(corner, minimizeTargetRef.current));
  }, [corner, minimizeTargetRef]);

  useLayoutEffect(() => {
    syncRestRect();
  }, [syncRestRect]);

  useEffect(() => {
    const stage = getPrototypePreviewStage();
    const tab = minimizeTargetRef.current;
    if (!stage || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      if (flyState) return;
      syncRestRect();
    });

    observer.observe(stage);
    if (tab) {
      observer.observe(tab);
    }
    window.addEventListener("resize", syncRestRect);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncRestRect);
    };
  }, [flyState, minimizeTargetRef, syncRestRect]);

  const finishFly = useCallback(
    (direction: FlyDirection) => {
      setFlyState(null);
      setFlyActive(false);
      if (direction === "minimize") {
        onMinimize();
      } else {
        onRestoreComplete?.();
      }
    },
    [onMinimize, onRestoreComplete],
  );

  useEffect(() => {
    if (!flyState || !flyActive) return;

    const shellNode = shellRef.current;
    if (!shellNode) {
      finishFly(flyState.direction);
      return;
    }

    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== shellNode || event.propertyName !== "transform") {
        return;
      }
      cleanup();
      finishFly(flyState.direction);
    };

    const cleanup = () => {
      shellNode.removeEventListener("transitionend", handleTransitionEnd);
      window.clearTimeout(fallbackTimer);
    };

    shellNode.addEventListener("transitionend", handleTransitionEnd);
    const fallbackTimer = window.setTimeout(() => {
      cleanup();
      finishFly(flyState.direction);
    }, FLY_DURATION_MS + 80);

    return cleanup;
  }, [finishFly, flyActive, flyState]);

  const beginFly = useCallback((direction: FlyDirection) => {
    if (prefersReducedMotion()) {
      if (direction === "minimize") {
        onMinimize();
      } else {
        onRestoreComplete?.();
      }
      return;
    }

    syncRestRect();
    setFlyState({ direction });
    startFlyAnimation(setFlyActive);
  }, [onMinimize, onRestoreComplete, syncRestRect]);

  const handleMinimize = useCallback(() => {
    if (minimized || flyState) return;
    beginFly("minimize");
  }, [beginFly, flyState, minimized]);

  useImperativeHandle(ref, () => ({ minimize: handleMinimize }), [handleMinimize]);

  useLayoutEffect(() => {
    if (!restoring || restoreStartedRef.current || flyState) return;

    restoreStartedRef.current = true;
    beginFly("restore");
  }, [beginFly, flyState, restoring]);

  useEffect(() => {
    if (!restoring) {
      restoreStartedRef.current = false;
    }
  }, [restoring]);

  if (!mounted || !review.hasStateCanvas || onStateMapPage) {
    return null;
  }

  const config = review.stateCanvasConfigRef.current;
  if (!config || !restRect) return null;

  const tabRect = minimizeTargetRef.current?.getBoundingClientRect() ?? null;
  const isFlying = flyState != null;
  const isMinimize = flyState?.direction === "minimize";
  const tabTransform =
    tabRect != null ? getAnchorTransform(restRect, tabRect) : "none";

  let transform = "none";
  let opacity = 1;

  if (isFlying) {
    if (isMinimize) {
      transform = flyActive ? tabTransform : "none";
      opacity = flyActive ? 0 : 1;
    } else {
      transform = flyActive ? "none" : tabTransform;
      opacity = flyActive ? 1 : 0;
    }
  } else if (minimized) {
    opacity = 0;
  }

  const shellLeft = restRect.left;
  const shellTop = restRect.top;

  const shellStyle: CSSProperties = {
    position: "fixed",
    left: shellLeft,
    top: shellTop,
    width: restRect.width,
    height: restRect.height,
    margin: 0,
    zIndex: MINI_STATE_MAP_Z_INDEX,
    transform,
    transformOrigin: "center center",
    opacity,
    pointerEvents: minimized && !isFlying ? "none" : "auto",
    transition: isFlying
      ? `transform ${FLY_DURATION_MS}ms ${FLY_EASE}, opacity ${FLY_DURATION_MS}ms ${FLY_EASE}`
      : "none",
  };

  const mapContent = (
    <PrototypeStateCanvasView
      config={config}
      layout="mini"
      activeStateId={review.activePreviewStateId}
      onMiniBackgroundClick={onExpand}
    />
  );

  return createPortal(
    <div
      className={styles.themeRoot}
      data-prototype-root
      data-prototype-comment-theme={commentTheme}
      aria-hidden={minimized && !isFlying ? true : undefined}
    >
      <div
        ref={shellRef}
        className={cn(
          styles.rootShell,
          isFlying && styles.rootShellFlying,
        )}
        data-prototype-mini-state-map
        style={shellStyle}
        {...hoverPanelProps}
      >
        {mapContent}
        {!isFlying && !minimized ? (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.actionButton}
              aria-label="Expand state map"
              onClick={onExpand}
            >
              <Maximize2 size={11} strokeWidth={2} aria-hidden />
            </button>
          </div>
        ) : null}
      </div>
    </div>,
    getPrototypeToolOverlayRoot() ?? getPrototypePreviewStage() ?? document.body,
  );
});
