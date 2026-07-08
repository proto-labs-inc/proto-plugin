"use client";

import { PrototypeComponent } from "proto-plugin";

import { EVENT_TYPES_PROFILE_SLUG, filterEventTypes } from "./event-types-mock-data";
import { EventTypesEmptyState } from "./event-types-empty-state";
import { EventTypeListItem } from "./event-types-list-item";
import type { MockEventType } from "./event-types-types";

type EventTypesListProps = {
  eventTypes: MockEventType[];
  searchTerm: string;
  secretFilterActive: boolean;
  onToggleHidden: (id: number) => void;
  onCreateClick: () => void;
};

export function EventTypesList({
  eventTypes,
  searchTerm,
  secretFilterActive,
  onToggleHidden,
  onCreateClick,
}: EventTypesListProps) {
  const filteredEventTypes = filterEventTypes(
    eventTypes,
    searchTerm,
    EVENT_TYPES_PROFILE_SLUG,
    secretFilterActive,
  );

  if (filteredEventTypes.length === 0) {
    return (
      <EventTypesEmptyState searchTerm={searchTerm} onCreateClick={onCreateClick} />
    );
  }

  return (
    <PrototypeComponent
      id="event-types-list"
      className="border-subtle bg-default flex flex-col overflow-hidden rounded-md border"
    >
      <ul className="static! divide-subtle w-full divide-y" data-testid="event-types">
        {filteredEventTypes.map((type, index) => (
          <EventTypeListItem
            key={type.id}
            type={type}
            isFirst={index === 0}
            isLast={index === filteredEventTypes.length - 1}
            onToggleHidden={onToggleHidden}
          />
        ))}
      </ul>
    </PrototypeComponent>
  );
}
