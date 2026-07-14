"use client";

import { PrototypeComponent } from "proto-plugin";
import { Badge } from "@coss/ui/components/badge";
import { Button } from "@coss/ui/components/button";
import { Card, CardContent } from "@coss/ui/components/card";
import { Input } from "@coss/ui/components/input";
import {
  Select,
  SelectButton,
  SelectItem,
  SelectPopup,
} from "@coss/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@coss/ui/components/table";
import { cn } from "@coss/ui/lib/utils";
import { useMemo } from "react";

import styles from "../automat-workflows-page.module.scss";
import { getAutomatProjectDashboardData } from "./automat-workflows-page-mock-data";
import type {
  AutomatProjectId,
  AutomatStatusFilter,
  AutomatWorkflow,
  AutomatWorkflowStatus,
} from "./automat-workflows-page-types";

type AutomatWorkflowsTableProps = {
  projectId: AutomatProjectId;
  searchQuery: string;
  statusFilter: AutomatStatusFilter;
  onSearchQueryChange: (query: string) => void;
  onStatusFilterChange: (filter: AutomatStatusFilter) => void;
};

const STATUS_OPTIONS: { value: AutomatStatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "scheduled", label: "Scheduled" },
  { value: "inactive", label: "Inactive" },
];

function statusBadgeClass(status: AutomatWorkflowStatus) {
  switch (status) {
    case "active":
      return styles.badgeActive;
    case "scheduled":
      return styles.badgeScheduled;
    case "inactive":
      return styles.badgeInactive;
  }
}

function statusLabel(status: AutomatWorkflowStatus) {
  switch (status) {
    case "active":
      return "Active";
    case "scheduled":
      return "Scheduled";
    case "inactive":
      return "Inactive";
  }
}

function filterWorkflows(
  workflows: AutomatWorkflow[],
  searchQuery: string,
  statusFilter: AutomatStatusFilter,
) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return workflows.filter((workflow) => {
    const matchesStatus =
      statusFilter === "all" ? true : workflow.status === statusFilter;
    const matchesSearch =
      normalizedQuery.length === 0 ||
      workflow.name.toLowerCase().includes(normalizedQuery) ||
      workflow.description.toLowerCase().includes(normalizedQuery);

    return matchesStatus && matchesSearch;
  });
}

export function AutomatWorkflowsTable({
  projectId,
  searchQuery,
  statusFilter,
  onSearchQueryChange,
  onStatusFilterChange,
}: AutomatWorkflowsTableProps) {
  const workflows = getAutomatProjectDashboardData(projectId).workflows;

  const filteredWorkflows = useMemo(
    () => filterWorkflows(workflows, searchQuery, statusFilter),
    [workflows, searchQuery, statusFilter],
  );

  const selectedStatusLabel =
    STATUS_OPTIONS.find((option) => option.value === statusFilter)?.label ?? "All statuses";

  return (
    <PrototypeComponent id="automat-workflows-table">
      <Card className="flex min-h-0 flex-1 flex-col gap-2 rounded-3xl border p-6">
        <CardContent className="flex min-h-0 flex-1 flex-col overflow-x-hidden p-0">
          <div className="flex shrink-0 items-center gap-4 pb-4">
            <div className="relative max-w-sm flex-1">
              <Input
                className="h-9 shadow-xs"
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
              />
            </div>
            <Select
              items={STATUS_OPTIONS}
              value={statusFilter}
              onValueChange={(value) => onStatusFilterChange(value as AutomatStatusFilter)}
            >
              <SelectButton className="h-9 w-[220px] shadow-xs">
                <span className="truncate">{selectedStatusLabel}</span>
              </SelectButton>
              <SelectPopup>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectPopup>
            </Select>
          </div>

          <div className="max-h-128 min-h-0 flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Session</TableHead>
                  <TableHead>Total Sessions</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkflows.map((workflow) => (
                  <PrototypeComponent
                    key={workflow.id}
                    as="tr"
                    id={`workflow-row.${workflow.id}`}
                    className="hover:bg-muted/50 border-b transition-colors"
                  >
                    <TableCell>
                          <div>
                            <div className="font-medium">{workflow.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {workflow.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-md border px-2 py-0.5 text-xs font-medium",
                              statusBadgeClass(workflow.status),
                            )}
                          >
                            {statusLabel(workflow.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{workflow.lastSession}</TableCell>
                        <TableCell>{workflow.totalSessions}</TableCell>
                        <TableCell>
                          <span className="text-sm">{workflow.successRate}%</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 cursor-pointer px-3">
                            Details
                          </Button>
                        </TableCell>
                  </PrototypeComponent>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PrototypeComponent>
  );
}
