import { definePreviewStateRegistry } from "proto-plugin";

import { MOCK_ACTIVE_FILTER } from "./table-editor-filters-mock-data";
import type {
  TableEditorFiltersLiveState,
  TableEditorFiltersPreviewStateId,
} from "./table-editor-filters-types";

export type { TableEditorFiltersPreviewStateId };

export const DEFAULT_TABLE_EDITOR_FILTERS_PREVIEW_STATE: TableEditorFiltersPreviewStateId =
  "populated";

const POPULATED_LIVE_STATE = {
  dataMode: "populated",
  sidePanel: "none",
  expandedRowId: null,
  filterInput: "",
  activeFilter: null,
} as const satisfies Omit<TableEditorFiltersLiveState, "previewStateId">;

export function createLiveStateForPreview(
  previewStateId: TableEditorFiltersPreviewStateId = DEFAULT_TABLE_EDITOR_FILTERS_PREVIEW_STATE,
): TableEditorFiltersLiveState {
  switch (previewStateId) {
    case "loading":
      return {
        previewStateId,
        dataMode: "loading",
        sidePanel: "none",
        expandedRowId: null,
        filterInput: "",
        activeFilter: null,
      };
    case "error":
      return {
        previewStateId,
        dataMode: "error",
        sidePanel: "none",
        expandedRowId: null,
        filterInput: "",
        activeFilter: null,
      };
    case "filtered-empty":
      return {
        previewStateId,
        dataMode: "filtered-empty",
        sidePanel: "none",
        expandedRowId: null,
        filterInput: MOCK_ACTIVE_FILTER.value,
        activeFilter: MOCK_ACTIVE_FILTER,
      };
    case "empty-table":
      return {
        previewStateId,
        dataMode: "empty-table",
        sidePanel: "none",
        expandedRowId: null,
        filterInput: "",
        activeFilter: null,
      };
    case "insert-row":
      return {
        previewStateId,
        ...POPULATED_LIVE_STATE,
        sidePanel: "insert-row",
      };
    case "insert-column":
      return {
        previewStateId,
        ...POPULATED_LIVE_STATE,
        sidePanel: "insert-column",
      };
    case "edit-row":
      return {
        previewStateId,
        ...POPULATED_LIVE_STATE,
        sidePanel: "edit-row",
        expandedRowId: 1,
      };
    case "populated":
    default:
      return {
        previewStateId: "populated",
        ...POPULATED_LIVE_STATE,
      };
  }
}

export function normalizeTableEditorFiltersLiveState(
  state: Partial<TableEditorFiltersLiveState> &
    Pick<TableEditorFiltersLiveState, "dataMode" | "sidePanel">,
): TableEditorFiltersLiveState {
  const previewStateId =
    state.previewStateId ?? inferPreviewStateId(state);
  const defaults = createLiveStateForPreview(previewStateId);

  return {
    ...defaults,
    ...state,
    filterInput: state.filterInput ?? "",
    activeFilter: state.activeFilter ?? null,
    expandedRowId: state.expandedRowId ?? defaults.expandedRowId,
    previewStateId: inferPreviewStateId(state),
  };
}

export function inferPreviewStateId(
  state: Pick<TableEditorFiltersLiveState, "dataMode" | "sidePanel">,
): TableEditorFiltersPreviewStateId {
  if (state.sidePanel === "insert-row") return "insert-row";
  if (state.sidePanel === "insert-column") return "insert-column";
  if (state.sidePanel === "edit-row") return "edit-row";
  if (state.dataMode === "loading") return "loading";
  if (state.dataMode === "error") return "error";
  if (state.dataMode === "filtered-empty") return "filtered-empty";
  if (state.dataMode === "empty-table") return "empty-table";
  return "populated";
}

function applyInferredPreviewState(
  current: TableEditorFiltersLiveState,
  patch: Partial<TableEditorFiltersLiveState>,
): TableEditorFiltersLiveState {
  const next = { ...current, ...patch };
  return {
    ...next,
    previewStateId: inferPreviewStateId(next),
  };
}

export const withInferredPreviewState = applyInferredPreviewState;

export const TABLE_EDITOR_FILTERS_PREVIEW_STATE_REGISTRY = definePreviewStateRegistry({
  canvasLayout: {
    options: {
      rowGap: 80,
    },
    rows: [
      {
        section: { label: "Table data" },
        states: [
          "loading",
          { id: "error", column: 1 },
          { id: "populated", column: 2 },
        ],
      },
      {
        states: [
          { id: "filtered-empty", column: 0 },
          { id: "empty-table", column: 1 },
          { id: "insert-row", column: 3 },
          { id: "insert-column", column: 4 },
          { id: "edit-row", column: 5 },
        ],
      },
    ],
  },
  states: [
    {
      id: "loading",
      label: "Loading",
      annotation: "Table editor skeleton while table metadata and rows are loading.",
    },
    {
      id: "error",
      label: "Error",
      annotation: "Failed to load table rows — error banner over the grid with retry.",
    },
    {
      id: "populated",
      label: "Populated",
      annotation:
        "Default employees table with three rows — type in the filter bar and press Enter to filter by id, name, or email.",
    },
    {
      id: "filtered-empty",
      label: "Filtered empty",
      annotation:
        "Active filter chips with zero matching rows — “Remove all filters” empty state.",
    },
    {
      id: "empty-table",
      label: "Empty table",
      annotation: "Table with no rows and import-data call to action.",
    },
    {
      id: "insert-row",
      label: "Insert row",
      annotation: "Add new row side panel over the populated grid.",
    },
    {
      id: "insert-column",
      label: "Insert column",
      annotation: "Add new column sheet over the populated grid.",
    },
    {
      id: "edit-row",
      label: "Edit row",
      annotation: "Expand a grid row into the row editor side panel with existing values.",
    },
  ],
  edges: [
    { from: "loading", to: "populated" },
    { from: "loading", to: "error" },
    { from: "error", to: "populated" },
    { from: "populated", to: "filtered-empty" },
    { from: "populated", to: "empty-table" },
    { from: "populated", to: "insert-row" },
    { from: "populated", to: "insert-column" },
    { from: "populated", to: "edit-row" },
    { from: "filtered-empty", to: "populated" },
    { from: "empty-table", to: "populated" },
    { from: "insert-row", to: "populated" },
    { from: "insert-column", to: "populated" },
    { from: "edit-row", to: "populated" },
  ],
});

export const TABLE_EDITOR_FILTERS_PREVIEW_OPTIONS =
  TABLE_EDITOR_FILTERS_PREVIEW_STATE_REGISTRY.pickerOptions;
