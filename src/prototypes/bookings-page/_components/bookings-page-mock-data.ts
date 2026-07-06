import type { BookingStatusTab, MockBooking } from "./bookings-page-types";

export const BOOKINGS_USER = {
  name: "Maayan Albert",
  email: "maayan@example.com",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maayan",
};

const july6Base = new Date(2026, 6, 6, 9, 45, 0, 0);

function slot(minutesFromStart: number, durationMinutes: number): {
  startTime: Date;
  endTime: Date;
} {
  const startTime = new Date(july6Base.getTime() + minutesFromStart * 60_000);
  const endTime = new Date(startTime.getTime() + durationMinutes * 60_000);
  return { startTime, endTime };
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
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  return `${weekday}, ${day} ${month}`;
}

export function formatBookingTimeRange(start: Date, end: Date): string {
  const format = (value: Date) =>
    value
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(" ", "")
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
  const headlines: Record<BookingStatusTab, string> = {
    upcoming: "No upcoming bookings",
    unconfirmed: "No unconfirmed bookings",
    recurring: "No recurring bookings",
    past: "No past bookings",
    cancelled: "No canceled bookings",
  };

  const descriptions: Record<BookingStatusTab, string> = {
    upcoming:
      "You have no upcoming bookings. As soon as someone books a time with you it will show up here.",
    unconfirmed:
      "You have no unconfirmed bookings. Your unconfirmed bookings will show up here.",
    recurring: "You have no recurring bookings. Your recurring bookings will show up here.",
    past: "You have no past bookings. Your past bookings will show up here.",
    cancelled: "You have no canceled bookings. Your canceled bookings will show up here.",
  };

  return {
    headline: headlines[statusTab],
    description: descriptions[statusTab],
  };
}
