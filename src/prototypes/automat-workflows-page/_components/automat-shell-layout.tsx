"use client";

import { PrototypeComponent } from "proto-plugin";
import { SidebarInset, SidebarProvider } from "@coss/ui/components/sidebar";
import { useEffect, useRef, useState } from "react";

import { AutomatHeader } from "./automat-header";
import { AutomatSidebar } from "./automat-sidebar";
import { useAutomatShellCompact } from "./use-automat-shell-compact";
import type { AutomatProjectId } from "./automat-workflows-page-types";

type AutomatShellLayoutProps = {
  children: React.ReactNode;
  projectId: AutomatProjectId;
  onProjectIdChange: (projectId: AutomatProjectId) => void;
};

export function AutomatShellLayout({
  children,
  projectId,
  onProjectIdChange,
}: AutomatShellLayoutProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const isCompact = useAutomatShellCompact(shellRef);
  const [sidebarOpen, setSidebarOpen] = useState(() => !isCompact);

  useEffect(() => {
    setSidebarOpen(!isCompact);
  }, [isCompact]);

  return (
    <PrototypeComponent
      id="automat-shell-layout"
      className="flex h-full min-h-0 w-full flex-1"
    >
      <div ref={shellRef} className="flex h-full min-h-0 w-full flex-1">
        <SidebarProvider
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          style={
            {
              "--sidebar-width": "17rem",
              "--sidebar-width-icon": "3rem",
            } as React.CSSProperties
          }
          className="group/sidebar-wrapper flex h-full min-h-0 w-full overflow-y-hidden"
        >
          <AutomatSidebar collapsible={isCompact ? "offcanvas" : "icon"} />
          <SidebarInset className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden border-l border-border bg-sidebar">
            <AutomatHeader
              projectId={projectId}
              onProjectIdChange={onProjectIdChange}
            />
            {children}
          </SidebarInset>
        </SidebarProvider>
      </div>
    </PrototypeComponent>
  );
}
