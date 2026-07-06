"use client";

import { EmptyScreen } from "@calcom/ui/components/empty-screen";
import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";

import { emptyStateCopy } from "./bookings-page-mock-data";
import { BookingsListItem } from "./bookings-list-item";
import { BookingsListPagination } from "./bookings-list-pagination";
import type { BookingStatusTab, MockBooking } from "./bookings-page-types";

type BookingsListProps = {
  statusTab: BookingStatusTab;
  bookings: MockBooking[];
};

export function BookingsList({ statusTab, bookings }: BookingsListProps) {
  const emptyCopy = emptyStateCopy(statusTab);

  if (bookings.length === 0) {
    return (
      <PrototypeComponent id="bookings-empty-state" className="mt-4">
        <div className="flex items-center justify-center pt-2 xl:pt-0">
          <EmptyScreen
            Icon="calendar"
            headline={emptyCopy.headline}
            description={emptyCopy.description}
          />
        </div>
      </PrototypeComponent>
    );
  }

  return (
    <PrototypeComponent
      id="bookings-list"
      className="border-subtle bg-default mt-4 overflow-hidden rounded-lg border"
    >
      <PrototypeComponent
        id="bookings-list-separator"
        className="text-subtle border-subtle border-b py-4 pl-6 text-xs uppercase leading-4"
      >
        Next
      </PrototypeComponent>
      <div className="divide-subtle divide-y">
        {bookings.map((booking) => (
          <BookingsListItem
            key={booking.uid}
            booking={booking}
            id={`bookings-list-item.${booking.uid}`}
          />
        ))}
      </div>
      <div className="border-subtle border-t px-4 py-3">
        <BookingsListPagination totalItems={bookings.length} />
      </div>
    </PrototypeComponent>
  );
}
