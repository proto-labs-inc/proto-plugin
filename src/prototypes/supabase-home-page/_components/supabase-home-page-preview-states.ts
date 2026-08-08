import { definePreviewStateRegistry } from "proto-plugin";

import type {
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
      return {
        previewStateId,
        advisorMode: "issue",
        connectSheet: "framework",
        copyPopoverOpen: false,
      };
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
        states: [
          { id: "connect-framework", column: 0 },
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
      annotation: "Connect sheet open from the Framework card in Get connected.",
    },
    {
      id: "copy-popover-open",
      label: "Copy popover",
      annotation: "Project URL and API key copy menu open under the project title.",
    },
  ],
  edges: [
    { from: "default", to: "advisor-empty" },
    { from: "default", to: "advisor-loading" },
    { from: "default", to: "connect-framework" },
    { from: "default", to: "copy-popover-open" },
    { from: "advisor-loading", to: "default" },
    { from: "advisor-empty", to: "default" },
    { from: "connect-framework", to: "default" },
    { from: "copy-popover-open", to: "default" },
  ],
});

export const SUPABASE_HOME_PAGE_PREVIEW_OPTIONS =
  SUPABASE_HOME_PAGE_PREVIEW_STATE_REGISTRY.pickerOptions;
