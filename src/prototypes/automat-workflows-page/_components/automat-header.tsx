"use client";

import { PrototypeComponent } from "proto-plugin";
import { Button } from "@coss/ui/components/button";
import { SidebarTrigger } from "@coss/ui/components/sidebar";
import { ChevronDown } from "lucide-react";

export function AutomatHeader() {
  return (
    <PrototypeComponent id="automat-header">
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b bg-sidebar px-4">
        <SidebarTrigger className="-ml-1 size-7" />
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="flex h-auto items-center gap-1 px-3 py-2 hover:bg-muted">
            <span className="text-sm font-medium">Acme Corporation</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
          <span className="text-muted-foreground">/</span>
          <Button variant="ghost" className="flex h-auto items-center gap-1 px-3 py-2 hover:bg-muted">
            <span className="text-sm font-medium">Finance Automation</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
        </div>
        <div className="flex-1" />
      </header>
    </PrototypeComponent>
  );
}
