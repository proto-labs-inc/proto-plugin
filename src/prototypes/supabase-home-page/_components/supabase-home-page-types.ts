export type AdvisorMode = "issue" | "empty" | "loading";

export type ConnectSheetMode = "none" | "framework" | "server" | "direct" | "orm" | "mcp";

export type SupabaseHomePagePreviewStateId =
  | "default"
  | "advisor-empty"
  | "advisor-loading"
  | "connect-framework"
  | "copy-popover-open";

export const SUPABASE_HOME_PAGE_PREVIEW_STATE_IDS = [
  "default",
  "advisor-empty",
  "advisor-loading",
  "connect-framework",
  "copy-popover-open",
] as const satisfies readonly SupabaseHomePagePreviewStateId[];

export type SupabaseHomePageLiveState = {
  previewStateId: SupabaseHomePagePreviewStateId;
  advisorMode: AdvisorMode;
  connectSheet: ConnectSheetMode;
  copyPopoverOpen: boolean;
};
