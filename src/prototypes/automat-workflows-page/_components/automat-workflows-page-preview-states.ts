import { definePreviewStateRegistry } from "proto-plugin";

import type {
  AutomatLiveState,
  AutomatWorkflowsPagePreviewStateId,
} from "./automat-workflows-page-types";

export const DEFAULT_AUTOMAT_WORKFLOWS_PAGE_PREVIEW_STATE: AutomatWorkflowsPagePreviewStateId =
  "overview-default";

const FINANCE_PROJECT_LIVE_STATE = {
  projectId: "finance-automation",
  searchQuery: "",
  statusFilter: "all",
  chatOpen: false,
} as const satisfies Omit<AutomatLiveState, "previewStateId">;

const HR_PROJECT_LIVE_STATE = {
  projectId: "hr-digital-transformation",
  searchQuery: "",
  statusFilter: "all",
  chatOpen: false,
} as const satisfies Omit<AutomatLiveState, "previewStateId">;

export function inferPreviewStateId(state: AutomatLiveState): AutomatWorkflowsPagePreviewStateId {
  const { projectId, searchQuery, statusFilter, chatOpen } = state;
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const isHr = projectId === "hr-digital-transformation";

  if (chatOpen && !isHr) {
    return "chat-open";
  }

  if (isHr) {
    if (normalizedSearch === "onboarding" && statusFilter === "all") {
      return "hr-valid-text-filter";
    }
    if (normalizedSearch === "zzz" && statusFilter === "all") {
      return "hr-empty-search";
    }
    if (normalizedSearch === "" && statusFilter === "active") {
      return "hr-status-active";
    }
    if (normalizedSearch === "" && statusFilter === "scheduled") {
      return "hr-status-scheduled";
    }
    if (normalizedSearch === "" && statusFilter === "inactive") {
      return "hr-status-inactive";
    }
    if (normalizedSearch.length > 0) {
      return "hr-valid-text-filter";
    }
    return "hr-project";
  }

  if (normalizedSearch === "invoice" && statusFilter === "all") {
    return "valid-text-filter";
  }
  if (normalizedSearch === "zzz" && statusFilter === "all") {
    return "empty-search";
  }
  if (normalizedSearch === "" && statusFilter === "active") {
    return "status-active";
  }
  if (normalizedSearch === "" && statusFilter === "scheduled") {
    return "status-scheduled";
  }
  if (normalizedSearch === "" && statusFilter === "inactive") {
    return "status-inactive";
  }
  if (normalizedSearch.length > 0) {
    return "valid-text-filter";
  }

  return state.previewStateId === "overview-default"
    ? "overview-default"
    : "finance-automation";
}

export function withInferredPreviewState(
  current: AutomatLiveState,
  patch: Partial<AutomatLiveState>,
): AutomatLiveState {
  const next = { ...current, ...patch };
  return {
    ...next,
    previewStateId: inferPreviewStateId(next),
  };
}

export function createLiveStateForPreview(
  previewStateId: AutomatWorkflowsPagePreviewStateId = DEFAULT_AUTOMAT_WORKFLOWS_PAGE_PREVIEW_STATE,
): AutomatLiveState {
  switch (previewStateId) {
    case "chat-open":
      return {
        previewStateId,
        ...FINANCE_PROJECT_LIVE_STATE,
        chatOpen: true,
      };
    case "finance-automation":
      return {
        previewStateId,
        ...FINANCE_PROJECT_LIVE_STATE,
      };
    case "hr-project":
      return {
        previewStateId,
        ...HR_PROJECT_LIVE_STATE,
      };
    case "valid-text-filter":
      return {
        previewStateId,
        ...FINANCE_PROJECT_LIVE_STATE,
        searchQuery: "invoice",
      };
    case "status-active":
      return {
        previewStateId,
        ...FINANCE_PROJECT_LIVE_STATE,
        statusFilter: "active",
      };
    case "status-scheduled":
      return {
        previewStateId,
        ...FINANCE_PROJECT_LIVE_STATE,
        statusFilter: "scheduled",
      };
    case "status-inactive":
      return {
        previewStateId,
        ...FINANCE_PROJECT_LIVE_STATE,
        statusFilter: "inactive",
      };
    case "empty-search":
      return {
        previewStateId,
        ...FINANCE_PROJECT_LIVE_STATE,
        searchQuery: "zzz",
      };
    case "hr-valid-text-filter":
      return {
        previewStateId,
        ...HR_PROJECT_LIVE_STATE,
        searchQuery: "onboarding",
      };
    case "hr-status-active":
      return {
        previewStateId,
        ...HR_PROJECT_LIVE_STATE,
        statusFilter: "active",
      };
    case "hr-status-scheduled":
      return {
        previewStateId,
        ...HR_PROJECT_LIVE_STATE,
        statusFilter: "scheduled",
      };
    case "hr-status-inactive":
      return {
        previewStateId,
        ...HR_PROJECT_LIVE_STATE,
        statusFilter: "inactive",
      };
    case "hr-empty-search":
      return {
        previewStateId,
        ...HR_PROJECT_LIVE_STATE,
        searchQuery: "zzz",
      };
    case "overview-default":
    default:
      return {
        previewStateId: "overview-default",
        ...FINANCE_PROJECT_LIVE_STATE,
      };
  }
}

export const AUTOMAT_WORKFLOWS_PAGE_PREVIEW_STATE_REGISTRY = definePreviewStateRegistry({
  canvasLayout: {
    rows: [
      {
        states: [{ id: "overview-default", column: 5 }],
      },
      {
        states: [
          { id: "chat-open", column: 0 },
          { id: "finance-automation", column: 4 },
          { id: "hr-project", column: 10 },
        ],
      },
      {
        states: [
          { id: "valid-text-filter", column: 2 },
          { id: "status-active", column: 3 },
          { id: "status-scheduled", column: 4 },
          { id: "status-inactive", column: 5 },
          { id: "empty-search", column: 6 },
          { id: "hr-valid-text-filter", column: 8 },
          { id: "hr-status-active", column: 9 },
          { id: "hr-status-scheduled", column: 10 },
          { id: "hr-status-inactive", column: 11 },
          { id: "hr-empty-search", column: 12 },
        ],
      },
    ],
  },
  states: [
    {
      id: "overview-default",
      label: "Default",
      annotation: "Finance Automation project — full workflows dashboard with all rows.",
    },
    {
      id: "chat-open",
      label: "Chat open",
      annotation: "Support chat panel expanded over the dashboard.",
    },
    {
      id: "finance-automation",
      label: "Finance automation",
      annotation: "Finance Automation project with search and status filters available.",
    },
    {
      id: "hr-project",
      label: "HR project",
      annotation:
        "HR Digital Transformation project — single HR Onboarding workflow and reduced stats.",
    },
    {
      id: "valid-text-filter",
      label: "Valid text filter",
      separatorBefore: true,
      annotation: 'Finance project — search query "invoice" narrows the workflows table.',
    },
    {
      id: "status-active",
      label: "Status: Active",
      annotation: "Finance project — status filter set to Active workflows only.",
    },
    {
      id: "status-scheduled",
      label: "Status: Scheduled",
      annotation: "Finance project — status filter set to Scheduled workflows only.",
    },
    {
      id: "status-inactive",
      label: "Status: Inactive",
      annotation: "Finance project — status filter set to Inactive workflows only.",
    },
    {
      id: "empty-search",
      label: "Empty search",
      annotation: "Finance project — search query with no matching workflow rows.",
    },
    {
      id: "hr-valid-text-filter",
      label: "Valid text filter",
      separatorBefore: true,
      annotation: 'HR project — search query "onboarding" narrows the workflows table.',
    },
    {
      id: "hr-status-active",
      label: "Status: Active",
      annotation: "HR project — status filter set to Active workflows only.",
    },
    {
      id: "hr-status-scheduled",
      label: "Status: Scheduled",
      annotation: "HR project — status filter set to Scheduled workflows only.",
    },
    {
      id: "hr-status-inactive",
      label: "Status: Inactive",
      annotation: "HR project — status filter set to Inactive workflows only.",
    },
    {
      id: "hr-empty-search",
      label: "Empty search",
      annotation: "HR project — search query with no matching workflow rows.",
    },
  ],
  edges: [
    { from: "overview-default", to: "chat-open" },
    { from: "overview-default", to: "finance-automation" },
    { from: "overview-default", to: "hr-project", dashed: true },
    { from: "finance-automation", to: "valid-text-filter", dashed: true },
    { from: "finance-automation", to: "status-active", dashed: true },
    { from: "finance-automation", to: "status-scheduled", dashed: true },
    { from: "finance-automation", to: "status-inactive", dashed: true },
    { from: "finance-automation", to: "empty-search", dashed: true },
    { from: "hr-project", to: "hr-valid-text-filter", dashed: true },
    { from: "hr-project", to: "hr-status-active", dashed: true },
    { from: "hr-project", to: "hr-status-scheduled", dashed: true },
    { from: "hr-project", to: "hr-status-inactive", dashed: true },
    { from: "hr-project", to: "hr-empty-search", dashed: true },
  ],
});

export const AUTOMAT_WORKFLOWS_PAGE_PREVIEW_OPTIONS =
  AUTOMAT_WORKFLOWS_PAGE_PREVIEW_STATE_REGISTRY.pickerOptions;
