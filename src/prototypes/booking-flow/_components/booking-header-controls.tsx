"use client";

import { Button } from "@calcom/ui/components/button";
import Icon from "@calcom/ui/components/icon/Icon";
import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { Calendar, Globe, LayoutGrid, List } from "lucide-react";

import type { BookingViewMode } from "./booking-flow-types";

type BookingHeaderControlsProps = {
  embed?: boolean;
  viewMode: BookingViewMode;
  onViewModeChange: (mode: BookingViewMode) => void;
};

export function BookingHeaderControls({
  embed = false,
  viewMode,
  onViewModeChange,
}: BookingHeaderControlsProps) {
  if (embed) {
    return (
      <PrototypeComponent
        id="booking-header-controls"
        className="absolute right-0 top-0 flex items-center gap-2"
      >
        <Button color="primary" size="sm">
          Need help?
        </Button>
        <ViewModeButton
          active={viewMode === "month"}
          label="Month view"
          onClick={() => onViewModeChange("month")}
        >
          <Calendar className="size-4" strokeWidth={1.75} />
        </ViewModeButton>
        <ViewModeButton
          active={viewMode === "week"}
          label="Week view"
          onClick={() => onViewModeChange("week")}
        >
          <LayoutGrid className="size-4" strokeWidth={1.75} />
        </ViewModeButton>
        <ViewModeButton
          active={viewMode === "list"}
          label="List view"
          onClick={() => onViewModeChange("list")}
        >
          <Globe className="size-4" strokeWidth={1.75} />
        </ViewModeButton>
      </PrototypeComponent>
    );
  }

  return null;
}

type BookingMainToolbarProps = {
  weekRangeLabel: string;
  overlayCalendar: boolean;
  onOverlayCalendarChange: (value: boolean) => void;
  use24h: boolean;
  onUse24hChange: (value: boolean) => void;
  viewMode: BookingViewMode;
  onViewModeChange: (mode: BookingViewMode) => void;
};

export const BookingMainToolbar = function BookingMainToolbar({
  weekRangeLabel,
  overlayCalendar,
  onOverlayCalendarChange,
  use24h,
  onUse24hChange,
  viewMode,
  onViewModeChange,
}: BookingMainToolbarProps) {
  return (
    <PrototypeComponent
      id="booking-header-controls"
      className="border-subtle flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="text-muted hover:bg-emphasis rounded p-1.5 transition"
          aria-label="Previous week"
        >
          <Icon name="chevron-left" size={16} />
        </button>
        <p className="text-emphasis text-sm font-medium">{weekRangeLabel}</p>
        <button
          type="button"
          className="text-muted hover:bg-emphasis rounded p-1.5 transition"
          aria-label="Next week"
        >
          <Icon name="chevron-right" size={16} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="text-default flex items-center gap-2 text-sm">
          <span>Overlay my calendar</span>
          <button
            type="button"
            role="switch"
            aria-checked={overlayCalendar}
            onClick={() => onOverlayCalendarChange(!overlayCalendar)}
            className={[
              "relative inline-flex h-5 w-9 shrink-0 rounded-full transition",
              overlayCalendar ? "bg-brand-default" : "bg-emphasis",
            ].join(" ")}
          >
            <span
              className={[
                "bg-default absolute top-0.5 size-4 rounded-full shadow-sm transition",
                overlayCalendar ? "left-[18px]" : "left-0.5",
              ].join(" ")}
            />
          </button>
        </label>

        <button
          type="button"
          className="text-muted hover:bg-emphasis rounded-md p-2 transition"
          aria-label="Settings"
        >
          <Icon name="settings" size={16} />
        </button>

        <div className="bg-subtle flex rounded-lg p-0.5">
          {(["12h", "24h"] as const).map((format) => {
            const active = (format === "24h") === use24h;
            return (
              <button
                key={format}
                type="button"
                onClick={() => onUse24hChange(format === "24h")}
                className={[
                  "rounded-md px-2.5 py-1 text-xs font-medium transition",
                  active
                    ? "bg-default text-emphasis shadow-outline-gray-rested"
                    : "text-subtle",
                ].join(" ")}
              >
                {format}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <ViewModeButton
            active={viewMode === "week"}
            label="Grid view"
            onClick={() => onViewModeChange("week")}
          >
            <LayoutGrid className="size-4" strokeWidth={1.75} />
          </ViewModeButton>
          <ViewModeButton
            active={viewMode === "list"}
            label="List view"
            onClick={() => onViewModeChange("list")}
          >
            <List className="size-4" strokeWidth={1.75} />
          </ViewModeButton>
        </div>
      </div>
    </PrototypeComponent>
  );
}

function ViewModeButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={[
        "border-subtle inline-flex size-9 items-center justify-center rounded-lg border transition",
        active ? "bg-emphasis text-emphasis" : "bg-default text-muted hover:bg-emphasis",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
