"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { usePrototypeComments } from "@prototype/lib/prototypes/use-prototype-comments";
import { usePrototypeReviewOptional } from "@prototype/lib/prototypes/prototype-review-context";
import { useCallback, useEffect, useState } from "react";

import { EventTypesMainContent } from "./_components/event-types-main-content";
import {
  createLiveStateForPreview,
  DEFAULT_EVENT_TYPES_PREVIEW_STATE,
  type EventTypesPreviewStateId,
} from "./_components/event-types-preview-states";
import { EventTypesPreviewStateSelect } from "./_components/event-types-preview-state-select";
import { buildEventTypesStateCanvasConfig } from "./_components/event-types-state-canvas-config";
import { EventTypesShellLayout } from "./_components/event-types-shell-layout";
import type { EventTypesLiveState } from "./_components/event-types-types";
import { filterEventTypes, EVENT_TYPES_PROFILE_SLUG } from "./_components/event-types-mock-data";

function createDefaultLiveState(): EventTypesLiveState {
  return createLiveStateForPreview(DEFAULT_EVENT_TYPES_PREVIEW_STATE);
}

function inferPreviewStateId(state: EventTypesLiveState): EventTypesPreviewStateId {
  if (state.createModalOpen) {
    return "new-event-type-modal";
  }

  const filtered = filterEventTypes(
    state.eventTypes,
    state.searchTerm,
    EVENT_TYPES_PROFILE_SLUG,
  );
  if (state.searchTerm.trim().length > 0 && filtered.length === 0) {
    return "empty-search";
  }

  return "event-types-list";
}

export default function EventTypesPage() {
  const [liveState, setLiveState] = useState<EventTypesLiveState>(createDefaultLiveState);
  const review = usePrototypeReviewOptional();

  const onRestore = useCallback((restored: EventTypesLiveState) => {
    setLiveState(restored);
  }, []);

  usePrototypeComments(liveState, onRestore);

  const setPreviewState = useCallback((previewStateId: EventTypesPreviewStateId) => {
    setLiveState(createLiveStateForPreview(previewStateId));
  }, []);

  const setSearchTerm = useCallback((searchTerm: string) => {
    setLiveState((current) => {
      const next = { ...current, searchTerm };
      return {
        ...next,
        previewStateId: inferPreviewStateId(next),
      };
    });
  }, []);

  const setCreateModalOpen = useCallback((createModalOpen: boolean) => {
    setLiveState((current) => {
      const next = { ...current, createModalOpen };
      return {
        ...next,
        previewStateId: inferPreviewStateId(next),
      };
    });
  }, []);

  const setCreateForm = useCallback((createForm: EventTypesLiveState["createForm"]) => {
    setLiveState((current) => ({ ...current, createForm }));
  }, []);

  const setToggleHidden = useCallback((id: number) => {
    setLiveState((current) => ({
      ...current,
      eventTypes: current.eventTypes.map((type) =>
        type.id === id ? { ...type, hidden: !type.hidden } : type,
      ),
    }));
  }, []);

  const setStateCanvasConfig = review?.setStateCanvasConfig;
  useEffect(() => {
    if (!setStateCanvasConfig) return;

    setStateCanvasConfig(buildEventTypesStateCanvasConfig(setPreviewState));

    return () => setStateCanvasConfig(null);
  }, [setPreviewState, setStateCanvasConfig]);

  return (
    <PrototypeComponent
      id="scroll-container"
      className="bg-default text-default flex h-full min-h-0 flex-1 flex-col overflow-hidden"
      data-cal-design-system
    >
      <PrototypeComponent
        id="page"
        className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden"
      >
        <EventTypesShellLayout>
          <EventTypesMainContent
            liveState={liveState}
            onSearchTermChange={setSearchTerm}
            onCreateModalOpenChange={setCreateModalOpen}
            onCreateFormChange={setCreateForm}
            onToggleHidden={setToggleHidden}
          />
        </EventTypesShellLayout>

        <EventTypesPreviewStateSelect
          previewStateId={liveState.previewStateId}
          onPreviewStateChange={setPreviewState}
        />
      </PrototypeComponent>
    </PrototypeComponent>
  );
}
