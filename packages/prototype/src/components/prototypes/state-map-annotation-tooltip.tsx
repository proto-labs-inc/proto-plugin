"use client";

import type { PrototypeStateCanvasNode } from "@prototype/lib/prototypes/prototype-state-canvas-types";
import {
  getStateMapAnnotationTitleTop,
  PROTOTYPE_STATE_NODE_WIDTH,
} from "@prototype/lib/prototypes/prototype-state-canvas-constants";
import {
  parseStateMapAnnotation,
  resolveBulletHighlightId,
  stateMapAnnotationHasInteractiveBullets,
} from "@prototype/lib/prototypes/state-map-annotation";
import { cn } from "@prototype/lib/utils";
import { useEffect } from "react";

import styles from "./state-map-annotation-tooltip.module.scss";

const TOOLTIP_GAP = 10;

export type StateMapAnnotationTarget = {
  id: string;
  label: string;
  parentLabel?: string;
  annotation: string;
  highlightRegions?: readonly string[];
};

export type StateMapAnnotationAnchor = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type StateMapAnnotationTooltipProps = {
  target: StateMapAnnotationTarget;
  anchor: StateMapAnnotationAnchor;
  visible: boolean;
  activeHighlightId: string | null;
  onHighlightChange: (highlightId: string | null) => void;
  onDismiss: () => void;
  onKeepOpen: () => void;
};

/** Anchor beside the hovered state or nested-state title row. */
export function getStateMapAnnotationAnchor<T extends string>(
  node: PrototypeStateCanvasNode<T>,
  targetId: string,
): StateMapAnnotationAnchor {
  return {
    x: node.x,
    y: getStateMapAnnotationTitleTop(
      node.y,
      targetId,
      node.id,
      node.callouts,
    ),
    width: PROTOTYPE_STATE_NODE_WIDTH,
    height: 0,
  };
}

function computeCanvasTooltipPosition(
  anchor: StateMapAnnotationAnchor,
): { left: number; top: number } {
  return {
    left: anchor.x + anchor.width + TOOLTIP_GAP,
    top: anchor.y,
  };
}

export function StateMapAnnotationTooltip({
  target,
  anchor,
  visible,
  activeHighlightId,
  onHighlightChange,
  onDismiss,
  onKeepOpen,
}: StateMapAnnotationTooltipProps) {
  const position = computeCanvasTooltipPosition(anchor);
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
      className={cn(styles.tooltip, visible && styles.tooltipVisible)}
      role="tooltip"
      style={{ left: position.left, top: position.top }}
      onMouseEnter={onKeepOpen}
      onMouseLeave={onDismiss}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {parsed.lead ? <p className={styles.lead}>{parsed.lead}</p> : null}
      {parsed.bullets.length > 0 ? (
        <ul className={styles.bulletList}>
          {parsed.bullets.map((bullet) => {
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
