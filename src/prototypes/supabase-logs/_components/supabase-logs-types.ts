export type ConnectSheetMode = "none" | "framework" | "server" | "direct" | "orm" | "mcp";

export type LogsOverlay =
  | "none"
  | "insert-source"
  | "templates"
  | "date-picker"
  | "field-reference";

export type LogsDataMode = "empty" | "loading" | "results" | "error";

export type SupabaseLogsPreviewStateId =
  | "default"
  | "insert-source"
  | "templates"
  | "date-picker"
  | "field-reference"
  | "results"
  | "loading"
  | "error"
  | "connect-framework"
  | "connect-server"
  | "connect-direct"
  | "connect-orm"
  | "connect-mcp";

export const SUPABASE_LOGS_PREVIEW_STATE_IDS = [
  "default",
  "insert-source",
  "templates",
  "date-picker",
  "field-reference",
  "results",
  "loading",
  "error",
  "connect-framework",
  "connect-server",
  "connect-direct",
  "connect-orm",
  "connect-mcp",
] as const satisfies readonly SupabaseLogsPreviewStateId[];

export type SupabaseLogsLiveState = {
  previewStateId: SupabaseLogsPreviewStateId;
  connectSheet: ConnectSheetMode;
  overlay: LogsOverlay;
  dataMode: LogsDataMode;
  dateRangeText: string;
  sql: string;
  fieldSource: string;
};
