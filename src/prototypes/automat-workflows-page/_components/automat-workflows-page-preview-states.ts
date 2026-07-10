import { definePreviewStateRegistry } from "proto-plugin";

import type {
  AutomatLiveState,
  AutomatWorkflowsPagePreviewStateId,
} from "./automat-workflows-page-types";

export const DEFAULT_AUTOMAT_WORKFLOWS_PAGE_PREVIEW_STATE: AutomatWorkflowsPagePreviewStateId =
  "overview-default";

export function createLiveStateForPreview(
  previewStateId: AutomatWorkflowsPagePreviewStateId = DEFAULT_AUTOMAT_WORKFLOWS_PAGE_PREVIEW_STATE,
): AutomatLiveState {
  switch (previewStateId) {
    case "search-filtered":
      return {
        previewStateId,
        sidebarOpen: true,
        searchQuery: "invoice",
        statusFilter: "all",
        chatOpen: false,
      };
    case "status-active":
      return {
        previewStateId,
        sidebarOpen: true,
        searchQuery: "",
        statusFilter: "active",
        chatOpen: false,
      };
    case "status-scheduled":
      return {
        previewStateId,
        sidebarOpen: true,
        searchQuery: "",
        statusFilter: "scheduled",
        chatOpen: false,
      };
    case "status-inactive":
      return {
        previewStateId,
        sidebarOpen: true,
        searchQuery: "",
        statusFilter: "inactive",
        chatOpen: false,
      };
    case "empty-search":
      return {
        previewStateId,
        sidebarOpen: true,
        searchQuery: "zzz",
        statusFilter: "all",
        chatOpen: false,
      };
    case "chat-open":
      return {
        previewStateId,
        sidebarOpen: true,
        searchQuery: "",
        statusFilter: "all",
        chatOpen: true,
      };
    case "sidebar-collapsed":
      return {
        previewStateId,
        sidebarOpen: false,
        searchQuery: "",
        statusFilter: "all",
        chatOpen: false,
      };
    case "overview-default":
    default:
      return {
        previewStateId: "overview-default",
        sidebarOpen: true,
        searchQuery: "",
        statusFilter: "all",
        chatOpen: false,
      };
  }
}

export const AUTOMAT_WORKFLOWS_PAGE_PREVIEW_STATE_REGISTRY = definePreviewStateRegistry({
  canvasLayout: {
    rows: [
      {
        section: { label: "Dashboard" },
        states: ["overview-default"],
      },
      {
        section: { label: "Table filters" },
        states: [
          "search-filtered",
          "status-active",
          "status-scheduled",
          "status-inactive",
          "empty-search",
        ],
      },
      {
        section: { label: "Chrome" },
        states: ["chat-open", "sidebar-collapsed"],
      },
    ],
  },
  states: [
    {
      id: "overview-default",
      label: "Overview default",
      annotation: "Full workflows dashboard with all rows, no filters, chat closed.",
    },
    {
      id: "search-filtered",
      label: "Search filtered",
      annotation: 'Search query "invoice" narrows the workflows table.',
    },
    {
      id: "status-active",
      label: "Status: Active",
      annotation: "Status filter set to Active workflows only.",
    },
    {
      id: "status-scheduled",
      label: "Status: Scheduled",
      annotation: "Status filter set to Scheduled workflows only.",
    },
    {
      id: "status-inactive",
      label: "Status: Inactive",
      annotation: "Status filter set to Inactive workflows only.",
    },
    {
      id: "empty-search",
      label: "Empty search",
      annotation: "Search query with no matching workflow rows.",
    },
    {
      id: "chat-open",
      label: "Chat open",
      annotation: "Support chat panel expanded over the dashboard.",
    },
    {
      id: "sidebar-collapsed",
      label: "Sidebar collapsed",
      annotation: "Sidebar collapsed to icon rail width.",
    },
  ],
  edges: [
    { from: "overview-default", to: "search-filtered", dashed: true },
    { from: "overview-default", to: "status-active", dashed: true },
    { from: "overview-default", to: "status-scheduled", dashed: true },
    { from: "overview-default", to: "status-inactive", dashed: true },
    { from: "overview-default", to: "empty-search", dashed: true },
    { from: "overview-default", to: "chat-open" },
    { from: "overview-default", to: "sidebar-collapsed" },
  ],
});

export const AUTOMAT_WORKFLOWS_PAGE_PREVIEW_OPTIONS =
  AUTOMAT_WORKFLOWS_PAGE_PREVIEW_STATE_REGISTRY.pickerOptions;
