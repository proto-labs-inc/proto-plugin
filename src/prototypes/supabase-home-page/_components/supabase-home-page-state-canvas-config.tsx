"use client";

import type { PrototypeStateCanvasConfig } from "proto-plugin";
import {
  PR_TARGET_HIGHLIGHT_BORDER,
  PR_TARGET_HIGHLIGHT_FILL,
} from "proto-plugin";

import type { SupabaseHomePagePreviewStateId } from "./supabase-home-page-types";
import { SUPABASE_HOME_PAGE_PREVIEW_STATE_REGISTRY } from "./supabase-home-page-preview-states";

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

function renderWireframe(stateId: SupabaseHomePagePreviewStateId) {
  switch (stateId) {
    case "advisor-loading":
      return (
        <div className="flex h-full flex-col gap-1 p-2">
          <WireBlock className="h-3 w-2/3 rounded-sm" />
          <WireBlock className="h-2 w-1/2 rounded-sm" />
          <WireBlock className="flex-1 rounded-sm" highlight />
        </div>
      );
    case "advisor-empty":
      return (
        <div className="flex h-full gap-1 p-2">
          <WireBlock className="w-[14%] rounded-sm" />
          <div className="relative flex-1">
            <WireBlock className="absolute inset-0 rounded-sm opacity-60" />
            <WireBlock className="absolute left-1/2 top-1/2 h-10 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm opacity-70" />
          </div>
        </div>
      );
    case "connect-framework":
    case "connect-server":
    case "connect-direct":
    case "connect-orm":
    case "connect-mcp":
      return (
        <div className="relative flex h-full gap-1 p-2">
          <WireBlock className="w-[14%] rounded-sm" />
          <WireBlock className="flex-1 rounded-sm opacity-60" />
          <WireBlock className="absolute right-0 top-0 h-full w-[38%] rounded-sm" highlight />
        </div>
      );
    case "copy-popover-open":
      return (
        <div className="relative flex h-full gap-1 p-2">
          <WireBlock className="w-[14%] rounded-sm" />
          <div className="relative flex-1">
            <WireBlock className="absolute inset-0 rounded-sm opacity-60" />
            <WireBlock
              className="absolute left-4 top-6 h-6 w-1/3 rounded-sm"
              highlight
            />
          </div>
        </div>
      );
    case "default":
    default:
      return (
        <div className="flex h-full gap-1 p-2">
          <WireBlock className="w-[14%] rounded-sm" />
          <div className="relative flex-1 flex flex-col gap-1">
            <WireBlock className="h-4 w-1/3 rounded-sm" />
            <WireBlock className="h-8 rounded-sm" highlight />
            <WireBlock className="flex-1 rounded-sm" />
          </div>
        </div>
      );
  }
}

export function buildSupabaseHomePageStateCanvasConfig(
  onStateSelect: (previewStateId: SupabaseHomePagePreviewStateId) => void,
): PrototypeStateCanvasConfig<SupabaseHomePagePreviewStateId> {
  const registry = SUPABASE_HOME_PAGE_PREVIEW_STATE_REGISTRY;

  return {
    onStateSelect,
    nodes: registry.canvasNodes,
    edges: registry.canvasEdges,
    sections: registry.canvasSections,
    canvasWidth: registry.canvasSize.width,
    canvasHeight: registry.canvasSize.height,
    renderWireframe: (stateId) =>
      renderWireframe(stateId as SupabaseHomePagePreviewStateId),
  };
}
