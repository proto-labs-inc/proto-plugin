"use client";

import { PrototypeComponent } from "proto-plugin";
import { cn } from "@/lib/cn";

import {
  PROTOTYPE_CREATOR,
  type CreatorAttributionVariant,
} from "./creator-attribution-content";

type CreatorAttributionBlockProps = {
  variant: CreatorAttributionVariant;
  className?: string;
};

function CreatorAvatar({
  size = "sm",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const dimension = size === "sm" ? "size-5" : "size-6";
  const textSize = size === "sm" ? "text-[9px]" : "text-[10px]";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-[#333] font-medium text-[#e0e0e0]",
        dimension,
        textSize,
        className,
      )}
      aria-hidden
    >
      {PROTOTYPE_CREATOR.initials}
    </span>
  );
}

function ToolbarChromePill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-[10rem] items-center gap-1.5 overflow-hidden rounded-full bg-[#1e1e1e] px-2.5 py-1 text-[11px] font-medium tracking-[-0.01em] text-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.28),0_0_0_1px_#333]",
        className,
      )}
    >
      {children}
    </span>
  );
}

function ToolbarInlineAttribution() {
  return (
    <div
      className="pointer-events-none fixed bottom-2.5 left-[3.25rem] z-[1060] flex items-center"
      aria-label={`Prototype by ${PROTOTYPE_CREATOR.name}`}
    >
      <span className="text-[11px] font-medium tracking-[-0.01em] text-[#888]">
        by{" "}
        <span className="text-[#ccc]">{PROTOTYPE_CREATOR.name}</span>
      </span>
    </div>
  );
}

function ToolbarAvatarPillAttribution() {
  return (
    <div
      className="pointer-events-none fixed bottom-2 left-[3.25rem] z-[1060] flex items-center"
      aria-label={`Prototype by ${PROTOTYPE_CREATOR.name}`}
    >
      <ToolbarChromePill>
        <CreatorAvatar />
        <span className="truncate">{PROTOTYPE_CREATOR.name}</span>
      </ToolbarChromePill>
    </div>
  );
}

function FloatingAboveToolbarAttribution() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[3.25rem] z-[1060] flex justify-center"
      aria-label={`Prototype by ${PROTOTYPE_CREATOR.name}`}
    >
      <ToolbarChromePill className="max-w-none px-3 py-1.5 text-xs">
        <CreatorAvatar size="md" />
        <span>Created by {PROTOTYPE_CREATOR.name}</span>
      </ToolbarChromePill>
    </div>
  );
}

function ViewportCornerBadgeAttribution() {
  return (
    <div
      className="pointer-events-none absolute left-4 top-4 z-40 sm:left-5"
      aria-label={`Prototype by ${PROTOTYPE_CREATOR.name}`}
    >
      <span className="inline-flex items-center gap-1.5 rounded-full border border-black/8 bg-white/90 px-2.5 py-1 text-[11px] font-medium text-neutral-700 shadow-sm backdrop-blur-sm">
        <CreatorAvatar className="bg-neutral-200 text-neutral-700" />
        {PROTOTYPE_CREATOR.name}
      </span>
    </div>
  );
}

function ViewportWatermarkAttribution() {
  return (
    <div
      className="pointer-events-none absolute inset-x-4 bottom-4 z-10 flex justify-end sm:inset-x-5"
      aria-label={`Prototype by ${PROTOTYPE_CREATOR.name}`}
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-400/80">
        {PROTOTYPE_CREATOR.name}
      </span>
    </div>
  );
}

function OverviewSidebarHeaderAttribution() {
  return (
    <div
      className="pointer-events-none fixed inset-y-0 right-0 z-[1055] flex w-72 flex-col border-l border-[var(--tool-chrome-border,#e5e5e5)] bg-[var(--tool-chrome-bg,#fafafa)] shadow-[-8px_0_24px_-12px_rgba(0,0,0,0.08)]"
      aria-hidden
    >
      <div className="flex items-center justify-between gap-3 border-b border-[var(--tool-chrome-border,#e5e5e5)] px-4 py-3">
        <span className="text-sm font-medium text-[var(--tool-chrome-text,#171717)]">
          Overview
        </span>
      </div>
      <div className="flex items-center gap-2.5 border-b border-[var(--tool-chrome-border,#e5e5e5)] px-4 py-3">
        <CreatorAvatar size="md" className="bg-neutral-300 text-neutral-800" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--tool-chrome-text,#171717)]">
            {PROTOTYPE_CREATOR.name}
          </p>
          <p className="truncate text-xs text-[var(--tool-chrome-text-muted,#737373)]">
            {PROTOTYPE_CREATOR.role}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 opacity-40">
        <div className="h-3 w-2/3 rounded bg-neutral-200" />
        <div className="h-3 w-full rounded bg-neutral-100" />
        <div className="h-3 w-5/6 rounded bg-neutral-100" />
      </div>
    </div>
  );
}

export function CreatorAttributionBlock({
  variant,
  className,
}: CreatorAttributionBlockProps) {
  return (
    <PrototypeComponent
      id="creator-attribution-block"
      className={cn("pointer-events-none", className)}
    >
      {variant === "toolbar-inline" ? <ToolbarInlineAttribution /> : null}
      {variant === "toolbar-avatar-pill" ? (
        <ToolbarAvatarPillAttribution />
      ) : null}
      {variant === "floating-above-toolbar" ? (
        <FloatingAboveToolbarAttribution />
      ) : null}
      {variant === "viewport-corner-badge" ? (
        <ViewportCornerBadgeAttribution />
      ) : null}
      {variant === "viewport-watermark" ? (
        <ViewportWatermarkAttribution />
      ) : null}
      {variant === "overview-sidebar-header" ? (
        <OverviewSidebarHeaderAttribution />
      ) : null}
    </PrototypeComponent>
  );
}
