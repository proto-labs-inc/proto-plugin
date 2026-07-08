"use client";

import Icon from "@calcom/ui/components/icon/Icon";
import { Avatar } from "@calcom/ui/components/avatar";
import { PrototypeComponent } from "proto-plugin";
import { ChevronDown } from "lucide-react";

import {
  BOOKING_EVENT,
  BOOKING_HOST,
  formatBookingDateLong,
  formatBookingTime,
  formatSlotRange,
  parseTimeLabel,
} from "./booking-mock-data";

type BookingEventDetailsProps = {
  selectedDate?: Date;
  selectedTime?: string;
  use24h?: boolean;
  showDateTime?: boolean;
  compact?: boolean;
};

function BookingEventDetails({
  selectedDate,
  selectedTime,
  use24h = false,
  showDateTime = false,
  compact = false,
}: BookingEventDetailsProps) {
  const slot =
    selectedDate && selectedTime
      ? parseTimeLabel(selectedTime)
      : null;

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex items-center gap-3">
        <Avatar
          alt={BOOKING_HOST.name}
          imageSrc={BOOKING_HOST.avatarUrl}
          size="md"
          className="border-subtle border"
        />
        <p className="text-subtle text-sm font-normal">{BOOKING_HOST.name}</p>
      </div>

      <h1
        className={
          compact
            ? "font-cal text-emphasis text-xl font-semibold"
            : "font-cal text-emphasis text-2xl font-semibold"
        }
      >
        {BOOKING_EVENT.title}
      </h1>

      <ul className="space-y-3">
        {showDateTime && selectedDate && slot ? (
          <li className="flex gap-3">
            <Icon name="calendar" className="text-muted mt-0.5 shrink-0" size={16} />
            <div className="text-default text-sm">
              <p>{formatBookingDateLong(selectedDate)}</p>
              <p className="text-subtle mt-0.5">
                {formatSlotRange(
                  selectedDate,
                  slot.hour,
                  slot.minute,
                  BOOKING_EVENT.durationMinutes,
                  use24h,
                )}
              </p>
            </div>
          </li>
        ) : null}

        <li className="text-default flex items-center gap-3 text-sm">
          <Icon name="clock" className="text-muted shrink-0" size={16} />
          <span>{BOOKING_EVENT.durationMinutes}m</span>
        </li>
        <li className="text-default flex items-center gap-3 text-sm">
          <Icon name="video" className="text-muted shrink-0" size={16} />
          <span>{BOOKING_EVENT.location}</span>
        </li>
        <li className="text-default flex items-center gap-3 text-sm">
          <Icon name="globe" className="text-muted shrink-0" size={16} />
          <button
            type="button"
            className="hover:bg-emphasis inline-flex items-center gap-1 rounded-md px-0.5 transition"
          >
            <span>{BOOKING_EVENT.timezone}</span>
            <ChevronDown className="text-muted size-3.5" strokeWidth={2} />
          </button>
        </li>
      </ul>
    </div>
  );
}

export function BookingCalLogo() {
  return (
    <PrototypeComponent id="booking-event-details.booking-cal-logo" className="flex justify-center py-6">
      <span className="font-cal text-emphasis text-lg font-bold tracking-tight">
        Cal.com
      </span>
    </PrototypeComponent>
  );
}

export function BookingEventSidebar({
  selectedDate,
  selectedTime,
  use24h,
  showDateTime,
  children,
}: BookingEventDetailsProps & { children?: React.ReactNode }) {
  return (
    <PrototypeComponent
      id="booking-event-details.booking-event-sidebar"
      className="border-subtle flex w-full shrink-0 flex-col border-r px-6 py-8 lg:w-[280px]"
    >
      <BookingEventDetails
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        use24h={use24h}
        showDateTime={showDateTime}
        compact
      />
      {children ? <div className="mt-8">{children}</div> : null}
    </PrototypeComponent>
  );
}

export { BookingEventDetails };
