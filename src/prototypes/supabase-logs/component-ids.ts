import { definePrototypeComponentRegistry } from "proto-plugin";

export const SUPABASE_LOGS_COMPONENT_IDS = [
  "page",
  "scroll-container",
  "supabase-logs-preview-state-select",
  "logs-explorer-page",
  "project-shell.project-header",
  "project-shell.product-sidebar",
  "logs-menu",
  "logs-explorer-content",
  "connect-sheet-panel",
] as const;

export const supabaseLogsComponentRegistry = definePrototypeComponentRegistry({
  ids: SUPABASE_LOGS_COMPONENT_IDS,
  dynamicPrefixes: ["logs-menu.collection.", "logs-explorer-content.row."],
});
