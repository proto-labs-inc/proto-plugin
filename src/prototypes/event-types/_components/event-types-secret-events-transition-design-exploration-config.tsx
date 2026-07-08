"use client";

import {
  buildDesignExplorationRenderers,
  type DesignExplorationConfig,
  type MobbinReference,
} from "proto-plugin";
import type { ReactNode } from "react";

import { EventTypesSecretEventsTransitionBlock } from "./event-types-secret-events-transition-block";
import {
  DEFAULT_EVENT_TYPES_SECRET_EVENTS_TRANSITION_VARIANT,
  EVENT_TYPES_SECRET_EVENTS_TRANSITION_BASELINE,
  EVENT_TYPES_SECRET_EVENTS_TRANSITION_VARIANT_OPTIONS,
  type EventTypesSecretEventsTransitionVariant,
} from "./event-types-secret-events-transition-content";

export type { EventTypesSecretEventsTransitionVariant };
export {
  DEFAULT_EVENT_TYPES_SECRET_EVENTS_TRANSITION_VARIANT,
  EVENT_TYPES_SECRET_EVENTS_TRANSITION_BASELINE,
  EVENT_TYPES_SECRET_EVENTS_TRANSITION_VARIANT_OPTIONS,
};

const MOBBIN_REFERENCES: MobbinReference[] = [
  {
    id: "232dc5a5-83ea-4116-b726-009a5af44dab",
    appName: "Calendly",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/3740da7f-3714-483c-bf71-fe0d4295bd94.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/232dc5a5-83ea-4116-b726-009a5af44dab",
    relevance:
      "Event types dashboard with grouped sections and filter chips — reference for chip-row entry points.",
    variantHint: "Filter chip row",
  },
  {
    id: "e91b82fc-09e5-4d9f-b2cc-b08723f03901",
    appName: "Mixpanel",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/e23659c5-2cb0-4d61-bee6-e1fa3e64f9ce.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/e91b82fc-09e5-4d9f-b2cc-b08723f03901",
    relevance:
      "Events table with add-filter control and column filters — maps to dropdown filter entry.",
    variantHint: "Filter dropdown",
  },
  {
    id: "956343a3-cc1f-430a-aaa7-8b439e7ccb6b",
    appName: "Cal.com",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/6e840107-8f4d-463b-8b7c-2a8ed9cec779.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/956343a3-cc1f-430a-aaa7-8b439e7ccb6b",
    relevance:
      "Stacked event-type list with sidebar nav — reference for sidebar sub-nav to a filtered view.",
    variantHint: "Sidebar sub-nav",
  },
];

const COMPONENT_ID_PREFIX = "event-types-secret-events-transition-explorer";
const VARIANT_TABS_ID_PREFIX = "event-types-secret-events-transition-variant-tabs";
const STORAGE_KEY_PREFIX = "event-types-secret-events-transition";

function renderTransitionPreview(
  variant: EventTypesSecretEventsTransitionVariant | "no-entry",
) {
  return (
    <div className="border-subtle bg-cal-muted h-[360px] overflow-hidden rounded-md border">
      <div className="border-subtle bg-default border-b px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-emphasis text-sm font-semibold">Event types</p>
            <p className="text-subtle text-xs">Configure booking links</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-subtle h-8 w-24 rounded-md" />
            <div className="bg-emphasis h-8 w-14 rounded-md" />
          </div>
        </div>
        <EventTypesSecretEventsTransitionBlock
          variant={variant}
          secretFilterActive={false}
          onSecretFilterChange={() => undefined}
        />
      </div>
      <div className="space-y-2 p-3">
        <div className="border-subtle bg-default h-14 rounded-md border" />
        <div className="border-subtle bg-default h-14 rounded-md border" />
        <div className="border-subtle bg-default h-14 rounded-md border opacity-60" />
      </div>
    </div>
  );
}

const renderers = buildDesignExplorationRenderers<
  EventTypesSecretEventsTransitionVariant
>(
  EVENT_TYPES_SECRET_EVENTS_TRANSITION_VARIANT_OPTIONS,
  (variant) => renderTransitionPreview(variant),
  EVENT_TYPES_SECRET_EVENTS_TRANSITION_BASELINE,
);

export function buildEventTypesSecretEventsTransitionDesignExplorationConfig(
  variant: EventTypesSecretEventsTransitionVariant,
  onVariantChange: (next: EventTypesSecretEventsTransitionVariant) => void,
): DesignExplorationConfig<EventTypesSecretEventsTransitionVariant> {
  return {
    componentIdPrefix: COMPONENT_ID_PREFIX,
    variantTabsIdPrefix: VARIANT_TABS_ID_PREFIX,
    storageKeyPrefix: STORAGE_KEY_PREFIX,
    variant,
    onVariantChange,
    options: EVENT_TYPES_SECRET_EVENTS_TRANSITION_VARIANT_OPTIONS,
    baseline: EVENT_TYPES_SECRET_EVENTS_TRANSITION_BASELINE,
    defaultVariant: DEFAULT_EVENT_TYPES_SECRET_EVENTS_TRANSITION_VARIANT,
    renderers,
    brief: {
      titleDefault: "Secret events transition",
      descriptionDefault:
        "Explore how users move from the default event types list into a secret-only view — same filtered list outcome, different entry points and affordances.",
    },
    variantsSection: {
      title: "Transition directions",
      description:
        "Each variant keeps the existing secret filter chip when active. Only the path from the default list changes.",
    },
    mobbin: {
      references: MOBBIN_REFERENCES,
      title: "Mobbin references",
      imagePathForReference: (id) => `/prototypes/mobbin-references/${id}.webp`,
    },
    variantTabAriaLabel: "secret events transition",
    briefConfigFilePath:
      "src/prototypes/event-types/_components/event-types-secret-events-transition-design-exploration-config.tsx",
  };
}

export function renderEventTypesSecretEventsTransitionVariant(
  variant: EventTypesSecretEventsTransitionVariant,
): ReactNode {
  return renderers[variant]();
}
