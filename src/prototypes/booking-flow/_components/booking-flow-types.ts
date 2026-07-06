export type BookingFlowStep =
  | "month-picker"
  | "week-grid"
  | "list-view"
  | "form-page"
  | "confirm-modal-week"
  | "confirm-modal-list"
  | "success";

export type BookingViewMode = "month" | "week" | "list";

export type BookingLiveState = {
  step: BookingFlowStep;
  viewMode: BookingViewMode;
  selectedDateIso: string;
  selectedTime: string;
  use24h: boolean;
  overlayCalendar: boolean;
};

export type SelectedSlot = {
  date: Date;
  time: string;
};
