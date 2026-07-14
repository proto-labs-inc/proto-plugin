"use client";

import { PrototypeComponent } from "proto-plugin";
import { AutomatAnalyticsBlock } from "./automat-analytics-block";
import { AutomatWorkflowsOverview } from "./automat-workflows-overview";
import { AutomatWorkflowsTable } from "./automat-workflows-table";
import type { AutomatAnalyticsVariant } from "./automat-analytics-content";
import type { AutomatProjectId, AutomatStatusFilter } from "./automat-workflows-page-types";

type AutomatWorkflowsDashboardProps = {
  projectId: AutomatProjectId;
  searchQuery: string;
  statusFilter: AutomatStatusFilter;
  analyticsVariant: AutomatAnalyticsVariant;
  onSearchQueryChange: (query: string) => void;
  onStatusFilterChange: (filter: AutomatStatusFilter) => void;
};

export function AutomatWorkflowsDashboard({
  projectId,
  searchQuery,
  statusFilter,
  analyticsVariant,
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

        <AutomatAnalyticsBlock variant={analyticsVariant} projectId={projectId} />

        <AutomatWorkflowsTable
          projectId={projectId}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchQueryChange={onSearchQueryChange}
          onStatusFilterChange={onStatusFilterChange}
        />
      </div>
    </PrototypeComponent>
  );
}
