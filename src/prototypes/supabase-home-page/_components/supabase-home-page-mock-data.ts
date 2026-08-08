export const MOCK_PROJECT = {
  name: "Default Project",
  apiUrl: "http://127.0.0.1:54321",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
} as const;

export type AdvisorIssue = {
  id: string;
  category: "SECURITY" | "PERFORMANCE";
  severity: "critical" | "warning";
  title: string;
  description: string;
  tableName?: string;
};

export const MOCK_ADVISOR_ISSUE: AdvisorIssue = {
  id: "rls-disabled-public-employees",
  category: "SECURITY",
  severity: "critical",
  title: "RLS Disabled in Public",
  description: "Table public.employees is public, but RLS has not been enabled.",
  tableName: "public.employees",
};

export const CONNECT_ACTIONS = [
  {
    id: "framework" as const,
    heading: "Framework",
    subheading: "Use a client library",
  },
  {
    id: "server" as const,
    heading: "Server",
    subheading: "Build APIs",
  },
  {
    id: "direct" as const,
    heading: "Direct",
    subheading: "Connection string",
  },
  {
    id: "orm" as const,
    heading: "ORM",
    subheading: "Third-party library",
  },
  {
    id: "mcp" as const,
    heading: "MCP",
    subheading: "Connect your agent",
  },
  {
    id: "api_keys" as const,
    heading: "API Keys",
    subheading: "Manage project keys",
  },
] as const;
