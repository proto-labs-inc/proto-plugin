"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";

import { EventTypesCreateModal } from "./event-types-create-modal";
import { EventTypesList } from "./event-types-list";
import { EventTypesPageHeader } from "./event-types-page-header";
import type { EventTypesLiveState } from "./event-types-types";

type EventTypesMainContentProps = {
  liveState: EventTypesLiveState;
  onSearchTermChange: (searchTerm: string) => void;
  onCreateModalOpenChange: (open: boolean) => void;
  onCreateFormChange: (form: EventTypesLiveState["createForm"]) => void;
  onToggleHidden: (id: number) => void;
};

export function EventTypesMainContent({
  liveState,
  onSearchTermChange,
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

      <div className="min-h-0 flex-1 overflow-y-auto">
        <EventTypesList
          eventTypes={liveState.eventTypes}
          searchTerm={liveState.searchTerm}
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
