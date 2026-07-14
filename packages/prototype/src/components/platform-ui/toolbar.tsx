"use client";

import { cn } from "@prototype/lib/utils";
import type { ReactNode } from "react";

export function Toolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ToolbarGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>{children}</div>
  );
}

export { IconButton as ToolbarButton } from "./icon-button";
