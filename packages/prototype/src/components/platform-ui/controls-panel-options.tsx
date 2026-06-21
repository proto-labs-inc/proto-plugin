"use client";

import { cn } from "@prototype/lib/utils";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

/** Flat option list for the review toolbar controls panel (no nested dropdown). */
export function ControlsPanelOptionGroup({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {title ? (
        <p className="px-2.5 pb-0.5 text-[11px] font-medium tracking-wide text-black/45 uppercase">
          {title}
        </p>
      ) : null}
      {children}
    </div>
  );
}

type ControlsPanelOptionProps = {
  children: ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
};

export function ControlsPanelOption({
  children,
  selected = false,
  onSelect,
  className,
}: ControlsPanelOptionProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-black/88 outline-none transition-colors duration-200 ease hover:bg-black/[0.06] hover:text-black/92 focus-visible:ring-2 focus-visible:ring-black/20",
        selected && "bg-black/[0.08] font-medium text-black/92",
        className,
      )}
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.();
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {selected ? (
        <Check className="size-3.5 shrink-0 text-black/55" strokeWidth={2.5} aria-hidden />
      ) : null}
    </button>
  );
}

export function ControlsPanelOptionSeparator({ className }: { className?: string }) {
  return (
    <div
      role="separator"
      className={cn("my-1 h-px bg-black/10", className)}
    />
  );
}
