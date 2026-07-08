"use client";

import { PrototypeComponent } from "proto-plugin";

import { formatBookingTime } from "./booking-mock-data";

type BookingTimeSlotProps = {
  hour: number;
  minute: number;
  use24h: boolean;
  onSelect: () => void;
  id: string;
};

export function BookingTimeSlot({
  hour,
  minute,
  use24h,
  onSelect,
  id,
}: BookingTimeSlotProps) {
  return (
    <PrototypeComponent id={id}>
      <button
        type="button"
        onClick={onSelect}
        className="border-subtle bg-default text-emphasis hover:border-emphasis hover:bg-emphasis group flex w-full items-center gap-2 rounded-[10px] border px-3 py-2.5 text-sm font-medium transition"
      >
        <span className="bg-semantic-success-emphasis size-1.5 shrink-0 rounded-full" />
        <span>{formatBookingTime(hour, minute, use24h)}</span>
      </button>
    </PrototypeComponent>
  );
}
