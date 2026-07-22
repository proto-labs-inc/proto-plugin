"use client";

import { cn } from "@prototype/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

/** Shared border/focus styling for prototype brief inputs (gallery modals + review sidebar). */
export const PROTOTYPE_BRIEF_FIELD_BORDER_CLASS =
  "border border-border shadow-none outline-none transition-colors placeholder:text-foreground/45 focus-visible:border-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-muted-foreground/20 focus-visible:ring-offset-0";

const BRIEF_TEXTAREA_BASE_CLASS =
  "w-full rounded-md bg-transparent px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-foreground/45";

const BRIEF_TEXTAREA_AUTO_SIZE_CLASS = "field-sizing-content resize-y";

const BRIEF_TEXTAREA_SCROLLABLE_CLASS = "resize-none overflow-y-auto";

export type PrototypeBriefTextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  minHeightClass?: string;
  /** Fixed height with internal scroll — for large pasted content (e.g. reference HTML). */
  scrollable?: boolean;
  heightClass?: string;
};

export function PrototypeBriefTextarea({
  className,
  minHeightClass = "min-h-[min(40vh,14rem)]",
  scrollable = false,
  heightClass = "h-[min(28vh,12rem)]",
  ...props
}: PrototypeBriefTextareaProps) {
  return (
    <textarea
      className={cn(
        BRIEF_TEXTAREA_BASE_CLASS,
        scrollable ? BRIEF_TEXTAREA_SCROLLABLE_CLASS : BRIEF_TEXTAREA_AUTO_SIZE_CLASS,
        scrollable ? heightClass : minHeightClass,
        PROTOTYPE_BRIEF_FIELD_BORDER_CLASS,
        className,
      )}
      {...props}
    />
  );
}
