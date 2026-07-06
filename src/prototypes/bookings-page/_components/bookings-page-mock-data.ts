import type { BookingStatusTab, MockBooking } from "./bookings-page-types";

export const BOOKINGS_USER = {
  name: "Maayan Albert",
  email: "maayan@example.com",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maayan",
};

const july6Base = new Date("2026-07-06T16:45:00.000Z");

function slot(minutesFromStart: number, durationMinutes: number): { start: Date; end: Date } {
  const start = new Date(july6Base.getTime() + minutesFromStart * 60_000);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  return { start, end };
}

export const UPCOMING_BOOKINGS: MockBooking[] = [
  {
    uid: "booking-1",
    ...slot(0, 15),
    title: "quick chat between Maayan Albert and Maayan Albert",
    attendeeName: "Maayan Albert",
    eventTypeLabel: "15 min meeting",
    videoUrl: "https://cal.video/room-1",
    isToday: false,
  },
  {
    uid: "booking-2",
    ...slot(15, 15),
    title: "quick chat between Maayan Albert and Maayan Albert",
    attendeeName: "Maayan Albert",
    eventTypeLabel: "15 min meeting",
    videoUrl: "https://cal.video/room-2",
  },
  {
    uid: "booking-3",
    ...slot(30, 15),
    title: "quick chat between Maayan Albert and Maayan Albert",
    attendeeName: "Maayan Albert",
    eventTypeLabel: "15 min meeting",
    videoUrl: "https://cal.video/room-3",
  },
  {
    uid: "booking-4",
    ...slot(45, 15),
    title: "quick chat between Maayan Albert and Maayan Albert",
    attendeeName: "Maayan Albert",
    eventTypeLabel: "15 min meeting",
    videoUrl: "https://cal.video/room-4",
  },
];

export const STATUS_TAB_OPTIONS: {
  value: BookingStatusTab;
  label: string;
}[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "unconfirmed", label: "Unconfirmed" },
  { value: "recurring", label: "Recurring" },
  { value: "past", label: "Past" },
  { value: "cancelled", label: "Canceled" },
];

export const FILTER_TYPE_OPTIONS: {
  id: "eventType" | "team" | "member" | "attendeeName" | "attendeeEmail" | "dateRange";
  label: string;
}[] = [
  { id: "eventType", label: "Event type" },
  { id: "team", label: "Team" },
  { id: "member", label: "Member" },
  { id: "attendeeName", label: "Attendee name" },
  { id: "attendeeEmail", label: "Attendee email" },
  { id: "dateRange", label: "Date range" },
];

export const EVENT_TYPE_FILTER_OPTIONS = [
  { value: "30-min", label: "30 min meeting" },
  { value: "15-min", label: "15 min meeting" },
  { value: "quick-chat", label: "Quick chat" },
];

export function formatBookingDateLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatBookingTimeRange(start: Date, end: Date): string {
  const format = (value: Date) =>
    value
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(":00", "")
      .toLowerCase();

  return `${format(start)} - ${format(end)}`;
}

export function filterBookings(
  bookings: MockBooking[],
  activeFilters: { id: string; valueLabel: string }[],
): MockBooking[] {
  return bookings.filter((booking) => {
    for (const filter of activeFilters) {
      if (filter.id === "eventType" && filter.valueLabel !== booking.eventTypeLabel) {
        return false;
      }
    }
    return true;
  });
}

export function emptyStateCopy(statusTab: BookingStatusTab): {
  headline: string;
  description: string;
} {
  const statusLabel = STATUS_TAB_OPTIONS.find((tab) => tab.value === statusTab)?.label.toLowerCase() ?? statusTab;

  return {
    headline: `No ${statusLabel} bookings`,
    description: `You have no ${statusLabel} bookings. ${
      statusTab === "upcoming"
        ? "As soon as someone books a time with you it will show up here."
        : statusTab === "unconfirmed"
          ? "Your unconfirmed bookings will show up here."
          : `Your ${statusLabel} bookings will show up here.`
    }`,
  };
}
