"use client";

import { EmptyScreen } from "@calcom/ui/components/empty-screen";
import { PrototypeComponent } from "proto-plugin";

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
      <PrototypeComponent id="bookings-empty-state">
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
      className="bg-cal-muted mb-6 grid rounded-xl px-0.5 pb-0.5"
      style={{
        gridTemplateRows: "auto 1fr auto",
        gridTemplateAreas: "'header' 'body' 'footer'",
      }}
    >
      <PrototypeComponent
        id="bookings-list-separator"
        className="text-subtle py-4 pl-6 text-xs leading-4"
        style={{ gridArea: "header" }}
      >
        Next
      </PrototypeComponent>

      <div
        className="scrollbar-thin relative overflow-auto rounded-md"
        style={{ gridArea: "body" }}
      >
        <div className="bg-default divide-subtle divide-y rounded-md">
          {bookings.map((booking) => (
            <BookingsListItem
              key={booking.uid}
              booking={booking}
              id={`bookings-list-item.${booking.uid}`}
            />
          ))}
        </div>
      </div>

      <div className="px-3 py-2" style={{ gridArea: "footer" }}>
        <BookingsListPagination totalItems={bookings.length} />
      </div>
    </PrototypeComponent>
  );
}
