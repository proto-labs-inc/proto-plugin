"use client";

import { cn } from "@prototype/lib/utils";
import type { ReactNode } from "react";

export type DesignExplorationVariantPreviewLayout = "inline" | "overlay";

export type DesignExplorationVariantPreviewShellProps = {
  /** Use `overlay` when the variant uses absolute positioning on the live page. */
  layout?: DesignExplorationVariantPreviewLayout;
  children: ReactNode;
  className?: string;
};

/**
 * Hosts a variant inside the design-brief preview card. Overlay layouts get a
 * positioned shell so absolutely placed controls remain visible in the sidebar.
 */
export function DesignExplorationVariantPreviewShell({
  layout = "inline",
  children,
  className,
}: DesignExplorationVariantPreviewShellProps) {
  const isOverlay = layout === "overlay";

  return (
    <div
      className={cn(
        "relative bg-white",
        isOverlay ? "h-full w-full" : "w-full px-2 py-3",
        className,
      )}
    >
      {isOverlay ? (
        <div
          className="from-muted/25 to-muted/5 pointer-events-none absolute inset-0 bg-gradient-to-b"
          aria-hidden
        />
      ) : null}
      {children}
    </div>
  );
}
