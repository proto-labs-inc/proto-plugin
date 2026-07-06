"use client";

import type { PrototypeStateCanvasConfig } from "@prototype/lib/prototypes/prototype-state-canvas-types";
import {
  PR_TARGET_HIGHLIGHT_BORDER,
  PR_TARGET_HIGHLIGHT_FILL,
} from "@prototype/lib/pr-split/pr-split-highlight";

import type { BookingsPagePreviewStateId } from "./bookings-page-preview-states";
import { BOOKINGS_PAGE_PREVIEW_STATE_REGISTRY } from "./bookings-page-preview-states";

function WireBlock({
  className,
  highlight,
}: {
  className?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={className}
      style={
        highlight
          ? {
              background: PR_TARGET_HIGHLIGHT_FILL,
              border: `1px solid ${PR_TARGET_HIGHLIGHT_BORDER}`,
            }
          : { background: "var(--cal-bg-emphasis, #e5e7eb)" }
      }
    />
  );
}

function renderWireframe(stateId: BookingsPagePreviewStateId) {
  switch (stateId) {
    case "upcoming-list":
      return (
        <div className="flex h-full flex-col gap-1 p-2">
          <WireBlock className="h-4 w-full rounded-sm" />
          <WireBlock className="flex-1 rounded-sm" highlight />
          <WireBlock className="h-3 w-2/3 rounded-sm" />
        </div>
      );
    case "unconfirmed-empty":
      return (
        <div className="flex h-full flex-col gap-1 p-2">
          <WireBlock className="h-4 w-full rounded-sm" />
          <WireBlock className="flex-1 rounded-sm border border-dashed" highlight />
        </div>
      );
    case "upcoming-filtered-empty":
      return (
        <div className="flex h-full flex-col gap-1 p-2">
          <WireBlock className="h-4 w-full rounded-sm" />
          <WireBlock className="h-4 w-3/5 rounded-sm" />
          <WireBlock className="flex-1 rounded-sm border border-dashed" highlight />
        </div>
      );
    default:
      return null;
  }
}

export function buildBookingsPageStateCanvasConfig(
  activeStateId: BookingsPagePreviewStateId,
  onStateSelect: (stateId: BookingsPagePreviewStateId) => void,
): PrototypeStateCanvasConfig<BookingsPagePreviewStateId> {
  const registry = BOOKINGS_PAGE_PREVIEW_STATE_REGISTRY;

  return {
    activeStateId,
    onStateSelect,
    nodes: registry.canvasNodes,
    edges: registry.canvasEdges,
    sections: registry.canvasSections,
    canvasWidth: registry.canvasSize.width,
    canvasHeight: registry.canvasSize.height,
    renderWireframe,
  };
}
