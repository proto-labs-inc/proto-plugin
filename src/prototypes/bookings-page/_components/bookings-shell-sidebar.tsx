"use client";

import { Avatar } from "@calcom/ui/components/avatar";
import Icon from "@calcom/ui/components/icon/Icon";
import classNames from "@calcom/ui/classNames";
import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";

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
  { id: "insights", label: "Insights", icon: "bar-chart", hasChevron: true },
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
      className={classNames(
        "group relative flex w-full items-center rounded-md px-2 py-1.5 text-sm font-medium transition md:justify-center lg:justify-start",
        item.active
          ? "bg-emphasis text-emphasis"
          : "text-default hover:bg-subtle hover:text-emphasis",
      )}
    >
      <Icon
        name={item.icon}
        className="h-4 w-4 shrink-0 lg:ltr:mr-2 lg:rtl:ml-2"
        aria-hidden
      />
      <span className="hidden truncate lg:inline">{item.label}</span>
      {item.hasChevron ? (
        <Icon name="chevron-down" className="ml-auto hidden h-4 w-4 lg:block" aria-hidden />
      ) : null}
    </button>
  );
}

export function BookingsShellSidebar() {
  return (
    <PrototypeComponent
      id="bookings-shell-sidebar"
      className="border-muted bg-cal-muted hidden h-full w-14 shrink-0 flex-col border-r md:flex lg:w-56 lg:px-3"
    >
      <div className="flex h-full flex-col justify-between py-3 lg:pt-4">
        <div>
          <header className="mb-2 hidden items-center justify-between px-1 lg:flex">
            <span className="font-cal text-emphasis text-lg font-semibold">Cal.com</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="text-subtle hover:text-emphasis rounded-md p-1.5 transition"
                aria-label="Search"
              >
                <Icon name="search" className="h-4 w-4" />
              </button>
              <Avatar
                alt={BOOKINGS_USER.name}
                imageSrc={BOOKINGS_USER.avatarUrl}
                size="sm"
                className="border-subtle border"
              />
            </div>
          </header>

          <div className="mb-2 flex justify-center lg:hidden">
            <span className="font-cal text-emphasis text-sm font-semibold">Cal</span>
          </div>

          <nav className="mt-2 flex-1 space-y-0.5 md:px-2 lg:px-0">
            {MAIN_NAV.map((item) => (
              <NavLink key={item.id} item={item} />
            ))}
          </nav>
        </div>

        <div className="space-y-0.5 md:px-2 lg:px-0">
          {BOTTOM_NAV.map((item) => (
            <NavLink key={item.id} item={item} />
          ))}
          <p className="text-subtle hidden px-2 pt-3 text-[10px] leading-4 lg:block">
            © 2024 Cal.com, Inc.
            <br />
            v4.4.7-h
          </p>
        </div>
      </div>
    </PrototypeComponent>
  );
}
