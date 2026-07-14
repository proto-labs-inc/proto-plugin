import { definePreviewStateRegistry } from "proto-plugin";

import {
  DEFAULT_EVENT_TYPES,
  EMPTY_SEARCH_QUERY,
  EVENT_TYPES_PROFILE_SLUG,
  filterEventTypes,
  SECRET_EVENTS_FILTER_LABEL,
} from "./event-types-mock-data";
import type { EventTypesLiveState, EventTypesPreviewStateId } from "./event-types-types";

export type { EventTypesPreviewStateId };

export const DEFAULT_EVENT_TYPES_PREVIEW_STATE: EventTypesPreviewStateId =
  "event-types-list";

const DEFAULT_CREATE_FORM: EventTypesLiveState["createForm"] = {
  title: "",
  slug: "",
  description: "",
  length: 15,
};

export function createLiveStateForPreview(
  previewStateId: EventTypesPreviewStateId = DEFAULT_EVENT_TYPES_PREVIEW_STATE,
): EventTypesLiveState {
  switch (previewStateId) {
    case "new-event-type-modal":
      return {
        previewStateId,
        searchTerm: "",
        secretFilterActive: false,
        createModalOpen: true,
        eventTypes: DEFAULT_EVENT_TYPES,
        createForm: {
          title: "",
          slug: "",
          description: "",
          length: 15,
        },
      };
    case "empty-search":
      return {
        previewStateId,
        searchTerm: EMPTY_SEARCH_QUERY,
        secretFilterActive: false,
        createModalOpen: false,
        eventTypes: DEFAULT_EVENT_TYPES,
        createForm: DEFAULT_CREATE_FORM,
      };
    case "secret-events-filter":
      return {
        previewStateId,
        searchTerm: "",
        secretFilterActive: true,
        createModalOpen: false,
        eventTypes: DEFAULT_EVENT_TYPES,
        createForm: DEFAULT_CREATE_FORM,
      };
    case "event-types-list":
    default:
      return {
        previewStateId: "event-types-list",
        searchTerm: "",
        secretFilterActive: false,
        createModalOpen: false,
        eventTypes: DEFAULT_EVENT_TYPES,
        createForm: DEFAULT_CREATE_FORM,
      };
  }
}

export const EVENT_TYPES_PREVIEW_STATE_REGISTRY = definePreviewStateRegistry({
  canvasLayout: {
    rows: [
      {
        section: { label: "Event types page" },
        states: ["event-types-list", "new-event-type-modal"],
      },
      {
        section: { label: "Search" },
        startColumn: 0,
        states: ["empty-search"],
      },
      {
        section: { label: "Filters" },
        startColumn: 1,
        states: ["secret-events-filter"],
      },
    ],
  },
  states: [
    {
      id: "event-types-list",
      label: "Event types list",
      annotation: `Default list with ${DEFAULT_EVENT_TYPES.length} event types for /${EVENT_TYPES_PROFILE_SLUG}.`,
    },
    {
      id: "new-event-type-modal",
      label: "New event type modal",
      annotation: "Add a new event type dialog with title, URL slug, description, and duration fields.",
    },
    {
      id: "empty-search",
      label: "Empty search",
      annotation: `Search query "${EMPTY_SEARCH_QUERY}" with dashed empty state and Create CTA.`,
    },
    {
      id: "secret-events-filter",
      label: "Secret events filter",
      annotation: `Active "${SECRET_EVENTS_FILTER_LABEL}" filter showing only secret event types.`,
    },
  ],
  edges: [
    { from: "event-types-list", to: "new-event-type-modal" },
    { from: "event-types-list", to: "empty-search", dashed: true },
    { from: "event-types-list", to: "secret-events-filter", dashed: true },
  ],
});

export const EVENT_TYPES_PREVIEW_OPTIONS =
  EVENT_TYPES_PREVIEW_STATE_REGISTRY.pickerOptions;
