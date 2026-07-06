export type BookingStatusTab =
  | "upcoming"
  | "unconfirmed"
  | "recurring"
  | "past"
  | "cancelled";

export type BookingsFilterId =
  | "eventType"
  | "team"
  | "member"
  | "attendeeName"
  | "attendeeEmail"
  | "dateRange";

export type BookingsActiveFilter = {
  id: BookingsFilterId;
  label: string;
  valueLabel: string;
};

export type BookingsViewMode = "list" | "calendar";

export type BookingsPagePreviewStateId =
  | "upcoming-list"
  | "unconfirmed-empty"
  | "upcoming-filtered-empty";

export type BookingsLiveState = {
  previewStateId: BookingsPagePreviewStateId;
  statusTab: BookingStatusTab;
  activeFilters: BookingsActiveFilter[];
  showFiltersBar: boolean;
  viewMode: BookingsViewMode;
  addFilterOpen: boolean;
};

export type MockBooking = {
  uid: string;
  startTime: Date;
  endTime: Date;
  title: string;
  attendeeName: string;
  eventTypeLabel: string;
  videoUrl: string;
  isToday?: boolean;
};
