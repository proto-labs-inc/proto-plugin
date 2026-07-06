"use client";

import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@calcom/ui/components/command";
import { Popover, PopoverContent, PopoverTrigger } from "@calcom/ui/components/popover";
import Icon from "@calcom/ui/components/icon/Icon";
import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
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
        <div
          key={filter.id}
          className="border-subtle bg-default inline-flex h-[34px] items-center rounded-md border px-3 text-sm"
        >
          <Icon name="disc" className="text-muted mr-2 h-4 w-4" />
          <span>{filter.label}</span>
          <Badge variant="gray" className="ml-2">
            {filter.valueLabel}
          </Badge>
          <button
            type="button"
            className="text-subtle hover:text-emphasis ml-2 inline-flex rounded-sm p-0.5"
            aria-label={`Remove ${filter.label} filter`}
            onClick={() => onRemoveFilter(filter.id)}
          >
            <Icon name="x" className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      <Popover open={addFilterOpen} onOpenChange={onAddFilterOpenChange}>
        <PopoverTrigger asChild>
          <Button color="secondary" className="h-full" aria-label="Add filter">
            <span className="sr-only">Add filter</span>
            <PlusIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Add filter…" />
            <CommandList>
              <CommandEmpty>No filters available</CommandEmpty>
              <CommandGroup>
                {availableFilterTypes.map((option) => (
                  <CommandItem
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
                  </CommandItem>
                ))}
              </CommandGroup>
              {availableFilterTypes.some((option) => option.id === "eventType") ? (
                <CommandGroup heading="Event type">
                  {EVENT_TYPE_FILTER_OPTIONS.map((option) => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        onAddFilter({
                          id: "eventType",
                          label: "Event type",
                          valueLabel: option.label,
                        });
                        onAddFilterOpenChange(false);
                      }}
                    >
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="hidden flex-grow md:block" />

      <Button color="secondary" size="sm" onClick={onClearFilters}>
        Clear
      </Button>
      <Button color="secondary" size="sm">
        Save
      </Button>
    </PrototypeComponent>
  );
}
