"use client";

import { PrototypeComponent } from "proto-plugin";

import { EventTypesShellSidebar } from "./event-types-shell-sidebar";
import type { EventTypesSecretEventsTransitionChoice } from "./event-types-secret-events-transition-content";

type EventTypesShellLayoutProps = {
  children: React.ReactNode;
  secretEventsTransitionVariant?: EventTypesSecretEventsTransitionChoice;
  secretFilterActive?: boolean;
  onSecretFilterChange?: (active: boolean) => void;
};

export function EventTypesShellLayout({
  children,
  secretEventsTransitionVariant = "no-entry",
  secretFilterActive = false,
  onSecretFilterChange,
}: EventTypesShellLayoutProps) {
  return (
    <PrototypeComponent
      id="event-types-shell-layout"
      className="bg-default @container/shell flex h-full min-h-0 w-full flex-1 overflow-hidden"
    >
      <EventTypesShellSidebar
        secretEventsTransitionVariant={secretEventsTransitionVariant}
        secretFilterActive={secretFilterActive}
        onSecretFilterChange={onSecretFilterChange}
      />
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2 sm:p-4 lg:p-6">
          {children}
        </div>
      </main>
    </PrototypeComponent>
  );
}
