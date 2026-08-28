"use client";

import type { ComponentType, ReactNode } from "react";
import {
  Auth,
  Database,
  EdgeFunctions,
  Home,
  Realtime,
  SqlEditor,
  Storage,
  TableEditor,
} from "icons";
import {
  Blocks,
  CircleHelp,
  Lightbulb,
  List,
  PanelLeftDashed,
  Plug,
  Search,
  Settings,
  User,
} from "lucide-react";
import { PrototypeComponent } from "proto-plugin";
import { Button, cn, Tooltip, TooltipContent, TooltipTrigger } from "ui";

import { MOCK_PROJECT } from "./supabase-logs-mock-data";

const ICON_SIZE = 20;
const ICON_STROKE_WIDTH = 1.5;

function HeaderIconButton({
  children,
  className,
  destructive,
  label,
}: {
  children: ReactNode;
  className?: string;
  destructive?: boolean;
  label: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="tiny"
          aria-label={label}
          className={cn(
            "rounded-full w-[32px] h-[32px] p-0 flex items-center justify-center group",
            destructive && "bg-destructive-200 border-destructive-500 hover:bg-destructive-200",
            className,
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

type ProjectHeaderProps = {
  onConnectClick: () => void;
};

export function ProjectHeader({ onConnectClick }: ProjectHeaderProps) {
  return (
    <PrototypeComponent
      id="project-shell.project-header"
      className="hidden md:flex h-11 md:h-12 items-center shrink-0 border-b"
    >
      <div className="flex items-center justify-between h-full pr-3 flex-1 overflow-x-auto gap-x-8 pl-4">
        <div className="hidden md:flex items-center text-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                className="items-center justify-center shrink-0 flex"
                href="/project/default"
                tabIndex={0}
              >
                <img alt="Supabase" className="h-[18px]" src="/img/supabase-logo.svg" />
                <span className="sr-only">Back to organization home</span>
              </a>
            </TooltipTrigger>
            <TooltipContent>Back to organization home</TooltipContent>
          </Tooltip>
          <div className="flex items-center md:pl-2">
            <div className="text-sm px-3 py-1">{MOCK_PROJECT.name}</div>
          </div>
          <div className="ml-3 items-center gap-x-2 flex">
            <Button
              type="button"
              variant="default"
              size="tiny"
              className="rounded-full text-xs px-2.5 py-1 h-[26px]"
              icon={<Plug className="rotate-90 h-[14px] w-[14px]" />}
              onClick={onConnectClick}
            >
              Connect
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-x-2">
          <div className="flex items-center gap-1 md:gap-2">
            <button
              type="button"
              className="hidden md:flex md:min-w-32 xl:min-w-32 rounded-full bg-transparent border border-input h-[30px] pl-1.5 md:pl-2 pr-1 items-center justify-between text-foreground-lighter hover:bg-surface-100 hover:border-stronger text-sm"
            >
              <div className="flex items-center space-x-1.5 text-foreground-lighter">
                <Search size={16} strokeWidth={1.5} />
                <p className="flex text-xs pr-2 text-foreground-muted">Search...</p>
              </div>
              <span className="whitespace-nowrap shrink-0 items-center text-[11px] leading-none tracking-[-0.025em] rounded px-[5px] py-[3px] hidden md:inline-flex h-full border border-default bg-surface-300 text-foreground-lighter shadow-xs">
                ⌘K
              </span>
            </button>

            <HeaderIconButton label="Help">
              <CircleHelp
                size={16}
                strokeWidth={1.5}
                className="text-foreground-light group-hover:text-foreground"
              />
            </HeaderIconButton>

            <div className="relative">
              <HeaderIconButton label="Advisor Center" destructive>
                <Lightbulb
                  size={16}
                  strokeWidth={1.5}
                  className="text-foreground-light group-hover:text-foreground"
                />
              </HeaderIconButton>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-destructive" />
            </div>

            <HeaderIconButton label="SQL Editor">
              <SqlEditor
                size={16}
                strokeWidth={1.5}
                className="text-foreground-light group-hover:text-foreground"
              />
            </HeaderIconButton>

            <HeaderIconButton label="AI Assistant">
              <svg
                width="16"
                height="16"
                viewBox="0 0 46 46"
                fill="none"
                className="text-brand-600 group-hover:text-brand"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M23 1.78677L44.2132 23L23 44.2132L1.7868 23L23 0.372559L23.7071 1.07967L44.9203 22.2929L45.6274 23L44.9203 23.7071L23.7071 44.9203L23 45.6274L22.2929 44.9203L1.07969 23.7071L0.372583 23L1.07969 22.2929L22.2929 1.07967L23 0.372559Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M30 23C30 26.866 26.866 30 23 30C19.134 30 16 26.866 16 23C16 19.134 19.134 16 23 16C26.866 16 30 19.134 30 23ZM31 23C31 27.4183 27.4183 31 23 31C18.5817 31 15 27.4183 15 23C15 18.5817 15 27.4183 15 23 15C27.4183 15 31 18.5817 31 23Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </HeaderIconButton>
          </div>

          <Button
            type="button"
            variant="text"
            size="tiny"
            className="hidden md:flex rounded-full overflow-hidden h-8 w-8 px-0 py-0 shrink-0 border-transparent hover:bg-surface-100"
            aria-label="Settings"
          >
            <figure className="bg-foreground flex items-center justify-center w-8 h-8 rounded-md">
              <User size={18} strokeWidth={1.5} className="text-background" />
            </figure>
          </Button>
        </div>
      </div>
    </PrototypeComponent>
  );
}

const SIDEBAR_ITEMS = [
  { icon: Home, label: "Project Overview", active: false },
  { icon: TableEditor, label: "Table Editor", active: false },
  { icon: SqlEditor, label: "SQL Editor", active: false },
] as const;

const SIDEBAR_DATABASE_ITEMS = [
  { icon: Database, label: "Database" },
  { icon: Auth, label: "Authentication" },
  { icon: Storage, label: "Storage" },
  { icon: EdgeFunctions, label: "Edge Functions" },
  { icon: Realtime, label: "Realtime" },
] as const;

const SIDEBAR_ADVISOR_ITEMS = [
  { icon: Lightbulb, label: "Advisors", hasDot: true },
  { icon: List, label: "Logs", active: true },
  { icon: Blocks, label: "Integrations" },
] as const;

function SidebarNavItem({
  icon: Icon,
  label,
  active,
  hasDot,
}: {
  icon: ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  label: string;
  active?: boolean;
  hasDot?: boolean;
}) {
  return (
    <li className="group/menu-item relative">
      <a
        className={cn(
          "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md py-2 px-1.5 text-left text-sm h-8",
          active
            ? "bg-sidebar-accent font-medium text-foreground"
            : "text-foreground-lighter hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        )}
        href="#"
      >
        <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} className="shrink-0" />
        <span className="truncate group-data-[collapsible=icon]:hidden">{label}</span>
      </a>
      {hasDot ? (
        <div className="absolute pointer-events-none flex h-2 w-2 left-[18px] top-2 z-10 rounded-full bg-destructive-600" />
      ) : null}
    </li>
  );
}

export function ProductSidebar() {
  return (
    <PrototypeComponent
      id="project-shell.product-sidebar"
      className="w-12 relative group peer hidden md:block text-sidebar-foreground shrink-0"
      data-state="collapsed"
      data-collapsible="icon"
    >
      <div className="absolute h-full inset-y-0 hidden md:flex left-0 w-12 border-r z-50">
        <div className="flex h-full w-full flex-col bg-sidebar">
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
            <ul className="flex w-full min-w-0 flex-col gap-1">
              <div className="relative flex w-full min-w-0 flex-col p-2 gap-0.5">
                {SIDEBAR_ITEMS.map((item) => (
                  <SidebarNavItem key={item.label} {...item} />
                ))}
              </div>
              <div className="shrink-0 bg-border-muted h-px w-[calc(100%-1rem)] mx-auto" />
              <div className="relative flex w-full min-w-0 flex-col p-2 gap-0.5">
                {SIDEBAR_DATABASE_ITEMS.map((item) => (
                  <SidebarNavItem key={item.label} {...item} />
                ))}
              </div>
              <div className="shrink-0 bg-border-muted h-px w-[calc(100%-1rem)] mx-auto" />
              <div className="relative flex w-full min-w-0 flex-col p-2 gap-0.5">
                {SIDEBAR_ADVISOR_ITEMS.map((item) => (
                  <SidebarNavItem key={item.label} {...item} />
                ))}
              </div>
              <div className="shrink-0 bg-border-muted h-px w-[calc(100%-1rem)] mx-auto" />
              <div className="relative flex w-full min-w-0 flex-col p-2 gap-0.5">
                <SidebarNavItem icon={Settings} label="Project Settings" />
              </div>
            </ul>
          </div>
          <div className="flex items-center justify-center p-2">
            <button
              type="button"
              aria-label="Sidebar control"
              className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-lighter hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            >
              <PanelLeftDashed size={ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} />
            </button>
          </div>
        </div>
      </div>
    </PrototypeComponent>
  );
}
