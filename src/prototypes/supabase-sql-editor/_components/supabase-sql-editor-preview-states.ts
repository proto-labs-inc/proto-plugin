import { definePreviewStateRegistry } from "proto-plugin";

import type {
  ConnectSheetMode,
  SupabaseSqlEditorLiveState,
  SupabaseSqlEditorPreviewStateId,
} from "./supabase-sql-editor-types";

export type { SupabaseSqlEditorPreviewStateId };

export const DEFAULT_SUPABASE_SQL_EDITOR_PREVIEW_STATE: SupabaseSqlEditorPreviewStateId =
  "default";

const DEFAULT_LIVE_FIELDS = {
  connectSheet: "none",
  newQueryMenuOpen: false,
  sqlMenuOpen: true,
  selectedExampleId: null,
} as const satisfies Omit<SupabaseSqlEditorLiveState, "previewStateId">;

function connectLiveState(
  previewStateId: SupabaseSqlEditorPreviewStateId,
  connectSheet: Exclude<ConnectSheetMode, "none">,
): SupabaseSqlEditorLiveState {
  return {
    previewStateId,
    connectSheet,
    newQueryMenuOpen: false,
    sqlMenuOpen: true,
    selectedExampleId: null,
  };
}

export function createLiveStateForPreview(
  previewStateId: SupabaseSqlEditorPreviewStateId = DEFAULT_SUPABASE_SQL_EDITOR_PREVIEW_STATE,
): SupabaseSqlEditorLiveState {
  switch (previewStateId) {
    case "new-query-menu":
      return {
        previewStateId,
        connectSheet: "none",
        newQueryMenuOpen: true,
        sqlMenuOpen: true,
        selectedExampleId: null,
      };
    case "sidebar-collapsed":
      return {
        previewStateId,
        connectSheet: "none",
        newQueryMenuOpen: false,
        sqlMenuOpen: false,
        selectedExampleId: null,
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
    case "default":
    default:
      return {
        previewStateId: "default",
        ...DEFAULT_LIVE_FIELDS,
      };
  }
}

export function inferPreviewStateId(
  state: Pick<
    SupabaseSqlEditorLiveState,
    "connectSheet" | "newQueryMenuOpen" | "sqlMenuOpen"
  >,
): SupabaseSqlEditorPreviewStateId {
  if (state.connectSheet === "framework") return "connect-framework";
  if (state.connectSheet === "server") return "connect-server";
  if (state.connectSheet === "direct") return "connect-direct";
  if (state.connectSheet === "orm") return "connect-orm";
  if (state.connectSheet === "mcp") return "connect-mcp";
  if (state.newQueryMenuOpen) return "new-query-menu";
  if (!state.sqlMenuOpen) return "sidebar-collapsed";
  return "default";
}

export function normalizeSupabaseSqlEditorLiveState(
  state: Partial<SupabaseSqlEditorLiveState> &
    Pick<
      SupabaseSqlEditorLiveState,
      "connectSheet" | "newQueryMenuOpen" | "sqlMenuOpen"
    >,
): SupabaseSqlEditorLiveState {
  const previewStateId = state.previewStateId ?? inferPreviewStateId(state);
  const defaults = createLiveStateForPreview(previewStateId);

  return {
    ...defaults,
    ...state,
    previewStateId: inferPreviewStateId({ ...defaults, ...state }),
  };
}

export function withInferredPreviewState(
  current: SupabaseSqlEditorLiveState,
  patch: Partial<SupabaseSqlEditorLiveState>,
): SupabaseSqlEditorLiveState {
  const next = { ...current, ...patch };
  return {
    ...next,
    previewStateId: inferPreviewStateId(next),
  };
}

export const SUPABASE_SQL_EDITOR_PREVIEW_STATE_REGISTRY = definePreviewStateRegistry({
  canvasLayout: {
    options: {
      rowGap: 72,
    },
    rows: [
      {
        section: { label: "SQL examples" },
        states: ["default", { id: "new-query-menu", column: 1 }, { id: "sidebar-collapsed", column: 2 }],
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
      annotation: "SQL Editor Examples page with product menu and quickstart cards.",
    },
    {
      id: "new-query-menu",
      label: "New query menu",
      annotation: "Create snippet / folder menu open from the SQL Editor + button.",
    },
    {
      id: "sidebar-collapsed",
      label: "Sidebar collapsed",
      annotation: "SQL Editor product menu hidden after collapse.",
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
    { from: "default", to: "new-query-menu" },
    { from: "default", to: "sidebar-collapsed" },
    { from: "default", to: "connect-framework" },
    { from: "new-query-menu", to: "default" },
    { from: "sidebar-collapsed", to: "default" },
    { from: "connect-framework", to: "connect-server" },
    { from: "connect-server", to: "connect-direct" },
    { from: "connect-direct", to: "connect-orm" },
    { from: "connect-orm", to: "connect-mcp" },
    { from: "connect-framework", to: "default" },
  ],
});

export const SUPABASE_SQL_EDITOR_PREVIEW_OPTIONS =
  SUPABASE_SQL_EDITOR_PREVIEW_STATE_REGISTRY.pickerOptions;
