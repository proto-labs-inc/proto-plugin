"use client";

import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { CalendarIcon, MenuIcon } from "@coss/ui/icons";

import { STATUS_TAB_OPTIONS } from "./bookings-page-mock-data";
import { BookingsToggleGroup } from "./bookings-toggle-group";
import type { BookingStatusTab, BookingsViewMode } from "./bookings-page-types";

type BookingsToolbarProps = {
  statusTab: BookingStatusTab;
  onStatusTabChange: (tab: BookingStatusTab) => void;
  filterCount: number;
  onFilterButtonClick: () => void;
  viewMode: BookingsViewMode;
  onViewModeChange: (mode: BookingsViewMode) => void;
};

export function BookingsToolbar({
  statusTab,
  onStatusTabChange,
  filterCount,
  onFilterButtonClick,
  viewMode,
  onViewModeChange,
}: BookingsToolbarProps) {
  return (
    <PrototypeComponent id="bookings-toolbar" className="flex flex-wrap items-center gap-2">
      <div className="w-full md:w-auto">
        <div className="overflow-x-auto md:overflow-visible">
          <BookingsToggleGroup
            value={statusTab}
            onValueChange={(value) => onStatusTabChange(value as BookingStatusTab)}
            options={STATUS_TAB_OPTIONS.map((tab) => ({
              value: tab.value,
              label: tab.label,
            }))}
          />
        </div>
      </div>

      <Button
        color="secondary"
        StartIcon="list-filter"
        className="h-full"
        size="sm"
        onClick={onFilterButtonClick}
      >
        Filter
        {filterCount > 0 ? (
          <Badge variant="gray" className="ml-1">
            {filterCount}
          </Badge>
        ) : null}
      </Button>

      <div className="hidden grow md:block" />

      <Button color="secondary" EndIcon="chevron-down" size="sm">
        Saved filters
      </Button>

      <div className="hidden sm:block">
        <BookingsToggleGroup
          value={viewMode}
          onValueChange={(value) => onViewModeChange(value as BookingsViewMode)}
          options={[
            {
              value: "list",
              label: "",
              iconLeft: <MenuIcon className="h-4 w-4" />,
            },
            {
              value: "calendar",
              label: "",
              iconLeft: <CalendarIcon className="h-4 w-4" />,
            },
          ]}
        />
      </div>
    </PrototypeComponent>
  );
}
