"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { AnimatePresence } from "motion/react";

import { BookingColumnTransition } from "./booking-motion";
import { BookingEventDetails, BookingCalLogo } from "./booking-event-details";
import { BookingHeaderControls } from "./booking-header-controls";
import { BookingMiniCalendar } from "./booking-mini-calendar";
import { BookingTimeFormatToggle } from "./booking-time-format-toggle";
import { BookingTimeSlot } from "./booking-time-slot";
import {
  BOOKING_MONDAY_SLOTS,
  formatBookingDayHeader,
  formatBookingTime,
} from "./booking-mock-data";
import type { BookingViewMode } from "./booking-flow-types";

type BookingMonthViewProps = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  selectedTime?: string;
  use24h: boolean;
  onUse24hChange: (value: boolean) => void;
  viewMode: BookingViewMode;
  onViewModeChange: (mode: BookingViewMode) => void;
  onSelectTime: (time: string) => void;
};

export function BookingMonthView({
  selectedDate,
  onSelectDate,
  use24h,
  onUse24hChange,
  viewMode,
  onViewModeChange,
  onSelectTime,
}: BookingMonthViewProps) {
  return (
    <PrototypeComponent
      id="booking-month-view"
      className="bg-muted flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto"
    >
      <div className="relative mx-auto flex w-full max-w-[960px] flex-1 flex-col px-4 py-10">
        <BookingHeaderControls
          embed
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />

        <div className="border-subtle bg-default mx-auto mt-12 w-full overflow-hidden rounded-2xl border shadow-sm">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)]">
            <div className="border-subtle border-b px-8 py-8 lg:border-b-0 lg:border-r">
              <BookingEventDetails compact />
            </div>

            <div className="border-subtle border-b px-6 py-8 lg:border-b-0 lg:border-r">
              <BookingMiniCalendar
                selectedDate={selectedDate}
                onSelectDate={onSelectDate}
                idPrefix="booking-month-view-day"
              />
            </div>

            <div className="flex min-h-[360px] flex-col px-6 py-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <AnimatePresence mode="wait">
                  <BookingColumnTransition key={selectedDate.toISOString()}>
                    <p className="text-emphasis text-sm font-semibold">
                      {formatBookingDayHeader(selectedDate)}
                    </p>
                  </BookingColumnTransition>
                </AnimatePresence>
                <BookingTimeFormatToggle use24h={use24h} onChange={onUse24hChange} compact />
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <AnimatePresence mode="wait">
                  <BookingColumnTransition
                    key={`${selectedDate.toISOString()}-slots`}
                    className="space-y-2"
                  >
                    {BOOKING_MONDAY_SLOTS.map((slot) => {
                      const normalized = formatBookingTime(
                        slot.hour,
                        slot.minute,
                        false,
                      );

                      return (
                        <BookingTimeSlot
                          key={`${slot.hour}-${slot.minute}`}
                          id={`booking-time-slot.${slot.hour}-${slot.minute}`}
                          hour={slot.hour}
                          minute={slot.minute}
                          use24h={use24h}
                          onSelect={() => onSelectTime(normalized)}
                        />
                      );
                    })}
                  </BookingColumnTransition>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <BookingCalLogo />
      </div>
    </PrototypeComponent>
  );
}