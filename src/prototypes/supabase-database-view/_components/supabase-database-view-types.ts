export type ConnectSheetMode = "none" | "framework" | "server" | "direct" | "orm" | "mcp";

export type DatabaseViewDataMode = "populated" | "loading" | "error" | "empty";

export type SupabaseDatabaseViewPreviewStateId =
  | "populated"
  | "loading"
  | "error"
  | "empty"
  | "schema-selector"
  | "find-table"
  | "export-menu"
  | "auto-layout"
  | "table-actions"
  | "connect-framework"
  | "connect-server"
  | "connect-direct"
  | "connect-orm"
  | "connect-mcp";

export const SUPABASE_DATABASE_VIEW_PREVIEW_STATE_IDS = [
  "populated",
  "loading",
  "error",
  "empty",
  "schema-selector",
  "find-table",
  "export-menu",
  "auto-layout",
  "table-actions",
  "connect-framework",
  "connect-server",
  "connect-direct",
  "connect-orm",
  "connect-mcp",
] as const satisfies readonly SupabaseDatabaseViewPreviewStateId[];

export type SupabaseDatabaseViewLiveState = {
  previewStateId: SupabaseDatabaseViewPreviewStateId;
  dataMode: DatabaseViewDataMode;
  selectedSchema: string;
  schemaSelectorOpen: boolean;
  findTableOpen: boolean;
  exportMenuOpen: boolean;
  autoLayoutOpen: boolean;
  tableActionsTableId: string | null;
  connectSheet: ConnectSheetMode;
};

export type SchemaColumn = {
  id: string;
  name: string;
  format: string;
  isPrimary?: boolean;
  isNullable?: boolean;
  isUnique?: boolean;
  isIdentity?: boolean;
};

export type SchemaTable = {
  id: string;
  name: string;
  x: number;
  y: number;
  columns: SchemaColumn[];
};

export type SchemaEdge = {
  id: string;
  sourceTableId: string;
  sourceColumnId: string;
  targetTableId: string;
  targetColumnId: string;
};
