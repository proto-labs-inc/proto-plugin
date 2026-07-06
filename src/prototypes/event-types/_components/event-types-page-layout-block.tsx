"use client";

import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import { ArrowButton } from "@calcom/ui/components/arrow-button";
import Icon from "@calcom/ui/components/icon/Icon";
import { showToast } from "@calcom/ui/components/toast";
import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import classNames from "@calcom/ui/classNames";

import { EventTypesEmptyState } from "./event-types-empty-state";
import { EventTypeListItemActions } from "./event-types-list-item";
import {
  EVENT_TYPES_PROFILE_SLUG,
  EVENT_TYPES_URL_PREFIX,
  filterEventTypes,
} from "./event-types-mock-data";
import type { EventTypesPageLayoutVariant } from "./event-types-page-layout-content";
import type { MockEventType } from "./event-types-types";

type EventTypesPageLayoutBlockProps = {
  variant: EventTypesPageLayoutVariant;
  eventTypes: MockEventType[];
  searchTerm: string;
  secretFilterActive: boolean;
  onToggleHidden: (id: number) => void;
  onCreateClick: () => void;
  embedded?: boolean;
};

function useFilteredEventTypes(
  eventTypes: MockEventType[],
  searchTerm: string,
  secretFilterActive: boolean,
) {
  return filterEventTypes(
    eventTypes,
    searchTerm,
    EVENT_TYPES_PROFILE_SLUG,
    secretFilterActive,
  );
}

function EventTypeBadges({ type }: { type: MockEventType }) {
  return (
    <ul className="flex flex-wrap gap-x-2 gap-y-1">
      <li>
        <Badge variant="gray" startIcon="clock">
          {type.length}m
        </Badge>
      </li>
      {type.isSecret ? (
        <li>
          <Badge variant="orange" startIcon="lock">
            Secret
          </Badge>
        </li>
      ) : null}
    </ul>
  );
}

function StackedListLayout({
  eventTypes,
  onToggleHidden,
}: {
  eventTypes: MockEventType[];
  onToggleHidden: (id: number) => void;
}) {
  return (
    <PrototypeComponent
      id="event-types-list"
      className="border-subtle bg-default flex flex-col overflow-hidden rounded-md border"
    >
      <ul className="static! divide-subtle w-full divide-y" data-testid="event-types">
        {eventTypes.map((type, index) => (
          <li key={type.id}>
            <div className="hover:bg-cal-muted flex w-full items-center justify-between transition">
              <div className="group flex w-full max-w-full items-center justify-between overflow-hidden px-4 py-4 sm:px-6">
                {index > 0 ? (
                  <ArrowButton arrowDirection="up" onClick={() => undefined} />
                ) : null}
                {index < eventTypes.length - 1 ? (
                  <ArrowButton arrowDirection="down" onClick={() => undefined} />
                ) : null}

                <div className="relative flex-1 overflow-hidden pr-4 text-sm">
                  <div title={type.title}>
                    <div>
                      <span className="text-default break-words font-semibold ltr:mr-1 rtl:ml-1">
                        {type.title}
                      </span>
                      <small className="text-subtle hidden font-normal leading-4 sm:inline">
                        {`/${EVENT_TYPES_PROFILE_SLUG}/${type.slug}`}
                      </small>
                    </div>
                    <div className="mt-2">
                      <EventTypeBadges type={type} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 hidden sm:mt-0 sm:flex">
                  <EventTypeListItemActions type={type} onToggleHidden={onToggleHidden} />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </PrototypeComponent>
  );
}

function CardGridLayout({
  eventTypes,
  onToggleHidden,
  embedded,
}: {
  eventTypes: MockEventType[];
  onToggleHidden: (id: number) => void;
  embedded?: boolean;
}) {
  return (
    <PrototypeComponent
      id="event-types-page-layout-card-grid"
      className={classNames(
        "grid gap-3",
        embedded ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
      )}
    >
      {eventTypes.map((type) => (
        <article
          key={type.id}
          className="border-subtle bg-default hover:bg-cal-muted flex flex-col rounded-lg border p-4 transition"
        >
          <div className="min-w-0 flex-1">
            <h4 className="text-default truncate font-semibold">{type.title}</h4>
            <p className="text-subtle mt-1 truncate text-sm">
              {`/${EVENT_TYPES_PROFILE_SLUG}/${type.slug}`}
            </p>
            <div className="mt-3">
              <EventTypeBadges type={type} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end border-t border-subtle pt-3">
            <EventTypeListItemActions type={type} onToggleHidden={onToggleHidden} />
          </div>
        </article>
      ))}
    </PrototypeComponent>
  );
}

function CompactTableLayout({
  eventTypes,
  onToggleHidden,
}: {
  eventTypes: MockEventType[];
  onToggleHidden: (id: number) => void;
}) {
  return (
    <PrototypeComponent
      id="event-types-page-layout-compact-table"
      className="border-subtle bg-default overflow-hidden rounded-md border"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-subtle bg-subtle border-b">
            <tr>
              <th className="text-subtle px-4 py-3 font-medium">Event type</th>
              <th className="text-subtle px-4 py-3 font-medium">Duration</th>
              <th className="text-subtle px-4 py-3 font-medium">Visibility</th>
              <th className="text-subtle px-4 py-3 font-medium">Booking link</th>
              <th className="text-subtle px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-subtle divide-y">
            {eventTypes.map((type) => (
              <tr key={type.id} className="hover:bg-cal-muted transition">
                <td className="px-4 py-3">
                  <div className="text-default font-medium">{type.title}</div>
                  {type.isSecret ? (
                    <Badge variant="orange" startIcon="lock" className="mt-1">
                      Secret
                    </Badge>
                  ) : null}
                </td>
                <td className="text-default px-4 py-3">{type.length} min</td>
                <td className="px-4 py-3">
                  <span className={type.hidden ? "text-subtle" : "text-default"}>
                    {type.hidden ? "Hidden" : "Visible"}
                  </span>
                </td>
                <td className="text-subtle px-4 py-3">
                  {`/${EVENT_TYPES_PROFILE_SLUG}/${type.slug}`}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <EventTypeListItemActions type={type} onToggleHidden={onToggleHidden} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PrototypeComponent>
  );
}

function SplitPreviewLayout({
  eventTypes,
  onToggleHidden,
}: {
  eventTypes: MockEventType[];
  onToggleHidden: (id: number) => void;
}) {
  const selected = eventTypes[0];

  return (
    <PrototypeComponent
      id="event-types-page-layout-split-preview"
      className="border-subtle bg-default flex min-h-0 flex-1 overflow-hidden rounded-md border"
    >
      <div className="border-subtle w-full max-w-xs shrink-0 overflow-y-auto border-r sm:max-w-sm">
        <ul className="divide-subtle divide-y">
          {eventTypes.map((type, index) => (
            <li key={type.id}>
              <button
                type="button"
                className={classNames(
                  "hover:bg-cal-muted flex w-full items-start gap-3 px-4 py-3 text-left transition",
                  index === 0 && "bg-cal-muted",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-default truncate font-medium">{type.title}</p>
                  <p className="text-subtle mt-0.5 text-xs">{type.length} min</p>
                </div>
                {type.isSecret ? (
                  <Icon name="lock" className="text-subtle mt-0.5 h-3.5 w-3.5 shrink-0" />
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selected ? (
        <div className="min-w-0 flex-1 overflow-y-auto p-6">
          <p className="text-subtle text-xs font-medium uppercase tracking-wide">
            Selected event type
          </p>
          <h3 className="text-emphasis mt-2 text-2xl font-semibold">{selected.title}</h3>
          <p className="text-subtle mt-2 text-sm">
            {`/${EVENT_TYPES_PROFILE_SLUG}/${selected.slug}`}
          </p>
          <div className="mt-4">
            <EventTypeBadges type={selected} />
          </div>
          <p className="text-default mt-6 max-w-lg text-sm leading-relaxed">
            Share this link so people can book a {selected.length}-minute meeting on your
            calendar.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              href={`/${EVENT_TYPES_PROFILE_SLUG}/${selected.slug}`}
              target="_blank"
            >
              Preview booking page
            </Button>
            <Button
              color="secondary"
              onClick={() => {
                void navigator.clipboard.writeText(
                  `${EVENT_TYPES_URL_PREFIX}/${EVENT_TYPES_PROFILE_SLUG}/${selected.slug}`,
                );
                showToast("Link copied", "success");
              }}
            >
              Copy link
            </Button>
          </div>
          <div className="border-subtle mt-8 border-t pt-6">
            <p className="text-subtle mb-3 text-sm font-medium">Profile visibility</p>
            <EventTypeListItemActions type={selected} onToggleHidden={onToggleHidden} />
          </div>
        </div>
      ) : null}
    </PrototypeComponent>
  );
}

function GroupedSectionsLayout({
  eventTypes,
  onToggleHidden,
}: {
  eventTypes: MockEventType[];
  onToggleHidden: (id: number) => void;
}) {
  const publicTypes = eventTypes.filter((type) => !type.isSecret);
  const secretTypes = eventTypes.filter((type) => type.isSecret);

  function renderSection(title: string, items: MockEventType[]) {
    if (items.length === 0) return null;

    return (
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-emphasis text-sm font-semibold">{title}</h3>
          <Badge variant="gray">{items.length}</Badge>
        </div>
        <div className="border-subtle bg-default overflow-hidden rounded-md border">
          <ul className="divide-subtle divide-y">
            {items.map((type) => (
              <li key={type.id}>
                <div className="hover:bg-cal-muted flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
                  <div className="min-w-0 flex-1">
                    <p className="text-default truncate font-semibold">{type.title}</p>
                    <p className="text-subtle mt-1 truncate text-sm">
                      {`/${EVENT_TYPES_PROFILE_SLUG}/${type.slug}`}
                    </p>
                    <div className="mt-2">
                      <EventTypeBadges type={type} />
                    </div>
                  </div>
                  <div className="hidden shrink-0 sm:flex">
                    <EventTypeListItemActions type={type} onToggleHidden={onToggleHidden} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <PrototypeComponent
      id="event-types-page-layout-grouped-sections"
      className="flex flex-col gap-6"
    >
      {renderSection("Public event types", publicTypes)}
      {renderSection("Secret event types", secretTypes)}
    </PrototypeComponent>
  );
}

export function EventTypesPageLayoutBlock({
  variant,
  eventTypes,
  searchTerm,
  secretFilterActive,
  onToggleHidden,
  onCreateClick,
  embedded = false,
}: EventTypesPageLayoutBlockProps) {
  const filteredEventTypes = useFilteredEventTypes(
    eventTypes,
    searchTerm,
    secretFilterActive,
  );

  const content =
    filteredEventTypes.length === 0 ? (
      <EventTypesEmptyState searchTerm={searchTerm} onCreateClick={onCreateClick} />
    ) : variant === "card-grid" ? (
      <CardGridLayout
        eventTypes={filteredEventTypes}
        onToggleHidden={onToggleHidden}
        embedded={embedded}
      />
    ) : variant === "compact-table" ? (
      <CompactTableLayout
        eventTypes={filteredEventTypes}
        onToggleHidden={onToggleHidden}
      />
    ) : variant === "split-preview" ? (
      <SplitPreviewLayout
        eventTypes={filteredEventTypes}
        onToggleHidden={onToggleHidden}
      />
    ) : variant === "grouped-sections" ? (
      <GroupedSectionsLayout
        eventTypes={filteredEventTypes}
        onToggleHidden={onToggleHidden}
      />
    ) : (
      <StackedListLayout
        eventTypes={filteredEventTypes}
        onToggleHidden={onToggleHidden}
      />
    );

  return (
    <PrototypeComponent id="event-types-page-layout-block" className="contents">
      {content}
    </PrototypeComponent>
  );
}
