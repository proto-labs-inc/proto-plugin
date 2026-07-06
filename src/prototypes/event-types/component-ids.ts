import { definePrototypeComponentRegistry } from "@prototype/lib/prototypes/prototype-component-registry";

export const EVENT_TYPES_COMPONENT_IDS = [
  "page",
  "scroll-container",
  "event-types-preview-state-select",
  "event-types-shell-layout",
  "event-types-shell-sidebar",
  "event-types-main-content",
  "event-types-page-header",
  "event-types-list",
  "event-types-empty-state",
  "event-types-create-modal",
  "event-types-description-field",
] as const;

export const EVENT_TYPES_DYNAMIC_TARGET_PREFIXES = [
  "event-types-list-item.",
] as const;

export const eventTypesComponentRegistry = definePrototypeComponentRegistry({
  ids: EVENT_TYPES_COMPONENT_IDS,
  dynamicPrefixes: EVENT_TYPES_DYNAMIC_TARGET_PREFIXES,
});
