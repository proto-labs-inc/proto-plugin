"use client";

import { Button } from "@calcom/ui/components/button";
import Icon from "@calcom/ui/components/icon/Icon";
import { Input } from "@coss/ui/components/input";
import { Label } from "@coss/ui/components/label";
import { Textarea } from "@coss/ui/components/textarea";
import { PrototypeComponent } from "proto";
import { UserPlus } from "lucide-react";

import { BookingCalLogo, BookingEventDetails } from "./booking-event-details";
import {
  BOOKING_EVENT,
  BOOKING_GUEST,
  BOOKING_HOST,
  formatBookingDateLong,
  formatSlotRange,
  parseTimeLabel,
} from "./booking-mock-data";

type BookingFormViewProps = {
  selectedDate: Date;
  selectedTime: string;
  use24h: boolean;
  onBack: () => void;
  onConfirm: () => void;
};

export function BookingFormView({
  selectedDate,
  selectedTime,
  use24h,
  onBack,
  onConfirm,
}: BookingFormViewProps) {
  const slot = parseTimeLabel(selectedTime);

  return (
    <PrototypeComponent id="booking-form-view" className="bg-muted h-full min-h-0 w-full flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[960px] px-4 py-10">
        <div className="border-subtle bg-default overflow-hidden rounded-2xl border shadow-sm">
          <div className="grid lg:grid-cols-2">
            <div className="border-subtle border-b px-8 py-8 lg:border-b-0 lg:border-r">
              <BookingEventDetails
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                use24h={use24h}
                showDateTime
              />
            </div>

            <div className="px-8 py-8">
              <BookingFormFields onBack={onBack} onConfirm={onConfirm} />
            </div>
          </div>
        </div>
        <BookingCalLogo />
      </div>
    </PrototypeComponent>
  );
}

type BookingConfirmModalProps = {
  selectedDate: Date;
  selectedTime: string;
  use24h: boolean;
  onBack: () => void;
  onConfirm: () => void;
};

function BookingConfirmModalContent({
  selectedDate,
  selectedTime,
  use24h,
  onBack,
  onConfirm,
}: BookingConfirmModalProps) {
  const slot = parseTimeLabel(selectedTime);

  return (
    <div className="border-subtle bg-default rounded-xl border p-6 shadow-xl">
      <h2 className="font-cal text-emphasis mb-1 text-xl font-semibold">
        Confirm your details
      </h2>
      <div className="text-subtle mb-6 flex flex-wrap items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-2">
          <Icon name="calendar" size={16} />
          {formatBookingDateLong(selectedDate)}, {selectedTime}
        </span>
        <span className="inline-flex items-center gap-2">
          <Icon name="clock" size={16} />
          {BOOKING_EVENT.durationMinutes}m
        </span>
      </div>

      <BookingFormFields compact onBack={onBack} onConfirm={onConfirm} />
    </div>
  );
}

function BookingFormFields({
  compact = false,
  onBack,
  onConfirm,
}: {
  compact?: boolean;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onConfirm();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="booking-name" className="text-emphasis text-sm font-medium">
          Your name <span className="text-error">*</span>
        </Label>
        <Input id="booking-name" defaultValue={BOOKING_GUEST.name} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="booking-email" className="text-emphasis text-sm font-medium">
          Email address <span className="text-error">*</span>
        </Label>
        <Input
          id="booking-email"
          type="email"
          defaultValue={BOOKING_GUEST.email}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="booking-notes" className="text-emphasis text-sm font-medium">
          Additional notes
        </Label>
        <Textarea
          id="booking-notes"
          rows={compact ? 3 : 4}
          placeholder="Please share anything that will help prepare for our meeting."
        />
      </div>

      <button
        type="button"
        className="text-default inline-flex items-center gap-2 text-sm font-medium"
      >
        <UserPlus className="size-4" strokeWidth={1.75} />
        Add guests
      </button>

      <p className="text-subtle text-xs leading-relaxed">
        By proceeding, you agree to Cal.com&apos;s{" "}
        <span className="text-emphasis font-semibold">Terms</span> and{" "}
        <span className="text-emphasis font-semibold">Privacy Policy</span>.
      </p>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" color="minimal" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" color="primary">
          Confirm
        </Button>
      </div>
    </form>
  );
}

export { BookingConfirmModalContent };

export function getBookingSummaryLine(
  selectedDate: Date,
  selectedTime: string,
  use24h: boolean,
) {
  const slot = parseTimeLabel(selectedTime);
  return {
    dateLine: formatBookingDateLong(selectedDate),
    timeLine: formatSlotRange(
      selectedDate,
      slot.hour,
      slot.minute,
      BOOKING_EVENT.durationMinutes,
      use24h,
    ),
    host: BOOKING_HOST,
  };
}
