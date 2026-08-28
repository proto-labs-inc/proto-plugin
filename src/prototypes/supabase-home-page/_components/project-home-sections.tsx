import {
  Box,
  Cable,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Database,
  KeyRound,
  Link2,
  Server,
  Sparkles,
} from "lucide-react";
import { PrototypeComponent } from "proto-plugin";
import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "ui";

import { CONNECT_ACTIONS, MOCK_PROJECT } from "./supabase-home-page-mock-data";
import type { ConnectSheetMode } from "./supabase-home-page-types";

const CONNECT_ICONS = {
  framework: Box,
  server: Server,
  direct: Database,
  orm: Cable,
  mcp: Sparkles,
  api_keys: KeyRound,
} as const;

const SCAFFOLD_CONTAINER_CLASS =
  "mx-auto w-full @container max-w-[1600px] px-4 @lg:px-6 @xl:px-10";
const SCAFFOLD_SECTION_CLASS = "flex flex-col first:pt-12 py-6 w-full";

type ConnectSectionProps = {
  onConnectActionClick: (mode: ConnectSheetMode) => void;
};

export function ConnectSection({ onConnectActionClick }: ConnectSectionProps) {
  return (
    <PrototypeComponent id="project-home-sections.connect-section" className="relative will-change-transform">
      <section className="w-full">
        <div className="mb-6">
          <h3 className="heading-section">Get connected</h3>
        </div>

        <Card className="bg-background/25 border-dashed relative overflow-hidden">
          <div className="absolute -inset-16 z-0 opacity-50">
            <img
              alt=""
              className="w-full h-full object-cover object-right hidden dark:block"
              src="/img/reports/bg-grafana-dark.svg"
            />
            <img
              alt=""
              className="w-full h-full object-cover object-right dark:hidden"
              src="/img/reports/bg-grafana-light.svg"
            />
            <div className="absolute inset-0 bg-linear-to-r from-background-alternative to-transparent" />
          </div>

          <CardContent className="relative z-10 p-0">
            <div className="grid grid-cols-1 xl:grid-cols-6 divide-y xl:divide-y-0 xl:divide-x border-muted">
              {CONNECT_ACTIONS.map((action) => {
                const Icon = CONNECT_ICONS[action.id];
                const isApiKeys = action.id === "api_keys";

                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => {
                      if (!isApiKeys) {
                        onConnectActionClick(action.id);
                      }
                    }}
                    className={cn(
                      "group flex items-center gap-3 p-4 text-left transition-colors min-h-[72px] w-full",
                      "hover:bg-surface-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand",
                      "xl:min-h-32 xl:flex-col xl:justify-center xl:p-6 xl:text-center",
                    )}
                  >
                    <span className="shrink-0 text-foreground-light group-hover:text-foreground">
                      <Icon size={16} strokeWidth={1.5} />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1 xl:flex-initial">
                      <p className="text-sm">{action.heading}</p>
                      <p className="text-sm text-foreground-lighter">{action.subheading}</p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="shrink-0 text-foreground-lighter group-hover:text-foreground xl:hidden"
                    />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </PrototypeComponent>
  );
}

type ProjectTopSectionProps = {
  copyPopoverOpen: boolean;
  onCopyPopoverOpenChange: (open: boolean) => void;
  onGetConnected: () => void;
};

export function ProjectTopSection({
  copyPopoverOpen,
  onCopyPopoverOpenChange,
  onGetConnected,
}: ProjectTopSectionProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const menuItems = [
    {
      label: "Project URL",
      value: MOCK_PROJECT.apiUrl,
      displayValue: MOCK_PROJECT.apiUrl,
      icon: Link2,
    },
  ];

  return (
    <PrototypeComponent id="project-home-sections.project-top-section">
      <div className="flex flex-col gap-y-4">
        <div className="grid grid-cols-1 gap-8 py-0 w-full items-center">
          <div className="flex flex-col">
            <div className="flex flex-row flex-wrap items-center gap-4 w-full">
              <div>
                <div className="flex items-center gap-x-2">
                  <h1 className="text-3xl">{MOCK_PROJECT.name}</h1>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="min-w-0 max-w-[400px] truncate text-left text-foreground-light">
                    {MOCK_PROJECT.apiUrl}
                  </span>
                  <DropdownMenu
                    open={copyPopoverOpen}
                    onOpenChange={(open) => {
                      if (!open) setCopiedItem(null);
                      onCopyPopoverOpenChange(open);
                    }}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        size="tiny"
                        variant="default"
                        iconRight={
                          <ChevronDown
                            size={14}
                            className={cn("transition-transform", copyPopoverOpen && "rotate-180")}
                          />
                        }
                      >
                        Copy <span className="sr-only">project URL and API keys</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="center" className="w-80 p-1">
                      {menuItems.map((item) => {
                        const Icon = item.icon;
                        const copied = copiedItem === item.label;

                        return (
                          <DropdownMenuItem
                            key={item.label}
                            className="group relative items-center gap-3 pr-10"
                            onSelect={(event) => {
                              event.preventDefault();
                              void navigator.clipboard?.writeText(item.value);
                              setCopiedItem(item.label);
                            }}
                          >
                            <Icon size={14} className="mt-0.5 shrink-0 text-foreground-light" />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm text-foreground">
                                {copied ? null : <span className="sr-only">Copy</span>}
                                {item.label}
                                {copied ? (
                                  <span className="sr-only">copied to your clipboard</span>
                                ) : null}
                              </div>
                              <div className="truncate text-sm text-foreground-lighter">
                                {item.displayValue}
                              </div>
                            </div>
                            <div
                              className={cn(
                                "absolute right-2 top-1/2 -translate-y-1/2 text-foreground-lighter opacity-0 transition-opacity group-hover:opacity-100",
                                copied && "opacity-100 text-brand",
                              )}
                            >
                              {copied ? <Check size={14} /> : <Copy size={14} />}
                            </div>
                          </DropdownMenuItem>
                        );
                      })}
                      <DropdownMenuSeparator />
                      <div className="p-1">
                        <Button
                          variant="default"
                          size="tiny"
                          className="w-full"
                          onClick={() => {
                            onCopyPopoverOpenChange(false);
                            onGetConnected();
                          }}
                        >
                          Get Connected
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrototypeComponent>
  );
}

export { SCAFFOLD_CONTAINER_CLASS, SCAFFOLD_SECTION_CLASS };
