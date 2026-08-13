"use client";

import type { PrototypeStateCanvasConfig } from "proto-plugin";
import {
  PR_TARGET_HIGHLIGHT_BORDER,
  PR_TARGET_HIGHLIGHT_FILL,
} from "proto-plugin";

import { SUPABASE_LOGS_PREVIEW_STATE_REGISTRY } from "./supabase-logs-preview-states";
import type { SupabaseLogsPreviewStateId } from "./supabase-logs-types";

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
          : { background: "var(--prototype-wireframe-block, #e5e7eb)" }
      }
    />
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full gap-1 p-2">
      <WireBlock className="w-[10%] rounded-sm" />
      <WireBlock className="w-[22%] rounded-sm" />
      <div className="relative flex-1 flex flex-col gap-1">{children}</div>
    </div>
  );
}

function renderWireframe(stateId: SupabaseLogsPreviewStateId) {
  switch (stateId) {
    case "insert-source":
    case "templates":
    case "date-picker":
      return (
        <Shell>
          <WireBlock className="h-4 w-1/2 rounded-sm" highlight />
          <WireBlock className="flex-1 rounded-sm opacity-60" />
          <WireBlock className="flex-1 rounded-sm opacity-40" />
        </Shell>
      );
    case "field-reference":
      return (
        <div className="relative flex h-full gap-1 p-2">
          <WireBlock className="w-[10%] rounded-sm" />
          <WireBlock className="w-[22%] rounded-sm opacity-60" />
          <WireBlock className="flex-1 rounded-sm opacity-60" />
          <WireBlock className="absolute right-0 top-0 h-full w-[38%] rounded-sm" highlight />
        </div>
      );
    case "loading":
    case "results":
    case "error":
      return (
        <Shell>
          <WireBlock className="h-4 rounded-sm opacity-60" />
          <WireBlock className="flex-1 rounded-sm opacity-40" />
          <WireBlock className="flex-1 rounded-sm" highlight />
        </Shell>
      );
    case "connect-framework":
    case "connect-server":
    case "connect-direct":
    case "connect-orm":
    case "connect-mcp":
      return (
        <div className="relative flex h-full gap-1 p-2">
          <WireBlock className="w-[10%] rounded-sm" />
          <WireBlock className="w-[22%] rounded-sm opacity-60" />
          <WireBlock className="flex-1 rounded-sm opacity-60" />
          <WireBlock className="absolute right-0 top-0 h-full w-[38%] rounded-sm" highlight />
        </div>
      );
    case "default":
    default:
      return (
        <Shell>
          <WireBlock className="h-4 rounded-sm" highlight />
          <WireBlock className="flex-1 rounded-sm" />
          <WireBlock className="flex-1 rounded-sm opacity-60" />
        </Shell>
      );
  }
}

export function buildSupabaseLogsStateCanvasConfig(
  onStateSelect: (previewStateId: SupabaseLogsPreviewStateId) => void,
): PrototypeStateCanvasConfig<SupabaseLogsPreviewStateId> {
  const registry = SUPABASE_LOGS_PREVIEW_STATE_REGISTRY;

  return {
    onStateSelect,
    nodes: registry.canvasNodes,
    edges: registry.canvasEdges,
    sections: registry.canvasSections,
    canvasWidth: registry.canvasSize.width,
    canvasHeight: registry.canvasSize.height,
    renderWireframe: (stateId) => renderWireframe(stateId as SupabaseLogsPreviewStateId),
  };
}
