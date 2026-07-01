import { definePrototypeComponentRegistry } from "@prototype/lib/prototypes/prototype-component-registry";

export const HOME_PAGE_COMPONENT_IDS = [
  "page",
  "scroll-container",
  "home-page-shapes-background",
  "shape-colors-preview-block",
  "shape-colors-variant-toggle",
  "shape-colors-explorer",
  "shape-colors-variant-tabs",
  "shape-colors-mobbin-inspiration-gallery",
  "home-page-copy-block",
  "partner-page-flow-block.partner-page-home-button",
] as const;

export const HOME_PAGE_DYNAMIC_TARGET_PREFIXES = [
  "shape-colors-explorer.",
  "shape-colors-variant-tabs.",
  "shape-colors-mobbin-inspiration-gallery.",
  "mobbin-inspiration-gallery.",
] as const;

export const homePageComponentRegistry = definePrototypeComponentRegistry({
  ids: HOME_PAGE_COMPONENT_IDS,
  dynamicPrefixes: HOME_PAGE_DYNAMIC_TARGET_PREFIXES,
});
