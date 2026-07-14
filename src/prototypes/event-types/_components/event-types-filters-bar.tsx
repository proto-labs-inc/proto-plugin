"use client";

import { Badge } from "@calcom/ui/components/badge";
import classNames from "@calcom/ui/classNames";
import Icon from "@calcom/ui/components/icon/Icon";
import { PrototypeComponent } from "proto";

import { SECRET_EVENTS_FILTER_LABEL } from "./event-types-mock-data";

type EventTypesFiltersBarProps = {
  secretFilterActive: boolean;
  onSecretFilterChange: (active: boolean) => void;
};

export function EventTypesFiltersBar({
  secretFilterActive,
  onSecretFilterChange,
}: EventTypesFiltersBarProps) {
  if (!secretFilterActive) return null;

  return (
    <PrototypeComponent
      id="event-types-filters-bar"
      className="mb-4 flex flex-wrap items-center gap-2"
    >
      <button
        type="button"
        onClick={() => onSecretFilterChange(false)}
        className={classNames(
          "border-subtle bg-default text-emphasis hover:bg-subtle inline-flex h-[34px] items-center gap-1 rounded-md border px-3 text-sm font-medium transition",
        )}
      >
        <Icon name="disc" className="h-4 w-4 shrink-0 stroke-[1.5px]" />
        <span>Event type</span>
        <Badge variant="gray" className="ml-2">
          {SECRET_EVENTS_FILTER_LABEL}
        </Badge>
        <Icon name="x" className="h-4 w-4 shrink-0 stroke-[1.5px]" />
      </button>
    </PrototypeComponent>
  );
}
