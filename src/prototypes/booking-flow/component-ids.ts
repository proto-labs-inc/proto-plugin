import { definePrototypeComponentRegistry } from "proto";

export const BOOKING_FLOW_COMPONENT_IDS = [
  "page",
  "scroll-container",
  "booking-flow-preview-state-select",
  "booking-layout-shell",
  "booking-header-controls",
  "booking-event-details.booking-cal-logo",
  "booking-event-details.booking-event-sidebar",
  "booking-mini-calendar",
  "booking-time-format-toggle",
  "booking-month-view",
  "booking-week-view",
  "booking-list-view",
  "booking-form-view",
  "booking-confirm-modal",
  "booking-success-view",
  "booking-time-slot",
  "booking-flow-wireframe",
] as const;

export const BOOKING_FLOW_DYNAMIC_TARGET_PREFIXES = [
  "booking-time-slot.",
  "booking-mini-calendar.",
  "booking-flow-wireframe.",
] as const;

export const bookingFlowComponentRegistry = definePrototypeComponentRegistry({
  ids: BOOKING_FLOW_COMPONENT_IDS,
  dynamicPrefixes: BOOKING_FLOW_DYNAMIC_TARGET_PREFIXES,
});
