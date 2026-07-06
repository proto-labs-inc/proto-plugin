"use client";

import { Avatar } from "@calcom/ui/components/avatar";
import Icon from "@calcom/ui/components/icon/Icon";
import classNames from "@calcom/ui/classNames";
import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { ChevronDownIcon } from "@coss/ui/icons";

import { EVENT_TYPES_USER } from "./event-types-mock-data";

type NavItem = {
  id: string;
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
  hasChevron?: boolean;
  active?: boolean;
};

const MAIN_NAV: NavItem[] = [
  { id: "event-types", label: "Event types", icon: "link", active: true },
  { id: "bookings", label: "Bookings", icon: "calendar" },
  { id: "availability", label: "Availability", icon: "clock" },
  { id: "apps", label: "Apps", icon: "grid-3x3", hasChevron: true },
];

const BOTTOM_NAV: NavItem[] = [
  { id: "view-public", label: "View public page", icon: "external-link" },
  { id: "copy-link", label: "Copy public page link", icon: "copy" },
];

function NavLink({ item }: { item: NavItem }) {
  return (
    <button
      type="button"
      aria-current={item.active ? "page" : undefined}
      className={classNames(
        "group relative mt-0.5 flex w-full items-center justify-start rounded-md px-2 py-1.5 text-left text-sm font-medium transition",
        "[&[aria-current='page']]:text-emphasis",
        "hover:bg-subtle hover:text-emphasis",
        item.active && "[&[aria-current='page']]:bg-emphasis",
      )}
    >
      <Icon
        name={item.icon}
        className="h-4 w-4 shrink-0 ltr:mr-2 rtl:ml-2"
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.hasChevron ? (
        <Icon name="chevron-down" className="ml-auto h-4 w-4" aria-hidden />
      ) : null}
    </button>
  );
}

export function EventTypesShellSidebar() {
  return (
    <PrototypeComponent
      id="event-types-shell-sidebar"
      className="border-muted bg-cal-muted relative hidden h-full w-56 shrink-0 flex-col overflow-y-auto overflow-x-hidden border-r px-3 md:flex"
    >
      <div className="flex h-full flex-col justify-between py-3 pt-4">
        <div>
          <header className="todesktop:-mt-3 todesktop:flex-col-reverse mb-2 flex items-center justify-between todesktop:[-webkit-app-region:drag]">
            <div data-testid="user-dropdown-trigger" className="todesktop:mt-4 w-full">
              <button
                type="button"
                data-testid="user-dropdown-trigger-button"
                className="hover:bg-emphasis todesktop:!bg-transparent group mx-0 flex w-full cursor-pointer appearance-none items-center rounded-full px-2 py-1.5 text-left outline-none transition focus:outline-none focus:ring-0 md:rounded-none lg:rounded"
              >
                <span className="relative h-5 w-5 shrink-0 rounded-full ltr:mr-2 rtl:ml-2">
                  <Avatar
                    size="xsm"
                    alt={`${EVENT_TYPES_USER.username} Avatar`}
                    imageSrc={EVENT_TYPES_USER.avatarUrl}
                    className="overflow-hidden"
                  />
                  <span className="border-muted absolute -bottom-0.5 right-0 h-2 w-2 rounded-full border bg-green-500" />
                </span>
                <span className="flex grow items-center gap-2">
                  <span className="w-24 shrink-0 text-sm leading-none">
                    <span className="text-emphasis block truncate py-0.5 font-medium leading-normal">
                      {EVENT_TYPES_USER.name}
                    </span>
                  </span>
                  <ChevronDownIcon
                    className="group-hover:text-subtle text-muted h-4 w-4 shrink-0 transition rtl:mr-4"
                    aria-hidden
                  />
                </span>
              </button>
            </div>
            <div className="flex w-full justify-end rtl:space-x-reverse">
              <button
                type="button"
                className="text-subtle hover:text-emphasis rounded-md p-1.5 transition"
                aria-label="Search"
              >
                <Icon name="search" className="h-4 w-4" />
              </button>
            </div>
          </header>

          <nav className="mt-4 flex-1">
            {MAIN_NAV.map((item) => (
              <NavLink key={item.id} item={item} />
            ))}
          </nav>
        </div>

        <div className="md:px-2 md:pb-4 lg:p-0">
          {BOTTOM_NAV.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={classNames(
                "group relative mt-0.5 flex w-full items-center justify-start rounded-md px-2 py-1.5 text-left text-sm font-medium transition",
                "text-default hover:bg-subtle hover:text-emphasis",
                index === 0 && "mt-3",
              )}
            >
              <Icon
                name={item.icon}
                className="h-4 w-4 shrink-0 ltr:mr-2 rtl:ml-2"
                aria-hidden
              />
              <span className="hidden min-w-0 flex-1 lg:flex">{item.label}</span>
            </button>
          ))}
          <p className="text-subtle hidden px-2 pt-3 text-[10px] leading-4 lg:block">
            © 2024 Cal.com, Inc.
            <br />
            v.6.2.0-sh
          </p>
        </div>
      </div>
    </PrototypeComponent>
  );
}
