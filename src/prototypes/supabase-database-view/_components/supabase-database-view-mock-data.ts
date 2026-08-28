import type { SchemaColumn, SchemaEdge, SchemaTable } from "./supabase-database-view-types";

export const MOCK_PROJECT = {
  name: "Default Project",
  apiUrl: "http://127.0.0.1:54321",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
} as const;

export const MOCK_SCHEMAS = [
  "public",
  "auth",
  "storage",
  "extensions",
  "graphql_public",
  "realtime",
] as const;

export const DEFAULT_SCHEMA = "public";

export const DATABASE_MENU_GROUPS = [
  {
    title: "Database Management",
    items: [
      { id: "schema-visualizer", label: "Schema Visualizer", active: true },
      { id: "tables", label: "Tables" },
      { id: "functions", label: "Functions" },
      { id: "triggers", label: "Triggers" },
      { id: "enumerated-types", label: "Enumerated Types" },
      { id: "extensions", label: "Extensions" },
      { id: "indexes", label: "Indexes" },
      { id: "publications", label: "Publications" },
    ],
  },
  {
    title: "Access Control",
    items: [
      { id: "policies", label: "Policies" },
      { id: "roles", label: "Roles" },
    ],
  },
  {
    title: "Configuration",
    items: [{ id: "settings", label: "Settings" }],
  },
  {
    title: "Platform",
    items: [{ id: "migrations", label: "Migrations" }],
  },
] as const;

function col(
  tableId: string,
  name: string,
  format: string,
  flags: Partial<Pick<SchemaColumn, "isPrimary" | "isNullable" | "isUnique" | "isIdentity">> = {},
): SchemaColumn {
  return {
    id: `${tableId}.${name}`,
    name,
    format,
    isNullable: flags.isNullable ?? true,
    ...flags,
  };
}

const nn = { isNullable: false } as const;
const pk = { isPrimary: true, isNullable: false } as const;
const unique = { isUnique: true } as const;

export const PUBLIC_SCHEMA_TABLES: SchemaTable[] = [
  {
    id: "messages",
    name: "messages",
    x: 0,
    y: 1390,
    columns: [
      col("messages", "usage", "jsonb"),
      col("messages", "conversation_id", "uuid", nn),
      col("messages", "content", "text", nn),
      col("messages", "role", "message_role", nn),
      col("messages", "id", "uuid", pk),
      col("messages", "created_at", "timestamptz", nn),
      col("messages", "context", "jsonb", nn),
      col("messages", "parts", "jsonb", nn),
      col("messages", "applied", "bool"),
      col("messages", "commit_oid", "text"),
      col("messages", "snapshots", "jsonb"),
      col("messages", "checkpoints", "jsonb", nn),
    ],
  },
  {
    id: "conversations",
    name: "conversations",
    x: 210,
    y: 1440,
    columns: [
      col("conversations", "agent_type", "agent_type"),
      col("conversations", "project_id", "uuid", nn),
      col("conversations", "display_name", "varchar"),
      col("conversations", "id", "uuid", pk),
      col("conversations", "created_at", "timestamptz", nn),
      col("conversations", "updated_at", "timestamptz", nn),
      col("conversations", "suggestions", "jsonb"),
    ],
  },
  {
    id: "projects",
    name: "projects",
    x: 420,
    y: 835,
    columns: [
      col("projects", "name", "varchar", nn),
      col("projects", "description", "text"),
      col("projects", "id", "uuid", pk),
      col("projects", "created_at", "timestamptz", nn),
      col("projects", "updated_at", "timestamptz", nn),
      col("projects", "sandbox_id", "varchar"),
      col("projects", "sandbox_url", "varchar"),
      col("projects", "preview_img_url", "varchar"),
      col("projects", "preview_img_path", "varchar"),
      col("projects", "preview_img_bucket", "varchar"),
      col("projects", "updated_preview_img_at", "timestamptz"),
      col("projects", "tags", "_varchar"),
    ],
  },
  {
    id: "users",
    name: "users",
    x: 420,
    y: 1995,
    columns: [
      col("users", "id", "uuid", pk),
      col("users", "first_name", "text"),
      col("users", "last_name", "text"),
      col("users", "display_name", "text"),
      col("users", "avatar_url", "text"),
      col("users", "email", "text"),
      col("users", "created_at", "timestamptz", nn),
      col("users", "updated_at", "timestamptz", nn),
      col("users", "stripe_customer_id", "text"),
      col("users", "github_installation_id", "text"),
    ],
  },
  {
    id: "custom-domains",
    name: "custom_domains",
    x: 420,
    y: 1120,
    columns: [
      col("custom-domains", "apex_domain", "text", { ...nn, ...unique }),
      col("custom-domains", "id", "uuid", pk),
      col("custom-domains", "verified", "bool", nn),
      col("custom-domains", "created_at", "timestamptz", nn),
      col("custom-domains", "updated_at", "timestamptz", nn),
    ],
  },
  {
    id: "custom-domain-verification",
    name: "custom_domain_verification",
    x: 210,
    y: 1070,
    columns: [
      col("custom-domain-verification", "project_id", "uuid", nn),
      col("custom-domain-verification", "id", "uuid", pk),
      col("custom-domain-verification", "created_at", "timestamptz", nn),
      col("custom-domain-verification", "updated_at", "timestamptz", nn),
      col("custom-domain-verification", "custom_domain_id", "uuid", nn),
      col("custom-domain-verification", "freestyle_verification_id", "text", nn),
      col("custom-domain-verification", "status", "verification_request_status", nn),
      col("custom-domain-verification", "full_domain", "text", nn),
      col("custom-domain-verification", "txt_record", "jsonb", nn),
      col("custom-domain-verification", "a_records", "jsonb", nn),
    ],
  },
  {
    id: "project-settings",
    name: "project_settings",
    x: 210,
    y: 1315,
    columns: [
      col("project-settings", "project_id", "uuid", { ...nn, ...unique }),
      col("project-settings", "run_command", "text", nn),
      col("project-settings", "build_command", "text", nn),
      col("project-settings", "install_command", "text", nn),
    ],
  },
  {
    id: "usage-records",
    name: "usage_records",
    x: 210,
    y: 1625,
    columns: [
      col("usage-records", "user_id", "uuid", nn),
      col("usage-records", "timestamp", "timestamptz", nn),
      col("usage-records", "id", "uuid", pk),
      col("usage-records", "type", "usage_types", nn),
      col("usage-records", "trace_id", "varchar"),
    ],
  },
  {
    id: "project-create-requests",
    name: "project_create_requests",
    x: 210,
    y: 1770,
    columns: [
      col("project-create-requests", "id", "uuid", pk),
      col("project-create-requests", "created_at", "timestamptz", nn),
      col("project-create-requests", "updated_at", "timestamptz", nn),
      col("project-create-requests", "status", "project_create_status", nn),
      col("project-create-requests", "project_id", "uuid", { ...nn, ...unique }),
      col("project-create-requests", "context", "jsonb", nn),
    ],
  },
  {
    id: "deployments",
    name: "deployments",
    x: 210,
    y: 1935,
    columns: [
      col("deployments", "id", "uuid", pk),
      col("deployments", "requested_by", "uuid", nn),
      col("deployments", "project_id", "uuid", nn),
      col("deployments", "sandbox_id", "text"),
      col("deployments", "urls", "_text"),
      col("deployments", "type", "deployment_type", nn),
      col("deployments", "status", "deployment_status", nn),
      col("deployments", "message", "text"),
      col("deployments", "build_log", "text"),
      col("deployments", "error", "text"),
      col("deployments", "progress", "int4"),
      col("deployments", "created_at", "timestamptz", nn),
      col("deployments", "updated_at", "timestamptz", nn),
      col("deployments", "build_script", "text"),
      col("deployments", "build_flags", "text"),
      col("deployments", "env_vars", "jsonb"),
    ],
  },
];

export const PUBLIC_SCHEMA_EDGES: SchemaEdge[] = [
  {
    id: "messages-conversations",
    sourceTableId: "messages",
    sourceColumnId: "messages.conversation_id",
    targetTableId: "conversations",
    targetColumnId: "conversations.id",
  },
  {
    id: "conversations-projects",
    sourceTableId: "conversations",
    sourceColumnId: "conversations.project_id",
    targetTableId: "projects",
    targetColumnId: "projects.id",
  },
  {
    id: "project-settings-projects",
    sourceTableId: "project-settings",
    sourceColumnId: "project-settings.project_id",
    targetTableId: "projects",
    targetColumnId: "projects.id",
  },
  {
    id: "custom-domain-verification-projects",
    sourceTableId: "custom-domain-verification",
    sourceColumnId: "custom-domain-verification.project_id",
    targetTableId: "projects",
    targetColumnId: "projects.id",
  },
  {
    id: "custom-domain-verification-domains",
    sourceTableId: "custom-domain-verification",
    sourceColumnId: "custom-domain-verification.custom_domain_id",
    targetTableId: "custom-domains",
    targetColumnId: "custom-domains.id",
  },
  {
    id: "usage-records-users",
    sourceTableId: "usage-records",
    sourceColumnId: "usage-records.user_id",
    targetTableId: "users",
    targetColumnId: "users.id",
  },
  {
    id: "project-create-requests-projects",
    sourceTableId: "project-create-requests",
    sourceColumnId: "project-create-requests.project_id",
    targetTableId: "projects",
    targetColumnId: "projects.id",
  },
  {
    id: "deployments-projects",
    sourceTableId: "deployments",
    sourceColumnId: "deployments.project_id",
    targetTableId: "projects",
    targetColumnId: "projects.id",
  },
  {
    id: "deployments-users",
    sourceTableId: "deployments",
    sourceColumnId: "deployments.requested_by",
    targetTableId: "users",
    targetColumnId: "users.id",
  },
];

/** Extra minimap-only cards so the overview matches the dense live graph. */
export const MINIMAP_GHOST_TABLES: Array<{ x: number; y: number; height: number }> = [
  { x: 210, y: 0, height: 265 },
  { x: 210, y: 265, height: 67 },
  { x: 0, y: 215, height: 221 },
  { x: 210, y: 350, height: 111 },
  { x: 210, y: 475, height: 177 },
  { x: 210, y: 660, height: 221 },
  { x: 210, y: 885, height: 133 },
  { x: 0, y: 2627.5, height: 133 },
  { x: 420, y: 2687.5, height: 133 },
  { x: 0, y: 2772.5, height: 155 },
];

export const TABLE_NODE_WIDTH = 160;
export const TABLE_HEADER_HEIGHT = 22;
export const TABLE_ROW_HEIGHT = 22;

export const GRAPH_VIEWPORT = {
  x: 89,
  y: -881.7,
  zoom: 0.8,
} as const;

export function tableHeight(table: SchemaTable) {
  return TABLE_HEADER_HEIGHT + table.columns.length * TABLE_ROW_HEIGHT;
}
