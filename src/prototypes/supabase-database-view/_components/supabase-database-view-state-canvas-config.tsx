"use client";

import type { PrototypeStateCanvasConfig } from "proto-plugin";
import { PR_TARGET_HIGHLIGHT_BORDER, PR_TARGET_HIGHLIGHT_FILL } from "proto-plugin";

import { SUPABASE_DATABASE_VIEW_PREVIEW_STATE_REGISTRY } from "./supabase-database-view-preview-states";
import type { SupabaseDatabaseViewPreviewStateId } from "./supabase-database-view-types";

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

function PageChrome({
  highlight,
}: {
  highlight?: "canvas" | "toolbar" | "menu" | "connect" | "dialog";
}) {
  return (
    <div className="relative flex h-full gap-1 p-2">
      <WireBlock className="w-[8%] rounded-sm" />
      <WireBlock className="w-[22%] rounded-sm" highlight={highlight === "menu"} />
      <div className="relative flex-1 flex flex-col gap-1">
        <WireBlock className="h-4 w-2/3 rounded-sm" highlight={highlight === "toolbar"} />
        <WireBlock className="flex-1 rounded-sm" highlight={highlight === "canvas"} />
        {highlight === "dialog" ? (
          <WireBlock className="absolute left-1/2 top-1/2 h-10 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm" highlight />
        ) : null}
      </div>
      {highlight === "connect" ? (
        <WireBlock className="absolute right-0 top-0 h-full w-[38%] rounded-sm" highlight />
      ) : null}
    </div>
  );
}

function renderWireframe(stateId: SupabaseDatabaseViewPreviewStateId) {
  switch (stateId) {
    case "loading":
    case "empty":
    case "error":
    case "populated":
      return <PageChrome highlight="canvas" />;
    case "schema-selector":
    case "find-table":
    case "export-menu":
      return <PageChrome highlight="toolbar" />;
    case "auto-layout":
      return <PageChrome highlight="dialog" />;
    case "table-actions":
      return <PageChrome highlight="canvas" />;
    case "connect-framework":
    case "connect-server":
    case "connect-direct":
    case "connect-orm":
    case "connect-mcp":
      return <PageChrome highlight="connect" />;
    default:
      return <PageChrome highlight="canvas" />;
  }
}

export function buildSupabaseDatabaseViewStateCanvasConfig(
  onStateSelect: (previewStateId: SupabaseDatabaseViewPreviewStateId) => void,
): PrototypeStateCanvasConfig<SupabaseDatabaseViewPreviewStateId> {
  const registry = SUPABASE_DATABASE_VIEW_PREVIEW_STATE_REGISTRY;

  return {
    onStateSelect,
    nodes: registry.canvasNodes,
    edges: registry.canvasEdges,
    sections: registry.canvasSections,
    canvasWidth: registry.canvasSize.width,
    canvasHeight: registry.canvasSize.height,
    renderWireframe: (stateId) =>
      renderWireframe(stateId as SupabaseDatabaseViewPreviewStateId),
  };
}
