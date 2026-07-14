"use client";

import { Badge } from "@calcom/ui/components/badge";
import classNames from "@calcom/ui/classNames";
import Icon from "@calcom/ui/components/icon/Icon";
import { SegmentedControl } from "@calcom/ui/components/segmented-control";
import { PrototypeComponent } from "proto-plugin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "proto-plugin/ui/dropdown-menu";
import { PlusIcon } from "@coss/ui/icons";
import { useState } from "react";

import { EventTypesFiltersBar } from "./event-types-filters-bar";
import {
  DEFAULT_EVENT_TYPES,
  SECRET_EVENTS_FILTER_LABEL,
} from "./event-types-mock-data";
import type {
  EventTypesSecretEventsTransitionChoice,
  EventTypesSecretEventsTransitionVariant,
} from "./event-types-secret-events-transition-content";

type EventTypesSecretEventsTransitionBlockProps = {
  variant: EventTypesSecretEventsTransitionChoice;
  secretFilterActive: boolean;
  onSecretFilterChange: (active: boolean) => void;
  secretEventCount?: number;
};

function SecretEventsChip({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "border-subtle bg-default text-emphasis hover:bg-subtle inline-flex h-[34px] items-center gap-1 rounded-md border px-3 text-sm font-medium transition",
        active && "border-emphasis bg-subtle",
      )}
    >
      <Icon name="disc" className="h-4 w-4 shrink-0 stroke-[1.5px]" />
      <span>Event type</span>
      <Badge variant="gray" className="ml-2">
        {SECRET_EVENTS_FILTER_LABEL}
      </Badge>
      {active ? (
        <Icon name="x" className="h-4 w-4 shrink-0 stroke-[1.5px]" />
      ) : null}
    </button>
  );
}

function FilterChipRowEntry({
  secretFilterActive,
  onSecretFilterChange,
}: Pick<
  EventTypesSecretEventsTransitionBlockProps,
  "secretFilterActive" | "onSecretFilterChange"
>) {
  if (secretFilterActive) {
    return (
      <EventTypesFiltersBar
        secretFilterActive={secretFilterActive}
        onSecretFilterChange={onSecretFilterChange}
      />
    );
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <SecretEventsChip
        active={false}
        onClick={() => onSecretFilterChange(true)}
      />
    </div>
  );
}

function HeaderTabsEntry({
  secretFilterActive,
  onSecretFilterChange,
}: Pick<
  EventTypesSecretEventsTransitionBlockProps,
  "secretFilterActive" | "onSecretFilterChange"
>) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <SegmentedControl
        value={secretFilterActive ? "secret" : "all"}
        onChange={(value) => onSecretFilterChange(value === "secret")}
        data={[
          { value: "all", label: "All event types" },
          { value: "secret", label: SECRET_EVENTS_FILTER_LABEL },
        ]}
      />
    </div>
  );
}

function FilterDropdownEntry({
  secretFilterActive,
  onSecretFilterChange,
}: Pick<
  EventTypesSecretEventsTransitionBlockProps,
  "secretFilterActive" | "onSecretFilterChange"
>) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (secretFilterActive) {
    return (
      <EventTypesFiltersBar
        secretFilterActive={secretFilterActive}
        onSecretFilterChange={onSecretFilterChange}
      />
    );
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger
          aria-label="Add filter"
          className={classNames(
            "border-subtle bg-default text-emphasis hover:bg-subtle inline-flex h-[34px] w-[34px] items-center justify-center rounded-md border transition",
          )}
        >
          <PlusIcon className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[220px]">
          <DropdownMenuItem
            onSelect={() => {
              onSecretFilterChange(true);
              setMenuOpen(false);
            }}
          >
            {SECRET_EVENTS_FILTER_LABEL}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function TitleLinkEntry({
  secretFilterActive,
  onSecretFilterChange,
  secretEventCount,
}: Pick<
  EventTypesSecretEventsTransitionBlockProps,
  "secretFilterActive" | "onSecretFilterChange" | "secretEventCount"
>) {
  if (secretFilterActive) {
    return (
      <EventTypesFiltersBar
        secretFilterActive={secretFilterActive}
        onSecretFilterChange={onSecretFilterChange}
      />
    );
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => onSecretFilterChange(true)}
        className="text-default hover:text-emphasis inline-flex items-center gap-1 text-sm font-medium transition"
      >
        View {SECRET_EVENTS_FILTER_LABEL.toLowerCase()}
        <span className="text-subtle">({secretEventCount ?? 0})</span>
        <Icon name="arrow-right" className="h-4 w-4 stroke-[1.5px]" />
      </button>
    </div>
  );
}

function renderVariantEntry(
  variant: EventTypesSecretEventsTransitionVariant,
  props: EventTypesSecretEventsTransitionBlockProps,
) {
  switch (variant) {
    case "filter-chip-row":
      return <FilterChipRowEntry {...props} />;
    case "header-tabs":
      return <HeaderTabsEntry {...props} />;
    case "filter-dropdown":
      return <FilterDropdownEntry {...props} />;
    case "title-link":
      return <TitleLinkEntry {...props} />;
    case "sidebar-subnav":
      if (props.secretFilterActive) {
        return (
          <EventTypesFiltersBar
            secretFilterActive={props.secretFilterActive}
            onSecretFilterChange={props.onSecretFilterChange}
          />
        );
      }
      return null;
    default:
      return null;
  }
}

export function EventTypesSecretEventsTransitionBlock({
  variant,
  secretFilterActive,
  onSecretFilterChange,
  secretEventCount = DEFAULT_EVENT_TYPES.filter((type) => type.isSecret).length,
}: EventTypesSecretEventsTransitionBlockProps) {
  if (variant === "no-entry") {
    if (!secretFilterActive) return null;
    return (
      <EventTypesFiltersBar
        secretFilterActive={secretFilterActive}
        onSecretFilterChange={onSecretFilterChange}
      />
    );
  }

  return (
    <PrototypeComponent
      id="event-types-secret-events-transition-block"
      className="shrink-0"
    >
      {renderVariantEntry(variant, {
        variant,
        secretFilterActive,
        onSecretFilterChange,
        secretEventCount,
      })}
    </PrototypeComponent>
  );
}
