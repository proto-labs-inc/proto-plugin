"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { usePrototypeComments } from "@prototype/lib/prototypes/use-prototype-comments";
import { usePrototypeReviewOptional } from "@prototype/lib/prototypes/prototype-review-context";
import { useCallback, useEffect, useState } from "react";

import { BookingsMainContent } from "./_components/bookings-main-content";
import {
  createLiveStateForPreview,
  DEFAULT_BOOKINGS_PAGE_PREVIEW_STATE,
  type BookingsPagePreviewStateId,
} from "./_components/bookings-page-preview-states";
import { BookingsPagePreviewStateSelect } from "./_components/bookings-page-preview-state-select";
import { buildBookingsPageStateCanvasConfig } from "./_components/bookings-page-state-canvas-config";
import type {
  BookingsActiveFilter,
  BookingsFilterId,
  BookingsLiveState,
} from "./_components/bookings-page-types";
import { BookingsShellLayout } from "./_components/bookings-shell-layout";

function createDefaultLiveState(): BookingsLiveState {
  return createLiveStateForPreview(DEFAULT_BOOKINGS_PAGE_PREVIEW_STATE);
}

function inferPreviewStateId(state: BookingsLiveState): BookingsPagePreviewStateId {
  if (state.statusTab === "unconfirmed" && state.activeFilters.length === 0) {
    return "unconfirmed-empty";
  }

  if (
    state.statusTab === "upcoming" &&
    state.activeFilters.some((filter) => filter.valueLabel === "30 min meeting")
  ) {
    return "upcoming-filtered-empty";
  }

  if (state.statusTab === "upcoming" && state.activeFilters.length === 0) {
    return "upcoming-list";
  }

  return state.previewStateId;
}

export default function BookingsPage() {
  const [liveState, setLiveState] = useState<BookingsLiveState>(createDefaultLiveState);
  const review = usePrototypeReviewOptional();

  const onRestore = useCallback((restored: BookingsLiveState) => {
    setLiveState(restored);
  }, []);

  usePrototypeComments(liveState, onRestore);

  const setPreviewState = useCallback((previewStateId: BookingsPagePreviewStateId) => {
    setLiveState(createLiveStateForPreview(previewStateId));
  }, []);

  const setStatusTab = useCallback((statusTab: BookingsLiveState["statusTab"]) => {
    setLiveState((current) => {
      const next = {
        ...current,
        statusTab,
        previewStateId: inferPreviewStateId({ ...current, statusTab }),
      };
      return {
        ...next,
        previewStateId: inferPreviewStateId(next),
      };
    });
  }, []);

  const setViewMode = useCallback((viewMode: BookingsLiveState["viewMode"]) => {
    setLiveState((current) => ({ ...current, viewMode }));
  }, []);

  const handleFilterButtonClick = useCallback(() => {
    setLiveState((current) => {
      if (current.activeFilters.length === 0) {
        return { ...current, addFilterOpen: true, showFiltersBar: true };
      }
      return { ...current, showFiltersBar: !current.showFiltersBar };
    });
  }, []);

  const handleAddFilterOpenChange = useCallback((addFilterOpen: boolean) => {
    setLiveState((current) => ({ ...current, addFilterOpen }));
  }, []);

  const handleAddFilter = useCallback((filter: BookingsActiveFilter) => {
    setLiveState((current) => {
      const activeFilters = [
        ...current.activeFilters.filter((item) => item.id !== filter.id),
        filter,
      ];
      const next = {
        ...current,
        activeFilters,
        showFiltersBar: true,
        addFilterOpen: false,
      };
      return {
        ...next,
        previewStateId: inferPreviewStateId(next),
      };
    });
  }, []);

  const handleRemoveFilter = useCallback((id: BookingsFilterId) => {
    setLiveState((current) => {
      const activeFilters = current.activeFilters.filter((filter) => filter.id !== id);
      const next = {
        ...current,
        activeFilters,
        showFiltersBar: activeFilters.length > 0,
      };
      return {
        ...next,
        previewStateId: inferPreviewStateId(next),
      };
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setLiveState((current) => {
      const next = {
        ...current,
        activeFilters: [],
        showFiltersBar: false,
        addFilterOpen: false,
      };
      return {
        ...next,
        previewStateId: inferPreviewStateId(next),
      };
    });
  }, []);

  const setStateCanvasConfig = review?.setStateCanvasConfig;
  useEffect(() => {
    if (!setStateCanvasConfig) return;

    setStateCanvasConfig(
      buildBookingsPageStateCanvasConfig(liveState.previewStateId, setPreviewState),
    );

    return () => setStateCanvasConfig(null);
  }, [liveState.previewStateId, setPreviewState, setStateCanvasConfig]);

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
          <BookingsPagePreviewStateSelect
            previewStateId={liveState.previewStateId}
            onPreviewStateChange={setPreviewState}
            registerOnly
          />
        </div>

        <BookingsShellLayout>
          <BookingsMainContent
            liveState={liveState}
            onStatusTabChange={setStatusTab}
            onViewModeChange={setViewMode}
            onFilterButtonClick={handleFilterButtonClick}
            onAddFilterOpenChange={handleAddFilterOpenChange}
            onAddFilter={handleAddFilter}
            onRemoveFilter={handleRemoveFilter}
            onClearFilters={handleClearFilters}
          />
        </BookingsShellLayout>

        <BookingsPagePreviewStateSelect
          previewStateId={liveState.previewStateId}
          onPreviewStateChange={setPreviewState}
        />
      </PrototypeComponent>
    </PrototypeComponent>
  );
}
