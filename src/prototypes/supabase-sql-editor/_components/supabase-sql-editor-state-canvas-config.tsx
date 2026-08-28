"use client";

import type { PrototypeStateCanvasConfig } from "proto-plugin";
import {
  PR_TARGET_HIGHLIGHT_BORDER,
  PR_TARGET_HIGHLIGHT_FILL,
} from "proto-plugin";

import type { SupabaseSqlEditorPreviewStateId } from "./supabase-sql-editor-types";
import { SUPABASE_SQL_EDITOR_PREVIEW_STATE_REGISTRY } from "./supabase-sql-editor-preview-states";

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

function renderWireframe(stateId: SupabaseSqlEditorPreviewStateId) {
  switch (stateId) {
    case "new-query-menu":
      return (
        <div className="relative flex h-full gap-1 p-2">
          <WireBlock className="w-[10%] rounded-sm" />
          <WireBlock className="w-[22%] rounded-sm" highlight />
          <WireBlock className="flex-1 rounded-sm opacity-60" />
        </div>
      );
    case "sidebar-collapsed":
      return (
        <div className="flex h-full gap-1 p-2">
          <WireBlock className="w-[10%] rounded-sm" />
          <WireBlock className="flex-1 rounded-sm" highlight />
        </div>
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
        <div className="flex h-full gap-1 p-2">
          <WireBlock className="w-[10%] rounded-sm" />
          <WireBlock className="w-[22%] rounded-sm" />
          <div className="relative flex-1 flex flex-col gap-1">
            <WireBlock className="h-4 w-1/3 rounded-sm" />
            <div className="grid flex-1 grid-cols-3 gap-1">
              <WireBlock className="rounded-sm" highlight />
              <WireBlock className="rounded-sm" />
              <WireBlock className="rounded-sm" />
            </div>
          </div>
        </div>
      );
  }
}

export function buildSupabaseSqlEditorStateCanvasConfig(
  onStateSelect: (previewStateId: SupabaseSqlEditorPreviewStateId) => void,
): PrototypeStateCanvasConfig<SupabaseSqlEditorPreviewStateId> {
  const registry = SUPABASE_SQL_EDITOR_PREVIEW_STATE_REGISTRY;

  return {
    onStateSelect,
    nodes: registry.canvasNodes,
    edges: registry.canvasEdges,
    sections: registry.canvasSections,
    canvasWidth: registry.canvasSize.width,
    canvasHeight: registry.canvasSize.height,
    renderWireframe: (stateId) =>
      renderWireframe(stateId as SupabaseSqlEditorPreviewStateId),
  };
}
