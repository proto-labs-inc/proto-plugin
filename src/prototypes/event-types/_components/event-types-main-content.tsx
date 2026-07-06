"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";

import { EventTypesCreateModal } from "./event-types-create-modal";
import { EventTypesFiltersBar } from "./event-types-filters-bar";
import { EventTypesPageHeader } from "./event-types-page-header";
import { EventTypesPageLayoutBlock } from "./event-types-page-layout-block";
import type { EventTypesPageLayoutVariant } from "./event-types-page-layout-content";
import type { EventTypesLiveState } from "./event-types-types";

type EventTypesMainContentProps = {
  liveState: EventTypesLiveState;
  layoutVariant: EventTypesPageLayoutVariant;
  onSearchTermChange: (searchTerm: string) => void;
  onSecretFilterChange: (active: boolean) => void;
  onCreateModalOpenChange: (open: boolean) => void;
  onCreateFormChange: (form: EventTypesLiveState["createForm"]) => void;
  onToggleHidden: (id: number) => void;
};

export function EventTypesMainContent({
  liveState,
  layoutVariant,
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

      {liveState.secretFilterActive ? (
        <EventTypesFiltersBar
          secretFilterActive={liveState.secretFilterActive}
          onSecretFilterChange={onSecretFilterChange}
        />
      ) : null}

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
