"use client";

import { BookText, FilePlus, FolderPlus, Plus, Pointer } from "lucide-react";
import { PrototypeComponent } from "proto-plugin";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TreeViewItem,
} from "ui";
import {
  InnerSideBarEmptyPanel,
  InnerSideBarFilterSearchInput,
  InnerSideBarFilterSortDropdown,
  InnerSideBarFilterSortDropdownItem,
  InnerSideBarFilters,
  InnerSideMenuCollapsible,
  InnerSideMenuCollapsibleContent,
  InnerSideMenuCollapsibleTrigger,
  InnerSideMenuDataItem,
} from "ui-patterns/InnerSideMenu";

type SqlEditorMenuProps = {
  newQueryMenuOpen: boolean;
  onNewQueryMenuOpenChange: (open: boolean) => void;
};

export function SqlEditorMenu({
  newQueryMenuOpen,
  onNewQueryMenuOpenChange,
}: SqlEditorMenuProps) {
  return (
    <PrototypeComponent
      id="sql-editor-menu"
      className="flex flex-col h-full min-w-[256px] w-[256px] shrink-0 hide-scrollbar bg-dash-sidebar border-default border-r"
    >
      <div className="border-default flex min-h-12 items-center border-b px-6">
        <h4 className="text-lg">SQL Editor</h4>
      </div>

      <div className="h-full flex flex-col justify-between grow overflow-y-auto">
        <div className="flex flex-col gap-y-4 grow">
          <div className="mt-4 mx-4 flex items-center justify-between gap-x-2">
            <InnerSideBarFilters className="w-full p-0 gap-0">
              <InnerSideBarFilterSearchInput
                name="search-queries"
                placeholder="Search queries..."
                aria-labelledby="Search queries"
                defaultValue=""
                readOnly
              >
                <InnerSideBarFilterSortDropdown value="inserted_at" onValueChange={() => {}}>
                  <InnerSideBarFilterSortDropdownItem value="name">
                    Alphabetical
                  </InnerSideBarFilterSortDropdownItem>
                  <InnerSideBarFilterSortDropdownItem value="inserted_at">
                    Created At
                  </InnerSideBarFilterSortDropdownItem>
                </InnerSideBarFilterSortDropdown>
              </InnerSideBarFilterSearchInput>
            </InnerSideBarFilters>

            <DropdownMenu open={newQueryMenuOpen} onOpenChange={onNewQueryMenuOpenChange}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      data-testid="sql-editor-new-query-button"
                      variant="default"
                      icon={<Plus className="text-foreground" />}
                      className="w-[26px]"
                      aria-label="Create a new query"
                    />
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">Create a new query</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" side="bottom" className="w-48">
                <DropdownMenuItem className="gap-x-2">
                  <FilePlus size={14} />
                  Create a new snippet
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-x-2">
                  <FolderPlus size={14} />
                  Create a new folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-col gap-4">
            <InnerSideMenuCollapsible className="px-0" defaultOpen>
              <InnerSideMenuCollapsibleTrigger title="PRIVATE" />
              <InnerSideMenuCollapsibleContent className="group-data-open:pt-2">
                <InnerSideBarEmptyPanel
                  title="No private queries created yet"
                  description="Queries will be automatically saved once you start writing in the editor"
                  className="mx-4"
                >
                  <div className="top-0 left-6 flex flex-col opacity-50 cursor-not-allowed bg-dash-sidebar -mb-7 pointer-events-none scale-75">
                    <div className="relative">
                      <div className="absolute inset-0 pointer-events-none z-10">
                        <div className="absolute inset-0 bg-linear-to-t from-transparent from-80% to-100% to-background-surface-100 dark:to-background-surface-75" />
                        <div className="absolute inset-0 bg-linear-to-r from-transparent from-50% to-100% to-background-surface-100 dark:to-background-surface-75" />
                      </div>
                      <div className="absolute left-[128px] bottom-[21px] text-foreground-muted z-10 pointer-events-none">
                        <Pointer size={16} className="text-foreground-light" strokeWidth={1.5} />
                      </div>
                      {[0, 1, 2, 3].map((i) => (
                        <div className="border-l pointer-events-none" key={`dummy-${i + 1}`}>
                          <TreeViewItem
                            isSelected={i === 2}
                            id={`dummy-${i + 1}`}
                            name={`dummy_query_${i + 1}`}
                            level={1}
                            xPadding={16}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </InnerSideBarEmptyPanel>
              </InnerSideMenuCollapsibleContent>
            </InnerSideMenuCollapsible>

            <InnerSideMenuCollapsible className="px-0" defaultOpen>
              <InnerSideMenuCollapsibleTrigger title="REFERENCE" />
              <InnerSideMenuCollapsibleContent className="group-data-open:pt-2">
                <InnerSideMenuDataItem
                  title="Templates"
                  isActive={false}
                  isOpened={false}
                  href="#"
                  className="capitalize"
                >
                  <BookText size={16} className="text-foreground-muted" />
                  templates
                </InnerSideMenuDataItem>
                <InnerSideMenuDataItem
                  title="Examples"
                  isActive
                  isOpened={false}
                  href="#"
                  className="capitalize"
                >
                  <BookText size={16} className="text-foreground-muted" />
                  examples
                </InnerSideMenuDataItem>
              </InnerSideMenuCollapsibleContent>
            </InnerSideMenuCollapsible>
          </div>
        </div>

        <div className="p-4 border-t sticky bottom-0 bg-studio">
          <Button block variant="default">
            View running queries
          </Button>
        </div>
      </div>
    </PrototypeComponent>
  );
}
