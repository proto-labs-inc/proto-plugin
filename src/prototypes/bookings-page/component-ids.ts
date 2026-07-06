import { definePrototypeComponentRegistry } from "@prototype/lib/prototypes/prototype-component-registry";

export const BOOKINGS_PAGE_COMPONENT_IDS = [
  "page",
  "scroll-container",
  "bookings-page-preview-state-select",
  "bookings-shell-layout",
  "bookings-shell-sidebar",
  "bookings-main-content",
  "bookings-toolbar",
  "bookings-toggle-group",
  "bookings-filters-bar",
  "bookings-list",
  "bookings-list-item",
  "bookings-empty-state",
  "bookings-list-separator",
  "bookings-list-pagination",
  "bookings-calendar-placeholder",
] as const;

export const BOOKINGS_PAGE_DYNAMIC_TARGET_PREFIXES = [
  "bookings-list-item.",
] as const;

export const bookingsPageComponentRegistry = definePrototypeComponentRegistry({
  ids: BOOKINGS_PAGE_COMPONENT_IDS,
  dynamicPrefixes: BOOKINGS_PAGE_DYNAMIC_TARGET_PREFIXES,
});
