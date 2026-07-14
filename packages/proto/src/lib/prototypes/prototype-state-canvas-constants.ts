/** Layout width of a state-map node card (CSS px). */
export const PROTOTYPE_STATE_NODE_WIDTH = 220;

/** Preview image area height inside a state-map node (CSS px). */
export const PROTOTYPE_STATE_NODE_PREVIEW_HEIGHT = 132;

/** Label row height below the wireframe preview (CSS px). */
export const PROTOTYPE_STATE_NODE_LABEL_HEIGHT = 36;

/** Single nested-state (callout) row height (CSS px). */
export const PROTOTYPE_STATE_NODE_CALLOUT_HEIGHT = 28;

/** Nested-state row height when a hint label is shown (CSS px). */
export const PROTOTYPE_STATE_NODE_CALLOUT_WITH_HINT_HEIGHT = 36;

/** Gap between nested-state rows (CSS px). */
export const PROTOTYPE_STATE_NODE_CALLOUT_GAP = 4;

/** Padding around the nested-state tray (CSS px). */
export const PROTOTYPE_STATE_NODE_CALLOUT_PADDING = 8;

/** Horizontal gap between state-map node columns (CSS px). */
export const PROTOTYPE_STATE_NODE_COLUMN_GAP = 56;

/** Vertical gap between a section label and the nodes below it (CSS px). */
export const PROTOTYPE_STATE_SECTION_TO_NODES = 40;

/** Vertical gap between rows of nodes (CSS px). */
export const PROTOTYPE_STATE_NODE_ROW_GAP = 48;

/** Padding from the canvas origin (CSS px). */
export const PROTOTYPE_STATE_CANVAS_PADDING = 48;

export type StateCanvasCalloutDimensions = {
  hint?: string;
};

export function getStateCanvasCalloutHeight(
  callout: StateCanvasCalloutDimensions,
): number {
  return callout.hint
    ? PROTOTYPE_STATE_NODE_CALLOUT_WITH_HINT_HEIGHT
    : PROTOTYPE_STATE_NODE_CALLOUT_HEIGHT;
}

/** Preview + label area height (excludes nested-state callouts). */
export function getStateCanvasNodeBodyHeight(): number {
  return PROTOTYPE_STATE_NODE_PREVIEW_HEIGHT + PROTOTYPE_STATE_NODE_LABEL_HEIGHT;
}

/** Canvas Y of the title row for a state or nested-state annotation target. */
export function getStateMapAnnotationTitleTop(
  nodeY: number,
  targetId: string,
  nodeId: string,
  callouts?: readonly (StateCanvasCalloutDimensions & { id: string })[],
): number {
  if (targetId === nodeId) {
    return nodeY + PROTOTYPE_STATE_NODE_PREVIEW_HEIGHT;
  }

  if (!callouts?.length) {
    return nodeY + PROTOTYPE_STATE_NODE_PREVIEW_HEIGHT;
  }

  let offset =
    getStateCanvasNodeBodyHeight() + PROTOTYPE_STATE_NODE_CALLOUT_PADDING;

  for (const callout of callouts) {
    if (callout.id === targetId) {
      return nodeY + offset;
    }
    offset +=
      getStateCanvasCalloutHeight(callout) + PROTOTYPE_STATE_NODE_CALLOUT_GAP;
  }

  return nodeY + PROTOTYPE_STATE_NODE_PREVIEW_HEIGHT;
}

/** Total rendered height of a state-map node, including nested states. */
export function getStateCanvasNodeHeight(
  callouts?: readonly StateCanvasCalloutDimensions[],
): number {
  const bodyHeight = getStateCanvasNodeBodyHeight();
  const count = callouts?.length ?? 0;
  if (count === 0) return bodyHeight;

  const calloutsHeight = (callouts ?? []).reduce((sum, callout, index) => {
    const gap = index > 0 ? PROTOTYPE_STATE_NODE_CALLOUT_GAP : 0;
    return sum + gap + getStateCanvasCalloutHeight(callout);
  }, 0);

  return bodyHeight + PROTOTYPE_STATE_NODE_CALLOUT_PADDING * 2 + calloutsHeight;
}

/** X coordinate for a zero-based column index. */
export function stateCanvasColumnX(columnIndex: number): number {
  return (
    PROTOTYPE_STATE_CANVAS_PADDING +
    columnIndex * (PROTOTYPE_STATE_NODE_WIDTH + PROTOTYPE_STATE_NODE_COLUMN_GAP)
  );
}

/** Maximum canvas zoom — thumbnails are generated for this scale. */
export const PROTOTYPE_STATE_CANVAS_MAX_SCALE = 4.5;

/** Device pixel ratio used when rasterizing state thumbnails. */
export const PROTOTYPE_STATE_SCREENSHOT_THUMB_PIXEL_RATIO = 2;

export function getStateScreenshotThumbSize(): { width: number; height: number } {
  const scale =
    PROTOTYPE_STATE_CANVAS_MAX_SCALE * PROTOTYPE_STATE_SCREENSHOT_THUMB_PIXEL_RATIO;

  return {
    width: Math.round(PROTOTYPE_STATE_NODE_WIDTH * scale),
    height: Math.round(PROTOTYPE_STATE_NODE_PREVIEW_HEIGHT * scale),
  };
}
