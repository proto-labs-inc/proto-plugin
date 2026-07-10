"use client";

import { PrototypeComponent } from "proto-plugin";
import { Card, CardContent, CardHeader, CardTitle } from "@coss/ui/components/card";

import {
  AUTOMAT_ACTIVE_WORKFLOW_COUNT,
  AUTOMAT_AGENTIC_COUNT,
  AUTOMAT_IDP_COUNT,
} from "./automat-workflows-page-mock-data";

export function AutomatStatsCards() {
  return (
    <PrototypeComponent id="automat-stats-cards">
      <Card className="flex flex-col gap-2 rounded-3xl border p-6">
        <CardHeader className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 p-0">
          <CardTitle className="font-semibold leading-none">Active Workflows</CardTitle>
        </CardHeader>
        <CardContent className="flex h-full flex-col p-0">
          <div className="text-5xl font-semibold">{AUTOMAT_ACTIVE_WORKFLOW_COUNT}</div>
          <div className="mt-auto flex items-center text-sm text-muted-foreground">
            <div className="flex flex-1 flex-col text-left">
              <span className="mb-2 text-sm">Agentic Workflows</span>
              <span className="font-medium text-foreground">{AUTOMAT_AGENTIC_COUNT}</span>
            </div>
            <div className="mx-4 h-12 w-px bg-border" />
            <div className="flex flex-1 flex-col text-left">
              <span className="mb-2 text-sm">IDP Processors</span>
              <span className="font-medium text-foreground">{AUTOMAT_IDP_COUNT}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PrototypeComponent>
  );
}
