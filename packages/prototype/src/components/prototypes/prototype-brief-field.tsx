"use client";

import { cn } from "@prototype/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

/** Shared border/focus styling for prototype brief inputs (gallery modals + review sidebar). */
export const PROTOTYPE_BRIEF_FIELD_BORDER_CLASS =
  "border border-border shadow-none outline-none transition-colors focus-visible:border-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-muted-foreground/20 focus-visible:ring-offset-0";

const BRIEF_TEXTAREA_BASE_CLASS =
  "field-sizing-content w-full resize-y rounded-md bg-transparent px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground";

export type PrototypeBriefTextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  minHeightClass?: string;
};

export function PrototypeBriefTextarea({
  className,
  minHeightClass = "min-h-[min(40vh,14rem)]",
  ...props
}: PrototypeBriefTextareaProps) {
  return (
    <textarea
      className={cn(
        BRIEF_TEXTAREA_BASE_CLASS,
        minHeightClass,
        PROTOTYPE_BRIEF_FIELD_BORDER_CLASS,
        className,
      )}
      {...props}
    />
  );
}
