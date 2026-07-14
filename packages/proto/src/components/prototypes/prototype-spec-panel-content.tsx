"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  Clock,
  Copy,
  GitBranch,
  GitMerge,
  Github,
  Monitor,
} from "lucide-react";

import { PrototypeComponent } from "./prototype-target";
import { resolveSourcePreviewUrl } from "../../lib/pr-split/resolve-source-preview-url";
import { PR_TARGET_HIGHLIGHT_BORDER } from "../../lib/pr-split/pr-split-highlight";
import type { PrSplitEntry } from "../../lib/pr-split/pr-split-types";
import { usePrVercelPreviews } from "../../lib/pr-split/use-pr-vercel-previews";
import type { VercelPreviewFromPr } from "../../lib/vercel-preview/parse-vercel-github-comment";

function reviewSidebarCardBorder(selected: boolean, hovered: boolean): string {
  if (selected) {
    return PR_TARGET_HIGHLIGHT_BORDER;
  }
  if (hovered) {
    return "var(--border-medium)";
  }
  return "var(--border-solid)";
}

function CopyPrPrompt<TWireframeId extends string, TLiveState>({
  entry,
  buildAgentPrompt,
}: {
  entry: PrSplitEntry<TWireframeId, TLiveState>;
  buildAgentPrompt: (
    entry: PrSplitEntry<TWireframeId, TLiveState>,
    origin?: string,
  ) => string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const origin =
      typeof window !== "undefined" ? window.location.origin : undefined;
    const prompt = buildAgentPrompt(entry, origin ?? "http://localhost:3003");
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <button
      type="button"
      aria-label="Copy PR prompt"
      onClick={handleCopy}
      className="inline-flex size-[13px] shrink-0 cursor-pointer items-center justify-center text-muted-foreground/60 transition-colors duration-200 ease hover:text-muted-foreground"
    >
      {copied ? (
        <Check className="size-3 text-[var(--text-primary)]" />
      ) : (
        <Copy className="size-3" />
      )}
    </button>
  );
}

function LinearIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
      className={className}
    >
      <path d="M2.5 13.5 6.5 9.5" />
      <path d="M6.5 13.5 13.5 6.5" />
      <path d="M2.5 6.5 9.5 2.5" />
    </svg>
  );
}

function CopyLinearLink({ linearUrl }: { linearUrl: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(linearUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <button
      type="button"
      aria-label={`Copy Linear issue URL: ${linearUrl}`}
      onClick={handleCopy}
      className="group inline-flex h-6 shrink-0 items-center gap-1 rounded-md border border-[var(--border-solid)] bg-[var(--bg-subtle)] px-2 text-[11px] text-[var(--text-secondary)] transition-colors duration-150 ease hover:bg-[var(--bg-layered)] hover:text-[var(--text-primary)]"
    >
      <LinearIcon className="size-3 shrink-0 text-[var(--text-tertiary)] transition-colors duration-150 ease group-hover:text-[var(--text-secondary)]" />
      Linear
      {copied ? (
        <Check className="size-3 text-[var(--text-primary)]" aria-hidden />
      ) : (
        <Copy
          className="size-3 text-[var(--text-tertiary)] transition-colors duration-150 ease group-hover:text-[var(--text-secondary)]"
          aria-hidden
        />
      )}
    </button>
  );
}

function CopyBranch({ branch }: { branch: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(branch).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <button
      type="button"
      aria-label={`Copy branch name: ${branch}`}
      onClick={handleCopy}
      className="group inline-flex h-6 shrink-0 items-center gap-1 rounded-md border border-[var(--border-solid)] bg-[var(--bg-subtle)] px-2 text-[11px] text-[var(--text-secondary)] transition-colors duration-150 ease hover:bg-[var(--bg-layered)] hover:text-[var(--text-primary)]"
    >
      <GitBranch
        className="size-3 shrink-0 text-[var(--text-tertiary)] transition-colors duration-150 ease group-hover:text-[var(--text-secondary)]"
        aria-hidden
      />
      Branch
      {copied ? (
        <Check className="size-3 text-[var(--text-primary)]" aria-hidden />
      ) : (
        <Copy
          className="size-3 text-[var(--text-tertiary)] transition-colors duration-150 ease group-hover:text-[var(--text-secondary)]"
          aria-hidden
        />
      )}
    </button>
  );
}

function CopyPrLink({ prUrl }: { prUrl: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <button
      type="button"
      aria-label={`Copy pull request URL: ${prUrl}`}
      onClick={handleCopy}
      className="group inline-flex h-6 shrink-0 items-center gap-1 rounded-md border border-[var(--border-solid)] bg-[var(--bg-subtle)] px-2 text-[11px] text-[var(--text-secondary)] transition-colors duration-150 ease hover:bg-[var(--bg-layered)] hover:text-[var(--text-primary)]"
    >
      <Github
        className="size-3 shrink-0 text-[var(--text-tertiary)] transition-colors duration-150 ease group-hover:text-[var(--text-secondary)]"
        aria-hidden
      />
      PR
      {copied ? (
        <Check className="size-3 text-[var(--text-primary)]" aria-hidden />
      ) : (
        <Copy
          className="size-3 text-[var(--text-tertiary)] transition-colors duration-150 ease group-hover:text-[var(--text-secondary)]"
          aria-hidden
        />
      )}
    </button>
  );
}

function CopyPreviewLink<TWireframeId extends string, TLiveState>({
  entry,
  previewCache,
  previewLoading,
  defaultPreviewPath,
  vercelProjectName,
}: {
  entry: PrSplitEntry<TWireframeId, TLiveState>;
  previewCache: Map<string, VercelPreviewFromPr>;
  previewLoading: boolean;
  defaultPreviewPath?: string;
  vercelProjectName?: string;
}) {
  const [copied, setCopied] = useState(false);
  const cached = entry.prUrl ? previewCache.get(entry.prUrl) : undefined;
  const resolved = resolveSourcePreviewUrl(cached ?? null, entry, {
    defaultPreviewPath: defaultPreviewPath ?? "/",
    vercelProjectName: vercelProjectName ?? "",
  });
  const previewUrl = resolved?.previewUrl ?? null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!previewUrl) return;
    navigator.clipboard.writeText(previewUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <button
      type="button"
      disabled={!previewUrl}
      aria-label={
        previewUrl
          ? `Copy preview URL: ${previewUrl}`
          : previewLoading
            ? "Loading preview URL"
            : "Preview unavailable"
      }
      onClick={handleCopy}
      className="group inline-flex h-6 shrink-0 cursor-pointer items-center gap-1 rounded-md border border-[var(--border-solid)] bg-[var(--bg-subtle)] px-2 text-[11px] text-[var(--text-secondary)] transition-colors duration-150 ease hover:bg-[var(--bg-layered)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Monitor
        className="size-3 shrink-0 text-[var(--text-tertiary)] transition-colors duration-150 ease group-hover:text-[var(--text-secondary)] group-disabled:opacity-60"
        aria-hidden
      />
      Preview
      {copied ? (
        <Check className="size-3 text-[var(--text-primary)]" aria-hidden />
      ) : (
        <Copy
          className="size-3 text-[var(--text-tertiary)] transition-colors duration-150 ease group-hover:text-[var(--text-secondary)] group-disabled:opacity-60"
          aria-hidden
        />
      )}
    </button>
  );
}

function PrStatusLink({
  prUrl,
  status,
}: {
  prUrl: string;
  status: "merged" | "approved" | "in-review";
}) {
  const config = {
    merged: {
      label: "Merged",
      className: "text-[#8957e5]",
      icon: <GitMerge className="size-3.5" aria-hidden />,
    },
    approved: {
      label: "Approved",
      className: "text-green-600",
      icon: <Check className="size-3.5" aria-hidden />,
    },
    "in-review": {
      label: "In Review",
      className: "text-[var(--color-active)]",
      icon: <Clock className="size-3.5" aria-hidden />,
    },
  }[status];

  return (
    <a
      href={prUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open pull request (${config.label})`}
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 transition-opacity duration-200 ease hover:opacity-80 ${config.className}`}
    >
      {config.icon}
      <span className="text-[12px] font-medium">{config.label}</span>
    </a>
  );
}

function PrPreviewCard<TWireframeId extends string, TLiveState>({
  entry,
  selected,
  onSelect,
  previewCache,
  previewLoading,
  renderWireframe,
  buildAgentPrompt,
  defaultPreviewPath,
  vercelProjectName,
}: {
  entry: PrSplitEntry<TWireframeId, TLiveState>;
  selected: boolean;
  onSelect: (entry: PrSplitEntry<TWireframeId, TLiveState>) => void;
  previewCache: Map<string, VercelPreviewFromPr>;
  previewLoading: boolean;
  renderWireframe: (wireframeId: TWireframeId) => ReactNode;
  buildAgentPrompt: (
    entry: PrSplitEntry<TWireframeId, TLiveState>,
    origin?: string,
  ) => string;
  defaultPreviewPath?: string;
  vercelProjectName?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const isMerged = Boolean(entry.merged);
  const [expanded, setExpanded] = useState(!isMerged);

  useEffect(() => {
    if (selected) setExpanded(true);
  }, [selected]);

  const collapseStyle = {
    display: "grid",
    gridTemplateRows: expanded ? "1fr" : "0fr",
    transition: "grid-template-rows 0.25s cubic-bezier(.215, .61, .355, 1)",
  } as const;

  const collapsedMerged = isMerged && !expanded;

  return (
    <button
      type="button"
      data-pr-order={entry.order}
      aria-current={selected ? "true" : undefined}
      onClick={() => {
        if (collapsedMerged) {
          setExpanded(true);
          return;
        }
        onSelect(entry);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="tool-review-card flex w-full cursor-pointer flex-col overflow-hidden text-left"
      style={{
        borderRadius: 6,
        border: `1px solid ${reviewSidebarCardBorder(selected, hovered)}`,
        background: collapsedMerged ? "var(--bg-subtle)" : "var(--bg-main)",
        opacity: collapsedMerged ? 0.55 : 1,
        transition:
          "border-color 0.15s ease, background 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      <div style={collapseStyle}>
        <div className="overflow-hidden">
          <div
            className="border-b border-[var(--border-solid)]"
            data-prototype-wireframe-preview
          >
            {renderWireframe(entry.wireframeId)}
          </div>
        </div>
      </div>
      <div className="flex flex-col px-3 pb-3.5 pt-3">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex min-w-0 items-center gap-2.5">
            <span className="text-[13px] font-medium text-[var(--text-primary)]">
              PR {entry.order} · {entry.title}
            </span>
            {!entry.prUrl ? (
              <CopyPrPrompt entry={entry} buildAgentPrompt={buildAgentPrompt} />
            ) : null}
            {entry.merged && entry.prUrl ? (
              <PrStatusLink prUrl={entry.prUrl} status="merged" />
            ) : entry.approved && entry.prUrl ? (
              <PrStatusLink prUrl={entry.prUrl} status="approved" />
            ) : entry.prUrl ? (
              <PrStatusLink prUrl={entry.prUrl} status="in-review" />
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-[11px] text-[var(--text-tertiary)]">
              {entry.size}
            </span>
            {isMerged ? (
              <span
                role="button"
                tabIndex={0}
                aria-label={expanded ? "Collapse PR" : "Expand PR"}
                aria-expanded={expanded}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded((v) => !v);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    setExpanded((v) => !v);
                  }
                }}
                className="inline-flex size-5 cursor-pointer items-center justify-center rounded text-[var(--text-tertiary)] transition-colors duration-200 ease hover:text-[var(--text-secondary)]"
              >
                <ChevronDown
                  className="size-4 transition-transform duration-200 ease"
                  style={{
                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                  aria-hidden
                />
              </span>
            ) : null}
          </div>
        </div>
        <div style={collapseStyle}>
          <div className="overflow-hidden">
            <div className="flex flex-col gap-3 pt-3">
              <p className="text-[12px] leading-normal text-[var(--text-secondary)]">
                {entry.description}
              </p>
              {entry.analyticsNotes && entry.analyticsNotes.length > 0 && (
                <div className="border-l-2 border-[var(--border-faint)] pl-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
                    Event logging
                  </p>
                  <ol className="mt-1 flex list-decimal flex-col gap-0.5 pl-4">
                    {entry.analyticsNotes.map((note) => (
                      <li
                        key={note}
                        className="text-[11px] leading-snug text-[var(--text-secondary)]"
                      >
                        {note}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {entry.prUrl ||
              entry.branch ||
              entry.linearUrl ||
              entry.vercelPreviewHost ? (
                <div className="flex flex-wrap items-center gap-2">
                  {entry.prUrl ? <CopyPrLink prUrl={entry.prUrl} /> : null}
                  {entry.branch ? <CopyBranch branch={entry.branch} /> : null}
                  {entry.linearUrl ? (
                    <CopyLinearLink linearUrl={entry.linearUrl} />
                  ) : null}
                  {entry.prUrl || entry.vercelPreviewHost ? (
                    <CopyPreviewLink
                      entry={entry}
                      previewCache={previewCache}
                      previewLoading={previewLoading}
                      defaultPreviewPath={defaultPreviewPath}
                      vercelProjectName={vercelProjectName}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export type PrototypeSpecPanelContentProps<
  TWireframeId extends string = string,
  TLiveState = unknown,
> = {
  entries: PrSplitEntry<TWireframeId, TLiveState>[];
  renderWireframe: (wireframeId: TWireframeId) => ReactNode;
  buildAgentPrompt: (
    entry: PrSplitEntry<TWireframeId, TLiveState>,
    origin?: string,
  ) => string;
  onPrNavigate?: (entry: PrSplitEntry<TWireframeId, TLiveState>) => void;
  selectedPrOrder?: number | null;
  previewApiPath?: string;
  defaultPreviewPath?: string;
  vercelProjectName?: string;
};

export function PrototypeSpecPanelContent<
  TWireframeId extends string = string,
  TLiveState = unknown,
>({
  entries,
  renderWireframe,
  buildAgentPrompt,
  onPrNavigate,
  selectedPrOrder,
  previewApiPath,
  defaultPreviewPath,
  vercelProjectName,
}: PrototypeSpecPanelContentProps<TWireframeId, TLiveState>) {
  const prUrlsWithLinks = useMemo(
    () =>
      entries
        .map((entry) => entry.prUrl)
        .filter((url): url is string => Boolean(url)),
    [entries],
  );

  const { previewCache, previewLoading } = usePrVercelPreviews(
    prUrlsWithLinks,
    previewApiPath,
  );

  useEffect(() => {
    if (selectedPrOrder == null) return;
    const timer = window.setTimeout(() => {
      const el = document.querySelector<HTMLElement>(
        `[data-pr-order="${selectedPrOrder}"]`,
      );
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 120);
    return () => clearTimeout(timer);
  }, [selectedPrOrder]);

  return (
    <PrototypeComponent
      id="spec-panel-content"
      className="flex flex-col gap-4 pb-6"
    >
      <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
        Click a PR to preview the change and highlight the relevant component.
      </p>
      <div className="flex flex-col gap-4">
        {entries.map((entry) => (
          <PrPreviewCard
            key={entry.order}
            entry={entry}
            selected={entry.order === selectedPrOrder}
            onSelect={(selected) => onPrNavigate?.(selected)}
            previewCache={previewCache}
            previewLoading={previewLoading}
            renderWireframe={renderWireframe}
            buildAgentPrompt={buildAgentPrompt}
            defaultPreviewPath={defaultPreviewPath}
            vercelProjectName={vercelProjectName}
          />
        ))}
      </div>
    </PrototypeComponent>
  );
}
