"use client";

import {
  PR_TARGET_HIGHLIGHT_BORDER,
  PR_TARGET_HIGHLIGHT_FILL,
  type PrototypeStateCanvasConfig,
} from "proto-plugin";

import type { EventTypesPreviewStateId } from "./event-types-types";
import { EVENT_TYPES_PREVIEW_STATE_REGISTRY } from "./event-types-preview-states";

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

function renderWireframe(stateId: EventTypesPreviewStateId) {
  switch (stateId) {
    case "event-types-list":
      return (
        <div className="flex h-full flex-col gap-1 p-2">
          <WireBlock className="h-4 w-full rounded-sm" />
          <WireBlock className="flex-1 rounded-sm" highlight />
        </div>
      );
    case "new-event-type-modal":
      return (
        <div className="relative flex h-full flex-col gap-1 p-2">
          <WireBlock className="h-4 w-full rounded-sm opacity-40" />
          <WireBlock className="flex-1 rounded-sm opacity-40" />
          <WireBlock className="absolute inset-x-2 top-4 bottom-2 rounded-sm border border-dashed" highlight />
        </div>
      );
    case "empty-search":
      return (
        <div className="flex h-full flex-col gap-1 p-2">
          <WireBlock className="h-4 w-full rounded-sm" />
          <WireBlock className="flex-1 rounded-sm border border-dashed" highlight />
        </div>
      );
    case "secret-events-filter":
      return (
        <div className="flex h-full flex-col gap-1 p-2">
          <WireBlock className="h-4 w-full rounded-sm" />
          <WireBlock className="h-5 w-24 rounded-sm" highlight />
          <WireBlock className="flex-1 rounded-sm" highlight />
        </div>
      );
    default:
      return null;
  }
}

export function buildEventTypesStateCanvasConfig(
  onStateSelect: (stateId: EventTypesPreviewStateId) => void,
): PrototypeStateCanvasConfig<EventTypesPreviewStateId> {
  const registry = EVENT_TYPES_PREVIEW_STATE_REGISTRY;

  return {
    onStateSelect,
    nodes: registry.canvasNodes,
    edges: registry.canvasEdges,
    sections: registry.canvasSections,
    canvasWidth: registry.canvasSize.width,
    canvasHeight: registry.canvasSize.height,
    renderWireframe,
  };
}
