"use client";

import type { PrototypeStateCanvasConfig } from "proto-plugin";
import {
  PR_TARGET_HIGHLIGHT_BORDER,
  PR_TARGET_HIGHLIGHT_FILL,
} from "proto-plugin";

import { FRONT_COVER_PREVIEW_STATE_REGISTRY } from "./front-cover-preview-states";
import type { FrontCoverPreviewStateId } from "./front-cover-types";

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

function PageChrome({ highlight }: { highlight?: "hero" | "products" | "dashboard" | "nav" | "menu" }) {
  return (
    <div className="flex h-full flex-col gap-1 p-2">
      <WireBlock className="h-3 w-full rounded-sm" highlight={highlight === "nav"} />
      {highlight === "menu" ? (
        <WireBlock className="h-8 w-1/2 rounded-sm" highlight />
      ) : null}
      <WireBlock className="h-10 w-full rounded-sm" highlight={highlight === "hero"} />
      <WireBlock className="flex-1 rounded-sm" highlight={highlight === "products"} />
      <WireBlock className="h-8 w-full rounded-sm" highlight={highlight === "dashboard"} />
    </div>
  );
}

function renderWireframe(stateId: FrontCoverPreviewStateId) {
  switch (stateId) {
    case "products":
      return <PageChrome highlight="products" />;
    case "dashboard-table-editor":
    case "dashboard-sql-editor":
    case "dashboard-rls":
      return <PageChrome highlight="dashboard" />;
    case "frameworks":
      return <PageChrome highlight="dashboard" />;
    case "nav-product":
    case "nav-developers":
    case "nav-solutions":
      return <PageChrome highlight="menu" />;
    case "mobile-menu":
      return <PageChrome highlight="nav" />;
    case "hero":
    default:
      return <PageChrome highlight="hero" />;
  }
}

export function buildFrontCoverStateCanvasConfig(
  onStateSelect: (previewStateId: FrontCoverPreviewStateId) => void,
): PrototypeStateCanvasConfig<FrontCoverPreviewStateId> {
  const registry = FRONT_COVER_PREVIEW_STATE_REGISTRY;

  return {
    onStateSelect,
    nodes: registry.canvasNodes,
    edges: registry.canvasEdges,
    sections: registry.canvasSections,
    canvasWidth: registry.canvasSize.width,
    canvasHeight: registry.canvasSize.height,
    renderWireframe: (stateId) => renderWireframe(stateId as FrontCoverPreviewStateId),
  };
}
