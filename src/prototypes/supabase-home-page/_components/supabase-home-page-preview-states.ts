import { definePreviewStateRegistry } from "proto-plugin";

import type {
  ConnectSheetMode,
  SupabaseHomePageLiveState,
  SupabaseHomePagePreviewStateId,
} from "./supabase-home-page-types";

export type { SupabaseHomePagePreviewStateId };

export const DEFAULT_SUPABASE_HOME_PAGE_PREVIEW_STATE: SupabaseHomePagePreviewStateId =
  "default";

const DEFAULT_LIVE_FIELDS = {
  advisorMode: "issue",
  connectSheet: "none",
  copyPopoverOpen: false,
} as const satisfies Omit<SupabaseHomePageLiveState, "previewStateId">;

function connectLiveState(
  previewStateId: SupabaseHomePagePreviewStateId,
  connectSheet: Exclude<ConnectSheetMode, "none">,
): SupabaseHomePageLiveState {
  return {
    previewStateId,
    advisorMode: "issue",
    connectSheet,
    copyPopoverOpen: false,
  };
}

export function createLiveStateForPreview(
  previewStateId: SupabaseHomePagePreviewStateId = DEFAULT_SUPABASE_HOME_PAGE_PREVIEW_STATE,
): SupabaseHomePageLiveState {
  switch (previewStateId) {
    case "advisor-empty":
      return {
        previewStateId,
        advisorMode: "empty",
        connectSheet: "none",
        copyPopoverOpen: false,
      };
    case "advisor-loading":
      return {
        previewStateId,
        advisorMode: "loading",
        connectSheet: "none",
        copyPopoverOpen: false,
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
    case "copy-popover-open":
      return {
        previewStateId,
        advisorMode: "issue",
        connectSheet: "none",
        copyPopoverOpen: true,
      };
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
    SupabaseHomePageLiveState,
    "advisorMode" | "connectSheet" | "copyPopoverOpen"
  >,
): SupabaseHomePagePreviewStateId {
  if (state.copyPopoverOpen) return "copy-popover-open";
  if (state.connectSheet === "framework") return "connect-framework";
  if (state.connectSheet === "server") return "connect-server";
  if (state.connectSheet === "direct") return "connect-direct";
  if (state.connectSheet === "orm") return "connect-orm";
  if (state.connectSheet === "mcp") return "connect-mcp";
  if (state.advisorMode === "loading") return "advisor-loading";
  if (state.advisorMode === "empty") return "advisor-empty";
  return "default";
}

export function normalizeSupabaseHomePageLiveState(
  state: Partial<SupabaseHomePageLiveState> &
    Pick<SupabaseHomePageLiveState, "advisorMode" | "connectSheet" | "copyPopoverOpen">,
): SupabaseHomePageLiveState {
  const previewStateId = state.previewStateId ?? inferPreviewStateId(state);
  const defaults = createLiveStateForPreview(previewStateId);

  return {
    ...defaults,
    ...state,
    previewStateId: inferPreviewStateId({ ...defaults, ...state }),
  };
}

export function withInferredPreviewState(
  current: SupabaseHomePageLiveState,
  patch: Partial<SupabaseHomePageLiveState>,
): SupabaseHomePageLiveState {
  const next = { ...current, ...patch };
  return {
    ...next,
    previewStateId: inferPreviewStateId(next),
  };
}

export const SUPABASE_HOME_PAGE_PREVIEW_STATE_REGISTRY = definePreviewStateRegistry({
  canvasLayout: {
    options: {
      rowGap: 72,
    },
    rows: [
      {
        section: { label: "Project home" },
        states: ["default", { id: "advisor-empty", column: 1 }, { id: "advisor-loading", column: 2 }],
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
          { id: "copy-popover-open", column: 2 },
        ],
      },
    ],
  },
  states: [
    {
      id: "default",
      label: "Default",
      annotation:
        "Self-hosted project home with Get connected cards and one critical advisor security issue.",
    },
    {
      id: "advisor-empty",
      label: "Advisor empty",
      annotation: "Advisor reports no security or performance issues.",
    },
    {
      id: "advisor-loading",
      label: "Advisor loading",
      annotation: "Advisor section shimmer while lint results load.",
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
    {
      id: "copy-popover-open",
      label: "Copy popover",
      annotation: "Project URL copy menu open under the project title.",
    },
  ],
  edges: [
    { from: "default", to: "advisor-empty" },
    { from: "default", to: "advisor-loading" },
    { from: "default", to: "connect-framework" },
    { from: "default", to: "copy-popover-open" },
    { from: "connect-framework", to: "connect-server" },
    { from: "connect-server", to: "connect-direct" },
    { from: "connect-direct", to: "connect-orm" },
    { from: "connect-orm", to: "connect-mcp" },
    { from: "advisor-loading", to: "default" },
    { from: "advisor-empty", to: "default" },
    { from: "connect-framework", to: "default" },
    { from: "copy-popover-open", to: "default" },
    { from: "copy-popover-open", to: "connect-framework" },
  ],
});

export const SUPABASE_HOME_PAGE_PREVIEW_OPTIONS =
  SUPABASE_HOME_PAGE_PREVIEW_STATE_REGISTRY.pickerOptions;
