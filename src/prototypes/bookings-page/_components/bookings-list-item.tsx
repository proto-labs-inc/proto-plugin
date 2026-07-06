"use client";

import { Button } from "@calcom/ui/components/button";
import Icon from "@calcom/ui/components/icon/Icon";
import classNames from "@calcom/ui/classNames";
import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";

import {
  formatBookingDateLabel,
  formatBookingTimeRange,
} from "./bookings-page-mock-data";
import type { MockBooking } from "./bookings-page-types";

type BookingsListItemProps = {
  booking: MockBooking;
  id: string;
};

export function BookingsListItem({ booking, id }: BookingsListItemProps) {
  return (
    <PrototypeComponent
      id={id}
      className="group relative w-full transition-all duration-100 ease-out hover:bg-cal-muted"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="sm:min-w-48 hidden align-top ltr:pl-3 rtl:pr-6 sm:table-cell">
          <div className="flex h-full items-center">
            <div className="bg-brand-default h-[70%] w-0.5" />
            <div className="ml-3 cursor-pointer py-4">
              <div className="text-emphasis text-sm leading-6">
                {formatBookingDateLabel(booking.startTime)}
              </div>
              <div className="text-subtle text-sm">
                {formatBookingTimeRange(booking.startTime, booking.endTime)}
              </div>
              <a
                href={booking.videoUrl}
                onClick={(event) => event.stopPropagation()}
                target="_blank"
                rel="noreferrer"
                className="text-sm leading-6 text-blue-600 hover:underline dark:text-blue-400"
              >
                <div className="flex items-center gap-2">
                  <Icon name="video" className="h-4 w-4" />
                  Join Cal Video
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4">
          <div className="cursor-pointer py-4">
            <div
              title={booking.title}
              className="text-emphasis max-w-10/12 break-words text-sm font-medium leading-6 sm:max-w-56 md:max-w-full"
            >
              {booking.title}
            </div>
            <div className="text-subtle text-sm">
              You and {booking.attendeeName}
            </div>
          </div>
        </div>

        <div className="flex items-start justify-end px-4 py-4 sm:items-center">
          <Button
            color="minimal"
            variant="icon"
            StartIcon="ellipsis-vertical"
            aria-label="Booking actions"
          />
        </div>
      </div>
    </PrototypeComponent>
  );
}
