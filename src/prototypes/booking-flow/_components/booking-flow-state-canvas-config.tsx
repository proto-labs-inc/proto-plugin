"use client";

import type { PrototypeStateCanvasConfig } from "@prototype/lib/prototypes/prototype-state-canvas-types";
import {
  PR_TARGET_HIGHLIGHT_BORDER,
  PR_TARGET_HIGHLIGHT_FILL,
} from "@prototype/lib/pr-split/pr-split-highlight";

import type { BookingFlowStepId } from "./booking-flow-preview-states";
import {
  BOOKING_FLOW_PREVIEW_STATE_REGISTRY,
} from "./booking-flow-preview-states";

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

function renderWireframe(step: BookingFlowStepId) {
  switch (step) {
    case "month-picker":
      return (
        <div className="flex h-full gap-1 p-2">
          <WireBlock className="w-[28%] rounded-sm" />
          <WireBlock className="w-[36%] rounded-sm" highlight />
          <WireBlock className="w-[36%] rounded-sm" />
        </div>
      );
    case "week-grid":
      return (
        <div className="flex h-full gap-1 p-2">
          <WireBlock className="w-[22%] rounded-sm" />
          <WireBlock className="flex-1 rounded-sm" highlight />
        </div>
      );
    case "list-view":
      return (
        <div className="flex h-full gap-1 p-2">
          <WireBlock className="w-[22%] rounded-sm" />
          <WireBlock className="flex-1 rounded-sm" highlight />
        </div>
      );
    case "form-page":
      return (
        <div className="flex h-full gap-1 p-2">
          <WireBlock className="w-[40%] rounded-sm" />
          <WireBlock className="flex-1 rounded-sm" highlight />
        </div>
      );
    case "confirm-modal-week":
    case "confirm-modal-list":
      return (
        <div className="relative h-full p-2">
          <WireBlock className="absolute inset-2 rounded-sm opacity-40" />
          <WireBlock
            className="absolute left-1/2 top-1/2 h-[55%] w-[45%] -translate-x-1/2 -translate-y-1/2 rounded-sm"
            highlight
          />
        </div>
      );
    case "success":
      return (
        <div className="flex h-full items-center justify-center p-4">
          <WireBlock className="h-full w-[70%] rounded-sm" highlight />
        </div>
      );
    default:
      return null;
  }
}

export function buildBookingFlowStateCanvasConfig(
  onStepSelect: (step: BookingFlowStepId) => void,
): PrototypeStateCanvasConfig<BookingFlowStepId> {
  const registry = BOOKING_FLOW_PREVIEW_STATE_REGISTRY;

  return {
    onStateSelect: onStepSelect,
    nodes: registry.canvasNodes,
    edges: registry.canvasEdges,
    sections: registry.canvasSections,
    canvasWidth: registry.canvasSize.width,
    canvasHeight: registry.canvasSize.height,
    renderWireframe,
  };
}
