"use client";

import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import classNames from "@calcom/ui/classNames";
import Icon from "@calcom/ui/components/icon/Icon";
import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@prototype/components/ui/dropdown-menu";
import { PlusIcon } from "@coss/ui/icons";

import {
  EVENT_TYPE_FILTER_OPTIONS,
  FILTER_TYPE_OPTIONS,
} from "./bookings-page-mock-data";
import type { BookingsActiveFilter, BookingsFilterId } from "./bookings-page-types";

type BookingsFiltersBarProps = {
  activeFilters: BookingsActiveFilter[];
  addFilterOpen: boolean;
  onAddFilterOpenChange: (open: boolean) => void;
  onAddFilter: (filter: BookingsActiveFilter) => void;
  onRemoveFilter: (id: BookingsFilterId) => void;
  onClearFilters: () => void;
};

export function BookingsFiltersBar({
  activeFilters,
  addFilterOpen,
  onAddFilterOpenChange,
  onAddFilter,
  onRemoveFilter,
  onClearFilters,
}: BookingsFiltersBarProps) {
  const availableFilterTypes = FILTER_TYPE_OPTIONS.filter(
    (option) => !activeFilters.some((filter) => filter.id === option.id),
  );

  return (
    <PrototypeComponent
      id="bookings-filters-bar"
      className="mt-3 flex flex-wrap items-center gap-2"
    >
      {activeFilters.map((filter) => (
        <DropdownMenu key={filter.id}>
          <DropdownMenuTrigger
            className={classNames(
              "border-subtle bg-default text-emphasis hover:bg-subtle inline-flex h-[34px] items-center gap-1 rounded-md border px-3 text-sm font-medium transition",
            )}
          >
            <Icon name="disc" className="h-4 w-4 shrink-0 stroke-[1.5px]" />
            <span>{filter.label}</span>
            <Badge variant="gray" className="ml-2">
              {filter.valueLabel}
            </Badge>
            <Icon name="chevron-down" className="h-4 w-4 shrink-0 stroke-[1.5px]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[220px]">
            {EVENT_TYPE_FILTER_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => {
                  onAddFilter({
                    id: "eventType",
                    label: "Event type",
                    valueLabel: option.label,
                  });
                }}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onSelect={() => onRemoveFilter(filter.id)}>
              Remove filter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}

      {availableFilterTypes.length > 0 ? (
        <DropdownMenu open={addFilterOpen} onOpenChange={onAddFilterOpenChange}>
          <DropdownMenuTrigger
            aria-label="Add filter"
            className={classNames(
              "border-subtle bg-default text-emphasis hover:bg-subtle inline-flex h-[34px] w-[34px] items-center justify-center rounded-md border transition",
            )}
          >
            <PlusIcon className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[220px]">
            {availableFilterTypes.map((option) => (
              <DropdownMenuItem
                key={option.id}
                onSelect={() => {
                  if (option.id === "eventType") {
                    onAddFilter({
                      id: "eventType",
                      label: "Event type",
                      valueLabel: "30 min meeting",
                    });
                  }
                  onAddFilterOpenChange(false);
                }}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      <div className="hidden flex-grow md:block" />

      <Button color="minimal" StartIcon="x" size="sm" onClick={onClearFilters}>
        Clear
      </Button>
      <Button color="secondary" StartIcon="bookmark" size="sm">
        Save
      </Button>
    </PrototypeComponent>
  );
}
