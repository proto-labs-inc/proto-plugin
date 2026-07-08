"use client";

import {
  buildDesignExplorationRenderers,
  type DesignExplorationConfig,
  type MobbinReference,
} from "proto-plugin";
import type { ReactNode } from "react";

import { DEFAULT_EVENT_TYPES } from "./event-types-mock-data";
import { EventTypesPageLayoutBlock } from "./event-types-page-layout-block";
import {
  DEFAULT_EVENT_TYPES_PAGE_LAYOUT_VARIANT,
  EVENT_TYPES_PAGE_LAYOUT_BASELINE,
  EVENT_TYPES_PAGE_LAYOUT_VARIANT_OPTIONS,
  type EventTypesPageLayoutVariant,
} from "./event-types-page-layout-content";

export type { EventTypesPageLayoutVariant };
export {
  DEFAULT_EVENT_TYPES_PAGE_LAYOUT_VARIANT,
  EVENT_TYPES_PAGE_LAYOUT_BASELINE,
  EVENT_TYPES_PAGE_LAYOUT_VARIANT_OPTIONS,
};

const MOBBIN_REFERENCES: MobbinReference[] = [
  {
    id: "956343a3-cc1f-430a-aaa7-8b439e7ccb6b",
    appName: "Cal.com",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/6e840107-8f4d-463b-8b7c-2a8ed9cec779.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/956343a3-cc1f-430a-aaa7-8b439e7ccb6b",
    relevance:
      "Stacked event-type rows with title, slug, duration badge, and inline actions — baseline list hierarchy.",
    variantHint: "Stacked list",
  },
  {
    id: "dd7829e7-c96c-4de2-a32d-5dc25aadeafc",
    appName: "Partiful",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/e25fe99a-3a5e-4632-87f9-8ad2369e7932.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/dd7829e7-c96c-4de2-a32d-5dc25aadeafc",
    relevance:
      "Card grid of upcoming events with title, host, and status labels — maps to tile-based browsing.",
    variantHint: "Card grid",
  },
  {
    id: "e91b82fc-09e5-4d9f-b2cc-b08723f03901",
    appName: "Mixpanel",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/e23659c5-2cb0-4d61-bee6-e1fa3e64f9ce.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/e91b82fc-09e5-4d9f-b2cc-b08723f03901",
    relevance:
      "Events table with column headers, filters, and search — reference for scanning many rows at once.",
    variantHint: "Compact table",
  },
  {
    id: "6f2afa65-bbd4-4779-bf16-d0dfb2fa8240",
    appName: "Retool",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/079764e7-266f-4369-8033-cb4ca19a4204.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/6f2afa65-bbd4-4779-bf16-d0dfb2fa8240",
    relevance:
      "Master list beside a detail/form panel — split layout for list selection plus rich preview.",
    variantHint: "Split preview",
  },
  {
    id: "232dc5a5-83ea-4116-b726-009a5af44dab",
    appName: "Calendly",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/3740da7f-3714-483c-bf71-fe0d4295bd94.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/232dc5a5-83ea-4116-b726-009a5af44dab",
    relevance:
      "Event types dashboard with grouped sections and filter chips — reference for labeled list clusters.",
    variantHint: "Grouped sections",
  },
];

const COMPONENT_ID_PREFIX = "event-types-page-layout-explorer";
const VARIANT_TABS_ID_PREFIX = "event-types-page-layout-variant-tabs";
const STORAGE_KEY_PREFIX = "event-types-page-layout";

function renderLayoutPreview(variant: EventTypesPageLayoutVariant) {
  return (
    <div className="border-subtle bg-cal-muted h-[420px] overflow-hidden rounded-md border">
      <div className="border-subtle bg-default border-b px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-emphasis text-sm font-semibold">Event types</p>
            <p className="text-subtle text-xs">Configure booking links</p>
          </div>
          <div className="bg-subtle h-8 w-16 rounded-md" />
        </div>
      </div>
      <div className="h-[calc(100%-57px)] overflow-y-auto p-3">
        <EventTypesPageLayoutBlock
          variant={variant}
          eventTypes={DEFAULT_EVENT_TYPES}
          searchTerm=""
          secretFilterActive={false}
          onToggleHidden={() => undefined}
          onCreateClick={() => undefined}
          embedded
        />
      </div>
    </div>
  );
}

const renderers = buildDesignExplorationRenderers<EventTypesPageLayoutVariant>(
  EVENT_TYPES_PAGE_LAYOUT_VARIANT_OPTIONS,
  (variant) => renderLayoutPreview(variant),
  EVENT_TYPES_PAGE_LAYOUT_BASELINE,
);

export function buildEventTypesPageLayoutDesignExplorationConfig(
  variant: EventTypesPageLayoutVariant,
  onVariantChange: (next: EventTypesPageLayoutVariant) => void,
): DesignExplorationConfig<EventTypesPageLayoutVariant> {
  return {
    componentIdPrefix: COMPONENT_ID_PREFIX,
    variantTabsIdPrefix: VARIANT_TABS_ID_PREFIX,
    storageKeyPrefix: STORAGE_KEY_PREFIX,
    variant,
    onVariantChange,
    options: EVENT_TYPES_PAGE_LAYOUT_VARIANT_OPTIONS,
    baseline: EVENT_TYPES_PAGE_LAYOUT_BASELINE,
    defaultVariant: DEFAULT_EVENT_TYPES_PAGE_LAYOUT_VARIANT,
    renderers,
    brief: {
      titleDefault: "Event types page layout",
      descriptionDefault:
        "Explore alternate layouts for the event types list — same data and actions, different hierarchy for scanning, comparing, and managing booking links.",
    },
    variantsSection: {
      title: "Layout directions",
      description:
        "Each variant keeps the shell sidebar, search, filters, and create modal. Only the list area changes.",
    },
    mobbin: {
      references: MOBBIN_REFERENCES,
      title: "Mobbin references",
      imagePathForReference: (id) => `/prototypes/mobbin-references/${id}.webp`,
    },
    variantTabAriaLabel: "event types page layout",
    briefConfigFilePath:
      "src/prototypes/event-types/_components/event-types-page-layout-design-exploration-config.tsx",
  };
}

export function renderEventTypesPageLayoutVariant(
  variant: EventTypesPageLayoutVariant,
): ReactNode {
  return renderers[variant]();
}
