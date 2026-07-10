"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import {
  getAnnotationMarkerPosition,
  getAnnotationOutlineBox,
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
import {
  PrototypeTargetHighlightLayer,
  toHighlightPortalStyle,
  useHighlightPortalContainer,
} from "@prototype/components/prototypes/prototype-target-highlight-layer";

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
  const highlightPortal = useHighlightPortalContainer();
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const layoutVersion = useLayoutShift();

  useEffect(() => {
    setMounted(true);
    setScrollY(window.scrollY);

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
    setScrollY(window.scrollY);
    setTargetElement(
      resolveAnnotationTargetElement(
        rootAnnotation,
        window.scrollY,
        resolveTargetOptions,
      ),
    );
  }, [rootAnnotation, resolveTargetOptions]);

  useEffect(() => {
    if (!ready) return;

    refreshTarget();

    const handleScroll = () => refreshTarget();
    const handleResize = () => refreshTarget();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    const scrollContainer = getPrototypeScrollContainer();
    scrollContainer?.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
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

  const outlineBox = getAnnotationOutlineBox(rootAnnotation, targetElement, scrollY);
  const portalOutlineBox =
    outlineBox != null
      ? toHighlightPortalStyle(
          {
            left: outlineBox.x,
            top: outlineBox.y,
            width: outlineBox.width,
            height: outlineBox.height,
          },
          highlightPortal,
        )
      : null;
  const positionStyle = getAnnotationMarkerPosition(rootAnnotation, targetElement, scrollY);
  const markerViewport = getMarkerViewportPosition(rootAnnotation, scrollY, targetElement);
  const popupLeft = Math.max(160, Math.min(window.innerWidth - 160, markerViewport.x));
  const popupPosition =
    markerViewport.y > window.innerHeight - 290
      ? { bottom: window.innerHeight - markerViewport.y + 20 }
      : { top: markerViewport.y + 20 };

  const markerLayerClassName = rootAnnotation.isFixed
    ? styles.fixedMarkersLayer
    : styles.markersLayer;

  return createPortal(
    (
      <div
        className={styles.captureScope}
        data-prototype-comment-theme={commentTheme}
        data-prototype-comment-accent="blue"
        data-prototype-comment-root=""
      >
        {!readOnly && (
          <div className={markerLayerClassName} style={{ zIndex: 99999 }}>
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
              positionStyle={positionStyle}
              onHoverEnter={() => {}}
              onHoverLeave={() => {}}
              onClick={() => {}}
            />
          </div>
        )}

        {portalOutlineBox ? (
          <PrototypeTargetHighlightLayer marker="target">
            <div
              className={`${rootAnnotation.isMultiSelect ? styles.multiSelectOutline : styles.singleSelectOutline} ${styles.enter}`}
              style={{
                left: portalOutlineBox.left,
                top: portalOutlineBox.top,
                width: portalOutlineBox.width,
                height: portalOutlineBox.height,
              }}
            />
          </PrototypeTargetHighlightLayer>
        ) : null}

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
