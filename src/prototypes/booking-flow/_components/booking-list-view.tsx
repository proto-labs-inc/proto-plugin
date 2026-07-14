"use client";

import { PrototypeComponent } from "proto-plugin";

import { BookingEventSidebar } from "./booking-event-details";
import { BookingMainToolbar } from "./booking-header-controls";
import { BookingMiniCalendar } from "./booking-mini-calendar";
import { BookingTimeSlot } from "./booking-time-slot";
import {
  BOOKING_LIST_DAYS,
  BOOKING_WEEK_START,
  formatBookingDayHeader,
  formatWeekRange,
  getListViewSlots,
} from "./booking-mock-data";
import type { BookingViewMode } from "./booking-flow-types";

type BookingListViewProps = {
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

export function BookingListView({
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
}: BookingListViewProps) {
  return (
    <PrototypeComponent
      id="booking-list-view"
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

        <div className="min-h-0 flex-1 overflow-auto px-6 py-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {BOOKING_LIST_DAYS.map((date, dayIndex) => (
              <div key={date.toISOString()} className="min-w-[120px]">
                <p className="text-emphasis mb-3 text-xs font-semibold uppercase tracking-wide">
                  {formatBookingDayHeader(date)}
                </p>
                <div className="space-y-2">
                  {getListViewSlots(dayIndex).slice(0, 12).map((slot) => (
                    <BookingTimeSlot
                      key={`${date.toISOString()}-${slot.hour}-${slot.minute}`}
                      id={`booking-time-slot.${dayIndex}-${slot.hour}-${slot.minute}`}
                      hour={slot.hour}
                      minute={slot.minute}
                      use24h={use24h}
                      onSelect={() => onSelectSlot(date, slot.hour, slot.minute)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PrototypeComponent>
  );
}
