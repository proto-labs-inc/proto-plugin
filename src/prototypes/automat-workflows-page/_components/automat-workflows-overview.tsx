"use client";

import { PrototypeComponent } from "proto-plugin";
import { Button } from "@coss/ui/components/button";
import { Plus } from "lucide-react";

export function AutomatWorkflowsOverview() {
  return (
    <PrototypeComponent id="automat-workflows-overview">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold leading-tight">Workflows</h1>
          <p className="text-muted-foreground">Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="h-9 cursor-pointer px-4 shadow-xs">
            Create New Workflow
            <Plus className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </PrototypeComponent>
  );
}
