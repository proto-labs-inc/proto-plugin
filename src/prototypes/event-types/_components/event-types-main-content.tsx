"use client";

import { PrototypeComponent } from "proto-plugin";

import { EventTypesCreateModal } from "./event-types-create-modal";
import { EventTypesPageHeader } from "./event-types-page-header";
import { EventTypesPageLayoutBlock } from "./event-types-page-layout-block";
import type { EventTypesPageLayoutVariant } from "./event-types-page-layout-content";
import { EventTypesSecretEventsTransitionBlock } from "./event-types-secret-events-transition-block";
import type { EventTypesSecretEventsTransitionChoice } from "./event-types-secret-events-transition-content";
import type { EventTypesLiveState } from "./event-types-types";

type EventTypesMainContentProps = {
  liveState: EventTypesLiveState;
  layoutVariant: EventTypesPageLayoutVariant;
  secretEventsTransitionVariant: EventTypesSecretEventsTransitionChoice;
  onSearchTermChange: (searchTerm: string) => void;
  onSecretFilterChange: (active: boolean) => void;
  onCreateModalOpenChange: (open: boolean) => void;
  onCreateFormChange: (form: EventTypesLiveState["createForm"]) => void;
  onToggleHidden: (id: number) => void;
};

export function EventTypesMainContent({
  liveState,
  layoutVariant,
  secretEventsTransitionVariant,
  onSearchTermChange,
  onSecretFilterChange,
  onCreateModalOpenChange,
  onCreateFormChange,
  onToggleHidden,
}: EventTypesMainContentProps) {
  return (
    <PrototypeComponent
      id="event-types-main-content"
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <EventTypesPageHeader
        searchTerm={liveState.searchTerm}
        onSearchTermChange={onSearchTermChange}
        onNewClick={() => onCreateModalOpenChange(true)}
      />

      <EventTypesSecretEventsTransitionBlock
        variant={secretEventsTransitionVariant}
        secretFilterActive={liveState.secretFilterActive}
        onSecretFilterChange={onSecretFilterChange}
      />

      <div
        className={
          layoutVariant === "split-preview"
            ? "flex min-h-0 flex-1 flex-col overflow-hidden"
            : "min-h-0 flex-1 overflow-y-auto"
        }
      >
        <EventTypesPageLayoutBlock
          variant={layoutVariant}
          eventTypes={liveState.eventTypes}
          searchTerm={liveState.searchTerm}
          secretFilterActive={liveState.secretFilterActive}
          onToggleHidden={onToggleHidden}
          onCreateClick={() => onCreateModalOpenChange(true)}
        />
      </div>

      <EventTypesCreateModal
        open={liveState.createModalOpen}
        form={liveState.createForm}
        onOpenChange={onCreateModalOpenChange}
        onFormChange={onCreateFormChange}
      />
    </PrototypeComponent>
  );
}
