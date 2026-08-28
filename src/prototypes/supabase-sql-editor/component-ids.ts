import { definePrototypeComponentRegistry } from "proto-plugin";

export const SUPABASE_SQL_EDITOR_COMPONENT_IDS = [
  "page",
  "scroll-container",
  "supabase-sql-editor-preview-state-select",
  "sql-editor-page",
  "project-shell.project-header",
  "project-shell.product-sidebar",
  "sql-editor-menu",
  "examples-content",
  "connect-sheet-panel",
  "sql-icon",
] as const;

export const supabaseSqlEditorComponentRegistry = definePrototypeComponentRegistry({
  ids: SUPABASE_SQL_EDITOR_COMPONENT_IDS,
  dynamicPrefixes: [],
});
