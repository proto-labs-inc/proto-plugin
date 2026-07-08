import type { DesignExplorationRationale } from "proto-plugin";

export type EventTypesPageLayoutVariant =
  | "card-grid"
  | "compact-table"
  | "split-preview"
  | "grouped-sections"
  | "stacked-list";

export const EVENT_TYPES_PAGE_LAYOUT_VARIANT_OPTIONS: Array<{
  value: EventTypesPageLayoutVariant;
  label: string;
  hint?: string;
  rationale?: DesignExplorationRationale;
}> = [
  {
    value: "card-grid",
    label: "Card grid",
    hint: "Two-column card grid with title, slug, badges, and actions per tile",
    rationale: {
      good:
        "Tiles give each event type breathing room and make badges and actions easy to spot.",
      bad: "The grid wraps awkwardly with many types and wastes vertical space on short lists.",
    },
  },
  {
    value: "compact-table",
    label: "Compact table",
    hint: "Column headers for name, duration, visibility, and actions — scan many types at once",
    rationale: {
      good:
        "Column headers make it fast to compare duration, visibility, and links across many types.",
      bad: "Horizontal scrolling on narrow viewports and tighter title space hurt mobile scanning.",
    },
  },
  {
    value: "split-preview",
    label: "Split preview",
    hint: "Compact list on the left with a detail panel for the selected event type",
    rationale: {
      good:
        "Selecting a type opens a detail panel with copy and preview actions without leaving the list.",
      bad: "Bulk toggles and link sharing take an extra click when you are managing several types at once.",
    },
  },
  {
    value: "grouped-sections",
    label: "Grouped sections",
    hint: "Public and secret event types in separate labeled sections",
    rationale: {
      good:
        "Separating public and secret types reduces the chance of sharing the wrong link.",
      bad: "Split sections break alphabetical scanning when you want one unified sorted list.",
    },
  },
];

export const EVENT_TYPES_PAGE_LAYOUT_BASELINE = {
  value: "stacked-list" as const satisfies EventTypesPageLayoutVariant,
  label: "Stacked list",
  hint: "Bordered stacked rows with reorder arrows — current event types page",
  rationale: {
    good:
      "Familiar stacked rows with reorder arrows match the current production page.",
    bad: "Dense rows get heavy when every type shows slug, badges, and three actions inline.",
  },
};

export const DEFAULT_EVENT_TYPES_PAGE_LAYOUT_VARIANT: EventTypesPageLayoutVariant =
  EVENT_TYPES_PAGE_LAYOUT_VARIANT_OPTIONS[0].value;
