"use client";

import {
  buildPrAgentPrompt,
  PrototypeComponent,
  PrototypeSpecPanelContent,
  usePrototypeComments,
  usePrototypeReviewOptional,
} from "proto-plugin";
import { useCallback, useEffect, useState } from "react";

import { EventTypesMainContent } from "./_components/event-types-main-content";
import {
  DEFAULT_EVENT_TYPES_PAGE_LAYOUT_VARIANT,
  type EventTypesPageLayoutVariant,
} from "./_components/event-types-page-layout-content";
import { EventTypesPageLayoutVariantToggle } from "./_components/event-types-page-layout-variant-toggle";
import {
  DEFAULT_EVENT_TYPES_SECRET_EVENTS_TRANSITION_VARIANT,
  type EventTypesSecretEventsTransitionChoice,
} from "./_components/event-types-secret-events-transition-content";
import { EventTypesSecretEventsTransitionVariantToggle } from "./_components/event-types-secret-events-transition-variant-toggle";
import {
  createLiveStateForPreview,
  DEFAULT_EVENT_TYPES_PREVIEW_STATE,
  type EventTypesPreviewStateId,
} from "./_components/event-types-preview-states";
import { EventTypesPreviewStateSelect } from "./_components/event-types-preview-state-select";
import {
  findPrSplitEntry,
  PR_SPLIT_CONFIG,
  PR_SPLIT_ENTRIES,
  readLiveStateFromSearchParams,
  readPageLayoutFromSearchParams,
  readSecretTransitionFromSearchParams,
  type EventTypesPrSplitEntry,
} from "./_components/pr-split-config";
import { PrSplitWireframe } from "./_components/pr-split-wireframes";
import { buildEventTypesStateCanvasConfig } from "./_components/event-types-state-canvas-config";
import { EventTypesShellLayout } from "./_components/event-types-shell-layout";
import type { EventTypesLiveState } from "./_components/event-types-types";
import { useRegisterEventTypesVariantSets } from "./_components/event-types-variant-sets";
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
    state.secretFilterActive,
  );
  if (state.searchTerm.trim().length > 0 && filtered.length === 0) {
    return "empty-search";
  }

  if (state.secretFilterActive) {
    return "secret-events-filter";
  }

  return "event-types-list";
}

export default function EventTypesPage() {
  const [liveState, setLiveState] = useState<EventTypesLiveState>(createDefaultLiveState);
  const [pageLayoutVariant, setPageLayoutVariant] = useState<EventTypesPageLayoutVariant>(
    DEFAULT_EVENT_TYPES_PAGE_LAYOUT_VARIANT,
  );
  const [secretEventsTransitionVariant, setSecretEventsTransitionVariant] =
    useState<EventTypesSecretEventsTransitionChoice>(
      DEFAULT_EVENT_TYPES_SECRET_EVENTS_TRANSITION_VARIANT,
    );
  const [selectedPrOrder, setSelectedPrOrder] = useState<number | null>(null);
  const review = usePrototypeReviewOptional();
  const setSpecContent = review?.setSpecContent;
  const focusShareTarget = review?.focusShareTarget;

  const onRestore = useCallback((restored: EventTypesLiveState) => {
    setLiveState(restored);
  }, []);

  usePrototypeComments(liveState, onRestore);
  useRegisterEventTypesVariantSets();

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

  const setSecretFilterActive = useCallback((secretFilterActive: boolean) => {
    setLiveState((current) => {
      const next = { ...current, secretFilterActive };
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

  const applyPrSplitEntry = useCallback((entry: EventTypesPrSplitEntry) => {
    setLiveState(entry.liveState);
    setPageLayoutVariant(entry.pageLayoutVariant);
    setSecretEventsTransitionVariant(entry.secretEventsTransitionVariant);
  }, []);

  const syncPrSplitToUrl = useCallback((entry: EventTypesPrSplitEntry | null) => {
    const url = new URL(window.location.href);
    if (!entry) {
      url.searchParams.delete("prSplit");
      url.searchParams.delete("prLayout");
      url.searchParams.delete("prSecretTransition");
      url.searchParams.delete("shareState");
    } else {
      PR_SPLIT_CONFIG.writeEntryToSearchParams(url.searchParams, entry);
      url.searchParams.set("prSplit", String(entry.order));
    }
    window.history.replaceState(null, "", url);
  }, []);

  const handlePrNavigate = useCallback(
    (entry: EventTypesPrSplitEntry) => {
      setSelectedPrOrder(entry.order);
      applyPrSplitEntry(entry);
      syncPrSplitToUrl(entry);
      focusShareTarget?.(entry.targetId);
    },
    [applyPrSplitEntry, focusShareTarget, syncPrSplitToUrl],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prSplit = params.get("prSplit");
    if (!prSplit) return;

    const order = Number(prSplit);
    const entry = findPrSplitEntry(order);
    if (!entry) return;

    setSelectedPrOrder(order);
    applyPrSplitEntry(entry);

    const restoredLiveState = readLiveStateFromSearchParams(params);
    if (restoredLiveState) {
      setLiveState(restoredLiveState);
    }

    const layoutVariant = readPageLayoutFromSearchParams(params);
    if (layoutVariant) {
      setPageLayoutVariant(layoutVariant);
    }

    const secretTransition = readSecretTransitionFromSearchParams(params);
    if (secretTransition) {
      setSecretEventsTransitionVariant(secretTransition);
    }

    const timer = window.setTimeout(() => {
      focusShareTarget?.(entry.targetId);
    }, 150);
    return () => clearTimeout(timer);
  }, [applyPrSplitEntry, focusShareTarget]);

  useEffect(() => {
    if (!setSpecContent) return;

    setSpecContent(
      <PrototypeSpecPanelContent
        entries={PR_SPLIT_ENTRIES}
        renderWireframe={(id) => <PrSplitWireframe id={id} embedded />}
        buildAgentPrompt={(entry, origin) =>
          buildPrAgentPrompt(entry, PR_SPLIT_ENTRIES, PR_SPLIT_CONFIG, origin)
        }
        onPrNavigate={handlePrNavigate}
        selectedPrOrder={selectedPrOrder}
        defaultPreviewPath={PR_SPLIT_CONFIG.defaultPreviewPath}
        vercelProjectName={PR_SPLIT_CONFIG.vercelProjectName}
      />,
    );

    return () => setSpecContent(null);
  }, [handlePrNavigate, selectedPrOrder, setSpecContent]);

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
        <div className="sr-only" aria-hidden>
          <EventTypesPageLayoutVariantToggle
            variant={pageLayoutVariant}
            onVariantChange={setPageLayoutVariant}
            registerOnly
          />
          <EventTypesSecretEventsTransitionVariantToggle
            variant={
              secretEventsTransitionVariant === "no-entry"
                ? DEFAULT_EVENT_TYPES_SECRET_EVENTS_TRANSITION_VARIANT
                : secretEventsTransitionVariant
            }
            onVariantChange={setSecretEventsTransitionVariant}
            registerOnly
          />
        </div>

        <EventTypesShellLayout
          secretEventsTransitionVariant={secretEventsTransitionVariant}
          secretFilterActive={liveState.secretFilterActive}
          onSecretFilterChange={setSecretFilterActive}
        >
          <EventTypesMainContent
            liveState={liveState}
            layoutVariant={pageLayoutVariant}
            secretEventsTransitionVariant={secretEventsTransitionVariant}
            onSearchTermChange={setSearchTerm}
            onSecretFilterChange={setSecretFilterActive}
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
