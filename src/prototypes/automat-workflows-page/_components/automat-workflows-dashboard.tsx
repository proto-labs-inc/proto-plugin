"use client";

import { PrototypeComponent } from "proto-plugin";
import { AutomatRecentActivity } from "./automat-recent-activity";
import { AutomatStatsCards } from "./automat-stats-cards";
import { AutomatVolumeChart } from "./automat-volume-chart";
import { AutomatWorkflowsOverview } from "./automat-workflows-overview";
import { AutomatWorkflowsTable } from "./automat-workflows-table";
import type { AutomatStatusFilter } from "./automat-workflows-page-types";

type AutomatWorkflowsDashboardProps = {
  searchQuery: string;
  statusFilter: AutomatStatusFilter;
  onSearchQueryChange: (query: string) => void;
  onStatusFilterChange: (filter: AutomatStatusFilter) => void;
};

export function AutomatWorkflowsDashboard({
  searchQuery,
  statusFilter,
  onSearchQueryChange,
  onStatusFilterChange,
}: AutomatWorkflowsDashboardProps) {
  return (
    <PrototypeComponent
      id="automat-workflows-dashboard"
      className="@container/page flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto p-6"
    >
      <div className="flex flex-col gap-6">
        <AutomatWorkflowsOverview />

        <div className="grid gap-4 @xl/page:grid-cols-2 @4xl/page:grid-cols-4">
          <AutomatStatsCards />
          <AutomatVolumeChart />
          <AutomatRecentActivity />
        </div>

        <AutomatWorkflowsTable
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchQueryChange={onSearchQueryChange}
          onStatusFilterChange={onStatusFilterChange}
        />
      </div>
    </PrototypeComponent>
  );
}
