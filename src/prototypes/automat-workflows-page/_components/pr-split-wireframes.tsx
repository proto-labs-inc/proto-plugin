"use client";

import {
  PR_SPLIT_WIREFRAME_FRAME_CLASS,
  PR_TARGET_HIGHLIGHT_BORDER,
  PR_TARGET_HIGHLIGHT_FILL,
  PrototypeComponent,
} from "proto-plugin";
import type { ReactNode } from "react";

import type { AutomatPrSplitWireframeId } from "./pr-split-config";

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
            : { background: "var(--prototype-wireframe-block, #e4e6ea)" }
      }
    />
  );
}

type AutomatPageShellProps = {
  highlightHeader?: boolean;
  highlightAnalytics?: boolean;
  highlightTable?: boolean;
  highlightShell?: boolean;
  analyticsLayout?: "kpi-strip" | "split-grid";
  tableFilters?: boolean;
  tableEmpty?: boolean;
  compactSidebar?: boolean;
};

function AutomatPageShell({
  highlightHeader = false,
  highlightAnalytics = false,
  highlightTable = false,
  highlightShell = false,
  analyticsLayout = "kpi-strip",
  tableFilters = false,
  tableEmpty = false,
  compactSidebar = false,
}: AutomatPageShellProps) {
  return (
    <div
      className={PR_SPLIT_WIREFRAME_FRAME_CLASS + " bg-[var(--cal-bg,#fff)]"}
      style={
        highlightShell
          ? {
              boxShadow: `inset 0 0 0 2px ${PR_TARGET_HIGHLIGHT_BORDER}`,
            }
          : undefined
      }
    >
      <div className="flex h-full">
        <aside
          className={`flex shrink-0 flex-col gap-1 border-r border-[var(--border-subtle,#e5e7eb)] p-1.5 ${
            compactSidebar ? "w-[8%]" : "w-[22%]"
          }`}
        >
          <WireBlock className="h-2 w-full rounded-sm" />
          <div className="mt-0.5 flex flex-col gap-0.5">
            <WireBlock className="h-2 w-full rounded-sm opacity-90" highlight={compactSidebar} />
            <WireBlock className="h-2 w-full rounded-sm opacity-70" />
            <WireBlock className="h-2 w-full rounded-sm opacity-70" />
            <WireBlock className="h-2 w-full rounded-sm opacity-70" />
          </div>
          <div className="mt-auto flex flex-col gap-0.5">
            <WireBlock className="h-2 w-full rounded-sm opacity-60" />
            <WireBlock className="h-2 w-full rounded-sm opacity-60" />
          </div>
        </aside>

        <div className="relative flex min-w-0 flex-1 flex-col">
          <header
            className="flex shrink-0 items-center gap-1.5 border-b border-[var(--border-subtle,#e5e7eb)] p-2"
            style={
              highlightHeader
                ? {
                    background: PR_TARGET_HIGHLIGHT_FILL,
                    boxShadow: `inset 0 -1px 0 ${PR_TARGET_HIGHLIGHT_BORDER}`,
                  }
                : undefined
            }
          >
            <WireBlock className="h-2 w-[4%] min-w-[0.5rem] shrink-0 rounded-sm opacity-70" />
            <WireBlock className="h-2 w-[14%] min-w-[2rem] rounded-sm opacity-80" />
            <span className="text-[6px] text-muted-foreground opacity-50">/</span>
            <WireBlock
              className="h-2 w-[18%] min-w-[2.5rem] rounded-sm"
              highlight={highlightHeader}
            />
            <div className="flex-1" />
          </header>

          <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden p-2">
            <div className="flex shrink-0 items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col gap-0.5">
                <WireBlock className="h-2.5 w-[20%] min-w-[2.5rem] rounded-sm" />
                <WireBlock className="h-1.5 w-[12%] min-w-[1.5rem] rounded-sm opacity-60" />
              </div>
              <WireBlock className="h-2.5 w-[16%] min-w-[2rem] shrink-0 rounded-sm opacity-80" />
            </div>

            {analyticsLayout === "kpi-strip" ? (
              <div
                className="flex shrink-0 flex-col gap-1 rounded-sm p-1"
                style={
                  highlightAnalytics
                    ? {
                        background: PR_TARGET_HIGHLIGHT_FILL,
                        border: `1px solid ${PR_TARGET_HIGHLIGHT_BORDER}`,
                      }
                    : undefined
                }
              >
                <div className="grid grid-cols-3 gap-1">
                  <WireBlock className="h-2.5 rounded-sm" highlight={highlightAnalytics} />
                  <WireBlock className="h-2.5 rounded-sm" highlight={highlightAnalytics} />
                  <WireBlock className="h-2.5 rounded-sm" highlight={highlightAnalytics} />
                </div>
                <WireBlock
                  className="h-5 rounded-sm"
                  highlight={highlightAnalytics}
                />
                <WireBlock className="h-3 rounded-sm opacity-70" />
              </div>
            ) : (
              <div className="grid shrink-0 grid-cols-2 gap-1">
                <WireBlock className="h-5 rounded-sm" />
                <WireBlock className="h-5 rounded-sm" />
                <WireBlock className="col-span-2 h-3 rounded-sm opacity-70" />
              </div>
            )}

            <div
              className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-sm border border-[var(--border-subtle,#e5e7eb)] p-1.5"
              style={
                highlightTable
                  ? {
                      background: PR_TARGET_HIGHLIGHT_FILL,
                      borderColor: PR_TARGET_HIGHLIGHT_BORDER,
                    }
                  : undefined
              }
            >
              {tableFilters ? (
                <div className="mb-1 flex shrink-0 gap-1">
                  <WireBlock className="h-2.5 flex-1 rounded-sm" highlight={highlightTable} />
                  <WireBlock className="h-2.5 w-[22%] min-w-[2rem] rounded-sm" highlight={highlightTable} />
                </div>
              ) : (
                <WireBlock className="mb-1 h-2.5 w-full shrink-0 rounded-sm opacity-50" />
              )}

              {tableEmpty ? (
                <WireBlock className="min-h-0 flex-1 rounded-sm" highlight dashed />
              ) : (
                <div className="flex min-h-0 flex-1 flex-col gap-0.5">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 border-b border-[var(--border-subtle,#e5e7eb)] py-0.5 last:border-b-0"
                    >
                      <div className="min-w-0 flex-1">
                        <WireBlock className="mb-0.5 h-1.5 w-[50%] rounded-sm opacity-80" />
                        <WireBlock className="h-1 w-[35%] rounded-sm opacity-50" />
                      </div>
                      <WireBlock className="h-1.5 w-[10%] shrink-0 rounded-sm opacity-50" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pointer-events-none absolute right-2 bottom-2">
            <WireBlock className="size-3 rounded-full opacity-40" />
          </div>
        </div>
      </div>
    </div>
  );
}

const WIREFRAME_RENDERERS: Record<AutomatPrSplitWireframeId, () => ReactNode> = {
  "project-scoped-table": () => (
    <AutomatPageShell highlightTable analyticsLayout="kpi-strip" />
  ),
  "project-switcher": () => (
    <AutomatPageShell highlightHeader analyticsLayout="kpi-strip" />
  ),
  "analytics-kpi-strip": () => (
    <AutomatPageShell highlightAnalytics analyticsLayout="kpi-strip" />
  ),
  "table-filters": () => (
    <AutomatPageShell highlightTable analyticsLayout="kpi-strip" tableFilters />
  ),
  "empty-search": () => (
    <AutomatPageShell
      highlightTable
      analyticsLayout="kpi-strip"
      tableFilters
      tableEmpty
    />
  ),
  "responsive-shell": () => (
    <AutomatPageShell highlightShell analyticsLayout="kpi-strip" compactSidebar />
  ),
};

type PrSplitWireframeProps = {
  id: AutomatPrSplitWireframeId;
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
