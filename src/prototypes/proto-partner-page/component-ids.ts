import { definePrototypeComponentRegistry } from "@prototype/lib/prototypes/prototype-component-registry";

export const PROTO_PARTNER_PAGE_COMPONENT_IDS = [
  "page",
  "scroll-container",
  "partner-shape-canvas",
  "proto-shape-customizer-block",
  "proto-shape-icons.proto-shape-icon",
  "proto-shape-icons.proto-color-swatch",
  "invite-copy-block",
  "invite-copy-variant-toggle",
  "invite-copy-explorer",
  "invite-copy-variant-tabs",
  "mobbin-inspiration-gallery",
  "proto-shapes-variant-toggle",
  "proto-shapes-explorer",
  "proto-shapes-variant-tabs",
  "protoshapes-mobbin-inspiration-gallery",
] as const;

/** Nested ids from PrototypeVariantExplorer / PrototypeDesignBriefPanel. */
export const DYNAMIC_TARGET_PREFIXES = [
  "invite-copy-explorer.",
  "invite-copy-variant-tabs.",
  "mobbin-inspiration-gallery.",
  "proto-shapes-explorer.",
  "proto-shapes-variant-tabs.",
  "protoshapes-mobbin-inspiration-gallery.",
] as const;

export const protoPartnerPageComponentRegistry = definePrototypeComponentRegistry({
  ids: PROTO_PARTNER_PAGE_COMPONENT_IDS,
  dynamicPrefixes: DYNAMIC_TARGET_PREFIXES,
});
