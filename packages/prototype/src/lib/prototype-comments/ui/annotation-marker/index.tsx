import type { CommentAnnotationFields } from "../../core/types";
import { IconEdit, IconPlus, IconXmark } from "../icons";

type MarkerAnnotation = CommentAnnotationFields & {
  status?: "pending" | "acknowledged" | "resolved" | "dismissed";
};
import styles from "./styles.module.scss";

type MarkerClickBehavior = "edit" | "delete";

// =============================================================================
// AnnotationMarker
// =============================================================================

type AnnotationMarkerProps = {
  annotation: MarkerAnnotation;
  globalIndex: number;
  /** Display index within this layer (for staggered animation delays) */
  layerIndex: number;
  layerSize: number;
  isExiting: boolean;
  isClearing: boolean;
  isAnimated: boolean;
  isHovered: boolean;
  isDeleting: boolean;
  isEditingAny: boolean;
  renumberFrom: number | null;
  markerClickBehavior: MarkerClickBehavior;
  tooltipStyle?: React.CSSProperties;
  positionStyle?: { left: string; top: string | number };
  onHoverEnter: (annotation: MarkerAnnotation) => void;
  onHoverLeave: () => void;
  onClick: (annotation: MarkerAnnotation) => void;
  onContextMenu?: (annotation: MarkerAnnotation) => void;
};

export function AnnotationMarker({
  annotation,
  globalIndex,
  layerIndex,
  layerSize,
  isExiting,
  isClearing,
  isAnimated,
  isHovered,
  isDeleting,
  isEditingAny,
  renumberFrom,
  markerClickBehavior,
  tooltipStyle,
  positionStyle,
  onHoverEnter,
  onHoverLeave,
  onClick,
  onContextMenu,
}: AnnotationMarkerProps) {
  const showDeleteState = (isHovered || isDeleting) && !isEditingAny;
  const showDeleteHover = showDeleteState && markerClickBehavior === "delete";
  const isMulti = annotation.isMultiSelect;

  const markerColor = isMulti
    ? "var(--prototype-comment-color-green)"
    : "var(--prototype-comment-color-accent)";

  const animClass = isExiting
    ? styles.exit
    : isClearing
      ? styles.clearing
      : !isAnimated
        ? styles.enter
        : "";

  const animationDelay = isExiting
    ? `${(layerSize - 1 - layerIndex) * 20}ms`
    : `${layerIndex * 20}ms`;

  return (
    <div
      className={`${styles.marker} ${isMulti ? styles.multiSelect : ""} ${animClass} ${showDeleteHover ? styles.hovered : ""}`}
      data-annotation-marker
      style={{
        left: positionStyle?.left ?? `${annotation.x}%`,
        top: positionStyle?.top ?? `${annotation.y}%`,
        backgroundColor: showDeleteHover ? undefined : markerColor,
        animationDelay,
      }}
      onMouseEnter={() => onHoverEnter(annotation)}
      onMouseLeave={onHoverLeave}
      onClick={(e) => {
        e.stopPropagation();
        if (!isExiting) onClick(annotation);
      }}
      onContextMenu={
        onContextMenu
          ? (e) => {
              if (markerClickBehavior === "delete") {
                e.preventDefault();
                e.stopPropagation();
                if (!isExiting) onContextMenu(annotation);
              }
            }
          : undefined
      }
    >
      {showDeleteState ? (
        showDeleteHover ? (
          <IconXmark size={isMulti ? 18 : 16} />
        ) : (
          <IconEdit size={16} />
        )
      ) : (
        <span
          className={
            renumberFrom !== null && globalIndex >= renumberFrom
              ? styles.renumber
              : undefined
          }
        >
          {globalIndex + 1}
        </span>
      )}

      {isHovered && !isEditingAny && (
        <div
          className={`${styles.markerTooltip} ${styles.enter}`}
          style={tooltipStyle}
        >
          <span className={styles.markerQuote}>
            {annotation.element}
            {annotation.selectedText &&
              ` "${annotation.selectedText.slice(0, 30)}${annotation.selectedText.length > 30 ? "..." : ""}"`}
          </span>
          <span className={styles.markerNote}>{annotation.comment}</span>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// PendingMarker
// =============================================================================

type PendingMarkerProps = {
  x: number;
  y: number;
  isMultiSelect?: boolean;
  isExiting: boolean;
  positionStyle?: { left: string; top: string | number };
};

export function PendingMarker({
  x,
  y,
  isMultiSelect,
  isExiting,
  positionStyle,
}: PendingMarkerProps) {
  return (
    <div
      className={`${styles.marker} ${styles.pending} ${isMultiSelect ? styles.multiSelect : ""} ${isExiting ? styles.exit : styles.enter}`}
      data-annotation-marker
      style={{
        left: positionStyle?.left ?? `${x}%`,
        top: positionStyle?.top ?? `${y}%`,
        backgroundColor: isMultiSelect
          ? "var(--prototype-comment-color-green)"
          : "var(--prototype-comment-color-accent)",
      }}
    >
      <IconPlus size={12} />
    </div>
  );
}

// =============================================================================
// ExitingMarker
// =============================================================================

type ExitingMarkerProps = {
  annotation: MarkerAnnotation;
  fixed?: boolean;
  positionStyle?: { left: string; top: string | number };
};

export function ExitingMarker({ annotation, fixed, positionStyle }: ExitingMarkerProps) {
  const isMulti = annotation.isMultiSelect;
  return (
    <div
      className={`${styles.marker} ${fixed ? styles.fixed : ""} ${styles.hovered} ${isMulti ? styles.multiSelect : ""} ${styles.exit}`}
      data-annotation-marker
      style={{
        left: positionStyle?.left ?? `${annotation.x}%`,
        top: positionStyle?.top ?? `${annotation.y}%`,
      }}
    >
      <IconXmark size={isMulti ? 12 : 10} />
    </div>
  );
}
