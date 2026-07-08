"use client";

import {
  PR_SPLIT_WIREFRAME_FRAME_CLASS,
  PR_TARGET_HIGHLIGHT_BORDER,
  PR_TARGET_HIGHLIGHT_FILL,
  PrototypeComponent,
} from "proto-plugin";
import type { ReactNode } from "react";

import type { EventTypesPrSplitWireframeId } from "./pr-split-config";

function WireBlock({
  className,
  highlight,
  dashed,
}: {
  className?: string;
  highlight?: boolean;
  dashed?: boolean;
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
          : dashed
            ? {
                background: "transparent",
                border: "1px dashed var(--border-subtle, #d1d5db)",
              }
            : { background: "var(--cal-bg-emphasis, #e5e7eb)" }
      }
    />
  );
}

type FullPageShellProps = {
  highlightChipRow?: boolean;
  highlightMain?: "list" | "grid" | "empty";
  highlightModal?: boolean;
  showChipRow?: boolean;
  showSecretBadges?: boolean;
};

function FullPageShell({
  highlightChipRow = false,
  highlightMain = "list",
  highlightModal = false,
  showChipRow = true,
  showSecretBadges = false,
}: FullPageShellProps) {
  return (
    <div className={PR_SPLIT_WIREFRAME_FRAME_CLASS + " bg-[var(--cal-bg,#fff)]"}>
      <div className="flex h-full">
        <aside className="flex w-[22%] shrink-0 flex-col gap-1 border-r border-[var(--border-subtle,#e5e7eb)] p-1.5">
          <WireBlock className="h-2 w-full rounded-sm" />
          <div className="mt-0.5 flex flex-col gap-0.5">
            <WireBlock className="h-2 w-full rounded-sm opacity-90" />
            <WireBlock className="h-2 w-full rounded-sm opacity-70" />
            <WireBlock className="h-2 w-full rounded-sm opacity-70" />
            <WireBlock className="h-2 w-full rounded-sm opacity-70" />
          </div>
          <div className="mt-auto flex flex-col gap-0.5">
            <WireBlock className="h-2 w-full rounded-sm opacity-60" />
            <WireBlock className="h-2 w-full rounded-sm opacity-60" />
          </div>
        </aside>

        <div className="relative flex min-w-0 flex-1 flex-col p-2">
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-col gap-0.5">
              <WireBlock className="h-2.5 w-[28%] min-w-[3rem] rounded-sm" />
              <WireBlock className="h-1.5 w-[45%] min-w-[4rem] rounded-sm opacity-60" />
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <WireBlock className="h-2.5 w-[18%] min-w-[2.5rem] rounded-sm" />
              <WireBlock className="h-2.5 w-[10%] min-w-[1.5rem] rounded-sm" />
            </div>
          </div>

          {showChipRow ? (
            highlightChipRow ? (
              <div className="mb-1 flex gap-1">
                <WireBlock className="h-3 w-[22%] min-w-[3rem] rounded-sm" highlight />
                <WireBlock className="h-3 w-[14%] min-w-[2rem] rounded-sm opacity-40" />
              </div>
            ) : (
              <WireBlock className="mb-1 h-3 w-[18%] min-w-[2.5rem] rounded-sm opacity-40" />
            )
          ) : null}

          {highlightModal ? (
            <>
              <WireBlock className="min-h-0 flex-1 rounded-sm opacity-35" />
              <div className="absolute inset-x-3 top-[18%] bottom-[12%] flex items-start justify-center">
                <div className="flex h-full w-[58%] flex-col gap-1 rounded-sm border border-[var(--border-subtle,#e5e7eb)] bg-[var(--cal-bg,#fff)] p-1.5 shadow-sm">
                  <WireBlock className="h-2 w-[40%] rounded-sm" highlight />
                  <WireBlock className="h-2 w-full rounded-sm opacity-60" />
                  <WireBlock className="h-2 w-full rounded-sm opacity-60" />
                  <WireBlock className="h-2 w-[70%] rounded-sm opacity-60" />
                  <WireBlock className="mt-auto h-2.5 w-full rounded-sm" highlight />
                </div>
              </div>
            </>
          ) : highlightMain === "empty" ? (
            <WireBlock className="min-h-0 flex-1 rounded-sm" highlight dashed />
          ) : highlightMain === "grid" ? (
            <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-1">
              <WireBlock className="rounded-sm" highlight />
              <WireBlock className="rounded-sm" highlight />
              <WireBlock className="rounded-sm" highlight />
              <WireBlock className="rounded-sm opacity-60" />
            </div>
          ) : (
            <div
              className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-sm border border-[var(--border-subtle,#e5e7eb)]"
              style={
                highlightMain === "list"
                  ? {
                      background: PR_TARGET_HIGHLIGHT_FILL,
                      borderColor: PR_TARGET_HIGHLIGHT_BORDER,
                    }
                  : undefined
              }
            >
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 border-b border-[var(--border-subtle,#e5e7eb)] px-1.5 py-1 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <WireBlock className="mb-0.5 h-1.5 w-[55%] rounded-sm opacity-80" />
                    <div className="flex gap-0.5">
                      <WireBlock className="h-1 w-[18%] rounded-sm opacity-60" />
                      {showSecretBadges && index < 2 ? (
                        <WireBlock className="h-1 w-[14%] rounded-sm" highlight />
                      ) : (
                        <WireBlock className="h-1 w-[14%] rounded-sm opacity-40" />
                      )}
                    </div>
                  </div>
                  <WireBlock className="h-1.5 w-[8%] shrink-0 rounded-sm opacity-50" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const WIREFRAME_RENDERERS: Record<EventTypesPrSplitWireframeId, () => ReactNode> = {
  "secret-filter-list": () => (
    <FullPageShell highlightMain="list" showSecretBadges showChipRow={false} />
  ),
  "secret-filter-chip-row": () => (
    <FullPageShell highlightChipRow highlightMain="list" />
  ),
  "card-grid-layout": () => (
    <FullPageShell highlightMain="grid" highlightChipRow />
  ),
  "empty-search": () => (
    <FullPageShell highlightMain="empty" highlightChipRow />
  ),
  "create-modal": () => (
    <FullPageShell highlightMain="grid" highlightModal />
  ),
};

type PrSplitWireframeProps = {
  id: EventTypesPrSplitWireframeId;
  embedded?: boolean;
};

export function PrSplitWireframe({ id, embedded }: PrSplitWireframeProps) {
  const content = WIREFRAME_RENDERERS[id]();

  if (embedded) {
    return content;
  }

  return (
    <PrototypeComponent id="pr-split-wireframes.pr-split-wireframe" className="w-full">
      {content}
    </PrototypeComponent>
  );
}
