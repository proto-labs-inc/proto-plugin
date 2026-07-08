import { definePrototypeComponentRegistry } from "proto-plugin";

export const EVENT_TYPES_COMPONENT_IDS = [
  "page",
  "scroll-container",
  "event-types-preview-state-select",
  "event-types-shell-layout",
  "event-types-shell-sidebar",
  "event-types-main-content",
  "event-types-page-header",
  "event-types-filters-bar",
  "event-types-list",
  "event-types-page-layout-block",
  "event-types-page-layout-card-grid",
  "event-types-page-layout-compact-table",
  "event-types-page-layout-split-preview",
  "event-types-page-layout-grouped-sections",
  "event-types-empty-state",
  "event-types-create-modal",
  "event-types-description-field",
  "event-types-form-field",
  "event-types-page-layout-variant-toggle",
  "event-types-page-layout-explorer",
  "event-types-page-layout-variant-tabs",
  "event-types-page-layout-mobbin-inspiration-gallery",
  "event-types-secret-events-transition-block",
  "event-types-secret-events-transition-variant-toggle",
  "event-types-secret-events-transition-explorer",
  "event-types-secret-events-transition-variant-tabs",
  "event-types-secret-events-transition-mobbin-inspiration-gallery",
  "mobbin-inspiration-gallery",
  "spec-panel-content",
  "pr-split-wireframes.pr-split-wireframe",
] as const;

export const EVENT_TYPES_DYNAMIC_TARGET_PREFIXES = [
  "event-types-list-item.",
  "event-types-page-layout-explorer.",
  "event-types-page-layout-variant-tabs.",
  "event-types-page-layout-mobbin-inspiration-gallery.",
  "event-types-secret-events-transition-explorer.",
  "event-types-secret-events-transition-variant-tabs.",
  "event-types-secret-events-transition-mobbin-inspiration-gallery.",
  "mobbin-inspiration-gallery.",
] as const;

export const eventTypesComponentRegistry = definePrototypeComponentRegistry({
  ids: EVENT_TYPES_COMPONENT_IDS,
  dynamicPrefixes: EVENT_TYPES_DYNAMIC_TARGET_PREFIXES,
});
