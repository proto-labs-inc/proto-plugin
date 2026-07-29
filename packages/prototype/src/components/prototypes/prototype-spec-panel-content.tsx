"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Ban,
  Check,
  Copy,
  GitBranch,
  GitMerge,
  GitPullRequest,
  GitPullRequestClosed,
  GitPullRequestDraft,
  Github,
  Monitor,
} from "lucide-react";

import { PrototypeComponent } from "./prototype-target";
import { useTrackEvent } from "../../lib/prototypes/telemetry/prototype-telemetry-context";
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

const PR_META_CHIP_BUTTON_CLASS =
  "group inline-flex h-6 shrink-0 items-center rounded-md border border-[var(--border-medium)] bg-[var(--bg-subtle)] px-2 text-[11px] font-medium text-[var(--text-primary)] transition-colors duration-150 ease hover:bg-[var(--bg-layered)]";

const PR_META_CHIP_LEADING_CLASS = "inline-flex items-center gap-1";
const PR_META_CHIP_ICON_CLASS = "size-3 shrink-0";
const PR_META_CHIP_TRAILING_ICON_CLASS = `${PR_META_CHIP_ICON_CLASS} ml-1.5`;

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
      aria-label={copied ? "Copied PR prompt" : "Create PR"}
      onClick={handleCopy}
      className="inline-flex h-7 w-fit cursor-pointer items-center justify-center rounded-md border border-[var(--border-medium)] bg-[var(--bg-subtle)] px-2.5 text-[11px] font-medium text-[var(--text-primary)] transition-colors duration-150 ease hover:bg-[var(--bg-layered)]"
    >
      {copied ? (
        <>
          Copied prompt
          <Check className={PR_META_CHIP_TRAILING_ICON_CLASS} aria-hidden />
        </>
      ) : (
        <>
          Create PR
          <Copy className={PR_META_CHIP_TRAILING_ICON_CLASS} aria-hidden />
        </>
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
      className={PR_META_CHIP_BUTTON_CLASS}
    >
      <span className={PR_META_CHIP_LEADING_CLASS}>
        <LinearIcon className={PR_META_CHIP_ICON_CLASS} />
        Linear
      </span>
      {copied ? (
        <Check className={PR_META_CHIP_TRAILING_ICON_CLASS} aria-hidden />
      ) : (
        <Copy className={PR_META_CHIP_TRAILING_ICON_CLASS} aria-hidden />
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
      className={PR_META_CHIP_BUTTON_CLASS}
    >
      <span className={PR_META_CHIP_LEADING_CLASS}>
        <GitBranch className={PR_META_CHIP_ICON_CLASS} aria-hidden />
        Branch
      </span>
      {copied ? (
        <Check className={PR_META_CHIP_TRAILING_ICON_CLASS} aria-hidden />
      ) : (
        <Copy className={PR_META_CHIP_TRAILING_ICON_CLASS} aria-hidden />
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
      className={PR_META_CHIP_BUTTON_CLASS}
    >
      <span className={PR_META_CHIP_LEADING_CLASS}>
        <Github className={PR_META_CHIP_ICON_CLASS} aria-hidden />
        PR
      </span>
      {copied ? (
        <Check className={PR_META_CHIP_TRAILING_ICON_CLASS} aria-hidden />
      ) : (
        <Copy className={PR_META_CHIP_TRAILING_ICON_CLASS} aria-hidden />
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
      className={`${PR_META_CHIP_BUTTON_CLASS} cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span className={PR_META_CHIP_LEADING_CLASS}>
        <Monitor
          className={`${PR_META_CHIP_ICON_CLASS} group-disabled:opacity-60`}
          aria-hidden
        />
        Preview
      </span>
      {copied ? (
        <Check className={PR_META_CHIP_TRAILING_ICON_CLASS} aria-hidden />
      ) : (
        <Copy
          className={`${PR_META_CHIP_TRAILING_ICON_CLASS} group-disabled:opacity-60`}
          aria-hidden
        />
      )}
    </button>
  );
}

type PrStatus =
  | "merged"
  | "closed"
  | "cancelled"
  | "approved"
  | "draft"
  | "in-review";

const PR_STATUS_CONFIG: Record<
  PrStatus,
  {
    label: string;
    className: string;
    icon: typeof GitMerge | null;
  }
> = {
  merged: {
    label: "Merged",
    className: "text-[#a371f7]",
    icon: GitMerge,
  },
  closed: {
    label: "Closed",
    className: "text-[#f85149]",
    icon: GitPullRequestClosed,
  },
  cancelled: {
    label: "Cancelled",
    className: "text-[var(--text-tertiary)]",
    icon: Ban,
  },
  approved: {
    label: "Approved",
    className: "text-green-600",
    icon: null,
  },
  draft: {
    label: "Draft",
    className: "text-[var(--text-tertiary)]",
    icon: GitPullRequestDraft,
  },
  "in-review": {
    label: "Open",
    className: "text-[#3fb950]",
    icon: GitPullRequest,
  },
};

function resolvePrStatus(
  entry: Pick<
    PrSplitEntry,
    "merged" | "closed" | "cancelled" | "approved" | "draft" | "prUrl"
  >,
): PrStatus | null {
  if (entry.merged) return "merged";
  if (entry.closed) return "closed";
  if (entry.cancelled) return "cancelled";
  if (entry.approved) return "approved";
  if (entry.draft) return "draft";
  if (entry.prUrl) return "in-review";
  return null;
}

function PrStatusBadge({
  status,
  prUrl,
}: {
  status: PrStatus;
  prUrl?: string;
}) {
  const config = PR_STATUS_CONFIG[status];
  const Icon = config.icon;
  const content = (
    <>
      {Icon ? <Icon className="size-3 shrink-0" aria-hidden /> : null}
      <span className="text-[11px] font-medium">{config.label}</span>
    </>
  );

  if (!prUrl) {
    return (
      <span
        className={`inline-flex shrink-0 items-center gap-1 ${config.className}`}
        aria-label={`Pull request status: ${config.label}`}
      >
        {content}
      </span>
    );
  }

  return (
    <a
      href={prUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open pull request (${config.label})`}
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex shrink-0 cursor-pointer items-center gap-1 transition-opacity duration-200 ease hover:opacity-80 ${config.className}`}
    >
      {content}
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
  const status = resolvePrStatus(entry);
  const showCopyPrompt = !entry.prUrl && status !== "cancelled";

  return (
    <button
      type="button"
      data-pr-order={entry.order}
      aria-current={selected ? "true" : undefined}
      onClick={() => onSelect(entry)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="tool-review-card flex w-full cursor-pointer flex-col overflow-hidden text-left"
      style={{
        borderRadius: 6,
        border: `1px solid ${reviewSidebarCardBorder(selected, hovered)}`,
        background: "var(--bg-main)",
        transition:
          "border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      <div
        className="border-b border-[var(--border-solid)]"
        data-prototype-wireframe-preview
      >
        {renderWireframe(entry.wireframeId)}
      </div>
      <div className="flex flex-col px-3 pb-3.5 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[13px] font-medium text-[var(--text-primary)]">
              PR {entry.order} · {entry.title}
            </span>
            {status ? (
              <PrStatusBadge status={status} prUrl={entry.prUrl} />
            ) : null}
          </div>
          <span className="shrink-0 text-[11px] text-[var(--text-tertiary)]">
            {entry.size}
          </span>
        </div>
        <div className="flex flex-col gap-3 pt-3">
          <p className="text-[12px] leading-normal text-[var(--text-secondary)]">
            {entry.description}
          </p>
          {showCopyPrompt ? (
            <CopyPrPrompt entry={entry} buildAgentPrompt={buildAgentPrompt} />
          ) : null}
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

  const track = useTrackEvent();

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
            onSelect={(selected) => {
              track("pr.navigated", {
                order: selected.order,
                title: selected.title,
              });
              onPrNavigate?.(selected);
            }}
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
