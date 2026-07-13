export type TableEntity = {
  name: string;
  hasApiAccess?: boolean;
  isUnrestricted?: boolean;
};

export const MOCK_TABLES: TableEntity[] = [
  { name: "branches", hasApiAccess: true },
  { name: "canvas", hasApiAccess: true },
  { name: "conversations", hasApiAccess: true },
  { name: "custom_domain_verification", hasApiAccess: true },
  { name: "custom_domains", hasApiAccess: true },
  { name: "deployments", hasApiAccess: true },
  { name: "employees", isUnrestricted: true },
  { name: "feedbacks", hasApiAccess: true },
  { name: "frames", hasApiAccess: true },
  { name: "legacy_subscriptions", hasApiAccess: true },
  { name: "messages", hasApiAccess: true },
  { name: "preview_domains", hasApiAccess: true },
  { name: "prices", hasApiAccess: true },
  { name: "products", hasApiAccess: true },
  { name: "project_create_requests", hasApiAccess: true },
  { name: "project_custom_domains", hasApiAccess: true },
  { name: "project_invitations", hasApiAccess: true },
  { name: "project_settings", hasApiAccess: true },
  { name: "projects", hasApiAccess: true },
  { name: "rate_limits", hasApiAccess: true },
  { name: "subscriptions", hasApiAccess: true },
  { name: "usage_records", hasApiAccess: true },
  { name: "user_canvases", hasApiAccess: true },
  { name: "user_projects", hasApiAccess: true },
  { name: "user_settings", hasApiAccess: true },
  { name: "users", hasApiAccess: true },
];

export type EmployeeRow = {
  id: number;
  name: string;
  email: string | null;
  created_at: string;
  department: string;
};

export const MOCK_EMPLOYEES: EmployeeRow[] = [
  {
    id: 1,
    name: "Erlich Bachman",
    email: null,
    created_at: "2026-07-12 19:53:46.791439+00",
    department: "Hooli",
  },
  {
    id: 2,
    name: "Richard Hendricks",
    email: null,
    created_at: "2026-07-12 19:53:46.791439+00",
    department: "Hooli",
  },
  {
    id: 3,
    name: "Monica Hall",
    email: null,
    created_at: "2026-07-12 19:53:46.791439+00",
    department: "Hooli",
  },
];

export type MockColumnName = "id" | "name" | "email" | "created_at" | "department";

export type MockColumn = {
  name: MockColumnName;
  format: string;
  isNullable: boolean;
  isPrimaryKey?: boolean;
  isIdentity?: boolean;
  defaultValue?: string | null;
};

export const MOCK_COLUMNS: MockColumn[] = [
  { name: "id", format: "int8", isPrimaryKey: true, isIdentity: true, isNullable: false, defaultValue: null },
  { name: "name", format: "text", isNullable: false, defaultValue: null },
  { name: "email", format: "text", isNullable: true, defaultValue: null },
  { name: "created_at", format: "timestamptz", isNullable: true, defaultValue: "now()" },
  { name: "department", format: "text", isNullable: true, defaultValue: "'Hooli'::text" },
];

export const MOCK_ACTIVE_FILTER = {
  column: "department",
  operator: "=",
  value: "Pied Piper",
} as const;
