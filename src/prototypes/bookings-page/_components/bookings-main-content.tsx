"use client";

import { PrototypeComponent } from "proto-plugin";

import { BookingsFiltersBar } from "./bookings-filters-bar";
import {
  filterBookings,
  UPCOMING_BOOKINGS,
} from "./bookings-page-mock-data";
import { BookingsList } from "./bookings-list";
import { BookingsToolbar } from "./bookings-toolbar";
import type {
  BookingsActiveFilter,
  BookingsFilterId,
  BookingsLiveState,
} from "./bookings-page-types";

type BookingsMainContentProps = {
  liveState: BookingsLiveState;
  onStatusTabChange: (tab: BookingsLiveState["statusTab"]) => void;
  onViewModeChange: (mode: BookingsLiveState["viewMode"]) => void;
  onFilterButtonClick: () => void;
  onAddFilterOpenChange: (open: boolean) => void;
  onAddFilter: (filter: BookingsActiveFilter) => void;
  onRemoveFilter: (id: BookingsFilterId) => void;
  onClearFilters: () => void;
};

function resolveBookings(liveState: BookingsLiveState) {
  if (liveState.statusTab !== "upcoming") {
    return [];
  }

  return filterBookings(UPCOMING_BOOKINGS, liveState.activeFilters);
}

export function BookingsMainContent({
  liveState,
  onStatusTabChange,
  onViewModeChange,
  onFilterButtonClick,
  onAddFilterOpenChange,
  onAddFilter,
  onRemoveFilter,
  onClearFilters,
}: BookingsMainContentProps) {
  const bookings = resolveBookings(liveState);
  const showFiltersBar =
    liveState.showFiltersBar || liveState.activeFilters.length > 0;

  return (
    <PrototypeComponent
      id="bookings-main-content"
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <BookingsToolbar
        statusTab={liveState.statusTab}
        onStatusTabChange={onStatusTabChange}
        filterCount={liveState.activeFilters.length}
        onFilterButtonClick={onFilterButtonClick}
        viewMode={liveState.viewMode}
        onViewModeChange={onViewModeChange}
        addFilterOpen={liveState.addFilterOpen}
        onAddFilterOpenChange={onAddFilterOpenChange}
        onAddFilter={onAddFilter}
        activeFilters={liveState.activeFilters}
      />

      {showFiltersBar ? (
        <BookingsFiltersBar
          activeFilters={liveState.activeFilters}
          addFilterOpen={liveState.addFilterOpen}
          onAddFilterOpenChange={onAddFilterOpenChange}
          onAddFilter={onAddFilter}
          onRemoveFilter={onRemoveFilter}
          onClearFilters={onClearFilters}
        />
      ) : null}

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
        {liveState.viewMode === "list" ? (
          <BookingsList statusTab={liveState.statusTab} bookings={bookings} />
        ) : (
          <PrototypeComponent
            id="bookings-calendar-placeholder"
            className="border-subtle bg-default flex min-h-[320px] items-center justify-center rounded-lg border border-dashed"
          >
            <p className="text-subtle text-sm">Calendar view preview</p>
          </PrototypeComponent>
        )}
      </div>
    </PrototypeComponent>
  );
}
