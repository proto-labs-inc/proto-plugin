"use client";

import { PrototypeComponent } from "proto-plugin";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  getMonthGrid,
  isDateAvailable,
} from "./booking-mock-data";

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

type BookingMiniCalendarProps = {
  year?: number;
  month?: number;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  todayDotDate?: number;
  idPrefix?: string;
};

export function BookingMiniCalendar({
  year = 2026,
  month = 6,
  selectedDate,
  onSelectDate,
  todayDotDate = 5,
  idPrefix = "booking-mini-calendar",
}: BookingMiniCalendarProps) {
  const cells = getMonthGrid(year, month);
  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <PrototypeComponent id="booking-mini-calendar">
      <div className="w-full">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-emphasis text-sm font-medium">{monthLabel}</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="text-muted hover:bg-emphasis rounded p-1 transition"
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              className="text-muted hover:bg-emphasis rounded p-1 transition"
              aria-label="Next month"
            >
              <ChevronRight className="size-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-muted py-1 text-center text-[10px] font-medium uppercase tracking-wide"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map(({ date, inMonth }, index) => {
            if (!date || !inMonth) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const available = isDateAvailable(date);
            const selected =
              date.toDateString() === selectedDate.toDateString();
            const showDot = date.getDate() === todayDotDate;

            return (
              <PrototypeComponent
                key={date.toISOString()}
                id={`${idPrefix}.${date.getDate()}`}
                className="aspect-square"
              >
                <button
                  type="button"
                  disabled={!available}
                  onClick={() => available && onSelectDate(date)}
                  className={[
                    "relative flex size-full items-center justify-center rounded-md text-sm transition",
                    selected
                      ? "bg-brand-default text-brand font-medium"
                      : available
                        ? "bg-emphasis text-emphasis hover:bg-emphasis/80 font-medium"
                        : "text-muted cursor-default font-normal",
                  ].join(" ")}
                >
                  {date.getDate()}
                  {showDot ? (
                    <span className="bg-emphasis absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full" />
                  ) : null}
                </button>
              </PrototypeComponent>
            );
          })}
        </div>
      </div>
    </PrototypeComponent>
  );
}
