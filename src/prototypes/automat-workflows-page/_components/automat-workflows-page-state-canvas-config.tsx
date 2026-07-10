"use client";

import type { PrototypeStateCanvasConfig } from "proto-plugin";
import {
  PR_TARGET_HIGHLIGHT_BORDER,
  PR_TARGET_HIGHLIGHT_FILL,
} from "proto-plugin";

import type { AutomatWorkflowsPagePreviewStateId } from "./automat-workflows-page-preview-states";
import { AUTOMAT_WORKFLOWS_PAGE_PREVIEW_STATE_REGISTRY } from "./automat-workflows-page-preview-states";

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
          : { background: "var(--prototype-wireframe-block, #e4e6ea)" }
      }
    />
  );
}

function renderFilterWireframe({ emptySearch = false }: { emptySearch?: boolean } = {}) {
  return (
    <div className="flex h-full flex-col gap-1 p-2">
      <WireBlock className="h-3 w-full rounded-sm" />
      <WireBlock className="h-4 w-2/3 rounded-sm" highlight />
      <WireBlock
        className={
          emptySearch
            ? "flex-1 rounded-sm border border-dashed"
            : "flex-1 rounded-sm"
        }
        highlight
      />
    </div>
  );
}

function renderWireframe(stateId: AutomatWorkflowsPagePreviewStateId) {
  switch (stateId) {
    case "overview-default":
    case "finance-automation":
      return (
        <div className="flex h-full flex-col gap-1 p-2">
          <WireBlock className="h-3 w-full rounded-sm" />
          <div className="grid flex-1 grid-cols-3 gap-1">
            <WireBlock className="rounded-sm" />
            <WireBlock className="rounded-sm" />
            <WireBlock className="rounded-sm" />
          </div>
          <WireBlock className="h-8 flex-1 rounded-sm" highlight />
        </div>
      );
    case "hr-project":
      return (
        <div className="flex h-full flex-col gap-1 p-2">
          <WireBlock className="h-3 w-full rounded-sm" />
          <div className="grid flex-1 grid-cols-3 gap-1">
            <WireBlock className="rounded-sm" />
            <WireBlock className="rounded-sm" />
            <WireBlock className="rounded-sm" />
          </div>
          <WireBlock className="h-4 flex-1 rounded-sm" highlight />
        </div>
      );
    case "valid-text-filter":
    case "status-active":
    case "status-scheduled":
    case "status-inactive":
    case "hr-valid-text-filter":
    case "hr-status-active":
    case "hr-status-scheduled":
    case "hr-status-inactive":
      return renderFilterWireframe();
    case "empty-search":
    case "hr-empty-search":
      return renderFilterWireframe({ emptySearch: true });
    case "chat-open":
      return (
        <div className="relative flex h-full flex-col gap-1 p-2">
          <WireBlock className="h-3 w-full rounded-sm" />
          <WireBlock className="flex-1 rounded-sm" />
          <WireBlock
            className="absolute right-1 bottom-1 h-3/4 w-2/5 rounded-sm"
            highlight
          />
        </div>
      );
    default:
      return null;
  }
}

export function buildAutomatWorkflowsPageStateCanvasConfig(
  onStateSelect: (stateId: AutomatWorkflowsPagePreviewStateId) => void,
): PrototypeStateCanvasConfig<AutomatWorkflowsPagePreviewStateId> {
  const registry = AUTOMAT_WORKFLOWS_PAGE_PREVIEW_STATE_REGISTRY;

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
