"use client";

import { Button } from "@calcom/ui/components/button";
import { EmptyScreen } from "@calcom/ui/components/empty-screen";
import { PrototypeComponent } from "proto";

type EventTypesEmptyStateProps = {
  searchTerm: string;
  onCreateClick: () => void;
};

export function EventTypesEmptyState({
  searchTerm,
  onCreateClick,
}: EventTypesEmptyStateProps) {
  const headline = searchTerm
    ? `No result found for "${searchTerm}"`
    : "Add a new event type";

  return (
    <PrototypeComponent id="event-types-empty-state" className="w-full">
      <EmptyScreen
        Icon="link"
        headline={headline}
        description="Event types enable you to share links that show available times on your calendar and allow people to make bookings with you."
        className="mb-16"
        buttonRaw={
          <Button variant="button" onClick={onCreateClick}>
            Create
          </Button>
        }
      />
    </PrototypeComponent>
  );
}
