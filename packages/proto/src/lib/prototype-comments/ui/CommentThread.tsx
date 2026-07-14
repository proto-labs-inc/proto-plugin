"use client";

import {
  useEffect,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import { getRepliesForParent } from "../core/comment-threads";
import type { CommentAnnotation } from "../core/types";
import { useCommentStore } from "../react/CommentProvider";
import threadStyles from "./comment-thread.module.scss";
import { cn } from "@prototype/lib/utils";

function formatReplyTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function PencilIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

type ThreadReplyRowProps<TState> = {
  reply: CommentAnnotation<TState>;
  canModify: boolean;
  dark?: boolean;
};

function ThreadReplyRow<TState>({
  reply,
  canModify,
  dark = false,
}: ThreadReplyRowProps<TState>) {
  const { updateAnnotation, deleteAnnotation } = useCommentStore<TState>();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(reply.comment);
  const [actionsVisible, setActionsVisible] = useState(false);

  useEffect(() => {
    setDraft(reply.comment);
  }, [reply.comment]);

  function handleSave() {
    const text = draft.trim();
    if (!text) return;
    updateAnnotation(reply.id, text);
    setEditing(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    event.stopPropagation();
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSave();
    }
    if (event.key === "Escape") {
      setDraft(reply.comment);
      setEditing(false);
    }
  }

  return (
    <div
      className={threadStyles.replyRow}
      role="listitem"
      onMouseEnter={() => setActionsVisible(true)}
      onMouseLeave={() => setActionsVisible(false)}
    >
      <div
        className={cn(threadStyles.replyMeta, dark && threadStyles.replyMetaDark)}
      >
        <span>{formatReplyTime(reply.timestamp)}</span>
      </div>

      {editing ? (
        <>
          <textarea
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            className={cn(threadStyles.textarea, dark && threadStyles.textareaDark)}
            aria-label="Edit reply"
            onClick={(event) => event.stopPropagation()}
          />
          <div className={threadStyles.rowComposerActions}>
            <button
              type="button"
              className={threadStyles.secondaryBtn}
              onClick={() => {
                setDraft(reply.comment);
                setEditing(false);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className={threadStyles.primaryBtn}
              disabled={!draft.trim()}
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </>
      ) : (
        <p
          className={cn(threadStyles.replyText, dark && threadStyles.replyTextDark)}
        >
          {reply.comment}
        </p>
      )}

      {canModify && !editing && (
        <div
          className={cn(
            threadStyles.rowActions,
            actionsVisible && threadStyles.rowActionsVisible,
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className={cn(
              threadStyles.iconBtn,
              dark && threadStyles.iconBtnDark,
            )}
            aria-label="Edit reply"
            onClick={() => {
              setDraft(reply.comment);
              setEditing(true);
            }}
          >
            <PencilIcon />
          </button>
          <button
            type="button"
            className={cn(
              threadStyles.iconBtn,
              threadStyles.iconBtnDanger,
              dark && threadStyles.iconBtnDark,
            )}
            aria-label="Delete reply"
            onClick={() => deleteAnnotation(reply.id)}
          >
            <TrashIcon />
          </button>
        </div>
      )}
    </div>
  );
}

type CommentThreadProps<TState> = {
  rootAnnotation: CommentAnnotation<TState>;
  readOnly?: boolean;
  /** Attached below the annotation popup on the canvas overlay */
  variant?: "inline" | "overlay";
  dark?: boolean;
  onComposerClick?: (event: MouseEvent) => void;
};

export function CommentThread<TState>({
  rootAnnotation,
  readOnly = false,
  variant = "inline",
  dark = false,
  onComposerClick,
}: CommentThreadProps<TState>) {
  const { annotations, addReply } = useCommentStore<TState>();
  const [showComposer, setShowComposer] = useState(false);
  const [draft, setDraft] = useState("");

  const replies = getRepliesForParent(annotations, rootAnnotation.id);
  const isResolved = rootAnnotation.status === "resolved";
  const canModify = !readOnly && !isResolved;

  function handleSubmit() {
    const text = draft.trim();
    if (!text) return;
    addReply(rootAnnotation.id, text);
    setDraft("");
    setShowComposer(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    event.stopPropagation();
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
    if (event.key === "Escape") {
      setDraft("");
      setShowComposer(false);
    }
  }

  if (replies.length === 0 && !canModify) {
    return null;
  }

  const content = (
    <div
      className={threadStyles.root}
      onClick={(event) => event.stopPropagation()}
    >
      {replies.length > 0 && (
        <div
          className={cn(threadStyles.replies, dark && threadStyles.repliesDark)}
          role="list"
          aria-label="Replies"
        >
          {replies.map((reply) => (
            <ThreadReplyRow
              key={reply.id}
              reply={reply}
              canModify={canModify}
              dark={dark}
            />
          ))}
        </div>
      )}

      {canModify && (
        <>
          {!showComposer ? (
            <button
              type="button"
              className={cn(
                threadStyles.replyLink,
                dark && threadStyles.replyLinkDark,
              )}
              onClick={() => setShowComposer(true)}
            >
              Reply
            </button>
          ) : (
            <div onClick={onComposerClick}>
              <textarea
                autoFocus
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write a reply…"
                rows={2}
                className={cn(threadStyles.textarea, dark && threadStyles.textareaDark)}
                aria-label="Reply to comment"
              />
              <div className={threadStyles.composerActions}>
                <button
                  type="button"
                  className={threadStyles.secondaryBtn}
                  onClick={() => {
                    setDraft("");
                    setShowComposer(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={threadStyles.primaryBtn}
                  disabled={!draft.trim()}
                  onClick={handleSubmit}
                >
                  Reply
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  if (variant === "overlay") {
    return (
      <div
        className={dark ? threadStyles.threadPanelDark : threadStyles.threadPanel}
      >
        {content}
      </div>
    );
  }

  return content;
}
