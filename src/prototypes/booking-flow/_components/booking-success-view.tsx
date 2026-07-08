"use client";

import Icon from "@calcom/ui/components/icon/Icon";
import { Badge } from "@calcom/ui/components/badge";
import { PrototypeComponent } from "proto-plugin";
import { ArrowLeft, Check, ExternalLink, Flag } from "lucide-react";

import {
  BOOKING_EVENT,
  BOOKING_GUEST,
  BOOKING_HOST,
  formatBookingDateLong,
  formatSlotRange,
  parseTimeLabel,
} from "./booking-mock-data";

type BookingSuccessViewProps = {
  selectedDate: Date;
  selectedTime: string;
  use24h: boolean;
  onBackToBookings: () => void;
};

export function BookingSuccessView({
  selectedDate,
  selectedTime,
  use24h,
  onBackToBookings,
}: BookingSuccessViewProps) {
  const slot = parseTimeLabel(selectedTime);

  return (
    <PrototypeComponent
      id="booking-success-view"
      className="bg-muted h-full min-h-0 w-full flex-1 overflow-y-auto px-4 py-8"
    >
      <button
        type="button"
        onClick={onBackToBookings}
        className="text-default hover:text-emphasis mb-6 inline-flex items-center gap-2 text-sm font-medium transition"
      >
        <ArrowLeft className="size-4" strokeWidth={2} />
        Back to bookings
      </button>

      <div className="border-subtle bg-default mx-auto max-w-[640px] overflow-hidden rounded-2xl border shadow-sm">
        <div className="px-8 py-10 text-center">
          <div className="bg-semantic-success-emphasis mx-auto mb-4 flex size-10 items-center justify-center rounded-full">
            <Check className="size-5 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-cal text-emphasis mb-2 text-2xl font-semibold">
            This meeting is scheduled
          </h1>
          <p className="text-subtle mx-auto max-w-md text-sm">
            We sent an email with a calendar invitation with the details to everyone.
          </p>
        </div>

        <div className="border-subtle space-y-5 border-t px-8 py-8">
          <DetailRow label="What">
            <p className="text-default text-sm">
              {BOOKING_EVENT.title} between {BOOKING_HOST.name} and {BOOKING_GUEST.name}
            </p>
          </DetailRow>

          <DetailRow label="When">
            <p className="text-default text-sm">{formatBookingDateLong(selectedDate)}</p>
            <p className="text-subtle text-sm">
              {formatSlotRange(
                selectedDate,
                slot.hour,
                slot.minute,
                BOOKING_EVENT.durationMinutes,
                use24h,
              )}{" "}
              (Pacific Daylight Time)
            </p>
          </DetailRow>

          <DetailRow label="Who">
            <div className="space-y-4">
              <div>
                <p className="text-default inline-flex items-center gap-2 text-sm font-medium">
                  {BOOKING_HOST.name}
                  <Badge variant="blue">Host</Badge>
                </p>
                <p className="text-subtle text-sm">{BOOKING_HOST.email}</p>
              </div>
              <div>
                <p className="text-default text-sm font-medium">{BOOKING_GUEST.name}</p>
                <p className="text-subtle text-sm">{BOOKING_GUEST.email}</p>
              </div>
            </div>
          </DetailRow>

          <DetailRow label="Where">
            <p className="text-default inline-flex items-center gap-2 text-sm">
              {BOOKING_EVENT.location}
              <ExternalLink className="text-muted size-3.5" strokeWidth={2} />
            </p>
          </DetailRow>
        </div>

        <div className="border-subtle border-t px-8 py-6">
          <p className="text-emphasis mb-3 text-sm font-medium">Add to calendar</p>
          <div className="flex flex-wrap gap-2">
            {["G", "O", "365", "iCal"].map((label) => (
              <button
                key={label}
                type="button"
                className="border-subtle bg-default text-emphasis hover:bg-emphasis inline-flex size-10 items-center justify-center rounded-lg border text-xs font-semibold transition"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-subtle text-subtle px-8 py-4 text-center text-sm">
          Need to make a change?{" "}
          <button type="button" className="text-emphasis underline">
            Reschedule
          </button>{" "}
          or{" "}
          <button type="button" className="text-emphasis underline">
            Cancel
          </button>
        </div>
      </div>

      <button
        type="button"
        className="text-subtle hover:text-default mx-auto mt-6 flex items-center gap-2 text-sm transition"
      >
        <Flag className="size-3.5" strokeWidth={2} />
        Report booking
      </button>
    </PrototypeComponent>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-4">
      <p className="text-subtle text-sm">{label}</p>
      <div>{children}</div>
    </div>
  );
}
