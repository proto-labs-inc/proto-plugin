"use client";

import { PanelLeftClose, PanelLeftOpen, Plus, X } from "lucide-react";
import { PrototypeComponent } from "proto-plugin";
import { Card, cn, Tooltip, TooltipContent, TooltipTrigger } from "ui";

import { SQL_EXAMPLES } from "./supabase-sql-editor-mock-data";
import { SqlIcon } from "./sql-icon";

type ExamplesContentProps = {
  sqlMenuOpen: boolean;
  selectedExampleId: string | null;
  onToggleSqlMenu: () => void;
  onSelectExample: (id: string) => void;
};

export function ExamplesContent({
  sqlMenuOpen,
  selectedExampleId,
  onToggleSqlMenu,
  onSelectExample,
}: ExamplesContentProps) {
  return (
    <PrototypeComponent
      id="examples-content"
      className="h-full flex flex-col flex-1 w-full min-w-0 bg-dash-sidebar overflow-hidden"
    >
      <div className="h-10 md:min-h-12 flex items-center bg-surface-200">
        <div className="w-full flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="hidden md:flex items-center justify-center w-10 h-12 hover:bg-surface-100 shrink-0 border-b border-b-default"
                onClick={onToggleSqlMenu}
              >
                {sqlMenuOpen ? (
                  <PanelLeftClose
                    size={16}
                    strokeWidth={1.5}
                    className="text-foreground-lighter hover:text-foreground-light"
                  />
                ) : (
                  <PanelLeftOpen
                    size={16}
                    strokeWidth={1.5}
                    className="text-foreground-lighter hover:text-foreground-light"
                  />
                )}
                <span className="sr-only">
                  {sqlMenuOpen ? "Collapse sidebar" : "Expand sidebar"}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {sqlMenuOpen ? "Collapse sidebar" : "Expand sidebar"}
            </TooltipContent>
          </Tooltip>

          <div
            role="tablist"
            aria-orientation="horizontal"
            className="border-b rounded-b-none gap-0 min-h-12 flex items-center w-full z-1 bg-surface-200 border-none text-clip overflow-x-auto"
          >
            <div className="flex items-center h-12 first-of-type:border-l border-default">
              <button
                type="button"
                role="tab"
                aria-selected="true"
                data-state="active"
                className="justify-center whitespace-nowrap py-1.5 text-foreground-lighter hover:text-foreground data-[state=active]:text-foreground data-[state=active]:shadow-xs data-[state=active]:border-foreground group flex items-center gap-2 pl-3 pr-2.5 text-xs bg-dash-sidebar/50 data-[state=active]:bg-dash-sidebar border-b border-default data-[state=active]:border-b-background-dash-sidebar relative h-full hover:bg-surface-300 italic font-light"
              >
                <SqlIcon className="fill-foreground-muted group-aria-selected:fill-foreground w-4 h-4 -ml-0.5 transition-colors" />
                <div className="flex items-center gap-0">
                  <span>Examples</span>
                </div>
                <div className="relative ml-1 flex size-5 items-center justify-center">
                  <span
                    role="button"
                    aria-label="Close tab"
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-200 rounded-xs cursor-pointer"
                  >
                    <X size={12} className="text-foreground-light" />
                  </span>
                </div>
                <div className="absolute w-full top-0 left-0 right-0 h-px bg-foreground opacity-0 group-data-[state=active]:opacity-100" />
              </button>
              <div role="separator" className="h-full w-px bg-border" />
            </div>

            <button
              type="button"
              className="flex items-center justify-center w-10 min-h-12 hover:bg-surface-100 shrink-0 border-b border-default"
              aria-label="New tab"
            >
              <Plus
                size={16}
                strokeWidth={1.5}
                className="text-foreground-lighter hover:text-foreground-light"
              />
            </button>
            <div className="grow h-full border-b border-default pr-6" />
          </div>
        </div>
      </div>

      <div className="h-full min-h-0">
        <div className="block h-full space-y-8 overflow-y-auto p-6 px-10 bg-dash-sidebar dark:bg-surface-100">
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="mb-1">Examples</h2>
              <p className="text-foreground-light text-sm">
                End-to-end examples and starter projects
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {SQL_EXAMPLES.map((example) => (
                <Card
                  key={example.id}
                  className={cn(
                    "grow bg-surface-100 p-3 transition-colors hover:bg-surface-200 border hover:border-default cursor-pointer",
                    selectedExampleId === example.id && "bg-surface-200 border-default",
                  )}
                  onClick={() => onSelectExample(example.id)}
                >
                  <div className="relative flex items-start gap-3">
                    <div className="rounded-full bg-alternative border w-8 h-8 flex items-center justify-center shrink-0">
                      <SqlIcon className="fill-foreground w-4 h-4" />
                    </div>
                    <div className="flex flex-col gap-0">
                      <h3 className="text-sm text-foreground mb-0">{example.title}</h3>
                      <p className="text-xs text-foreground-light">{example.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PrototypeComponent>
  );
}
