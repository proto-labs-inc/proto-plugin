"use client";

import type { PrototypeStateCanvasConfig } from "proto-plugin";
import {
  PR_TARGET_HIGHLIGHT_BORDER,
  PR_TARGET_HIGHLIGHT_FILL,
} from "proto-plugin";

import type { TableEditorFiltersPreviewStateId } from "./table-editor-filters-types";
import { TABLE_EDITOR_FILTERS_PREVIEW_STATE_REGISTRY } from "./table-editor-filters-preview-states";

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

function renderWireframe(stateId: TableEditorFiltersPreviewStateId) {
  switch (stateId) {
    case "loading":
      return (
        <div className="flex h-full flex-col gap-1 p-2">
          <WireBlock className="h-3 w-full rounded-sm" />
          <WireBlock className="h-2 w-full rounded-sm" />
          <WireBlock className="flex-1 rounded-sm" highlight />
        </div>
      );
    case "error":
      return (
        <div className="relative flex h-full gap-1 p-2">
          <WireBlock className="w-[22%] rounded-sm" />
          <div className="relative flex-1">
            <WireBlock className="absolute inset-0 rounded-sm opacity-60" />
            <WireBlock
              className="absolute left-1/2 top-1/2 h-8 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-sm"
              highlight
            />
          </div>
        </div>
      );
    case "populated":
      return (
        <div className="flex h-full gap-1 p-2">
          <WireBlock className="w-[22%] rounded-sm" />
          <WireBlock className="flex-1 rounded-sm" highlight />
        </div>
      );
    case "filtered-empty":
      return (
        <div className="relative flex h-full gap-1 p-2">
          <WireBlock className="w-[22%] rounded-sm" />
          <div className="relative flex-1">
            <WireBlock className="absolute inset-0 rounded-sm" highlight />
            <WireBlock className="absolute left-1/2 top-1/2 h-4 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm opacity-70" />
          </div>
        </div>
      );
    case "empty-table":
      return (
        <div className="relative flex h-full gap-1 p-2">
          <WireBlock className="w-[22%] rounded-sm" />
          <div className="relative flex-1">
            <WireBlock className="absolute inset-0 rounded-sm" highlight />
            <WireBlock className="absolute left-1/2 top-1/2 h-6 w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-sm opacity-70" />
          </div>
        </div>
      );
    case "insert-row":
      return (
        <div className="relative flex h-full gap-1 p-2">
          <WireBlock className="w-[22%] rounded-sm opacity-60" />
          <WireBlock className="flex-1 rounded-sm opacity-60" />
          <WireBlock className="absolute right-2 top-2 bottom-2 w-[38%] rounded-sm" highlight />
        </div>
      );
    case "edit-row":
      return (
        <div className="relative flex h-full gap-1 p-2">
          <WireBlock className="w-[22%] rounded-sm opacity-60" />
          <WireBlock className="flex-1 rounded-sm opacity-60" />
          <WireBlock className="absolute right-2 top-2 bottom-2 w-[38%] rounded-sm" highlight />
        </div>
      );
    case "insert-column":
      return (
        <div className="relative flex h-full gap-1 p-2">
          <WireBlock className="w-[22%] rounded-sm opacity-60" />
          <WireBlock className="flex-1 rounded-sm opacity-60" />
          <WireBlock className="absolute right-0 top-0 bottom-0 w-[42%] rounded-sm" highlight />
        </div>
      );
    default:
      return null;
  }
}

export function buildTableEditorFiltersStateCanvasConfig(
  onStateSelect: (stateId: TableEditorFiltersPreviewStateId) => void,
): PrototypeStateCanvasConfig<TableEditorFiltersPreviewStateId> {
  const registry = TABLE_EDITOR_FILTERS_PREVIEW_STATE_REGISTRY;

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
