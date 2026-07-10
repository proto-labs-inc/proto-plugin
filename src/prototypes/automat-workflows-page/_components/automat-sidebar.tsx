"use client";

import { PrototypeComponent } from "proto-plugin";
import { Badge } from "@coss/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@coss/ui/components/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@coss/ui/components/sidebar";
import {
  ChartLine,
  CreditCard,
  Grid2x2,
  ListChecks,
  MousePointerClick,
  ScanText,
  Settings,
} from "lucide-react";

import { AUTOMAT_ASSET_BASE } from "./automat-workflows-page-mock-data";

const manageNav = [
  { id: "workflows", label: "Workflows", icon: Grid2x2, active: true },
  { id: "sessions", label: "Sessions", icon: ListChecks, active: false },
  { id: "analytics", label: "Analytics", icon: ChartLine, active: false },
] as const;

const createNav = [
  { id: "agentic-workflow", label: "Agentic Workflow", icon: MousePointerClick },
  { id: "document-extractor", label: "Document Extractor", icon: ScanText },
] as const;

const footerNav = [
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

type AutomatSidebarProps = {
  collapsible?: "icon" | "offcanvas";
};

export function AutomatSidebar({ collapsible = "icon" }: AutomatSidebarProps) {
  return (
    <PrototypeComponent id="automat-sidebar">
      <Sidebar variant="inset" collapsible={collapsible}>
        <SidebarHeader className="flex flex-col gap-2 p-2">
          <a
            className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-sidebar-accent"
            href="#"
          >
            <img
              alt="Automat Logo"
              className="h-6 w-auto"
              src={`${AUTOMAT_ASSET_BASE}/automat_logo_blue.svg`}
            />
            <Badge
              variant="outline"
              className="rounded-full bg-background px-2 py-0.5 text-xs"
            >
              Demo Site
            </Badge>
          </a>
        </SidebarHeader>

        <SidebarContent className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
          <SidebarGroup className="p-2">
            <SidebarGroupLabel>Manage</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {manageNav.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton isActive={item.active} render={<a href="#" />}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="p-2">
            <SidebarGroupLabel>Create</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {createNav.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton render={<a href="#" />}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="flex flex-col gap-2 p-2">
          <SidebarMenu>
            {footerNav.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton render={<a href="#" />}>
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <Avatar className="size-8 shrink-0">
              <AvatarImage alt="Lucas O. avatar" src={`${AUTOMAT_ASSET_BASE}/lucas.png`} />
              <AvatarFallback>LO</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="text-sm font-medium leading-none">Lucas O.</span>
              <span className="truncate text-xs text-muted-foreground">lucas@runautomat.com</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </PrototypeComponent>
  );
}
