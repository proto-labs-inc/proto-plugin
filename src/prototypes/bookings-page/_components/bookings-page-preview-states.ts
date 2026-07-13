import { definePreviewStateRegistry } from "proto-plugin";

import type { BookingsLiveState, BookingsPagePreviewStateId } from "./bookings-page-types";

export type { BookingsPagePreviewStateId };

export const DEFAULT_BOOKINGS_PAGE_PREVIEW_STATE: BookingsPagePreviewStateId = "upcoming-list";

export function createLiveStateForPreview(
  previewStateId: BookingsPagePreviewStateId = DEFAULT_BOOKINGS_PAGE_PREVIEW_STATE,
): BookingsLiveState {
  switch (previewStateId) {
    case "unconfirmed-empty":
      return {
        previewStateId,
        statusTab: "unconfirmed",
        activeFilters: [],
        showFiltersBar: false,
        viewMode: "list",
        addFilterOpen: false,
      };
    case "upcoming-filtered-empty":
      return {
        previewStateId,
        statusTab: "upcoming",
        activeFilters: [
          {
            id: "eventType",
            label: "Event type",
            valueLabel: "30 min meeting",
          },
        ],
        showFiltersBar: true,
        viewMode: "list",
        addFilterOpen: false,
      };
    case "upcoming-list":
    default:
      return {
        previewStateId: "upcoming-list",
        statusTab: "upcoming",
        activeFilters: [],
        showFiltersBar: false,
        viewMode: "list",
        addFilterOpen: false,
      };
  }
}

export const BOOKINGS_PAGE_PREVIEW_STATE_REGISTRY = definePreviewStateRegistry({
  canvasLayout: {
    rows: [
      {
        section: { label: "Status tabs" },
        states: ["upcoming-list", "unconfirmed-empty"],
      },
      {
        section: { label: "Custom filters" },
        startColumn: 0,
        states: ["upcoming-filtered-empty"],
      },
    ],
  },
  states: [
    {
      id: "upcoming-list",
      label: "Upcoming list",
      annotation: "Default upcoming tab with booking rows, pagination, and Join Cal Video links.",
    },
    {
      id: "unconfirmed-empty",
      label: "Unconfirmed empty",
      annotation: "Unconfirmed preset tab with dashed empty state.",
    },
    {
      id: "upcoming-filtered-empty",
      label: "Filtered empty",
      annotation: "Upcoming tab with an active event-type filter chip and no matching bookings.",
    },
  ],
  edges: [
    { from: "upcoming-list", to: "unconfirmed-empty" },
    { from: "upcoming-list", to: "upcoming-filtered-empty", dashed: true },
  ],
});

export const BOOKINGS_PAGE_PREVIEW_OPTIONS = BOOKINGS_PAGE_PREVIEW_STATE_REGISTRY.pickerOptions;
