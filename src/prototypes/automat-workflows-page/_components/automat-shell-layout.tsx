"use client";

import { PrototypeComponent } from "proto-plugin";
import {
  SidebarInset,
  SidebarProvider,
} from "@coss/ui/components/sidebar";

import { AutomatChatWidget } from "./automat-chat-widget";
import { AutomatDemoLauncher } from "./automat-demo-launcher";
import { AutomatHeader } from "./automat-header";
import { AutomatSidebar } from "./automat-sidebar";

type AutomatShellLayoutProps = {
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
  chatOpen: boolean;
  onChatOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function AutomatShellLayout({
  sidebarOpen,
  onSidebarOpenChange,
  chatOpen,
  onChatOpenChange,
  children,
}: AutomatShellLayoutProps) {
  return (
    <PrototypeComponent id="automat-shell-layout" className="flex h-full min-h-0 w-full flex-1">
      <SidebarProvider
        open={sidebarOpen}
        onOpenChange={onSidebarOpenChange}
        style={
          {
            "--sidebar-width": "17rem",
            "--sidebar-width-icon": "3rem",
          } as React.CSSProperties
        }
        className="group/sidebar-wrapper flex h-full min-h-0 w-full overflow-y-hidden"
      >
        <AutomatSidebar />
        <SidebarInset className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden border-l border-border bg-sidebar">
          <AutomatHeader />
          {children}
        </SidebarInset>
        <AutomatChatWidget chatOpen={chatOpen} onChatOpenChange={onChatOpenChange} />
        <AutomatDemoLauncher />
      </SidebarProvider>
    </PrototypeComponent>
  );
}
