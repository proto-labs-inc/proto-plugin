import {
  decodeShareState,
  encodeShareState,
  SHARE_STATE_PARAM,
  type PrSplitConfig,
  type PrSplitEntry as PrSplitEntryBase,
} from "proto-plugin";

import {
  createLiveStateForPreview,
  DEFAULT_EVENT_TYPES_PREVIEW_STATE,
} from "./event-types-preview-states";
import {
  DEFAULT_EVENT_TYPES_PAGE_LAYOUT_VARIANT,
  type EventTypesPageLayoutVariant,
} from "./event-types-page-layout-content";
import {
  DEFAULT_EVENT_TYPES_SECRET_EVENTS_TRANSITION_VARIANT,
  type EventTypesSecretEventsTransitionChoice,
} from "./event-types-secret-events-transition-content";
import type { EventTypesLiveState } from "./event-types-types";

export type EventTypesPrSplitWireframeId =
  | "secret-filter-list"
  | "secret-filter-chip-row"
  | "card-grid-layout"
  | "empty-search"
  | "create-modal";

export type EventTypesPrSplitEntry = PrSplitEntryBase<
  EventTypesPrSplitWireframeId,
  EventTypesLiveState
> & {
  pageLayoutVariant: EventTypesPageLayoutVariant;
  secretEventsTransitionVariant: EventTypesSecretEventsTransitionChoice;
};

export const PR_LAYOUT_PARAM = "prLayout";
export const PR_SECRET_TRANSITION_PARAM = "prSecretTransition";

export const PR_SPLIT_CONFIG: PrSplitConfig<EventTypesLiveState> = {
  slug: "event-types",
  seriesLabel: "Event types page FE",
  sourceRepo: "calcom/cal.diy",
  sourceWorkPath: "apps/web",
  configFilePath: "src/prototypes/event-types/_components/pr-split-config.ts",
  branchName: (entry) => {
    const slug = entry.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return `feat/event-types-fe-${entry.order}-${slug}`;
  },
  writeEntryToSearchParams: (searchParams, entry) => {
    const extended = entry as EventTypesPrSplitEntry;
    searchParams.set(SHARE_STATE_PARAM, encodeShareState(entry.liveState));
    searchParams.set(PR_LAYOUT_PARAM, extended.pageLayoutVariant);
    searchParams.set(PR_SECRET_TRANSITION_PARAM, extended.secretEventsTransitionVariant);
  },
  defaultPreviewPath: "/event-types",
  vercelProjectName: "cal",
  scopeNote:
    "Ship only the chosen design directions: card-grid layout and filter-chip-row secret-events entry. Do not merge compact-table, split-preview, grouped-sections, header-tabs, filter-dropdown, title-link, or sidebar-subnav variants — those stay in the prototype design brief only.",
};

export const PR_SPLIT_ENTRIES: EventTypesPrSplitEntry[] = [
  {
    order: 1,
    title: "Secret event types data model & list filtering",
    description:
      "Add an isSecret flag to event types in the data layer and wire list queries so the event-types page can show a secret-only subset. Surface the Secret badge on rows in the existing stacked list layout.",
    size: "Medium",
    targetId: "event-types-list",
    wireframeId: "secret-filter-list",
    pageLayoutVariant: "stacked-list",
    secretEventsTransitionVariant: "no-entry",
    liveState: createLiveStateForPreview("secret-events-filter"),
    previewPath: "/event-types",
    analyticsNotes: ["event_types_secret_filter_applied"],
  },
  {
    order: 2,
    title: "Secret events filter chip row entry",
    description:
      "Add a persistent filter chip row below the page header with a tappable Secret events chip that activates the secret-only filter. When active, show the removable filter chip bar matching the prototype.",
    size: "Medium",
    targetId: "event-types-secret-events-transition-block",
    wireframeId: "secret-filter-chip-row",
    pageLayoutVariant: "stacked-list",
    secretEventsTransitionVariant: DEFAULT_EVENT_TYPES_SECRET_EVENTS_TRANSITION_VARIANT,
    liveState: createLiveStateForPreview(DEFAULT_EVENT_TYPES_PREVIEW_STATE),
    previewPath: "/event-types",
    analyticsNotes: ["event_types_secret_filter_chip_clicked"],
  },
  {
    order: 3,
    title: "Card grid event types layout",
    description:
      "Replace the production stacked list with a responsive card grid — title, slug, duration and secret badges, and row actions per tile. Keep search, header, and shell sidebar unchanged.",
    size: "Large",
    targetId: "event-types-page-layout-card-grid",
    wireframeId: "card-grid-layout",
    pageLayoutVariant: DEFAULT_EVENT_TYPES_PAGE_LAYOUT_VARIANT,
    secretEventsTransitionVariant: DEFAULT_EVENT_TYPES_SECRET_EVENTS_TRANSITION_VARIANT,
    liveState: createLiveStateForPreview(DEFAULT_EVENT_TYPES_PREVIEW_STATE),
    previewPath: "/event-types",
  },
  {
    order: 4,
    title: "Empty search results state",
    description:
      "When search returns no event types, render the dashed EmptyScreen with the query-specific headline and a Create CTA. Match copy and spacing from the prototype empty-search preview state.",
    size: "Small",
    targetId: "event-types-empty-state",
    wireframeId: "empty-search",
    pageLayoutVariant: DEFAULT_EVENT_TYPES_PAGE_LAYOUT_VARIANT,
    secretEventsTransitionVariant: DEFAULT_EVENT_TYPES_SECRET_EVENTS_TRANSITION_VARIANT,
    liveState: createLiveStateForPreview("empty-search"),
    previewPath: "/event-types",
  },
  {
    order: 5,
    title: "Create event type modal",
    description:
      "Wire the New button to open the create dialog with title, URL slug prefix, description, and duration fields. Match modal layout, sticky footer actions, and form validation affordances from the prototype.",
    size: "Medium",
    targetId: "event-types-create-modal",
    wireframeId: "create-modal",
    pageLayoutVariant: DEFAULT_EVENT_TYPES_PAGE_LAYOUT_VARIANT,
    secretEventsTransitionVariant: DEFAULT_EVENT_TYPES_SECRET_EVENTS_TRANSITION_VARIANT,
    liveState: createLiveStateForPreview("new-event-type-modal"),
    previewPath: "/event-types",
    analyticsNotes: ["event_type_create_modal_opened"],
  },
];

export function findPrSplitEntry(order: number): EventTypesPrSplitEntry | undefined {
  return PR_SPLIT_ENTRIES.find((entry) => entry.order === order);
}

export function readLiveStateFromSearchParams(
  searchParams: URLSearchParams,
): EventTypesLiveState | null {
  const encoded = searchParams.get(SHARE_STATE_PARAM);
  if (!encoded) return null;

  try {
    return decodeShareState<EventTypesLiveState>(encoded);
  } catch {
    return null;
  }
}

export function readPageLayoutFromSearchParams(
  searchParams: URLSearchParams,
): EventTypesPageLayoutVariant | null {
  const value = searchParams.get(PR_LAYOUT_PARAM);
  if (!value) return null;
  return value as EventTypesPageLayoutVariant;
}

export function readSecretTransitionFromSearchParams(
  searchParams: URLSearchParams,
): EventTypesSecretEventsTransitionChoice | null {
  const value = searchParams.get(PR_SECRET_TRANSITION_PARAM);
  if (!value) return null;
  return value as EventTypesSecretEventsTransitionChoice;
}
