"use client";

import {
  parseStateMapAnnotation,
  resolveBulletHighlightId,
  stateMapAnnotationHasInteractiveBullets,
} from "@prototype/lib/prototypes/state-map-annotation";
import { cn } from "@prototype/lib/utils";
import { useEffect, useMemo } from "react";

import styles from "./state-map-annotation-tooltip.module.scss";

export type StateMapAnnotationTarget = {
  id: string;
  label: string;
  parentLabel?: string;
  annotation: string;
  highlightRegions?: readonly string[];
};

type StateMapAnnotationPanelProps = {
  target: StateMapAnnotationTarget;
  canvasScale: number;
  visible: boolean;
  activeHighlightId: string | null;
  onHighlightChange: (highlightId: string | null) => void;
  onDismiss: () => void;
  onKeepOpen: () => void;
};

const ANNOTATION_FONT_SCREEN_PX = 11;
const ANNOTATION_PADDING_X_SCREEN_PX = 12;
const ANNOTATION_PADDING_Y_SCREEN_PX = 10;
const ANNOTATION_BULLET_LIST_MARGIN_TOP_SCREEN_PX = 7;
const ANNOTATION_BULLET_PADDING_Y_SCREEN_PX = 3;
const ANNOTATION_BULLET_PADDING_LEFT_SCREEN_PX = 14;
const ANNOTATION_BULLET_GAP_SCREEN_PX = 1;
const ANNOTATION_BULLET_INTERACTIVE_MARGIN_LEFT_SCREEN_PX = -6;
const ANNOTATION_BULLET_INTERACTIVE_PADDING_LEFT_SCREEN_PX = 20;
const ANNOTATION_BULLET_RADIUS_SCREEN_PX = 4;

function getConstantScreenCanvasPx(
  canvasScale: number,
  targetScreenPx: number,
): number {
  if (canvasScale <= 0) {
    return targetScreenPx;
  }
  return targetScreenPx / canvasScale;
}

function useAnnotationScaleStyles(canvasScale: number) {
  return useMemo(() => {
    const fontSize = `${getConstantScreenCanvasPx(canvasScale, ANNOTATION_FONT_SCREEN_PX)}px`;
    const paddingX = `${getConstantScreenCanvasPx(canvasScale, ANNOTATION_PADDING_X_SCREEN_PX)}px`;
    const paddingY = `${getConstantScreenCanvasPx(canvasScale, ANNOTATION_PADDING_Y_SCREEN_PX)}px`;
    const bulletListMarginTop = `${getConstantScreenCanvasPx(canvasScale, ANNOTATION_BULLET_LIST_MARGIN_TOP_SCREEN_PX)}px`;
    const bulletPaddingY = `${getConstantScreenCanvasPx(canvasScale, ANNOTATION_BULLET_PADDING_Y_SCREEN_PX)}px`;
    const bulletPaddingLeft = `${getConstantScreenCanvasPx(canvasScale, ANNOTATION_BULLET_PADDING_LEFT_SCREEN_PX)}px`;
    const bulletGap = `${getConstantScreenCanvasPx(canvasScale, ANNOTATION_BULLET_GAP_SCREEN_PX)}px`;
    const bulletInteractiveMarginLeft = `${getConstantScreenCanvasPx(canvasScale, ANNOTATION_BULLET_INTERACTIVE_MARGIN_LEFT_SCREEN_PX)}px`;
    const bulletInteractivePaddingLeft = `${getConstantScreenCanvasPx(canvasScale, ANNOTATION_BULLET_INTERACTIVE_PADDING_LEFT_SCREEN_PX)}px`;
    const bulletRadius = `${getConstantScreenCanvasPx(canvasScale, ANNOTATION_BULLET_RADIUS_SCREEN_PX)}px`;

    return {
      panel: {
        padding: `${paddingY} ${paddingX}`,
      },
      lead: { fontSize },
      bulletList: { marginTop: bulletListMarginTop },
      bulletItem: {
        fontSize,
        padding: `${bulletPaddingY} 0 ${bulletPaddingY} ${bulletPaddingLeft}`,
      },
      bulletItemGap: { marginTop: bulletGap },
      bulletItemInteractive: {
        marginLeft: bulletInteractiveMarginLeft,
        paddingLeft: bulletInteractivePaddingLeft,
        borderRadius: bulletRadius,
      },
    };
  }, [canvasScale]);
}

export function StateMapAnnotationPanel({
  target,
  canvasScale,
  visible,
  activeHighlightId,
  onHighlightChange,
  onDismiss,
  onKeepOpen,
}: StateMapAnnotationPanelProps) {
  const scaleStyles = useAnnotationScaleStyles(canvasScale);
  const parsed = parseStateMapAnnotation(target.annotation);
  const hasInteractiveBullets = stateMapAnnotationHasInteractiveBullets(
    target.annotation,
    target.highlightRegions,
  );

  useEffect(() => {
    onHighlightChange(null);
  }, [target.id, onHighlightChange]);

  return (
    <div
      className={cn(styles.panel, visible && styles.panelVisible)}
      role="tooltip"
      style={scaleStyles.panel}
      onMouseEnter={onKeepOpen}
      onMouseLeave={onDismiss}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {parsed.lead ? (
        <p className={styles.lead} style={scaleStyles.lead}>
          {parsed.lead}
        </p>
      ) : null}
      {parsed.bullets.length > 0 ? (
        <ul className={styles.bulletList} style={scaleStyles.bulletList}>
          {parsed.bullets.map((bullet, index) => {
            const highlightId = resolveBulletHighlightId(
              bullet,
              target.highlightRegions,
            );
            const isInteractive = hasInteractiveBullets && highlightId != null;
            return (
              <li
                key={bullet.index}
                className={cn(
                  styles.bulletItem,
                  isInteractive && styles.bulletItemInteractive,
                  isInteractive &&
                    activeHighlightId === highlightId &&
                    styles.bulletItemActive,
                )}
                style={{
                  ...scaleStyles.bulletItem,
                  ...(index > 0 ? scaleStyles.bulletItemGap : {}),
                  ...(isInteractive ? scaleStyles.bulletItemInteractive : {}),
                }}
                onMouseEnter={
                  isInteractive
                    ? () => onHighlightChange(highlightId)
                    : undefined
                }
                onMouseLeave={
                  isInteractive ? () => onHighlightChange(null) : undefined
                }
              >
                {bullet.text}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/** @deprecated Use StateMapAnnotationPanel instead. */
export const StateMapAnnotationTooltip = StateMapAnnotationPanel;
