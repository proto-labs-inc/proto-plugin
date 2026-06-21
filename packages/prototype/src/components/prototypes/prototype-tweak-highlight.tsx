"use client";

import { injectCaptureColorTokens } from "@prototype/lib/prototype-comments/core/capture-theme";
import { resolveAnnotationTargetById } from "@prototype/lib/prototype-comments/core/annotation-target";
import styles from "@prototype/lib/prototype-comments/ui/capture-styles.module.scss";
import { cn } from "@prototype/lib/utils";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type HighlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type PrototypeTweakHighlightProps = {
  targetId: string;
  onComplete: () => void;
};

/** Fade in, hold, then fade out. */
const HOLD_MS = 1500;
const FADE_MS = 250;

const HIGHLIGHT_BORDER =
  "color-mix(in srgb, var(--prototype-comment-color-blue) 60%, transparent)";
const HIGHLIGHT_FILL =
  "color-mix(in srgb, var(--prototype-comment-color-blue) 5%, transparent)";

function findTweakTarget(targetId: string): HTMLElement | null {
  const byExact = resolveAnnotationTargetById(targetId);
  if (byExact) return byExact;

  const screenshotRoot = document.querySelector("[data-prototype-screenshot]");
  return (
    screenshotRoot?.querySelector<HTMLElement>(
      `[data-prototype-target$=".${CSS.escape(targetId)}"]`,
    ) ?? null
  );
}

export function PrototypeTweakHighlight({
  targetId,
  onComplete,
}: PrototypeTweakHighlightProps) {
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<HighlightRect | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setMounted(true);
    injectCaptureColorTokens();
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const updateRect = () => {
      const element = findTweakTarget(targetId);
      if (!element) {
        setRect(null);
        return;
      }

      const nextRect = element.getBoundingClientRect();
      setRect({
        top: nextRect.top,
        left: nextRect.left,
        width: nextRect.width,
        height: nextRect.height,
      });
    };

    updateRect();

    const retryTimer = window.setInterval(updateRect, 50);
    const stopRetryTimer = window.setTimeout(
      () => window.clearInterval(retryTimer),
      400,
    );

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const holdMs = reducedMotion ? 120 : HOLD_MS;
    const fadeMs = reducedMotion ? 0 : FADE_MS;

    const exitTimer = window.setTimeout(() => setIsExiting(true), holdMs + fadeMs);
    const completeTimer = window.setTimeout(
      onComplete,
      holdMs + fadeMs * 2,
    );

    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);

    return () => {
      window.clearInterval(retryTimer);
      window.clearTimeout(stopRetryTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(completeTimer);
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [mounted, onComplete, targetId]);

  if (!mounted || !rect) return null;

  return createPortal(
    <div
      aria-hidden
      data-prototype-comment-accent="blue"
      className={cn(
        styles.singleSelectOutline,
        isExiting ? styles.exit : styles.enter,
        "z-[1045] motion-reduce:transition-none",
      )}
      style={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        borderColor: HIGHLIGHT_BORDER,
        backgroundColor: HIGHLIGHT_FILL,
        animationDuration: `${FADE_MS}ms`,
      }}
    />,
    document.body,
  );
}
