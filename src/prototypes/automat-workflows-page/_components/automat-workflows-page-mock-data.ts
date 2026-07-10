import type {
  AutomatActivityItem,
  AutomatChartPoint,
  AutomatChatThread,
  AutomatProjectId,
  AutomatWorkflow,
} from "./automat-workflows-page-types";

export const AUTOMAT_ASSET_BASE = "/prototypes/automat-workflows-page";

export const AUTOMAT_ORGANIZATION_NAME = "Acme Corporation";

export const AUTOMAT_PROJECTS = [
  {
    id: "finance-automation",
    name: "Finance Automation",
    description: "AP/AR process automation and financial reporting",
  },
  {
    id: "hr-digital-transformation",
    name: "HR Digital Transformation",
    description: "Modernizing HR processes with automation",
  },
] as const;

export const AUTOMAT_WORKFLOWS: AutomatWorkflow[] = [
  {
    id: "wf-001",
    name: "Invoice Processing Workflow",
    description: "Automated workflow for processing vendor invoices",
    status: "active",
    lastSession: "2024-01-20T14:22:00Z",
    totalSessions: 245,
    successRate: 98.5,
  },
  {
    id: "wf-002",
    name: "Customer Onboarding",
    description: "Streamlines new customer registration process",
    status: "active",
    lastSession: "2024-01-20T11:45:00Z",
    totalSessions: 156,
    successRate: 95.2,
  },
  {
    id: "wf-003",
    name: "Employee Expense Processing",
    description: "Automated expense report validation and reimbursement",
    status: "active",
    lastSession: "2024-01-20T09:15:00Z",
    totalSessions: 89,
    successRate: 92.8,
  },
  {
    id: "wf-004",
    name: "Purchase Order Automation",
    description: "Streamlines PO creation and approval workflow",
    status: "scheduled",
    lastSession: "2024-01-19T16:45:00Z",
    totalSessions: 134,
    successRate: 96.3,
  },
  {
    id: "wf-005",
    name: "Contract Management",
    description: "Automated contract review and renewal tracking",
    status: "active",
    lastSession: "2024-01-20T13:20:00Z",
    totalSessions: 67,
    successRate: 94.7,
  },
  {
    id: "wf-006",
    name: "Inventory Management",
    description: "Automated stock level monitoring and reordering",
    status: "active",
    lastSession: "2024-01-20T07:30:00Z",
    totalSessions: 312,
    successRate: 99.1,
  },
  {
    id: "wf-007",
    name: "Customer Support Ticket Routing",
    description: "Intelligent ticket classification and assignment",
    status: "inactive",
    lastSession: "2024-01-18T17:00:00Z",
    totalSessions: 23,
    successRate: 88.9,
  },
  {
    id: "wf-008",
    name: "Financial Reporting Automation",
    description: "Automated monthly financial report generation",
    status: "active",
    lastSession: "2024-01-20T06:00:00Z",
    totalSessions: 20,
    successRate: 97.4,
  },
  {
    id: "wf-009",
    name: "HR Onboarding Process",
    description: "Streamlined new employee onboarding workflow",
    status: "active",
    lastSession: "2024-01-20T10:15:00Z",
    totalSessions: 45,
    successRate: 91.6,
  },
  {
    id: "wf-010",
    name: "Compliance Monitoring",
    description: "Automated regulatory compliance tracking and reporting",
    status: "scheduled",
    lastSession: "2024-01-19T23:59:00Z",
    totalSessions: 78,
    successRate: 93.2,
  },
];

export const AUTOMAT_RECENT_ACTIVITY: AutomatActivityItem[] = [
  {
    id: "activity-1",
    title: "Invoice Processing Workflow",
    description: "Processed 25 invoices successfully",
    timestamp: "Today, 2:35 PM",
  },
  {
    id: "activity-2",
    title: "Customer Onboarding Workflow",
    description: "Completed 12 new customer setups",
    timestamp: "Today, 1:45 PM",
  },
  {
    id: "activity-3",
    title: "Data Migration Workflow",
    description: "Migrated 1,200 records to new system",
    timestamp: "Today, 11:20 AM",
  },
  {
    id: "activity-4",
    title: "Email Campaign Workflow",
    description: "Sent 5,000 personalized emails",
    timestamp: "Today, 9:15 AM",
  },
  {
    id: "activity-5",
    title: "Order Fulfillment Workflow",
    description: "Processed 87 orders automatically",
    timestamp: "Yesterday, 4:30 PM",
  },
  {
    id: "activity-6",
    title: "Report Generation Workflow",
    description: "Generated monthly analytics report",
    timestamp: "Yesterday, 2:15 PM",
  },
];

export const AUTOMAT_VOLUME_CHART_DATA: AutomatChartPoint[] = [
  { day: "Mon", volume: 19.5 },
  { day: "Tue", volume: 36.4 },
  { day: "Wed", volume: 28.6 },
  { day: "Thu", volume: 58.5 },
  { day: "Fri", volume: 49.4 },
  { day: "Sat", volume: 87.1 },
  { day: "Sun", volume: 115.7 },
];

export const AUTOMAT_CHAT_THREADS: AutomatChatThread[] = [
  {
    id: "thread-agent",
    name: "Automat Agent",
    avatar: `${AUTOMAT_ASSET_BASE}/Agent.png`,
    message:
      "I've added a human review step for invoices over $100k. A team member will be notified to review these invoices before processing.",
    time: "3:15 PM",
  },
  {
    id: "thread-kelley",
    name: "Kelley S.",
    avatar: `${AUTOMAT_ASSET_BASE}/kelley.png`,
    message: "Understood, we'll help you set that up right...",
    time: "2:02 PM",
    grayscale: true,
  },
  {
    id: "thread-pablo",
    name: "Pablo L.",
    avatar: `${AUTOMAT_ASSET_BASE}/pablo.png`,
    message: "Exciting news!",
    time: "2:02 PM",
    grayscale: true,
  },
];

export const AUTOMAT_HR_WORKFLOWS: AutomatWorkflow[] = [
  {
    id: "wf-003",
    name: "HR Onboarding",
    description: "Employee onboarding automation",
    status: "active",
    lastSession: "2024-01-20T10:15:00Z",
    totalSessions: 89,
    successRate: 92.1,
  },
];

export type AutomatProjectDashboardData = {
  activeWorkflowCount: number;
  agenticCount: number;
  idpCount: number;
  workflows: AutomatWorkflow[];
};

export const AUTOMAT_PROJECT_DASHBOARD_DATA: Record<
  AutomatProjectId,
  AutomatProjectDashboardData
> = {
  "finance-automation": {
    activeWorkflowCount: 10,
    agenticCount: 6,
    idpCount: 4,
    workflows: AUTOMAT_WORKFLOWS,
  },
  "hr-digital-transformation": {
    activeWorkflowCount: 1,
    agenticCount: 1,
    idpCount: 0,
    workflows: AUTOMAT_HR_WORKFLOWS,
  },
};

export function getAutomatProjectDashboardData(projectId: AutomatProjectId) {
  return AUTOMAT_PROJECT_DASHBOARD_DATA[projectId];
}
