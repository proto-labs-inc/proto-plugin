export type ConnectSheetMode = "none" | "framework" | "server" | "direct" | "orm" | "mcp";

export type SupabaseSqlEditorPreviewStateId =
  | "default"
  | "new-query-menu"
  | "sidebar-collapsed"
  | "connect-framework"
  | "connect-server"
  | "connect-direct"
  | "connect-orm"
  | "connect-mcp";

export const SUPABASE_SQL_EDITOR_PREVIEW_STATE_IDS = [
  "default",
  "new-query-menu",
  "sidebar-collapsed",
  "connect-framework",
  "connect-server",
  "connect-direct",
  "connect-orm",
  "connect-mcp",
] as const satisfies readonly SupabaseSqlEditorPreviewStateId[];

export type SupabaseSqlEditorLiveState = {
  previewStateId: SupabaseSqlEditorPreviewStateId;
  connectSheet: ConnectSheetMode;
  newQueryMenuOpen: boolean;
  sqlMenuOpen: boolean;
  selectedExampleId: string | null;
};
