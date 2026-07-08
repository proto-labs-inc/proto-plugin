import type { DesignExplorationRationale } from "proto-plugin";

export type EventTypesSecretEventsTransitionVariant =
  | "filter-chip-row"
  | "header-tabs"
  | "filter-dropdown"
  | "title-link"
  | "sidebar-subnav";

export const EVENT_TYPES_SECRET_EVENTS_TRANSITION_VARIANT_OPTIONS: Array<{
  value: EventTypesSecretEventsTransitionVariant;
  label: string;
  hint?: string;
  rationale?: DesignExplorationRationale;
}> = [
  {
    value: "filter-chip-row",
    label: "Filter chip row",
    hint: "Persistent chip row below the header with a tappable Secret events chip",
    rationale: {
      good:
        "Matches the active filter chip pattern — users learn one control for enter and exit.",
      bad: "Always-on chips add visual noise when most users never filter to secret types.",
    },
  },
  {
    value: "header-tabs",
    label: "Header tabs",
    hint: "All / Secret segmented control beside the page title",
    rationale: {
      good:
        "Two clear modes with obvious mutual exclusivity — no hidden filter state to discover.",
      bad: "Tabs compete for space with search and New on narrow viewports.",
    },
  },
  {
    value: "filter-dropdown",
    label: "Filter dropdown",
    hint: "Add-filter button opens a menu with Secret events as an option",
    rationale: {
      good:
        "Keeps the default list clean while scaling to more filter types later.",
      bad: "Two clicks to reach secret types — easy to miss for first-time users.",
    },
  },
  {
    value: "title-link",
    label: "Title link",
    hint: "Subtle text link under the page title pointing to secret event types",
    rationale: {
      good:
        "Minimal chrome — secret types feel secondary without adding a permanent control bar.",
      bad: "Easy to overlook; no affordance when the filter is already active.",
    },
  },
  {
    value: "sidebar-subnav",
    label: "Sidebar sub-nav",
    hint: "Secret events nested under Event types in the shell sidebar",
    rationale: {
      good:
        "Treats secret types as a distinct destination — familiar nav pattern for power users.",
      bad: "Hidden on mobile where the sidebar collapses; splits list context across nav zones.",
    },
  },
];

export const EVENT_TYPES_SECRET_EVENTS_TRANSITION_BASELINE = {
  value: "no-entry" as const,
  label: "No entry point",
  hint: "Secret filter only reachable via preview state — no in-page control on the default list",
  rationale: {
    good: "Zero extra UI on the default event types list.",
    bad: "Reviewers cannot discover or test the secret-events view without the state picker.",
  },
};

export const DEFAULT_EVENT_TYPES_SECRET_EVENTS_TRANSITION_VARIANT: EventTypesSecretEventsTransitionVariant =
  EVENT_TYPES_SECRET_EVENTS_TRANSITION_VARIANT_OPTIONS[0].value;

export type EventTypesSecretEventsTransitionChoice =
  | EventTypesSecretEventsTransitionVariant
  | typeof EVENT_TYPES_SECRET_EVENTS_TRANSITION_BASELINE.value;
