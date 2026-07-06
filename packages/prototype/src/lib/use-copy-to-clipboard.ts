"use client";

import { copyTextWithAttachments } from "@prototype/lib/copy-text-with-attachments";
import { cn } from "@prototype/lib/utils";
import { CheckIcon, CopyIcon, SaveIcon } from "lucide-react";
import { createElement, useCallback, useRef, useState } from "react";

type CopyState = "idle" | "scaling-out" | "copied" | "reverting-out" | null;

const SCALE_OUT_MS = 200;
const COPIED_MS = 1500;

// Hook to copy text to clipboard with a cooldown. the cooldownTime is the time
// in milliseconds before the isCopied state is reset to false. This is useful
// to display UI that the value was copied.
export default function useCopyToClipboard({
  cooldownTime = COPIED_MS,
  idleIcon = "copy",
}: {
  cooldownTime?: number;
  idleIcon?: "copy" | "save";
} = {}) {
  const [state, setState] = useState<CopyState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isCopied = state === "copied" || state === "reverting-out";

  const copy = useCallback(
    async (text: string) => {
      clearTimeout(timerRef.current);
      setState("idle");

      const idle = () => {
        setState("idle");
      };

      const revert = () => {
        setState("reverting-out");
        timerRef.current = setTimeout(idle, SCALE_OUT_MS);
      };

      const copied = () => {
        setState("copied");
        timerRef.current = setTimeout(revert, cooldownTime);
      };

      const didCopy = await copyTextWithAttachments(text);
      if (!didCopy) return;

      setState("scaling-out");
      timerRef.current = setTimeout(copied, SCALE_OUT_MS);
    },
    [cooldownTime],
  );

  const icon = isCopied
    ? createElement(CheckIcon, {
        size: 13,
        strokeWidth: 2,
        className: cn(
          "motion-reduce:animate-none",
          state === "copied" && "animate-blur-scale-in",
          state === "reverting-out" && "animate-blur-scale-out",
        ),
      })
    : createElement(idleIcon === "save" ? SaveIcon : CopyIcon, {
        size: 13,
        className: cn(
          "motion-reduce:animate-none",
          state === "idle" && "animate-blur-scale-in",
          state === "scaling-out" && "animate-blur-scale-out",
        ),
      });

  return { isCopied, copy, icon };
}
