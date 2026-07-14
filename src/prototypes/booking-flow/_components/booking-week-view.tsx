"use client";

import { PrototypeComponent } from "proto-plugin";

import { BookingEventSidebar } from "./booking-event-details";
import { BookingMainToolbar } from "./booking-header-controls";
import { BookingMiniCalendar } from "./booking-mini-calendar";
import {
  BOOKING_BUSY_BLOCKS,
  BOOKING_WEEK_START,
  formatWeekRange,
  isWeekend,
} from "./booking-mock-data";
import type { BookingViewMode } from "./booking-flow-types";

const WEEK_DAYS = Array.from({ length: 7 }, (_, index) => {
  const date = new Date(BOOKING_WEEK_START);
  date.setDate(date.getDate() + index);
  return date;
});

const HOUR_LABELS = [
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0,
];

type BookingWeekViewProps = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  use24h: boolean;
  onUse24hChange: (value: boolean) => void;
  overlayCalendar: boolean;
  onOverlayCalendarChange: (value: boolean) => void;
  viewMode: BookingViewMode;
  onViewModeChange: (mode: BookingViewMode) => void;
  onSelectSlot: (date: Date, hour: number, minute: number) => void;
  dimmed?: boolean;
};

export function BookingWeekView({
  selectedDate,
  onSelectDate,
  use24h,
  onUse24hChange,
  overlayCalendar,
  onOverlayCalendarChange,
  viewMode,
  onViewModeChange,
  onSelectSlot,
  dimmed = false,
}: BookingWeekViewProps) {
  return (
    <PrototypeComponent
      id="booking-week-view"
      className={[
        "bg-default flex h-full min-h-0 w-full flex-1",
        dimmed ? "pointer-events-none select-none" : "",
      ].join(" ")}
    >
      <BookingEventSidebar selectedDate={selectedDate}>
        <BookingMiniCalendar selectedDate={selectedDate} onSelectDate={onSelectDate} />
      </BookingEventSidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        <BookingMainToolbar
          weekRangeLabel={formatWeekRange(BOOKING_WEEK_START)}
          overlayCalendar={overlayCalendar}
          onOverlayCalendarChange={onOverlayCalendarChange}
          use24h={use24h}
          onUse24hChange={onUse24hChange}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />

        <div className="min-h-0 flex-1 overflow-auto">
          <div className="grid min-w-[760px] grid-cols-[56px_repeat(7,minmax(0,1fr))]">
            <div className="border-subtle border-b" />
            {WEEK_DAYS.map((date) => (
              <div
                key={date.toISOString()}
                className="border-subtle text-muted border-b px-2 py-3 text-center text-[11px] font-medium uppercase tracking-wide"
              >
                {date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3)}{" "}
                {date.getDate().toString().padStart(2, "0")}
              </div>
            ))}

            {HOUR_LABELS.map((hour) => (
              <HourRow
                key={hour}
                hour={hour}
                use24h={use24h}
                onSelectSlot={onSelectSlot}
              />
            ))}

            <CurrentTimeIndicator />
          </div>
        </div>
      </div>
    </PrototypeComponent>
  );
}

function HourRow({
  hour,
  use24h,
  onSelectSlot,
}: {
  hour: number;
  use24h: boolean;
  onSelectSlot: (date: Date, hour: number, minute: number) => void;
}) {
  const label = use24h
    ? `${hour.toString().padStart(2, "0")}:00`
    : `${hour % 12 || 12}:00${hour >= 12 ? "pm" : "am"}`;

  return (
    <>
      <div className="border-subtle text-muted border-b px-2 py-6 text-right text-[11px]">
        {label}
      </div>
      {WEEK_DAYS.map((date, dayIndex) => {
        const weekend = isWeekend(date);
        const busy = BOOKING_BUSY_BLOCKS.find((block) => block.dayOffset === dayIndex);

        return (
          <div
            key={`${date.toISOString()}-${hour}`}
            className="border-subtle relative border-b border-r"
          >
            {weekend ? (
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, var(--cal-bg-emphasis) 0, var(--cal-bg-emphasis) 1px, transparent 1px, transparent 8px)",
                }}
              />
            ) : null}

            {busy && hour >= busy.startHour && hour < busy.endHour ? (
              <div className="absolute inset-x-1 top-2 bottom-2 overflow-hidden rounded-md border border-[var(--cal-border-subtle)] bg-[var(--cal-bg-muted)]">
                <div className="border-semantic-success-emphasis bg-semantic-success-emphasis absolute inset-y-1 left-0 w-1 rounded-full" />
                <div
                  className="absolute inset-0 opacity-50"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg, var(--cal-bg-emphasis) 0, var(--cal-bg-emphasis) 1px, transparent 1px, transparent 8px)",
                  }}
                />
                <div className="relative px-3 py-2">
                  <p className="text-emphasis text-xs font-medium">{busy.label}</p>
                  <p className="text-subtle text-[11px]">{busy.timeLabel}</p>
                </div>
              </div>
            ) : null}

            {!weekend && !busy ? (
              <button
                type="button"
                className="hover:bg-emphasis/40 absolute inset-0"
                onClick={() => onSelectSlot(date, 17, 15)}
                aria-label="Select available slot"
              />
            ) : null}
          </div>
        );
      })}
    </>
  );
}

function CurrentTimeIndicator() {
  return (
    <>
      <div className="relative border-b py-3 pr-2 text-right">
        <span className="text-emphasis bg-default relative z-10 inline-block px-1 text-[11px] font-medium">
          8:20pm
        </span>
      </div>
      {WEEK_DAYS.map((date) => (
        <div key={`line-${date.toISOString()}`} className="relative border-b">
          <div className="bg-emphasis absolute inset-x-0 top-[18px] z-10 h-px" />
        </div>
      ))}
    </>
  );
}
