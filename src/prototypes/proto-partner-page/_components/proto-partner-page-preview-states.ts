import { definePreviewStateRegistry } from "proto-plugin";

import type { PartnerPageId } from "./partner-page-flow-block";

export const PROTO_PARTNER_PAGE_PREVIEW_STATE_IDS = [
  "invite",
  "invite-follow-up",
  "customize",
  "submit-modal",
] as const;

export type ProtoPartnerPagePreviewStateId =
  (typeof PROTO_PARTNER_PAGE_PREVIEW_STATE_IDS)[number];

export type ProtoPartnerPageLiveState = {
  previewStateId: ProtoPartnerPagePreviewStateId;
  pageId: PartnerPageId;
  submitModalOpen: boolean;
};

export const DEFAULT_PROTO_PARTNER_PAGE_PREVIEW_STATE: ProtoPartnerPagePreviewStateId =
  "invite";

export function pageIdForPreviewState(
  previewStateId: ProtoPartnerPagePreviewStateId,
): PartnerPageId {
  switch (previewStateId) {
    case "invite-follow-up":
      return "invite-follow-up";
    case "customize":
    case "submit-modal":
      return "customize";
    case "invite":
    default:
      return "invite";
  }
}

export function createLiveStateForPreview(
  previewStateId: ProtoPartnerPagePreviewStateId = DEFAULT_PROTO_PARTNER_PAGE_PREVIEW_STATE,
): ProtoPartnerPageLiveState {
  const pageId = pageIdForPreviewState(previewStateId);
  return {
    previewStateId,
    pageId,
    submitModalOpen: previewStateId === "submit-modal",
  };
}

export function inferPreviewStateId(
  state: Pick<ProtoPartnerPageLiveState, "pageId" | "submitModalOpen">,
): ProtoPartnerPagePreviewStateId {
  if (state.pageId === "customize" && state.submitModalOpen) {
    return "submit-modal";
  }
  if (state.pageId === "invite-follow-up") return "invite-follow-up";
  if (state.pageId === "customize") return "customize";
  return "invite";
}

export function withInferredPreviewState(
  current: ProtoPartnerPageLiveState,
  patch: Partial<ProtoPartnerPageLiveState>,
): ProtoPartnerPageLiveState {
  const next = { ...current, ...patch };
  return {
    ...next,
    previewStateId: inferPreviewStateId(next),
  };
}

export function normalizeProtoPartnerPageLiveState(
  state: Partial<ProtoPartnerPageLiveState> &
    Pick<ProtoPartnerPageLiveState, "pageId" | "submitModalOpen">,
): ProtoPartnerPageLiveState {
  const previewStateId =
    state.previewStateId ?? inferPreviewStateId(state);
  const defaults = createLiveStateForPreview(previewStateId);

  return {
    ...defaults,
    ...state,
    previewStateId: inferPreviewStateId({
      pageId: state.pageId ?? defaults.pageId,
      submitModalOpen: state.submitModalOpen ?? defaults.submitModalOpen,
    }),
  };
}

export const PROTO_PARTNER_PAGE_PREVIEW_STATE_REGISTRY = definePreviewStateRegistry({
  canvasLayout: {
    options: {
      rowGap: 80,
    },
    rows: [
      {
        section: { label: "Flow" },
        states: [
          "invite",
          { id: "invite-follow-up", column: 1 },
          { id: "customize", column: 2 },
          { id: "submit-modal", column: 3 },
        ],
      },
    ],
  },
  states: [
    {
      id: "invite",
      label: "Invite",
      annotation: "Intro invite screen with copy and continue CTA.",
    },
    {
      id: "invite-follow-up",
      label: "Invite follow-up",
      annotation:
        "Accepted invite with example shapes and CTA into the customizer.",
    },
    {
      id: "customize",
      label: "Customize",
      annotation: "Shape customizer with canvas and picker dock — submit modal closed.",
    },
    {
      id: "submit-modal",
      label: "Submit modal",
      annotation: "Customize screen with the preview/submit shape modal open.",
    },
  ],
  edges: [
    { from: "invite", to: "invite-follow-up" },
    { from: "invite-follow-up", to: "customize" },
    { from: "customize", to: "submit-modal" },
  ],
});

export const PROTO_PARTNER_PAGE_PREVIEW_OPTIONS =
  PROTO_PARTNER_PAGE_PREVIEW_STATE_REGISTRY.pickerOptions;
