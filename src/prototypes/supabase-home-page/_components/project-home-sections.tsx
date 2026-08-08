import {
  Box,
  Cable,
  ChevronDown,
  ChevronRight,
  Database,
  KeyRound,
  Server,
  Sparkles,
} from "lucide-react";
import { PrototypeComponent } from "proto-plugin";
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
};

export function ProjectTopSection({
  copyPopoverOpen,
  onCopyPopoverOpenChange,
}: ProjectTopSectionProps) {
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
                  <DropdownMenu open={copyPopoverOpen} onOpenChange={onCopyPopoverOpenChange}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="default"
                        size="tiny"
                        className="text-xs px-2.5 py-1 h-[26px]"
                      >
                        <span className="truncate">
                          Copy <span className="sr-only">project URL and API keys</span>
                        </span>
                        <ChevronDown size={14} className="ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                      <DropdownMenuItem>Copy project URL</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Copy anon key</DropdownMenuItem>
                      <DropdownMenuItem>Copy service role key</DropdownMenuItem>
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
