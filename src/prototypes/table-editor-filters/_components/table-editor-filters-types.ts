export const TABLE_EDITOR_FILTERS_PREVIEW_STATE_IDS = [
  "loading",
  "error",
  "populated",
  "filtered-empty",
  "empty-table",
  "insert-row",
  "insert-column",
  "edit-row",
] as const;

export type TableEditorFiltersPreviewStateId =
  (typeof TABLE_EDITOR_FILTERS_PREVIEW_STATE_IDS)[number];

export type TableEditorDataMode = "loading" | "error" | "populated" | "filtered-empty" | "empty-table";

export type TableEditorSidePanel = "none" | "insert-row" | "insert-column" | "edit-row";

export type TableEditorActiveFilter = {
  column: string;
  operator: string;
  value: string;
};

export type TableEditorFiltersLiveState = {
  previewStateId: TableEditorFiltersPreviewStateId;
  dataMode: TableEditorDataMode;
  sidePanel: TableEditorSidePanel;
  expandedRowId: number | null;
  filterInput: string;
  activeFilter: TableEditorActiveFilter | null;
};
