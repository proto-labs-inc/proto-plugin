"use client";

import type { PrototypeStateCanvasConfig } from "proto-plugin";
import {
  PR_TARGET_HIGHLIGHT_BORDER,
  PR_TARGET_HIGHLIGHT_FILL,
} from "proto-plugin";

import {
  PROTO_PARTNER_PAGE_PREVIEW_STATE_REGISTRY,
  type ProtoPartnerPagePreviewStateId,
} from "./proto-partner-page-preview-states";

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

function renderWireframe(stateId: ProtoPartnerPagePreviewStateId) {
  switch (stateId) {
    case "invite":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-1.5 p-3">
          <WireBlock className="h-2 w-1/3 rounded-sm" />
          <WireBlock className="h-3 w-2/3 rounded-sm" highlight />
          <WireBlock className="h-2 w-1/2 rounded-sm opacity-70" />
          <WireBlock className="mt-1 h-4 w-1/3 rounded-full" highlight />
        </div>
      );
    case "invite-follow-up":
      return (
        <div className="relative flex h-full flex-col p-2">
          <div className="absolute inset-x-3 top-3 flex justify-between gap-2">
            <WireBlock className="size-5 rounded-sm opacity-60" />
            <WireBlock className="size-6 rounded-full opacity-50" />
            <WireBlock className="size-5 rounded-sm opacity-60" />
          </div>
          <div className="mt-auto flex flex-col items-center gap-1.5 pb-2">
            <WireBlock className="h-3 w-1/2 rounded-sm" highlight />
            <WireBlock className="h-2 w-2/5 rounded-sm opacity-70" />
            <WireBlock className="mt-1 h-4 w-1/3 rounded-full" highlight />
          </div>
        </div>
      );
    case "customize":
      return (
        <div className="flex h-full flex-col gap-1 p-2">
          <div className="flex items-center justify-between gap-2">
            <WireBlock className="h-3 w-8 rounded-sm" />
            <WireBlock className="h-3 w-12 rounded-sm" highlight />
          </div>
          <WireBlock className="min-h-0 flex-1 rounded-sm" />
          <WireBlock className="h-8 w-full rounded-sm" highlight />
        </div>
      );
    case "submit-modal":
      return (
        <div className="relative flex h-full flex-col gap-1 p-2">
          <div className="flex items-center justify-between gap-2 opacity-40">
            <WireBlock className="h-3 w-8 rounded-sm" />
            <WireBlock className="h-3 w-12 rounded-sm" />
          </div>
          <WireBlock className="min-h-0 flex-1 rounded-sm opacity-40" />
          <WireBlock className="h-8 w-full rounded-sm opacity-40" />
          <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 flex-col gap-1.5 rounded-sm p-2"
            style={{
              background: PR_TARGET_HIGHLIGHT_FILL,
              border: `1px solid ${PR_TARGET_HIGHLIGHT_BORDER}`,
            }}
          >
            <WireBlock className="mx-auto size-10 rounded-sm opacity-80" />
            <WireBlock className="mx-auto h-2 w-2/3 rounded-sm opacity-70" />
            <div className="mt-1 flex gap-1">
              <WireBlock className="h-3 flex-1 rounded-sm opacity-70" />
              <WireBlock className="h-3 flex-1 rounded-sm opacity-70" />
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

export function buildProtoPartnerPageStateCanvasConfig(
  onStateSelect: (stateId: ProtoPartnerPagePreviewStateId) => void,
): PrototypeStateCanvasConfig<ProtoPartnerPagePreviewStateId> {
  const registry = PROTO_PARTNER_PAGE_PREVIEW_STATE_REGISTRY;

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
