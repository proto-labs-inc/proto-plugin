"use client";

import { cn } from "@prototype/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import {
  createContext,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

const PanelSelectContext = createContext<(() => void) | null>(null);

export function usePanelSelectClose() {
  return useContext(PanelSelectContext);
}

type PanelSelectProps = {
  label: string;
  valueLabel: string;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
};

export function PanelSelect({
  label,
  valueLabel,
  children,
  className,
  defaultOpen = false,
}: PanelSelectProps) {
  const [open, setOpen] = useState(defaultOpen);
  const close = () => setOpen(false);

  return (
    <PanelSelectContext.Provider value={close}>
      <div className={cn("relative", className)}>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="listbox"
          className="flex h-8 min-w-0 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-sm text-foreground shadow-sm transition-colors duration-200 ease hover:bg-muted"
          onClick={(event) => {
            event.stopPropagation();
            setOpen((current) => !current);
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="truncate font-medium">{valueLabel}</span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>
        {open ? (
          <div
            role="listbox"
            className="absolute top-full left-0 z-50 mt-1 min-w-[10rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
            onPointerDown={(event) => event.stopPropagation()}
          >
            {children}
          </div>
        ) : null}
      </div>
    </PanelSelectContext.Provider>
  );
}

type PanelMenuItemProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "onSelect"
> & {
  selected?: boolean;
  onSelect?: () => void;
  children: ReactNode;
};

export function PanelMenuItem({
  selected = false,
  className,
  children,
  onSelect,
  onClick,
  ...props
}: PanelMenuItemProps) {
  const closePanelSelect = usePanelSelectClose();

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      className={cn(
        "flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
        selected && "bg-accent text-accent-foreground",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          onSelect?.();
          closePanelSelect?.();
        }
      }}
      {...props}
    >
      <span className="min-w-0 flex-1 truncate text-left">{children}</span>
      {selected ? (
        <Check className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
      ) : null}
    </button>
  );
}

export function PanelMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("-mx-1 my-1 h-px bg-border", className)} role="separator" />;
}
