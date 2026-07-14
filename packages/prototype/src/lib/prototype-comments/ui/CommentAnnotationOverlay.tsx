"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { PrototypeComponentAnchorLayer } from "@prototype/components/prototypes/prototype-component-anchor-layer";
import {
  getElementRelativeMarkerStyle,
  getMarkerViewportPosition,
  getPrototypeScrollContainer,
  resolveAnnotationTargetById,
  resolveAnnotationTargetElement,
  type AnnotationTargetOptions,
} from "../core/annotation-target";
import {
  resolveThreadRootId,
} from "../core/comment-threads";
import { parseComputedStylesString } from "../core/element-identification";
import type { CommentAnnotation } from "../core/types";
import { useLayoutShift } from "../hooks/useLayoutShift";
import { useCommentStore } from "../react/CommentProvider";
import { usePrototypeToolTheme } from "@prototype/lib/prototypes/use-prototype-tool-theme";
import { AnnotationPopupCSS } from "./annotation-popup";
import { AnnotationMarker } from "./annotation-marker";
import styles from "./capture-styles.module.scss";

type CommentAnnotationOverlayProps<TState = unknown> = {
  annotation: CommentAnnotation<TState>;
  basePath?: string;
  onDismiss?: () => void;
  readOnly?: boolean;
  resolveTargetOptions?: AnnotationTargetOptions;
};

export function CommentAnnotationOverlay<TState = unknown>({
  annotation,
  basePath = "/canvas",
  onDismiss,
  readOnly = false,
  resolveTargetOptions,
}: CommentAnnotationOverlayProps<TState>) {
  const router = useRouter();
  const { annotations, updateAnnotation, deleteAnnotation } =
    useCommentStore<TState>();
  const { useLightTheme, commentTheme } = usePrototypeToolTheme();
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [layoutTick, setLayoutTick] = useState(0);
  const layoutVersion = useLayoutShift();

  useEffect(() => {
    setMounted(true);

    const frame = requestAnimationFrame(() => {
      setReady(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const rootId = resolveThreadRootId(annotations, annotation.id);
  const rootAnnotation = useMemo(
    () => annotations.find((item) => item.id === rootId) ?? annotation,
    [annotations, rootId, annotation],
  );

  const refreshTarget = useCallback(() => {
    setTargetElement(
      resolveAnnotationTargetElement(
        rootAnnotation,
        window.scrollY,
        resolveTargetOptions,
      ),
    );
    setLayoutTick((tick) => tick + 1);
  }, [rootAnnotation, resolveTargetOptions]);

  useEffect(() => {
    if (!ready) return;

    refreshTarget();

    const handleScroll = () => refreshTarget();
    const handleResize = () => refreshTarget();

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    const scrollContainer = getPrototypeScrollContainer();
    scrollContainer?.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
      scrollContainer?.removeEventListener("scroll", handleScroll);
    };
  }, [ready, refreshTarget, layoutVersion]);

  const navigateAway = useCallback(() => {
    setIsExiting(true);
    window.setTimeout(() => {
      if (onDismiss) {
        onDismiss();
      } else {
        router.push(basePath);
      }
    }, 150);
  }, [router, basePath, onDismiss]);

  const handleSave = useCallback(
    (comment: string) => {
      updateAnnotation(rootAnnotation.id, comment);
    },
    [rootAnnotation.id, updateAnnotation],
  );

  const handleDelete = useCallback(() => {
    deleteAnnotation(rootAnnotation.id);
    navigateAway();
  }, [rootAnnotation.id, deleteAnnotation, navigateAway]);

  if (!mounted || !ready) {
    return null;
  }

  const targetMissing =
    Boolean(rootAnnotation.targetId) &&
    !targetElement &&
    !resolveAnnotationTargetById(rootAnnotation.targetId!);

  const markerStyle = getElementRelativeMarkerStyle(rootAnnotation);
  const markerViewport = getMarkerViewportPosition(
    rootAnnotation,
    targetElement,
  );
  const popupLeft = Math.max(160, Math.min(window.innerWidth - 160, markerViewport.x));
  const popupPosition =
    markerViewport.y > window.innerHeight - 290
      ? { bottom: window.innerHeight - markerViewport.y + 20 }
      : { top: markerViewport.y + 20 };

  return createPortal(
    (
      <div
        className={styles.captureScope}
        data-prototype-comment-theme={commentTheme}
        data-prototype-comment-accent="blue"
        data-prototype-comment-root=""
      >
        <PrototypeComponentAnchorLayer
          targetId={rootAnnotation.targetId}
          targetElement={targetElement}
          marker="target"
          showOutline
          isMultiSelect={!!rootAnnotation.isMultiSelect}
        >
          {!readOnly ? (
            <div className={styles.markersLayerInViewport}>
              <AnnotationMarker
                annotation={{
                  ...rootAnnotation,
                  status: rootAnnotation.status ?? "pending",
                }}
                globalIndex={0}
                layerIndex={0}
                layerSize={1}
                isExiting={false}
                isClearing={false}
                isAnimated
                isHovered={false}
                isDeleting={false}
                isEditingAny
                renumberFrom={null}
                markerClickBehavior="edit"
                positionStyle={markerStyle}
                onHoverEnter={() => {}}
                onHoverLeave={() => {}}
                onClick={() => {}}
              />
            </div>
          ) : null}
        </PrototypeComponentAnchorLayer>

        <div className={styles.overlay} style={{ zIndex: 99999 }}>
          {targetMissing && (
            <div
              className={styles.targetUnresolvedBanner}
              style={{
                position: "fixed",
                top: 12,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 100000,
              }}
            >
              Original target not found — position may be approximate
            </div>
          )}

          <AnnotationPopupCSS
            element={rootAnnotation.element}
            selectedText={rootAnnotation.selectedText}
            computedStyles={parseComputedStylesString(
              rootAnnotation.computedStyles,
            )}
            placeholder="Edit your feedback..."
            initialValue={rootAnnotation.comment}
            submitLabel="Save"
            readOnly={readOnly}
            onSubmit={handleSave}
            onCancel={navigateAway}
            onDelete={readOnly ? undefined : handleDelete}
            isExiting={isExiting}
            lightMode={useLightTheme}
            accentColor={
              rootAnnotation.isMultiSelect
                ? "var(--prototype-comment-color-green)"
                : "var(--prototype-comment-color-accent)"
            }
            style={{
              left: popupLeft,
              ...popupPosition,
            }}
          />
        </div>
      </div>
    ) as any,
    document.body,
  );
}
