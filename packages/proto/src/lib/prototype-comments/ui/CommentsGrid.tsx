"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@prototype/components/ui/tooltip";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  isAnnotationResolved,
  sortAnnotationsForDisplay,
} from "../core/annotation-status";
import { getRepliesForParent } from "../core/comment-threads";
import type { CommentAnnotation } from "../core/types";
import { useCommentStoreOptional } from "../react/CommentProvider";
import { CommentThread } from "./CommentThread";
import { usePrototypeToolTheme } from "@prototype/lib/prototypes/use-prototype-tool-theme";
import { getViewportBoundingBox } from "./comment-highlight";
import {
  PR_TARGET_HIGHLIGHT_BORDER,
  PR_TARGET_HIGHLIGHT_FILL,
} from "@prototype/lib/pr-split/pr-split-highlight";
import cardStyles from "./comments-grid-card.module.scss";
import { cn } from "@prototype/lib/utils";

function reviewSidebarCardBorder(
  selected: boolean,
  hovered: boolean,
): string {
  if (selected) {
    return PR_TARGET_HIGHLIGHT_BORDER;
  }
  if (hovered) {
    return "var(--border-medium)";
  }
  return "var(--border-solid)";
}

const s = {
  emptyState: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    textAlign: "center" as const,
    color: "var(--text-tertiary)",
    fontSize: "14px",
    gap: "8px",
  },
  emptyIcon: {
    width: "40px",
    height: "40px",
    opacity: 0.45,
    marginBottom: "4px",
    color: "var(--text-secondary)",
  },
  grid: (layout: "grid" | "sidebar"): CSSProperties => ({
    display: "grid",
    gridTemplateColumns:
      layout === "sidebar" ? "minmax(0, 1fr)" : "repeat(2, minmax(0, 1fr))",
    gap: layout === "sidebar" ? "12px" : "16px",
    padding: layout === "sidebar" ? "0" : "4px 2px",
  }),
  card: (
    hovered: boolean,
    selected: boolean,
    resolved: boolean,
    layout: "grid" | "sidebar" = "grid",
  ): CSSProperties => ({
    display: "flex",
    flexDirection: "column",
    borderRadius: layout === "sidebar" ? "0.5rem" : "6px",
    overflow: "hidden",
    border: `1px solid ${
      selected
        ? PR_TARGET_HIGHLIGHT_BORDER
        : hovered
          ? "var(--border-medium)"
          : "var(--border-solid)"
    }`,
    background: "var(--bg-main)",
    cursor: "pointer",
    transition: "border-color 0.15s ease, background 0.15s ease, opacity 0.15s ease",
    position: "relative",
    opacity: resolved ? 0.72 : 1,
  }),
  screenshot: {
    position: "relative" as const,
    overflow: "hidden",
    background: "var(--bg-subtle)",
    borderBottom: "1px solid var(--border-solid)",
  },
  screenshotImg: {
    display: "block",
    width: "100%",
    height: "auto",
  },
  noScreenshot: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: "16 / 9",
    color: "var(--text-tertiary)",
    fontSize: "13px",
  },
  highlight: (
    isMultiSelect: boolean,
    x: number,
    y: number,
    w: number,
    h: number,
    vw: number,
    vh: number,
  ): CSSProperties => ({
    position: "absolute",
    left: `${(x / vw) * 100}%`,
    top: `${(y / vh) * 100}%`,
    width: `${(w / vw) * 100}%`,
    height: `${(h / vh) * 100}%`,
    boxSizing: "border-box",
    borderRadius: "4px",
    border: isMultiSelect
      ? "2px dashed rgba(34,197,94,0.8)"
      : `1.5px solid ${PR_TARGET_HIGHLIGHT_BORDER}`,
    background: isMultiSelect
      ? "rgba(34,197,94,0.12)"
      : PR_TARGET_HIGHLIGHT_FILL,
    pointerEvents: "none",
  }),
  content: {
    padding: "10px 12px 12px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
    flex: 1,
  },
  comment: (resolved: boolean): CSSProperties => ({
    fontSize: "14px",
    lineHeight: 1.5,
    color: resolved ? "var(--text-secondary)" : "var(--text-primary)",
    margin: 0,
    display: "-webkit-box" as unknown as "block",
    WebkitBoxOrient: "vertical" as const,
    WebkitLineClamp: 3,
    overflow: "hidden",
    textDecoration: resolved ? "line-through" : "none",
  }),
  resolvedBadge: {
    alignSelf: "flex-start",
    fontSize: "11px",
    fontWeight: 500,
    lineHeight: 1,
    color: "var(--success)",
    background: "color-mix(in srgb, var(--success) 12%, transparent)",
    borderRadius: "4px",
    padding: "4px 6px",
  },
  actions: (visible: boolean, resolved: boolean): CSSProperties => ({
    position: "absolute",
    top: "8px",
    right: "8px",
    display: "flex",
    gap: "4px",
    opacity: visible || resolved ? 1 : 0,
    transition: "opacity 0.15s",
    pointerEvents: visible || resolved ? "auto" : "none",
  }),
  actionBtn: (variant?: "danger" | "resolve" | "resolved"): CSSProperties => ({
    width: "28px",
    height: "28px",
    borderRadius: "calc(var(--radius) - 2px)",
    border: "1px solid var(--tool-chrome-border)",
    background: "var(--tool-chrome-bg)",
    color:
      variant === "danger"
        ? "var(--tool-chrome-pink)"
        : variant === "resolved"
          ? "#22c55e"
          : "var(--tool-chrome-text-muted)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    boxShadow: "var(--shadow-sm)",
  }),
  editInput: {
    fontSize: "14px",
    lineHeight: 1.5,
    color: "var(--text-primary)",
    border: "1px solid var(--border-medium)",
    borderRadius: "6px",
    padding: "6px 8px",
    outline: "none",
    resize: "none" as const,
    width: "100%",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
    background: "var(--bg-main)",
  },
};

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CopiedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function copyText(text: string): void {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => copyTextFallback(text));
  } else {
    copyTextFallback(text);
  }
}

function copyTextFallback(text: string): void {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

function buildCopyPrompt(
  annotation: CommentAnnotation<unknown>,
  prototypeSlug?: string,
  allAnnotations?: readonly CommentAnnotation<unknown>[],
): string {
  const lines: string[] = [];
  lines.push(`Fix the following UI feedback:`);
  if (prototypeSlug) {
    lines.push(`Prototype: ${prototypeSlug}`);
    lines.push(`Work in: src/prototypes/${prototypeSlug}/`);
  }
  lines.push(`\nComment: "${annotation.comment}"`);
  if (allAnnotations) {
    const replies = getRepliesForParent(allAnnotations, annotation.id);
    for (const reply of replies) {
      lines.push(`Reply: "${reply.comment}"`);
    }
  }
  if (annotation.element) lines.push(`Element: ${annotation.element}`);
  if (annotation.sourceFile) lines.push(`Source file: ${annotation.sourceFile}`);
  if (annotation.reactComponents) lines.push(`React components: ${annotation.reactComponents}`);
  if (annotation.elementPath) lines.push(`Element path: ${annotation.elementPath}`);
  if (annotation.cssClasses) lines.push(`CSS classes: ${annotation.cssClasses}`);
  if (annotation.nearbyText) lines.push(`Nearby text: ${annotation.nearbyText}`);
  return lines.join("\n");
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ResolveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

const ACTION_TOOLTIP_DELAY_MS = 500;

type CommentActionButtonProps = {
  label: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  variant?: "danger" | "resolve" | "resolved";
  compact?: boolean;
  children: ReactNode;
};

function CommentActionButton({
  label,
  onClick,
  variant,
  compact = false,
  children,
}: CommentActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          style={s.actionBtn(variant)}
          className={cn(compact && cardStyles.actionBtnCompact)}
          onClick={onClick}
          type="button"
          aria-label={label}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

type CommentCardProps<TState> = {
  annotation: CommentAnnotation<TState>;
  onSelect?: (id: string) => void;
  linkBasePath?: string;
  onDelete: (id: string) => void;
  onUpdateComment: (id: string, comment: string) => void;
  onResolve?: (id: string) => void;
  showResolveActions?: boolean;
  showCopyPrompt?: boolean;
  showReplies?: boolean;
  selected?: boolean;
  prototypeSlug?: string;
  layout?: "grid" | "sidebar";
  expandComment?: boolean;
};

function CommentCard<TState>({
  annotation,
  onSelect,
  linkBasePath,
  onDelete,
  onUpdateComment,
  onResolve,
  showResolveActions = true,
  showCopyPrompt = true,
  showReplies = true,
  selected = false,
  prototypeSlug,
  layout = "grid",
  expandComment = false,
}: CommentCardProps<TState>) {
  const commentStore = useCommentStoreOptional();
  const { useLightTheme } = usePrototypeToolTheme();
  const allAnnotations = commentStore?.annotations;
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(annotation.comment);
  const [copied, setCopied] = useState(false);
  const isResolved = showResolveActions && isAnnotationResolved(annotation);
  const isCondensed = isResolved && !editing;
  const replyCount =
    showReplies && allAnnotations
      ? getRepliesForParent(allAnnotations, annotation.id).length
      : 0;
  const showActions = hovered && !editing;

  useEffect(() => {
    if (selected && cardRef.current) {
      cardRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selected]);

  const viewportBox = getViewportBoundingBox(annotation);
  const viewport = annotation.captureViewport;
  const isSidebarLayout = layout === "sidebar";
  const showResolvedBadge =
    showResolveActions && isResolved && !isCondensed;

  function handleSave() {
    if (draft.trim()) onUpdateComment(annotation.id, draft.trim());
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setDraft(annotation.comment);
      setEditing(false);
    }
  }

  function handleSelect() {
    if (linkBasePath) {
      window.open(`${linkBasePath}/${annotation.id}`, "_blank", "noopener,noreferrer");
      return;
    }
    onSelect?.(annotation.id);
  }

  function renderActionButtons(compact: boolean) {
    return (
      <>
        {editing ? (
          <CommentActionButton
            label="Save"
            onClick={handleSave}
            compact={compact}
          >
            <CheckIcon />
          </CommentActionButton>
        ) : (
          <>
            {showResolveActions && onResolve ? (
              <CommentActionButton
                label={isResolved ? "Unresolve comment" : "Resolve comment"}
                variant={isResolved ? "resolved" : "resolve"}
                compact={compact}
                onClick={(e) => {
                  e.stopPropagation();
                  onResolve(annotation.id);
                }}
              >
                <ResolveIcon />
              </CommentActionButton>
            ) : null}
            <span className={cardStyles.secondaryAction}>
              <CommentActionButton
                label="Edit comment"
                compact={compact}
                onClick={(e) => {
                  e.stopPropagation();
                  setDraft(annotation.comment);
                  setEditing(true);
                }}
              >
                <PencilIcon />
              </CommentActionButton>
            </span>
            {showCopyPrompt ? (
              <span className={cardStyles.secondaryAction}>
                <CommentActionButton
                  label="Copy as agent prompt"
                  variant={copied ? "resolve" : undefined}
                  compact={compact}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyText(
                      buildCopyPrompt(
                        annotation as CommentAnnotation<unknown>,
                        prototypeSlug,
                        allAnnotations as CommentAnnotation<unknown>[] | undefined,
                      ),
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? <CopiedIcon /> : <CopyIcon />}
                </CommentActionButton>
              </span>
            ) : null}
          </>
        )}
        <CommentActionButton
          label="Delete comment"
          variant="danger"
          compact={compact}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(annotation.id);
          }}
        >
          <TrashIcon />
        </CommentActionButton>
      </>
    );
  }

  const showActionBar = showActions || isCondensed;

  const actionButtons = (
    <TooltipProvider delayDuration={ACTION_TOOLTIP_DELAY_MS}>
      <div
        className={cardStyles.actions}
        style={s.actions(showActionBar, isCondensed || isResolved)}
        onClick={(e) => e.stopPropagation()}
      >
        {renderActionButtons(isCondensed)}
      </div>
    </TooltipProvider>
  );

  return (
    <div
      ref={cardRef}
      className={cn(
        "tool-review-card",
        cardStyles.card,
        isSidebarLayout && cardStyles.cardSidebar,
        isSidebarLayout && "rounded-md text-[var(--tool-chrome-text)]",
        isCondensed && cardStyles.cardCondensed,
        isResolved && cardStyles.cardResolved,
      )}
      style={
        isSidebarLayout
          ? {
              border: `1px solid ${reviewSidebarCardBorder(selected, hovered)}`,
              background: "var(--bg-main)",
              transition:
                "border-color 0.15s ease, background 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease",
            }
          : {
              border: `1px solid ${
                selected
                  ? PR_TARGET_HIGHLIGHT_BORDER
                  : hovered
                    ? "var(--border-medium)"
                    : "var(--border-solid)"
              }`,
              background: "var(--bg-main)",
            }
      }
      aria-current={selected ? "true" : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !editing && handleSelect()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (editing) return;
        if (e.key === "Enter") {
          handleSelect();
          return;
        }
        if (
          selected &&
          (e.key === "ArrowUp" || e.key === "ArrowDown")
        ) {
          e.preventDefault();
        }
      }}
    >
      {actionButtons}

      <div className={cardStyles.screenshotCollapse}>
        <div className={cardStyles.screenshotInner}>
          <div className={cardStyles.screenshot}>
            {annotation.screenshot ? (
              <>
                <img
                  src={annotation.screenshot}
                  alt={annotation.comment}
                  style={s.screenshotImg}
                />
                {viewportBox && viewport && (
                  <div
                    aria-hidden
                    style={s.highlight(
                      !!annotation.isMultiSelect,
                      viewportBox.x,
                      viewportBox.y,
                      viewportBox.width,
                      viewportBox.height,
                      viewport.width,
                      viewport.height,
                    )}
                  />
                )}
              </>
            ) : (
              <div style={s.noScreenshot}>No screenshot</div>
            )}
          </div>
        </div>
      </div>

      <div className={cardStyles.body}>
        <span className={cardStyles.statusIcon} aria-hidden>
          <ResolveIcon />
        </span>

        <div className={cardStyles.bodyMain}>
          <div
            className={cn(
              cardStyles.resolvedBadgeCollapse,
              showResolvedBadge && cardStyles.resolvedBadgeCollapseExpanded,
            )}
          >
            <div className={cardStyles.resolvedBadgeInner}>
              {showResolvedBadge ? (
                <span style={s.resolvedBadge}>Resolved</span>
              ) : null}
            </div>
          </div>

          {editing ? (
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              onClick={(e) => e.stopPropagation()}
              rows={3}
              style={s.editInput}
            />
          ) : (
            <p
              className={cn(
                cardStyles.comment,
                expandComment && cardStyles.commentExpanded,
              )}
              style={
                !expandComment && isResolved && !isCondensed
                  ? s.comment(true)
                  : undefined
              }
            >
              {annotation.comment}
            </p>
          )}

          {replyCount > 0 ? (
            <span
              className={cn(
                cardStyles.replyCount,
                cardStyles.replyCountVisible,
              )}
            >
              {replyCount} {replyCount === 1 ? "reply" : "replies"}
            </span>
          ) : null}

          {showReplies ? (
            <div className={cardStyles.threadCollapse}>
              <div className={cardStyles.threadInner}>
                <CommentThread
                  rootAnnotation={annotation}
                  dark={!useLightTheme}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type CommentsGridProps<TState> = {
  annotations: CommentAnnotation<TState>[];
  onSelect?: (id: string) => void;
  linkBasePath?: string;
  layout?: "grid" | "sidebar";
  onDelete: (id: string) => void;
  onUpdateComment: (id: string, comment: string) => void;
  onResolve?: (id: string) => void;
  showResolveActions?: boolean;
  showCopyPrompt?: boolean;
  showReplies?: boolean;
  emptyStateTitle?: string;
  emptyStateAction?: ReactNode;
  selectedId?: string | null;
  sortOrder?: "newest" | "oldest";
  expandComment?: boolean;
};

export function CommentsGrid<TState>({
  annotations,
  onSelect,
  linkBasePath,
  layout = "grid",
  onDelete,
  onUpdateComment,
  onResolve,
  showResolveActions = true,
  showCopyPrompt = true,
  showReplies = true,
  emptyStateTitle = "No comments yet",
  emptyStateAction,
  selectedId,
  sortOrder = "newest",
  expandComment = false,
}: CommentsGridProps<TState>) {
  const commentStore = useCommentStoreOptional();
  const prototypeSlug = commentStore?.slug;
  const sorted = sortAnnotationsForDisplay(annotations, sortOrder);

  if (sorted.length === 0) {
    return (
      <div style={s.emptyState}>
        <svg style={s.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span style={{ fontWeight: 500, color: "var(--text-secondary)" }}>
          {emptyStateTitle}
        </span>
        {emptyStateAction}
      </div>
    );
  }

  return (
    <div style={s.grid(layout)}>
      {sorted.map((annotation) => (
        <CommentCard
          key={annotation.id}
          annotation={annotation}
          layout={layout}
          onSelect={onSelect}
          linkBasePath={linkBasePath}
          onDelete={onDelete}
          onUpdateComment={onUpdateComment}
          onResolve={onResolve}
          showResolveActions={showResolveActions}
          showCopyPrompt={showCopyPrompt}
          showReplies={showReplies}
          selected={selectedId === annotation.id}
          prototypeSlug={prototypeSlug}
          expandComment={expandComment}
        />
      ))}
    </div>
  );
}
