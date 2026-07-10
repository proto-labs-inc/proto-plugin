export type AutomatWorkflowStatus = "active" | "scheduled" | "inactive";

export type AutomatStatusFilter = "all" | AutomatWorkflowStatus;

export type AutomatProjectId = "finance-automation" | "hr-digital-transformation";

export type AutomatWorkflowsPagePreviewStateId =
  | "overview-default"
  | "chat-open"
  | "finance-automation"
  | "hr-project"
  | "valid-text-filter"
  | "status-active"
  | "status-scheduled"
  | "status-inactive"
  | "empty-search"
  | "hr-valid-text-filter"
  | "hr-status-active"
  | "hr-status-scheduled"
  | "hr-status-inactive"
  | "hr-empty-search";

export type AutomatLiveState = {
  previewStateId: AutomatWorkflowsPagePreviewStateId;
  projectId: AutomatProjectId;
  searchQuery: string;
  statusFilter: AutomatStatusFilter;
  chatOpen: boolean;
};

export type AutomatWorkflow = {
  id: string;
  name: string;
  description: string;
  status: AutomatWorkflowStatus;
  lastSession: string;
  totalSessions: number;
  successRate: number;
};

export type AutomatActivityItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
};

export type AutomatChartPoint = {
  day: string;
  volume: number;
};

export type AutomatChatThread = {
  id: string;
  name: string;
  avatar: string;
  message: string;
  time: string;
  grayscale?: boolean;
};
