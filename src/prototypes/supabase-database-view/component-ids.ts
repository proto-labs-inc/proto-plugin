import { definePrototypeComponentRegistry } from "proto-plugin";

export const SUPABASE_DATABASE_VIEW_COMPONENT_IDS = [
  "page",
  "scroll-container",
  "supabase-database-view-preview-state-select",
  "database-view-page",
  "project-shell.project-header",
  "project-shell.product-sidebar",
  "database-menu",
  "schema-visualizer",
  "schema-selector",
  "find-table-selector",
  "schema-graph-legend",
  "schema-table-node",
  "connect-sheet-panel",
] as const;

export const supabaseDatabaseViewComponentRegistry = definePrototypeComponentRegistry({
  ids: SUPABASE_DATABASE_VIEW_COMPONENT_IDS,
  dynamicPrefixes: ["schema-table-node.", "database-menu.item."],
});
