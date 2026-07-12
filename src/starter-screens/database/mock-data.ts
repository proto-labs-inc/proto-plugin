export type SchemaColumn = {
  name: string;
  format: string;
  isPrimary?: boolean;
  isNullable?: boolean;
  isUnique?: boolean;
  isIdentity?: boolean;
};

export type SchemaTable = {
  name: string;
  columns: SchemaColumn[];
  x: number;
  y: number;
};

export const MOCK_SCHEMA_TABLES: SchemaTable[] = [
  {
    name: "messages",
    x: 40,
    y: 40,
    columns: [
      { name: "id", format: "uuid", isPrimary: true, isNullable: false },
      { name: "conversation_id", format: "uuid", isNullable: false },
      { name: "content", format: "text", isNullable: true },
      { name: "role", format: "text", isNullable: false },
      { name: "created_at", format: "timestamptz", isNullable: false },
    ],
  },
  {
    name: "project_settings",
    x: 280,
    y: 40,
    columns: [
      { name: "project_id", format: "uuid", isPrimary: true, isNullable: false },
      { name: "run_command", format: "text", isNullable: true },
      { name: "build_command", format: "text", isNullable: true },
      { name: "install_command", format: "text", isNullable: true },
    ],
  },
  {
    name: "conversations",
    x: 520,
    y: 40,
    columns: [
      { name: "id", format: "uuid", isPrimary: true, isNullable: false },
      { name: "agent_type", format: "text", isNullable: false },
      { name: "project_id", format: "uuid", isNullable: false },
      { name: "display_name", format: "text", isNullable: true },
      { name: "created_at", format: "timestamptz", isNullable: false },
      { name: "updated_at", format: "timestamptz", isNullable: false },
    ],
  },
  {
    name: "usage_records",
    x: 40,
    y: 280,
    columns: [
      { name: "user_id", format: "uuid", isNullable: false },
      { name: "timestamp", format: "timestamptz", isNullable: false },
      { name: "id", format: "uuid", isPrimary: true, isNullable: false },
      { name: "type", format: "text", isNullable: false },
      { name: "trace_id", format: "text", isNullable: true },
    ],
  },
  {
    name: "project_create_requests",
    x: 280,
    y: 280,
    columns: [
      { name: "id", format: "uuid", isPrimary: true, isNullable: false },
      { name: "created_at", format: "timestamptz", isNullable: false },
      { name: "updated_at", format: "timestamptz", isNullable: false },
      { name: "status", format: "text", isNullable: false },
      { name: "project_id", format: "uuid", isNullable: false },
    ],
  },
  {
    name: "deployments",
    x: 520,
    y: 280,
    columns: [
      { name: "id", format: "uuid", isPrimary: true, isNullable: false },
      { name: "requested_by", format: "uuid", isNullable: false },
      { name: "project_id", format: "uuid", isNullable: false },
      { name: "sandbox_id", format: "text", isNullable: true },
      { name: "url", format: "text", isNullable: true },
      { name: "type", format: "text", isNullable: false },
      { name: "status", format: "text", isNullable: false },
    ],
  },
  {
    name: "users",
    x: 760,
    y: 280,
    columns: [
      { name: "id", format: "uuid", isPrimary: true, isNullable: false },
      { name: "first_name", format: "text", isNullable: true },
      { name: "last_name", format: "text", isNullable: true },
      { name: "display_name", format: "text", isNullable: true },
    ],
  },
];
