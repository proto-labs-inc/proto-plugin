import { definePreviewStateRegistry } from "proto-plugin";

import { DEFAULT_LOGS_SQL } from "./supabase-logs-mock-data";
import type {
  ConnectSheetMode,
  LogsDataMode,
  LogsOverlay,
  SupabaseLogsLiveState,
  SupabaseLogsPreviewStateId,
} from "./supabase-logs-types";

export type { SupabaseLogsPreviewStateId };

export const DEFAULT_SUPABASE_LOGS_PREVIEW_STATE: SupabaseLogsPreviewStateId = "default";

const DEFAULT_LIVE_FIELDS = {
  connectSheet: "none",
  overlay: "none",
  dataMode: "empty",
  dateRangeText: "Last hour",
  sql: DEFAULT_LOGS_SQL,
  fieldSource: "edge_logs",
} as const satisfies Omit<SupabaseLogsLiveState, "previewStateId">;

function overlayLiveState(
  previewStateId: SupabaseLogsPreviewStateId,
  overlay: Exclude<LogsOverlay, "none">,
): SupabaseLogsLiveState {
  return {
    previewStateId,
    ...DEFAULT_LIVE_FIELDS,
    overlay,
  };
}

function dataLiveState(
  previewStateId: SupabaseLogsPreviewStateId,
  dataMode: Exclude<LogsDataMode, "empty">,
  sql = DEFAULT_LOGS_SQL,
): SupabaseLogsLiveState {
  return {
    previewStateId,
    ...DEFAULT_LIVE_FIELDS,
    dataMode,
    sql,
  };
}

function connectLiveState(
  previewStateId: SupabaseLogsPreviewStateId,
  connectSheet: Exclude<ConnectSheetMode, "none">,
): SupabaseLogsLiveState {
  return {
    previewStateId,
    ...DEFAULT_LIVE_FIELDS,
    connectSheet,
  };
}

export function createLiveStateForPreview(
  previewStateId: SupabaseLogsPreviewStateId = DEFAULT_SUPABASE_LOGS_PREVIEW_STATE,
): SupabaseLogsLiveState {
  switch (previewStateId) {
    case "insert-source":
      return overlayLiveState(previewStateId, "insert-source");
    case "templates":
      return overlayLiveState(previewStateId, "templates");
    case "date-picker":
      return overlayLiveState(previewStateId, "date-picker");
    case "field-reference":
      return overlayLiveState(previewStateId, "field-reference");
    case "results":
      return dataLiveState(previewStateId, "results");
    case "loading":
      return dataLiveState(previewStateId, "loading");
    case "error":
      return dataLiveState(
        previewStateId,
        "error",
        "select\n  timestamp, event_message, metadata\n  from edge_logs",
      );
    case "connect-framework":
      return connectLiveState(previewStateId, "framework");
    case "connect-server":
      return connectLiveState(previewStateId, "server");
    case "connect-direct":
      return connectLiveState(previewStateId, "direct");
    case "connect-orm":
      return connectLiveState(previewStateId, "orm");
    case "connect-mcp":
      return connectLiveState(previewStateId, "mcp");
    case "default":
    default:
      return {
        previewStateId: "default",
        ...DEFAULT_LIVE_FIELDS,
      };
  }
}

export function inferPreviewStateId(
  state: Pick<SupabaseLogsLiveState, "connectSheet" | "overlay" | "dataMode">,
): SupabaseLogsPreviewStateId {
  if (state.connectSheet === "framework") return "connect-framework";
  if (state.connectSheet === "server") return "connect-server";
  if (state.connectSheet === "direct") return "connect-direct";
  if (state.connectSheet === "orm") return "connect-orm";
  if (state.connectSheet === "mcp") return "connect-mcp";
  if (state.overlay === "insert-source") return "insert-source";
  if (state.overlay === "templates") return "templates";
  if (state.overlay === "date-picker") return "date-picker";
  if (state.overlay === "field-reference") return "field-reference";
  if (state.dataMode === "loading") return "loading";
  if (state.dataMode === "error") return "error";
  if (state.dataMode === "results") return "results";
  return "default";
}

export function normalizeSupabaseLogsLiveState(
  state: Partial<SupabaseLogsLiveState> &
    Pick<SupabaseLogsLiveState, "connectSheet" | "overlay" | "dataMode">,
): SupabaseLogsLiveState {
  const previewStateId = state.previewStateId ?? inferPreviewStateId(state);
  const defaults = createLiveStateForPreview(previewStateId);

  return {
    ...defaults,
    ...state,
    previewStateId: inferPreviewStateId({ ...defaults, ...state }),
  };
}

export function withInferredPreviewState(
  current: SupabaseLogsLiveState,
  patch: Partial<SupabaseLogsLiveState>,
): SupabaseLogsLiveState {
  const next = { ...current, ...patch };
  return {
    ...next,
    previewStateId: inferPreviewStateId(next),
  };
}

export const SUPABASE_LOGS_PREVIEW_STATE_REGISTRY = definePreviewStateRegistry({
  canvasLayout: {
    options: {
      rowGap: 72,
    },
    rows: [
      {
        section: { label: "Explorer" },
        states: ["default", { id: "insert-source", column: 1 }, { id: "templates", column: 2 }],
      },
      {
        states: [
          { id: "date-picker", column: 0 },
          { id: "field-reference", column: 1 },
        ],
      },
      {
        section: { label: "Query results" },
        states: ["loading", { id: "results", column: 1 }, { id: "error", column: 2 }],
      },
      {
        section: { label: "Connect sheet" },
        states: [
          "connect-framework",
          { id: "connect-server", column: 1 },
          { id: "connect-direct", column: 2 },
        ],
      },
      {
        states: [
          { id: "connect-orm", column: 0 },
          { id: "connect-mcp", column: 1 },
        ],
      },
    ],
  },
  states: [
    {
      id: "default",
      label: "Default",
      annotation: "Logs explorer with placeholder SQL and empty results.",
    },
    {
      id: "insert-source",
      label: "Insert source",
      annotation: "Insert source dropdown open in the query toolbar.",
    },
    {
      id: "templates",
      label: "Templates",
      annotation: "Templates dropdown open in the query toolbar.",
    },
    {
      id: "date-picker",
      label: "Date picker",
      annotation: "Last hour date range popover open.",
    },
    {
      id: "field-reference",
      label: "Field reference",
      annotation: "Field Reference sheet open on the right.",
    },
    {
      id: "loading",
      label: "Loading",
      annotation: "Query running with shimmer over the editor.",
    },
    {
      id: "results",
      label: "Results",
      annotation: "Explorer after Run with mock log rows.",
    },
    {
      id: "error",
      label: "Missing limit",
      annotation: "Query error when SQL has no LIMIT clause.",
    },
    {
      id: "connect-framework",
      label: "Connect framework",
      annotation: "Connect sheet open on the Framework tab.",
    },
    {
      id: "connect-server",
      label: "Connect server",
      annotation: "Connect sheet open on the Server tab.",
    },
    {
      id: "connect-direct",
      label: "Connect direct",
      annotation: "Connect sheet open on the Direct tab.",
    },
    {
      id: "connect-orm",
      label: "Connect ORM",
      annotation: "Connect sheet open on the ORM tab.",
    },
    {
      id: "connect-mcp",
      label: "Connect MCP",
      annotation: "Connect sheet open on the MCP tab.",
    },
  ],
  edges: [
    { from: "default", to: "insert-source" },
    { from: "default", to: "templates" },
    { from: "default", to: "date-picker" },
    { from: "default", to: "field-reference" },
    { from: "default", to: "loading" },
    { from: "default", to: "connect-framework" },
    { from: "insert-source", to: "default" },
    { from: "templates", to: "default" },
    { from: "date-picker", to: "default" },
    { from: "field-reference", to: "default" },
    { from: "loading", to: "results" },
    { from: "loading", to: "error" },
    { from: "results", to: "default" },
    { from: "error", to: "default" },
    { from: "connect-framework", to: "connect-server" },
    { from: "connect-server", to: "connect-direct" },
    { from: "connect-direct", to: "connect-orm" },
    { from: "connect-orm", to: "connect-mcp" },
    { from: "connect-framework", to: "default" },
  ],
});

export const SUPABASE_LOGS_PREVIEW_OPTIONS = SUPABASE_LOGS_PREVIEW_STATE_REGISTRY.pickerOptions;
