"use client";

import { PrototypeComponent } from "proto-plugin";
import { Menu } from "ui";

import { DATABASE_MENU_GROUPS } from "./supabase-database-view-mock-data";

export function DatabaseMenu() {
  return (
    <PrototypeComponent
      id="database-menu"
      className="flex flex-col w-full h-full hide-scrollbar bg-dash-sidebar border-default"
    >
      <div id="spec-click-target" className="flex flex-col w-full h-full">
        <div className="border-default flex min-h-(--header-height) items-center border-b px-6">
          <h4 className="text-lg">Database</h4>
        </div>
        <div className="grow overflow-y-auto">
          <div className="flex flex-col space-y-4">
            <Menu type="pills">
              {DATABASE_MENU_GROUPS.map((group, idx) => (
                <div key={group.title}>
                  <div className="my-4 space-y-4">
                    <div className="md:mx-3">
                      <Menu.Group
                        title={
                          <div className="flex flex-col space-y-2 uppercase font-mono">
                            <span>{group.title}</span>
                          </div>
                        }
                      />
                      <div>
                        {group.items.map((item) => (
                          <PrototypeComponent key={item.id} id={`database-menu.item.${item.id}`}>
                            <Menu.Item active={"active" in item && item.active}>
                              {item.label}
                            </Menu.Item>
                          </PrototypeComponent>
                        ))}
                      </div>
                    </div>
                  </div>
                  {idx !== DATABASE_MENU_GROUPS.length - 1 ? (
                    <div className="h-px w-[calc(100%-1.5rem)] mx-auto md:w-full bg-border-overlay" />
                  ) : null}
                </div>
              ))}
            </Menu>
          </div>
        </div>
      </div>
    </PrototypeComponent>
  );
}
