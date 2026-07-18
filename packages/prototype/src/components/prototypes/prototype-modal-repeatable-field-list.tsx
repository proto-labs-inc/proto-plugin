"use client";

import { Button } from "@prototype/components/ui/button";
import { Minus, Plus } from "lucide-react";
import type { ReactNode } from "react";

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
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => {
        const label = itemLabel(index, items.length);
        const update = (patch: Partial<TItem>) =>
          onChange(
            items.map((entry) =>
              entry.id === item.id ? { ...entry, ...patch } : entry,
            ),
          );

        return (
          <div
            key={item.id}
            className="flex flex-col gap-2 rounded-md border border-border p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {label}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground"
                aria-label={`Remove ${label}`}
                onClick={() =>
                  onChange(items.filter((entry) => entry.id !== item.id))
                }
              >
                <Minus size={16} strokeWidth={2} aria-hidden />
              </Button>
            </div>
            {renderItem(item, update)}
          </div>
        );
      })}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-fit gap-1.5 px-2 text-muted-foreground"
        onClick={() => onChange([...items, createItem()])}
      >
        <Plus size={14} strokeWidth={2} aria-hidden />
        {addLabel}
      </Button>
    </div>
  );
}
