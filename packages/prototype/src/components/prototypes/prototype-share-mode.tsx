"use client";

import {
  getPrototypeTargetElement,
  getPrototypeTargetIdFromElement,
} from "@prototype/components/prototypes/prototype-target";
import { buildCommentCaptureCursorStyles, isCommentCaptureBlockedTarget } from "@prototype/lib/prototype-comments/core/comment-capture-blocked";
import { deepElementFromPoint } from "@prototype/lib/prototype-comments/core/annotation-target";
import { injectCaptureColorTokens } from "@prototype/lib/prototype-comments/core/capture-theme";
import { useCommentCaptureBridgeOptional } from "@prototype/lib/prototype-comments/react/CommentCaptureToolbar";
import styles from "@prototype/lib/prototype-comments/ui/capture-styles.module.scss";
import { usePrototypeCommentRegistry } from "@prototype/lib/prototypes/prototype-comment-registry";
import { usePrototypeReview } from "@prototype/lib/prototypes/prototype-review-context";
import { buildComponentShareLink } from "@prototype/lib/prototypes/prototype-share-link";
import { cn } from "@prototype/lib/utils";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import {
  PrototypeTargetHighlightLayer,
  toHighlightPortalStyle,
  useHighlightPortalContainer,
} from "./prototype-target-highlight-layer";

export function PrototypeShareMode() {
  const review = usePrototypeReview();
  const bridge = useCommentCaptureBridgeOptional();
  const { readHandlers } = usePrototypeCommentRegistry();
  const highlightPortal = useHighlightPortalContainer();
  const [mounted, setMounted] = useState(false);
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    injectCaptureColorTokens();
  }, []);

  useEffect(() => {
    if (!review.shareModeActive) return;
    if (bridge?.isCommentModeActive) {
      bridge.onEnterCommentMode();
    }
  }, [bridge, review.shareModeActive]);

  useEffect(() => {
    if (bridge?.isCommentModeActive && review.shareModeActive) {
      review.exitShareMode();
    }
  }, [bridge, review]);

  useEffect(() => {
    if (!review.shareModeActive) {
      setHoverRect(null);
      setHoverLabel(null);
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const target = (event.composedPath()[0] || event.target) as HTMLElement;
      if (isCommentCaptureBlockedTarget(target)) {
        setHoverRect(null);
        setHoverLabel(null);
        return;
      }

      const elementUnder = deepElementFromPoint(event.clientX, event.clientY);
      if (!elementUnder || isCommentCaptureBlockedTarget(elementUnder)) {
        setHoverRect(null);
        setHoverLabel(null);
        return;
      }

      const anchor = getPrototypeTargetElement(elementUnder);
      if (!anchor) {
        setHoverRect(null);
        setHoverLabel(null);
        return;
      }

      setHoverRect(anchor.getBoundingClientRect());
      setHoverLabel(anchor.getAttribute("data-element"));
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [review.shareModeActive]);

  useEffect(() => {
    if (!review.shareModeActive) return;

    const handleClick = (event: MouseEvent) => {
      const target = (event.composedPath()[0] || event.target) as HTMLElement;
      if (isCommentCaptureBlockedTarget(target)) return;

      const elementUnder = deepElementFromPoint(event.clientX, event.clientY);
      if (!elementUnder || isCommentCaptureBlockedTarget(elementUnder)) return;

      const anchor = getPrototypeTargetElement(elementUnder);
      const targetId = getPrototypeTargetIdFromElement(elementUnder);
      if (!anchor || !targetId) {
        toast.error("Select a prototype component to share");
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const handlers = readHandlers();
      const liveState = handlers?.getLiveState() ?? {};
      const shareLink = buildComponentShareLink(targetId, liveState, {
        commentId: bridge?.selectedId,
      });

      void navigator.clipboard
        .writeText(shareLink)
        .then(() => {
          toast.success("Component link copied", {
            description: "Paste the link to share this view.",
            duration: 3000,
          });
          review.exitShareMode();
        })
        .catch(() => {
          toast.error("Could not copy to clipboard");
        });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        review.exitShareMode();
      }
    };

    document.addEventListener("click", handleClick, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [readHandlers, review]);

  useEffect(() => {
    if (!review.shareModeActive) return;

    const style = document.createElement("style");
    style.id = "prototype-share-mode-cursor";
    style.textContent = buildCommentCaptureCursorStyles();
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, [review.shareModeActive]);

  if (!mounted || !review.shareModeActive) return null;

  const portalHoverRect =
    hoverRect != null
      ? toHighlightPortalStyle(hoverRect, highlightPortal)
      : null;

  return createPortal(
    <>
      <PrototypeTargetHighlightLayer marker="share">
        {portalHoverRect ? (
          <div
            aria-hidden
            className={cn(styles.singleSelectOutline, styles.enter)}
            style={{
              left: portalHoverRect.left,
              top: portalHoverRect.top,
              width: portalHoverRect.width,
              height: portalHoverRect.height,
            }}
          />
        ) : null}
      </PrototypeTargetHighlightLayer>

      <div
        data-prototype-share-hint
        className="pointer-events-auto fixed bottom-20 left-1/2 z-[1051] flex -translate-x-1/2 items-center gap-2 rounded-lg bg-card px-3 py-2 shadow-md ring-[0.5px] ring-border"
      >
        <span className="text-xs text-foreground">
          {hoverLabel
            ? `Click to copy link to ${hoverLabel}`
            : "Click a component to copy its link"}
        </span>
        <button
          type="button"
          aria-label="Exit share mode"
          className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors duration-200 ease"
          onClick={review.exitShareMode}
        >
          <X size={14} />
        </button>
      </div>
    </>,
    document.body,
  );
}
