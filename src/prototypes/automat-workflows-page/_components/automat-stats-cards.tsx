"use client";

import { PrototypeComponent } from "proto-plugin";
import { Card, CardContent, CardHeader, CardTitle } from "@coss/ui/components/card";

import {
  getAutomatProjectDashboardData,
} from "./automat-workflows-page-mock-data";
import type { AutomatProjectId } from "./automat-workflows-page-types";

type AutomatStatsCardsProps = {
  projectId: AutomatProjectId;
};

export function AutomatStatsCards({ projectId }: AutomatStatsCardsProps) {
  const { activeWorkflowCount, agenticCount, idpCount } =
    getAutomatProjectDashboardData(projectId);

  return (
    <PrototypeComponent id="automat-stats-cards">
      <Card className="flex h-[240px] flex-col gap-2 rounded-3xl border p-6">
        <CardHeader className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 p-0">
          <CardTitle className="font-semibold leading-none">Active Workflows</CardTitle>
        </CardHeader>
        <CardContent className="flex h-full flex-col p-0">
          <div className="text-5xl font-semibold">{activeWorkflowCount}</div>
          <div className="mt-auto flex items-center text-sm text-muted-foreground">
            <div className="flex flex-1 flex-col text-left">
              <span className="mb-2 text-sm">Agentic Workflows</span>
              <span className="font-medium text-foreground">{agenticCount}</span>
            </div>
            <div className="mx-4 h-12 w-px bg-border" />
            <div className="flex flex-1 flex-col text-left">
              <span className="mb-2 text-sm">IDP Processors</span>
              <span className="font-medium text-foreground">{idpCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PrototypeComponent>
  );
}
