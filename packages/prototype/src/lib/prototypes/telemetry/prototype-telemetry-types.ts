export const PROTOTYPE_TELEMETRY_ENDPOINT = "/api/telemetry/events";

/**
 * A single user-action event. Emitted from the client and appended to the
 * telemetry list on the server. `props` carries event-specific detail.
 */
export type PrototypeTelemetryEvent = {
  id: string;
  name: string;
  props?: Record<string, unknown>;
  slug?: string;
  route: string;
  ts: string;
  clientId: string;
  sessionId: string;
  userName?: string;
  companyName?: string;
  pluginVersion?: string;
};

/**
 * Known event names, using the `domain.action` convention. Not exhaustive —
 * `track()` accepts any string so instrumentation can add events freely, but
 * these document the taxonomy and enable autocompletion.
 */
export const PROTOTYPE_TELEMETRY_EVENTS = {
  pageViewed: "page.viewed",

  commentModeEntered: "comment.mode_entered",
  commentModeExited: "comment.mode_exited",
  commentCreated: "comment.created",
  commentReplied: "comment.replied",
  commentEdited: "comment.edited",
  commentResolved: "comment.resolved",
  commentDeleted: "comment.deleted",
  commentRestored: "comment.restored",

  modalOpened: "modal.opened",
  modalPromptCopied: "modal.prompt_copied",

  onboardingStepAdvanced: "onboarding.step_advanced",

  stateSelected: "state.selected",
  stateMapOpened: "state_map.opened",
  variantSelected: "variant.selected",
  designBriefOpened: "design_brief.opened",

  navClicked: "nav.clicked",
  prototypeOpened: "prototype.opened",
  newPrototypeClicked: "prototype.new_clicked",

  shareCopied: "share.copied",
  prNavigated: "pr.navigated",
  prCopied: "pr.copied",
  vercelPreviewOpened: "vercel_preview.opened",
  layoutToggled: "layout.toggled",

  prototypeCreated: "prototype.created",
  prototypeDeleted: "prototype.deleted",
} as const;

export type PrototypeTelemetryEventName =
  | (typeof PROTOTYPE_TELEMETRY_EVENTS)[keyof typeof PROTOTYPE_TELEMETRY_EVENTS]
  // Allow arbitrary event names without losing autocompletion for known ones.
  | (string & {});
