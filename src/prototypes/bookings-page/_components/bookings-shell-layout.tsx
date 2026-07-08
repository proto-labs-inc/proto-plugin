"use client";

import { PrototypeComponent } from "proto-plugin";

import { BookingsShellSidebar } from "./bookings-shell-sidebar";

export function BookingsShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <PrototypeComponent
      id="bookings-shell-layout"
      className="bg-default flex h-full min-h-0 w-full flex-1 overflow-hidden"
    >
      <BookingsShellSidebar />
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2 sm:p-4 lg:p-6">
          {children}
        </div>
      </main>
    </PrototypeComponent>
  );
}
