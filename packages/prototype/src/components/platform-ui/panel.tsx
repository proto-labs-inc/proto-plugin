"use client";

import { cn } from "@prototype/lib/utils";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
  className?: string;
};

export function Panel({ children, className }: PanelProps) {
  return (
    <div className={cn("flex flex-col gap-0", className)}>{children}</div>
  );
}

type PanelSectionProps = {
  title: ReactNode;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
};

export function PanelSection({
  title,
  expanded,
  onExpandedChange,
  children,
  className,
  headerClassName,
}: PanelSectionProps) {
  return (
    <section className={cn("border-t border-border", className)}>
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-foreground transition-colors duration-200 ease hover:text-foreground",
          headerClassName,
        )}
        aria-expanded={expanded}
        onClick={() => onExpandedChange(!expanded)}
      >
        {title}
        <ChevronDown
          className={cn(
            "tool-panel-section-chevron size-4 shrink-0 text-muted-foreground",
            expanded && "is-expanded",
          )}
          aria-hidden
        />
      </button>
      <div
        className={cn("tool-panel-section-content", expanded && "is-expanded")}
      >
        <div className="overflow-hidden">
          <PanelBody>{children}</PanelBody>
        </div>
      </div>
    </section>
  );
}

export function PanelBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-3 pb-3 text-sm text-muted-foreground", className)}>
      {children}
    </div>
  );
}

export function PanelHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-lg font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}
