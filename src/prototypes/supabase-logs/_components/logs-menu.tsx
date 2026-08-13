"use client";

import { Datadog, Grafana, Sentry } from "icons";
import { ChevronRight, Plus, Search } from "lucide-react";
import { PrototypeComponent } from "proto-plugin";
import { useMemo, useState } from "react";
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger, Separator } from "ui";
import { InnerSideBarEmptyPanel } from "ui-patterns/InnerSideMenu";

import { LOG_COLLECTIONS } from "./supabase-logs-mock-data";

const ICON_PROPS = {
  height: 20,
  width: 20,
  className: "text-foreground-light",
};

export function LogsMenu() {
  const [searchText, setSearchText] = useState("");
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  const [queriesOpen, setQueriesOpen] = useState(true);

  const filteredCollections = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return LOG_COLLECTIONS;
    return LOG_COLLECTIONS.filter((collection) => collection.name.toLowerCase().includes(query));
  }, [searchText]);

  return (
    <PrototypeComponent
      id="logs-menu"
      className="flex flex-col w-full h-full hide-scrollbar bg-dash-sidebar border-default"
    >
      <div id="spec-click-target" className="flex flex-col w-full h-full">
        <div className="border-default flex min-h-(--header-height) items-center border-b px-6">
          <h4 className="text-lg">Logs</h4>
        </div>
        <div className="grow overflow-y-auto">
          <div className="pb-4 relative">
            <div className="flex gap-x-2 items-center sticky top-0 bg-dash-sidebar z-1 px-4 py-4">
              <div className="flex items-center w-full p-0 gap-0">
                <label htmlFor="search-collections" className="relative w-full">
                  <span className="sr-only">Search collections</span>
                  <input
                    id="search-collections"
                    name="search-collections"
                    type="text"
                    placeholder="Search collections..."
                    aria-labelledby="Search collections"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    className="flex border border-control bg-foreground/[.026] placeholder:text-foreground-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-background-control px-3 py-2 h-[32px] md:h-[28px] text-base md:text-xs pl-7 pr-7 w-full rounded-sm"
                  />
                  <Search
                    size={14}
                    strokeWidth={1.5}
                    className="absolute left-2 top-0 bottom-0 my-auto text-foreground-muted"
                  />
                </label>
              </div>
              <Button
                type="button"
                variant="default"
                size="tiny"
                icon={<Plus className="text-foreground" />}
                className="w-[26px]"
                aria-label="New query"
              />
            </div>

            <div className="px-2">
              <a
                title="Templates"
                aria-current="false"
                className="text-sm h-7 pl-3 pr-2 flex items-center justify-between rounded-md group relative hover:bg-surface-200 text-foreground-light hover:text-foreground"
                href="#"
              >
                Templates
              </a>
            </div>

            <Separator className="my-4" />

            <Collapsible open={collectionsOpen} onOpenChange={setCollectionsOpen}>
              <CollapsibleTrigger className="flex items-center gap-x-2 px-4 [&[data-state=open]>svg]:rotate-90! pb-2">
                <ChevronRight
                  size={16}
                  className="text-foreground-light transition-transform duration-200"
                />
                <span className="text-foreground-light font-mono text-sm uppercase">
                  Collections
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {filteredCollections.map((collection) => (
                  <PrototypeComponent
                    key={collection.key}
                    id={`logs-menu.collection.${collection.key}`}
                    className="relative flex hover:text-foreground hover:bg-foreground-lighter/10 transition-all text-foreground-light group"
                  >
                    <a
                      className="h-7 flex-1 text-sm px-4 flex items-center gap-2 truncate"
                      href="#"
                    >
                      <span className="truncate">{collection.name}</span>
                    </a>
                  </PrototypeComponent>
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-4" />

            <Collapsible open={queriesOpen} onOpenChange={setQueriesOpen}>
              <CollapsibleTrigger className="flex items-center gap-x-2 px-4 [&[data-state=open]>svg]:rotate-90! pb-2">
                <ChevronRight
                  size={16}
                  className="text-foreground-light transition-transform duration-200"
                />
                <span className="text-foreground-light font-mono text-sm uppercase">Queries</span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <InnerSideBarEmptyPanel
                  className="mx-4"
                  title="No queries created yet"
                  actions={
                    <Button type="button" variant="default" size="tiny">
                      Create query
                    </Button>
                  }
                />
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-4" />

            <div className="rounded-lg border p-4 space-y-3 bg-muted/10 border-border/50 text-left **:text-left [&_div]:items-start mx-4 mt-4">
              <div className="flex justify-start items-start">
                <div className="flex items-center gap-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-foreground-light"
                  >
                    <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1" />
                    <path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />
                  </svg>
                  <Datadog {...ICON_PROPS} fill="currentColor" />
                  <Grafana {...ICON_PROPS} fill="currentColor" />
                  <Sentry {...ICON_PROPS} fill="currentColor" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-sm text-foreground">Capture your logs</h3>
                <p className="text-xs text-foreground-light">
                  Send logs to your preferred observability or storage platform.
                </p>
              </div>
              <div className="flex justify-start items-start gap-x-2">
                <Button type="button" variant="default" size="tiny">
                  Go to Log Drains
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrototypeComponent>
  );
}
