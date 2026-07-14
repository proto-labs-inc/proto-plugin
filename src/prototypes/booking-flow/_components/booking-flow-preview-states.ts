import { definePreviewStateRegistry } from "proto";

export const BOOKING_FLOW_STEP_IDS = [
  "month-picker",
  "week-grid",
  "list-view",
  "form-page",
  "confirm-modal-week",
  "confirm-modal-list",
  "success",
] as const;

export type BookingFlowStepId = (typeof BOOKING_FLOW_STEP_IDS)[number];

export const BOOKING_FLOW_PREVIEW_STATE_REGISTRY = definePreviewStateRegistry({
  canvasLayout: {
    rows: [
      {
        section: { label: "Pick a time" },
        states: ["month-picker", "week-grid", "list-view"],
      },
      {
        section: { label: "Book" },
        startColumn: 0,
        states: ["form-page", "confirm-modal-week", "confirm-modal-list"],
      },
      {
        section: { label: "Confirmed" },
        startColumn: 1,
        states: ["success"],
      },
    ],
  },
  states: [
    {
      id: "month-picker",
      label: "Month picker",
      annotation: "Embed-style 3-column card: event details, calendar, time slots.",
    },
    {
      id: "week-grid",
      label: "Week grid",
      annotation: "Weekly availability grid with busy blocks and overlay toggle.",
    },
    {
      id: "list-view",
      label: "List view",
      annotation: "Multi-day column list of 15-minute slots.",
    },
    {
      id: "form-page",
      label: "Booking form",
      annotation: "Two-column embed card with guest details form.",
    },
    {
      id: "confirm-modal-week",
      label: "Confirm (week bg)",
      annotation: "Confirm details modal over blurred week grid.",
    },
    {
      id: "confirm-modal-list",
      label: "Confirm (list bg)",
      annotation: "Confirm details modal over blurred list view.",
    },
    {
      id: "success",
      label: "Scheduled",
      annotation: "Meeting scheduled confirmation with calendar links.",
    },
  ],
  edges: [
    { from: "month-picker", to: "week-grid" },
    { from: "month-picker", to: "list-view" },
    { from: "month-picker", to: "form-page" },
    { from: "week-grid", to: "confirm-modal-week" },
    { from: "list-view", to: "confirm-modal-list" },
    { from: "form-page", to: "success" },
    { from: "confirm-modal-week", to: "success" },
    { from: "confirm-modal-list", to: "success" },
  ],
});

export const BOOKING_FLOW_PREVIEW_OPTIONS =
  BOOKING_FLOW_PREVIEW_STATE_REGISTRY.pickerOptions;

export const DEFAULT_BOOKING_FLOW_STEP: BookingFlowStepId = "month-picker";
