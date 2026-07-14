"use client";

import {
  PR_SPLIT_WIREFRAME_FRAME_CLASS,
  PR_TARGET_HIGHLIGHT_BORDER,
  PR_TARGET_HIGHLIGHT_FILL,
  PrototypeComponent,
} from "proto-plugin";
import type { ReactNode } from "react";

import type { TableEditorFiltersPrSplitWireframeId } from "./pr-split-config";

function WireBlock({
  className,
  highlight,
  dashed,
  pulse,
}: {
  className?: string;
  highlight?: boolean;
  dashed?: boolean;
  pulse?: boolean;
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
            : pulse
              ? {
                  background:
                    "linear-gradient(90deg, var(--prototype-wireframe-block, #3a3a3a) 25%, var(--prototype-wireframe-block-pulse-mid, #454545) 50%, var(--prototype-wireframe-block, #3a3a3a) 75%)",
                  backgroundSize: "200% 100%",
                }
              : { background: "var(--prototype-wireframe-block, #e4e6ea)" }
      }
    />
  );
}

type TableEditorPageShellProps = {
  highlightTableMenu?: boolean;
  highlightToolbar?: boolean;
  highlightGridOverlay?: "empty" | "error" | "loading" | false;
  highlightSidePanel?: boolean;
  showFilterChip?: boolean;
  showSidePanel?: boolean;
};

function TableEditorPageShell({
  highlightTableMenu = false,
  highlightToolbar = false,
  highlightGridOverlay = false,
  highlightSidePanel = false,
  showFilterChip = false,
  showSidePanel = false,
}: TableEditorPageShellProps) {
  return (
    <div
      className={PR_SPLIT_WIREFRAME_FRAME_CLASS + " bg-[var(--cal-bg,#fff)]"}
    >
      <header className="flex h-[10%] min-h-[1.25rem] shrink-0 items-center justify-between border-b border-[var(--border-subtle,#e5e7eb)] px-2">
        <div className="flex items-center gap-1">
          <WireBlock className="h-2 w-[10%] min-w-[1.5rem] rounded-sm" />
          <WireBlock className="h-2 w-[14%] min-w-[2rem] rounded-sm opacity-70" />
        </div>
        <div className="flex items-center gap-0.5">
          <WireBlock className="h-2 w-[8%] min-w-[1rem] rounded-sm opacity-60" />
          <WireBlock className="h-2 w-[6%] min-w-[0.75rem] rounded-sm opacity-60" />
          <WireBlock className="h-2 w-[6%] min-w-[0.75rem] rounded-sm opacity-60" />
        </div>
      </header>

      <div className="flex h-full min-h-0 flex-1">
        <aside className="flex w-[6%] min-w-[1rem] shrink-0 flex-col items-center gap-1 border-r border-[var(--border-subtle,#e5e7eb)] py-1">
          <WireBlock className="h-2 w-[70%] rounded-sm" />
          <WireBlock className="h-2 w-[70%] rounded-sm opacity-70" />
          <WireBlock className="h-2 w-[70%] rounded-sm opacity-50" />
          <WireBlock className="h-2 w-[70%] rounded-sm opacity-50" />
        </aside>

        <aside
          className="flex w-[20%] min-w-[2.5rem] shrink-0 flex-col gap-0.5 border-r border-[var(--border-subtle,#e5e7eb)] p-1"
          style={
            highlightTableMenu
              ? {
                  background: PR_TARGET_HIGHLIGHT_FILL,
                  boxShadow: `inset -1px 0 0 ${PR_TARGET_HIGHLIGHT_BORDER}`,
                }
              : undefined
          }
        >
          <WireBlock
            className="h-2 w-full rounded-sm opacity-80"
            highlight={highlightTableMenu}
          />
          <WireBlock className="h-1.5 w-[85%] rounded-sm opacity-60" />
          <div className="mt-0.5 flex flex-col gap-0.5">
            {Array.from({ length: 6 }).map((_, index) => (
              <WireBlock
                key={index}
                className="h-1.5 w-full rounded-sm"
                highlight={highlightTableMenu && index === 4}
              />
            ))}
          </div>
        </aside>

        <div className="relative flex min-w-0 flex-1 flex-col">
          <div className="flex h-[8%] min-h-[0.75rem] shrink-0 items-center gap-1 border-b border-[var(--border-subtle,#e5e7eb)] px-1.5">
            <WireBlock className="h-2 w-[16%] min-w-[2rem] rounded-sm" />
            <WireBlock className="h-2 w-[6%] min-w-[0.75rem] rounded-sm opacity-50" />
            <div className="flex-1" />
          </div>

          <div
            className="flex h-[10%] min-h-[0.85rem] shrink-0 items-center gap-1 border-b border-[var(--border-subtle,#e5e7eb)] px-1.5"
            style={
              highlightToolbar
                ? {
                    background: PR_TARGET_HIGHLIGHT_FILL,
                    boxShadow: `inset 0 -1px 0 ${PR_TARGET_HIGHLIGHT_BORDER}`,
                  }
                : undefined
            }
          >
            <WireBlock className="h-2 w-[4%] min-w-[0.5rem] rounded-sm opacity-50" />
            <WireBlock
              className="h-2 min-w-[2rem] flex-1 rounded-sm"
              highlight={highlightToolbar}
            />
            {showFilterChip ? (
              <WireBlock
                className="h-2 w-[14%] min-w-[1.5rem] shrink-0 rounded-sm"
                highlight
              />
            ) : null}
            <WireBlock className="h-2 w-[8%] min-w-[1rem] rounded-sm opacity-50" />
            <WireBlock className="h-2 w-[10%] min-w-[1.25rem] rounded-sm opacity-50" />
          </div>

          <div className="relative min-h-0 flex-1">
            <div className="flex h-full flex-col">
              <div className="flex h-[8%] min-h-[0.6rem] shrink-0 border-b border-[var(--border-subtle,#e5e7eb)]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <WireBlock
                    key={index}
                    className="h-full flex-1 border-r border-[var(--border-subtle,#e5e7eb)] last:border-r-0"
                    pulse={highlightGridOverlay === "loading"}
                    highlight={highlightGridOverlay === "loading"}
                  />
                ))}
              </div>
              <div className="min-h-0 flex-1">
                {highlightGridOverlay === "empty" ? (
                  <div className="flex h-full items-center justify-center p-2">
                    <WireBlock
                      className="h-[55%] w-[42%] min-w-[3rem] rounded-sm"
                      highlight
                      dashed
                    />
                  </div>
                ) : highlightGridOverlay === "error" ? (
                  <div className="flex h-full items-start justify-center p-2 pt-3">
                    <WireBlock
                      className="h-[28%] w-[72%] min-w-[4rem] rounded-sm"
                      highlight
                    />
                  </div>
                ) : highlightGridOverlay === "loading" ? (
                  <div className="flex h-full flex-col gap-0">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex min-h-0 flex-1 items-center gap-1 border-b border-[var(--border-subtle,#e5e7eb)] px-1"
                      >
                        <WireBlock
                          className="h-1.5 w-[4%] rounded-sm"
                          highlight
                          pulse
                        />
                        <WireBlock
                          className="h-1.5 flex-1 rounded-sm"
                          highlight
                          pulse
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full flex-col gap-0">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex min-h-0 flex-1 items-center gap-1 border-b border-[var(--border-subtle,#e5e7eb)] px-1"
                      >
                        <WireBlock className="h-1.5 w-[4%] rounded-sm opacity-40" />
                        <WireBlock className="h-1.5 flex-1 rounded-sm opacity-70" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {showSidePanel ? (
              <div
                className="absolute inset-y-0 right-0 flex w-[34%] min-w-[3rem] flex-col border-l border-[var(--border-subtle,#e5e7eb)] bg-[var(--cal-bg,#fff)] p-1.5 shadow-sm"
                style={
                  highlightSidePanel
                    ? {
                        background: PR_TARGET_HIGHLIGHT_FILL,
                        borderColor: PR_TARGET_HIGHLIGHT_BORDER,
                      }
                    : undefined
                }
              >
                <WireBlock
                  className="mb-1 h-2 w-[55%] rounded-sm"
                  highlight={highlightSidePanel}
                />
                <WireBlock className="mb-0.5 h-2 w-full rounded-sm opacity-70" />
                <WireBlock className="mb-0.5 h-2 w-full rounded-sm opacity-70" />
                <WireBlock className="mb-0.5 h-2 w-[80%] rounded-sm opacity-60" />
                <WireBlock
                  className="mt-auto h-2.5 w-full rounded-sm"
                  highlight={highlightSidePanel}
                />
              </div>
            ) : null}
          </div>

          <div className="flex h-[7%] min-h-[0.55rem] shrink-0 items-center justify-between border-t border-[var(--border-subtle,#e5e7eb)] px-1.5">
            <WireBlock className="h-1.5 w-[12%] min-w-[1.5rem] rounded-sm opacity-50" />
            <WireBlock className="h-1.5 w-[18%] min-w-[2rem] rounded-sm opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}

const WIREFRAME_RENDERERS: Record<
  TableEditorFiltersPrSplitWireframeId,
  () => ReactNode
> = {
  "table-sidebar": () => <TableEditorPageShell highlightTableMenu />,
  "grid-header": () => <TableEditorPageShell highlightToolbar showFilterChip />,
  "loading-skeleton": () => (
    <TableEditorPageShell highlightGridOverlay="loading" />
  ),
  "empty-state-overlay": () => (
    <TableEditorPageShell highlightGridOverlay="empty" />
  ),
  "error-overlay": () => <TableEditorPageShell highlightGridOverlay="error" />,
  "insert-column-panel": () => (
    <TableEditorPageShell showSidePanel highlightSidePanel />
  ),
};

type PrSplitWireframeProps = {
  id: TableEditorFiltersPrSplitWireframeId;
  embedded?: boolean;
};

export function PrSplitWireframe({ id, embedded }: PrSplitWireframeProps) {
  const content = WIREFRAME_RENDERERS[id]();

  if (embedded) {
    return content;
  }

  return (
    <PrototypeComponent
      id="pr-split-wireframes.pr-split-wireframe"
      className="w-full"
    >
      {content}
    </PrototypeComponent>
  );
}
