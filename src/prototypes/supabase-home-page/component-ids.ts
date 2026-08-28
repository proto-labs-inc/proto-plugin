import { definePrototypeComponentRegistry } from "proto-plugin";

export const SUPABASE_HOME_PAGE_COMPONENT_IDS = [
  "page",
  "scroll-container",
  "supabase-home-page-preview-state-select",
  "home-page-content",
  "home-page-shell.project-header",
  "home-page-shell.product-sidebar",
  "project-home-sections.project-top-section",
  "project-home-sections.connect-section",
  "advisor-section",
  "connect-sheet-panel",
] as const;

export const supabaseHomePageComponentRegistry = definePrototypeComponentRegistry({
  ids: SUPABASE_HOME_PAGE_COMPONENT_IDS,
  dynamicPrefixes: [],
});
