"use client";

import { Button } from "@calcom/ui/components/button";
import Icon from "@calcom/ui/components/icon/Icon";
import { PrototypeComponent } from "proto";

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
                className="text-default text-sm leading-6 hover:underline"
              >
                <div className="flex items-center gap-2">
                  <span className="bg-inverted flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px]">
                    <Icon name="video" className="text-inverted h-2.5 w-2.5" />
                  </span>
                  Join Cal Video
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4" data-testid="title-and-attendees">
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

        <div className="flex flex-col flex-wrap items-end justify-end gap-2 py-4 pl-4 text-right text-sm font-medium ltr:pr-4 rtl:pl-4 sm:flex-shrink-0 sm:flex-row sm:flex-nowrap sm:items-start sm:pl-0">
          <Button
            color="secondary"
            StartIcon="ellipsis"
            className="px-2"
            aria-label="Booking actions"
          />
        </div>
      </div>
    </PrototypeComponent>
  );
}
