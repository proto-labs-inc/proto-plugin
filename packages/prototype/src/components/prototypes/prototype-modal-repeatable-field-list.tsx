"use client";

import { Button } from "@prototype/components/ui/button";
import { cn } from "@prototype/lib/utils";
import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export type RepeatableFieldItem = { id: string };

export type RepeatableFieldListProps<TItem extends RepeatableFieldItem> = {
  items: TItem[];
  onChange: (items: TItem[]) => void;
  /** Factory for a fresh, empty item appended when the user clicks add. */
  createItem: () => TItem;
  /** Label shown for the add-new button (e.g. "Add doc"). */
  addLabel: string;
  /** Per-item header label. Receives the item's index and the total count. */
  itemLabel: (index: number, total: number) => string;
  /** Render the fields for one item. `update` patches that item in place. */
  renderItem: (item: TItem, update: (patch: Partial<TItem>) => void) => ReactNode;
};

const EXIT_MS = 200;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type RepeatableFieldItemCardProps = {
  label: string;
  isLast: boolean;
  onRemove: () => void;
  children: ReactNode;
};

function RepeatableFieldItemCard({
  label,
  isLast,
  onRemove,
  children,
}: RepeatableFieldItemCardProps) {
  const [exiting, setExiting] = useState(false);
  const onRemoveRef = useRef(onRemove);
  onRemoveRef.current = onRemove;

  useEffect(() => {
    if (!exiting) return;
    const timer = window.setTimeout(() => onRemoveRef.current(), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [exiting]);

  const handleRemove = () => {
    if (exiting) return;
    if (prefersReducedMotion()) {
      onRemove();
      return;
    }
    setExiting(true);
  };

  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity] ease-out motion-reduce:transition-none",
        exiting ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
      )}
      style={{ transitionDuration: `${EXIT_MS}ms` }}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={cn(
            "animate-in fade-in-0 slide-in-from-top-1 duration-200 motion-reduce:animate-none",
            !isLast && "pb-3",
          )}
        >
          <div
            className={cn(
              "flex flex-col gap-3 rounded-lg border border-border/70 bg-muted/40 p-3.5",
              "transition-[opacity,transform] duration-200 ease-out",
              exiting && "pointer-events-none -translate-y-0.5 scale-[0.99]",
            )}
          >
            <div className="-mt-0.5 flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {label}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "size-7 shrink-0 text-muted-foreground",
                  "hover:bg-destructive/10 hover:text-destructive",
                  "focus-visible:ring-destructive/30",
                )}
                aria-label={`Remove ${label}`}
                onClick={handleRemove}
              >
                <X size={14} strokeWidth={2} aria-hidden />
              </Button>
            </div>
            <div className="flex flex-col gap-3">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Bordered add/remove list chrome shared by the gallery create modals. Owns the
 * card wrapper, per-item header + remove button, and the add-new button; callers
 * supply the item fields via `renderItem` and patch state through `update`.
 */
export function RepeatableFieldList<TItem extends RepeatableFieldItem>({
  items,
  onChange,
  createItem,
  addLabel,
  itemLabel,
  renderItem,
}: RepeatableFieldListProps<TItem>) {
  const itemsRef = useRef(items);
  itemsRef.current = items;

  return (
    <div className="flex flex-col">
      {items.map((item, index) => {
        const label = itemLabel(index, items.length);
        const update = (patch: Partial<TItem>) =>
          onChange(
            itemsRef.current.map((entry) =>
              entry.id === item.id ? { ...entry, ...patch } : entry,
            ),
          );

        return (
          <RepeatableFieldItemCard
            key={item.id}
            label={label}
            isLast={index === items.length - 1}
            onRemove={() =>
              onChange(
                itemsRef.current.filter((entry) => entry.id !== item.id),
              )
            }
          >
            {renderItem(item, update)}
          </RepeatableFieldItemCard>
        );
      })}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-fit gap-1.5 px-2 text-muted-foreground",
          items.length > 0 && "mt-3",
          "hover:bg-muted/60 hover:text-foreground",
        )}
        onClick={() => onChange([...itemsRef.current, createItem()])}
      >
        <Plus size={14} strokeWidth={2} aria-hidden />
        {addLabel}
      </Button>
    </div>
  );
}
