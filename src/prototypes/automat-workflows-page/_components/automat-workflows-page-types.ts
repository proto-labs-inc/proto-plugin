export type AutomatWorkflowStatus = "active" | "scheduled" | "inactive";

export type AutomatStatusFilter = "all" | AutomatWorkflowStatus;

export type AutomatWorkflowsPagePreviewStateId =
  | "overview-default"
  | "search-filtered"
  | "status-active"
  | "status-scheduled"
  | "status-inactive"
  | "empty-search"
  | "chat-open"
  | "sidebar-collapsed";

export type AutomatLiveState = {
  previewStateId: AutomatWorkflowsPagePreviewStateId;
  sidebarOpen: boolean;
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
