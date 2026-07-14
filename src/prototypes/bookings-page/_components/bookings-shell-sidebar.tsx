"use client";

import { Avatar } from "@calcom/ui/components/avatar";
import Icon from "@calcom/ui/components/icon/Icon";
import classNames from "@calcom/ui/classNames";
import { PrototypeComponent } from "proto";

import { BOOKINGS_USER } from "./bookings-page-mock-data";

type NavItem = {
  id: string;
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
  hasChevron?: boolean;
  active?: boolean;
};

const MAIN_NAV: NavItem[] = [
  { id: "event-types", label: "Event types", icon: "link" },
  { id: "bookings", label: "Bookings", icon: "calendar", active: true },
  { id: "availability", label: "Availability", icon: "clock" },
  { id: "teams", label: "Teams", icon: "users" },
  { id: "apps", label: "Apps", icon: "grid-3x3", hasChevron: true },
  { id: "routing", label: "Routing", icon: "split" },
  { id: "workflows", label: "Workflows", icon: "zap" },
  { id: "insights", label: "Insights", icon: "chart-bar", hasChevron: true },
];

const BOTTOM_NAV: NavItem[] = [
  { id: "view-public", label: "View public page", icon: "external-link" },
  { id: "copy-link", label: "Copy public page link", icon: "copy" },
  { id: "settings", label: "Settings", icon: "settings" },
];

function NavLink({ item }: { item: NavItem }) {
  return (
    <button
      type="button"
      aria-current={item.active ? "page" : undefined}
      className={classNames(
        "group relative flex w-full items-center justify-start rounded-md px-2 py-1.5 text-sm font-medium transition",
        "[&[aria-current='page']]:text-emphasis mt-0.5",
        "hover:bg-subtle hover:text-emphasis",
        item.active && "[&[aria-current='page']]:bg-emphasis",
      )}
    >
      <Icon
        name={item.icon}
        className="h-4 w-4 shrink-0 ltr:mr-2 rtl:ml-2"
        aria-hidden
      />
      <span className="w-full truncate">{item.label}</span>
      {item.hasChevron ? (
        <Icon name="chevron-down" className="ml-auto h-4 w-4" aria-hidden />
      ) : null}
    </button>
  );
}

export function BookingsShellSidebar() {
  return (
    <PrototypeComponent
      id="bookings-shell-sidebar"
      className="border-muted bg-cal-muted relative hidden h-full w-56 shrink-0 flex-col overflow-y-auto overflow-x-hidden border-r px-3 md:flex"
    >
      <div className="flex h-full flex-col justify-between py-3 pt-4">
        <div>
          <header className="mb-2 flex items-center justify-between">
            <h3 className="logo inline px-1.5">
              <strong>
                <span className="font-cal text-emphasis text-sm font-semibold tracking-tight">
                  Cal.com
                </span>
              </strong>
            </h3>
            <div className="flex w-full items-center justify-end gap-1 rtl:space-x-reverse">
              <button
                type="button"
                className="text-subtle hover:text-emphasis rounded-md p-1.5 transition"
                aria-label="Search"
              >
                <Icon name="search" className="h-4 w-4" />
              </button>
              <div className="relative">
                <Avatar
                  alt={BOOKINGS_USER.name}
                  imageSrc={BOOKINGS_USER.avatarUrl}
                  size="sm"
                  className="border-subtle border"
                />
                <span className="bg-semantic-success-emphasis absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-2 ring-[var(--cal-bg-muted)]" />
              </div>
            </div>
          </header>

          <nav className="mt-4 flex-1">
            {MAIN_NAV.map((item) => (
              <NavLink key={item.id} item={item} />
            ))}
          </nav>
        </div>

        <div>
          {BOTTOM_NAV.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={classNames(
                "group relative mt-0.5 flex w-full items-center justify-start rounded-md px-2 py-1.5 text-sm font-medium transition",
                "text-default hover:bg-subtle hover:text-emphasis",
                index === 0 && "mt-3",
              )}
            >
              <Icon
                name={item.icon}
                className="h-4 w-4 shrink-0 ltr:mr-2 rtl:ml-2"
                aria-hidden
              />
              <span className="w-full">{item.label}</span>
            </button>
          ))}
          <p className="text-subtle px-2 pt-3 text-[10px] leading-4">
            © 2026 Cal.com, Inc.
            <br />
            v.6.6.7-h
          </p>
        </div>
      </div>
    </PrototypeComponent>
  );
}
