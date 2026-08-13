import { definePreviewStateRegistry } from "proto-plugin";

import { DEFAULT_SCHEMA } from "./supabase-database-view-mock-data";
import type {
  ConnectSheetMode,
  DatabaseViewDataMode,
  SupabaseDatabaseViewLiveState,
  SupabaseDatabaseViewPreviewStateId,
} from "./supabase-database-view-types";

export type { SupabaseDatabaseViewPreviewStateId };

export const DEFAULT_SUPABASE_DATABASE_VIEW_PREVIEW_STATE: SupabaseDatabaseViewPreviewStateId =
  "populated";

const CLOSED_OVERLAYS = {
  schemaSelectorOpen: false,
  findTableOpen: false,
  exportMenuOpen: false,
  autoLayoutOpen: false,
  tableActionsTableId: null,
  connectSheet: "none",
} as const;

function baseFields(
  dataMode: DatabaseViewDataMode,
  selectedSchema = DEFAULT_SCHEMA,
): Omit<SupabaseDatabaseViewLiveState, "previewStateId"> {
  return {
    dataMode,
    selectedSchema,
    ...CLOSED_OVERLAYS,
  };
}

function connectLiveState(
  previewStateId: SupabaseDatabaseViewPreviewStateId,
  connectSheet: Exclude<ConnectSheetMode, "none">,
): SupabaseDatabaseViewLiveState {
  return {
    previewStateId,
    ...baseFields("populated"),
    connectSheet,
  };
}

export function createLiveStateForPreview(
  previewStateId: SupabaseDatabaseViewPreviewStateId = DEFAULT_SUPABASE_DATABASE_VIEW_PREVIEW_STATE,
): SupabaseDatabaseViewLiveState {
  switch (previewStateId) {
    case "loading":
      return { previewStateId, ...baseFields("loading") };
    case "error":
      return { previewStateId, ...baseFields("error") };
    case "empty":
      return { previewStateId, ...baseFields("empty", "auth") };
    case "schema-selector":
      return {
        previewStateId,
        ...baseFields("populated"),
        schemaSelectorOpen: true,
      };
    case "find-table":
      return {
        previewStateId,
        ...baseFields("populated"),
        findTableOpen: true,
      };
    case "export-menu":
      return {
        previewStateId,
        ...baseFields("populated"),
        exportMenuOpen: true,
      };
    case "auto-layout":
      return {
        previewStateId,
        ...baseFields("populated"),
        autoLayoutOpen: true,
      };
    case "table-actions":
      return {
        previewStateId,
        ...baseFields("populated"),
        tableActionsTableId: "conversations",
      };
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
    case "populated":
    default:
      return { previewStateId: "populated", ...baseFields("populated") };
  }
}

export function inferPreviewStateId(
  state: Pick<
    SupabaseDatabaseViewLiveState,
    | "connectSheet"
    | "autoLayoutOpen"
    | "exportMenuOpen"
    | "tableActionsTableId"
    | "findTableOpen"
    | "schemaSelectorOpen"
    | "dataMode"
  >,
): SupabaseDatabaseViewPreviewStateId {
  if (state.connectSheet === "framework") return "connect-framework";
  if (state.connectSheet === "server") return "connect-server";
  if (state.connectSheet === "direct") return "connect-direct";
  if (state.connectSheet === "orm") return "connect-orm";
  if (state.connectSheet === "mcp") return "connect-mcp";
  if (state.autoLayoutOpen) return "auto-layout";
  if (state.exportMenuOpen) return "export-menu";
  if (state.tableActionsTableId) return "table-actions";
  if (state.findTableOpen) return "find-table";
  if (state.schemaSelectorOpen) return "schema-selector";
  if (state.dataMode === "loading") return "loading";
  if (state.dataMode === "error") return "error";
  if (state.dataMode === "empty") return "empty";
  return "populated";
}

export function normalizeSupabaseDatabaseViewLiveState(
  state: Partial<SupabaseDatabaseViewLiveState> &
    Pick<
      SupabaseDatabaseViewLiveState,
      | "connectSheet"
      | "autoLayoutOpen"
      | "exportMenuOpen"
      | "tableActionsTableId"
      | "findTableOpen"
      | "schemaSelectorOpen"
      | "dataMode"
    >,
): SupabaseDatabaseViewLiveState {
  const previewStateId = state.previewStateId ?? inferPreviewStateId(state);
  const defaults = createLiveStateForPreview(previewStateId);

  return {
    ...defaults,
    ...state,
    previewStateId: inferPreviewStateId({ ...defaults, ...state }),
  };
}

export function withInferredPreviewState(
  current: SupabaseDatabaseViewLiveState,
  patch: Partial<SupabaseDatabaseViewLiveState>,
): SupabaseDatabaseViewLiveState {
  const next = { ...current, ...patch };
  return {
    ...next,
    previewStateId: inferPreviewStateId(next),
  };
}

export const SUPABASE_DATABASE_VIEW_PREVIEW_STATE_REGISTRY = definePreviewStateRegistry({
  canvasLayout: {
    options: {
      rowGap: 72,
    },
    rows: [
      {
        section: { label: "Schema visualizer" },
        states: ["populated", { id: "loading", column: 1 }, { id: "empty", column: 2 }],
      },
      {
        states: [{ id: "error", column: 0 }],
      },
      {
        section: { label: "Toolbar overlays" },
        states: [
          "schema-selector",
          { id: "find-table", column: 1 },
          { id: "export-menu", column: 2 },
        ],
      },
      {
        states: [
          { id: "auto-layout", column: 0 },
          { id: "table-actions", column: 1 },
        ],
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
      id: "populated",
      label: "Populated",
      annotation: "Schema Visualizer with public tables, edges, minimap, and legend.",
    },
    {
      id: "loading",
      label: "Loading",
      annotation: "Loading tables spinner on the schema canvas.",
    },
    {
      id: "empty",
      label: "Empty schema",
      annotation: "No tables in the selected schema.",
    },
    {
      id: "error",
      label: "Error",
      annotation: "Failed to retrieve tables admonition.",
    },
    {
      id: "schema-selector",
      label: "Schema selector",
      annotation: "Schema picker popover open on public.",
    },
    {
      id: "find-table",
      label: "Find table",
      annotation: "Find table command popover open.",
    },
    {
      id: "export-menu",
      label: "Export menu",
      annotation: "Copy as SQL overflow menu open.",
    },
    {
      id: "auto-layout",
      label: "Auto layout",
      annotation: "Confirm rearrange dialog open.",
    },
    {
      id: "table-actions",
      label: "Table actions",
      annotation: "conversations table overflow menu open.",
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
    { from: "populated", to: "loading" },
    { from: "populated", to: "empty" },
    { from: "populated", to: "error" },
    { from: "populated", to: "schema-selector" },
    { from: "populated", to: "find-table" },
    { from: "populated", to: "export-menu" },
    { from: "populated", to: "auto-layout" },
    { from: "populated", to: "table-actions" },
    { from: "populated", to: "connect-framework" },
    { from: "schema-selector", to: "populated" },
    { from: "schema-selector", to: "empty" },
    { from: "find-table", to: "populated" },
    { from: "export-menu", to: "populated" },
    { from: "auto-layout", to: "populated" },
    { from: "table-actions", to: "populated" },
    { from: "connect-framework", to: "connect-server" },
    { from: "connect-server", to: "connect-direct" },
    { from: "connect-direct", to: "connect-orm" },
    { from: "connect-orm", to: "connect-mcp" },
    { from: "connect-framework", to: "populated" },
    { from: "loading", to: "populated" },
    { from: "empty", to: "populated" },
    { from: "error", to: "populated" },
  ],
});

export const SUPABASE_DATABASE_VIEW_PREVIEW_OPTIONS =
  SUPABASE_DATABASE_VIEW_PREVIEW_STATE_REGISTRY.pickerOptions;
