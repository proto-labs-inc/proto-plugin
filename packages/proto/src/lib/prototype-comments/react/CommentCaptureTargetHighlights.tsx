"use client";

import styles from "@prototype/lib/prototype-comments/ui/capture-styles.module.scss";
import {
  PrototypeTargetHighlightLayer,
  toHighlightPortalStyle,
  useHighlightPortalContainer,
} from "@prototype/components/prototypes/prototype-target-highlight-layer";

type HighlightRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type HoverInfo = {
  element: string;
  rect: DOMRect | null;
};

type MultiSelectItem = {
  element: HTMLElement;
};

type PendingAnnotation = {
  targetElement?: HTMLElement | null;
  multiSelectElements?: HTMLElement[];
  boundingBox?: { x: number; y: number; width: number; height: number };
  isMultiSelect?: boolean;
};

type CommentCaptureTargetHighlightsProps = {
  hoverInfo: HoverInfo | null;
  pendingAnnotation: PendingAnnotation | null;
  pendingExiting: boolean;
  pendingMultiSelectElements: MultiSelectItem[];
  scrollY: number;
};

function toPortalRect(
  rect: HighlightRect,
  portal: HTMLElement | null,
): HighlightRect {
  return toHighlightPortalStyle(rect, portal);
}

export function CommentCaptureTargetHighlights({
  hoverInfo,
  pendingAnnotation,
  pendingExiting,
  pendingMultiSelectElements,
  scrollY,
}: CommentCaptureTargetHighlightsProps) {
  const highlightPortal = useHighlightPortalContainer();

  return (
    <PrototypeTargetHighlightLayer marker="capture">
      {hoverInfo?.rect && !pendingAnnotation ? (
        <div
          className={`${styles.singleSelectOutline} ${styles.enter}`}
          style={toPortalRect(hoverInfo.rect, highlightPortal)}
        />
      ) : null}

      {pendingMultiSelectElements.map((item, index) => {
        const rect = toPortalRect(
          item.element.getBoundingClientRect(),
          highlightPortal,
        );
        return (
          <div
            key={`multi-hover-${index}`}
            className={`${styles.multiSelectOutline} ${styles.enter}`}
            style={rect}
          />
        );
      })}

      {pendingAnnotation
        ? pendingAnnotation.multiSelectElements?.length
          ? pendingAnnotation.multiSelectElements
              .filter((el) => document.contains(el))
              .map((el, index) => {
                const rect = toPortalRect(
                  el.getBoundingClientRect(),
                  highlightPortal,
                );
                return (
                  <div
                    key={`pending-multi-${index}`}
                    className={`${styles.multiSelectOutline} ${
                      pendingExiting ? styles.exit : styles.enter
                    }`}
                    style={rect}
                  />
                );
              })
          : pendingAnnotation.targetElement &&
              document.contains(pendingAnnotation.targetElement)
            ? (() => {
                const rect = toPortalRect(
                  pendingAnnotation.targetElement!.getBoundingClientRect(),
                  highlightPortal,
                );
                return (
                  <div
                    className={`${styles.singleSelectOutline} ${
                      pendingExiting ? styles.exit : styles.enter
                    }`}
                    style={rect}
                  />
                );
              })()
            : pendingAnnotation.boundingBox
              ? (() => {
                  const rect = toPortalRect(
                    {
                      left: pendingAnnotation.boundingBox!.x,
                      top:
                        pendingAnnotation.boundingBox!.y - scrollY,
                      width: pendingAnnotation.boundingBox!.width,
                      height: pendingAnnotation.boundingBox!.height,
                    },
                    highlightPortal,
                  );
                  return (
                    <div
                      className={`${
                        pendingAnnotation.isMultiSelect
                          ? styles.multiSelectOutline
                          : styles.singleSelectOutline
                      } ${pendingExiting ? styles.exit : styles.enter}`}
                      style={rect}
                    />
                  );
                })()
              : null
        : null}
    </PrototypeTargetHighlightLayer>
  );
}
