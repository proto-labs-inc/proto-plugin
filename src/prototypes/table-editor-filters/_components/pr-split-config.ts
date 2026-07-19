import {
  decodeShareState,
  encodeShareState,
  PREVIEW_STATE_PARAM,
  SHARE_STATE_PARAM,
  type PrSplitConfig,
  type PrSplitEntry as PrSplitEntryBase,
} from "proto-plugin";

import {
  DEFAULT_GRID_EMPTY_STATE_VARIANT,
  type GridEmptyStateVariant,
} from "./grid-empty-state-content";
import {
  DEFAULT_GRID_ERROR_STATE_VARIANT,
  type GridErrorStateVariant,
} from "./grid-error-state-content";
import {
  DEFAULT_INSERT_COLUMN_VARIANT,
  type InsertColumnVariant,
} from "./insert-column-content";
import {
  createLiveStateForPreview,
  DEFAULT_TABLE_EDITOR_FILTERS_PREVIEW_STATE,
} from "./table-editor-filters-preview-states";
import type { TableEditorFiltersLiveState } from "./table-editor-filters-types";

export type TableEditorFiltersPrSplitWireframeId =
  | "table-sidebar"
  | "grid-header"
  | "loading-skeleton"
  | "empty-state-overlay"
  | "error-overlay"
  | "insert-column-panel";

export type TableEditorFiltersPrSplitEntry = PrSplitEntryBase<
  TableEditorFiltersPrSplitWireframeId,
  TableEditorFiltersLiveState
> & {
  emptyStateVariant: GridEmptyStateVariant;
  errorStateVariant: GridErrorStateVariant;
  insertColumnVariant: InsertColumnVariant;
};

export const PR_EMPTY_STATE_PARAM = "prEmptyState";
export const PR_ERROR_STATE_PARAM = "prErrorState";
export const PR_INSERT_COLUMN_PARAM = "prInsertColumn";

export const PR_SPLIT_CONFIG: PrSplitConfig<TableEditorFiltersLiveState> = {
  slug: "table-editor-filters",
  seriesLabel: "Table editor filters FE",
  sourceRepo: "supabase/supabase",
  sourceWorkPath: "apps/studio",
  configFilePath: "src/prototypes/table-editor-filters/_components/pr-split-config.ts",
  branchName: (entry) => {
    const slug = entry.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return `feat/table-editor-filters-fe-${entry.order}-${slug}`;
  },
  writeEntryToSearchParams: (searchParams, entry) => {
    const extended = entry as TableEditorFiltersPrSplitEntry;
    searchParams.set(SHARE_STATE_PARAM, encodeShareState(entry.liveState));
    searchParams.set(PREVIEW_STATE_PARAM, entry.liveState.previewStateId);
    searchParams.set(PR_EMPTY_STATE_PARAM, extended.emptyStateVariant);
    searchParams.set(PR_ERROR_STATE_PARAM, extended.errorStateVariant);
    searchParams.set(PR_INSERT_COLUMN_PARAM, extended.insertColumnVariant);
  },
  defaultPreviewPath: "/project/default/editor/17604",
  vercelProjectName: "studio",
  scopeNote:
    "Ship only the chosen design directions: illustration-card empty states, inline-admonition error state, and essential-first add-column panel. Do not merge unchosen design-brief variants (drop-zone, filter-context, step-guide, split-actions, centered-copy, warning-banner, support-primary, diagnostic-panel, tabbed-workflow, type-hero, accordion-sections, stacked-compact, sectioned-sidebar, etc.).",
};

export const PR_SPLIT_ENTRIES: TableEditorFiltersPrSplitEntry[] = [
  {
    order: 1,
    title: "Table editor sidebar",
    description:
      "Match the prototype table list sidebar — schema selector, search tables input, New table CTA, and scrollable entity list with active-row styling, API-access icons, and Unrestricted badges. Wire to TableEditorMenu in apps/studio.",
    size: "Medium",
    targetId: "table-editor-menu",
    wireframeId: "table-sidebar",
    emptyStateVariant: DEFAULT_GRID_EMPTY_STATE_VARIANT,
    errorStateVariant: DEFAULT_GRID_ERROR_STATE_VARIANT,
    insertColumnVariant: DEFAULT_INSERT_COLUMN_VARIANT,
    liveState: createLiveStateForPreview(DEFAULT_TABLE_EDITOR_FILTERS_PREVIEW_STATE),
    previewPath: "/project/default/editor/17604",
    branch: "feat/table-editor-filters-fe-1-table-editor-sidebar",
    prUrl: "https://github.com/supabase/supabase/pull/48064",
    merged: true,
  },
  {
    order: 2,
    title: "Grid header & filter toolbar",
    description:
      "Ship the table tab bar and toolbar row — quick filter input (Enter to apply), removable filter chips, Sort/RLS/Role actions, refresh, and Insert dropdown. Extend live state with filterInput and activeFilter; match filterEmployeesByQuery matching on id, name, and email.",
    size: "Large",
    targetId: "table-editor-toolbar",
    wireframeId: "grid-header",
    emptyStateVariant: DEFAULT_GRID_EMPTY_STATE_VARIANT,
    errorStateVariant: DEFAULT_GRID_ERROR_STATE_VARIANT,
    insertColumnVariant: DEFAULT_INSERT_COLUMN_VARIANT,
    liveState: createLiveStateForPreview(DEFAULT_TABLE_EDITOR_FILTERS_PREVIEW_STATE),
    previewPath: "/project/default/editor/17604",
    branch: "feat/table-editor-filters-fe-2-grid-header-filter-toolbar",
    prUrl: "https://github.com/supabase/supabase/pull/48066",
    analyticsNotes: ["table_editor_filter_applied", "table_editor_filter_chip_removed"],
  },
  {
    order: 3,
    title: "Grid loading skeleton",
    description:
      "When table rows are loading, render the skeleton grid overlay with shimmer header cells and placeholder rows over the grid body. Match column widths, row count, and toolbar visibility from the prototype loading preview state.",
    size: "Small",
    targetId: "grid-loading-skeleton",
    wireframeId: "loading-skeleton",
    emptyStateVariant: DEFAULT_GRID_EMPTY_STATE_VARIANT,
    errorStateVariant: DEFAULT_GRID_ERROR_STATE_VARIANT,
    insertColumnVariant: DEFAULT_INSERT_COLUMN_VARIANT,
    liveState: createLiveStateForPreview("loading"),
    previewPath: "/project/default/editor/17604",
    branch: "feat/table-editor-filters-fe-3-grid-loading-skeleton",
    prUrl: "https://github.com/supabase/supabase/pull/48068",
  },
  {
    order: 4,
    title: "Grid empty states",
    description:
      "Replace production centered-copy empty overlays with the illustration-card layout for empty-table and filtered-empty branches. Include filter chip context on zero-result filters and match copy/CTAs from the prototype default variant.",
    size: "Medium",
    targetId: "grid-empty-state",
    wireframeId: "empty-state-overlay",
    emptyStateVariant: DEFAULT_GRID_EMPTY_STATE_VARIANT,
    errorStateVariant: DEFAULT_GRID_ERROR_STATE_VARIANT,
    insertColumnVariant: DEFAULT_INSERT_COLUMN_VARIANT,
    liveState: createLiveStateForPreview("empty-table"),
    previewPath: "/project/default/editor/17604",
    branch: "feat/table-editor-filters-fe-4-grid-empty-states",
    prUrl: "https://github.com/supabase/supabase/pull/48070",
    draft: true,
  },
  {
    order: 5,
    title: "Grid error state",
    description:
      "Replace the warning-banner AlertError overlay with an inline admonition that surfaces the Postgres error line, recovery instructions, explicit Refresh, and Contact support actions — matching the prototype inline-admonition default.",
    size: "Small",
    targetId: "grid-error-state",
    wireframeId: "error-overlay",
    emptyStateVariant: DEFAULT_GRID_EMPTY_STATE_VARIANT,
    errorStateVariant: DEFAULT_GRID_ERROR_STATE_VARIANT,
    insertColumnVariant: DEFAULT_INSERT_COLUMN_VARIANT,
    liveState: createLiveStateForPreview("error"),
    previewPath: "/project/default/editor/17604",
  },
  {
    order: 6,
    title: "Add new column panel",
    description:
      "Reorganize ColumnEditor for new columns with essential-first layout: name and type fields up top, constraints and relations tucked into a collapsed Advanced section. Keep the same field set as production — only organization and priority change.",
    size: "Medium",
    targetId: "insert-column-content.insert-column-form-content",
    wireframeId: "insert-column-panel",
    emptyStateVariant: DEFAULT_GRID_EMPTY_STATE_VARIANT,
    errorStateVariant: DEFAULT_GRID_ERROR_STATE_VARIANT,
    insertColumnVariant: DEFAULT_INSERT_COLUMN_VARIANT,
    liveState: createLiveStateForPreview("insert-column"),
    previewPath: "/project/default/editor/17604",
    analyticsNotes: ["table_editor_add_column_panel_opened"],
  },
];

export function findPrSplitEntry(order: number): TableEditorFiltersPrSplitEntry | undefined {
  return PR_SPLIT_ENTRIES.find((entry) => entry.order === order);
}

export function readLiveStateFromSearchParams(
  searchParams: URLSearchParams,
): TableEditorFiltersLiveState | null {
  const encoded = searchParams.get(SHARE_STATE_PARAM);
  if (!encoded) return null;

  try {
    return decodeShareState<TableEditorFiltersLiveState>(encoded);
  } catch {
    return null;
  }
}

export function readEmptyStateVariantFromSearchParams(
  searchParams: URLSearchParams,
): GridEmptyStateVariant | null {
  const value = searchParams.get(PR_EMPTY_STATE_PARAM);
  if (!value) return null;
  return value as GridEmptyStateVariant;
}

export function readErrorStateVariantFromSearchParams(
  searchParams: URLSearchParams,
): GridErrorStateVariant | null {
  const value = searchParams.get(PR_ERROR_STATE_PARAM);
  if (!value) return null;
  return value as GridErrorStateVariant;
}

export function readInsertColumnVariantFromSearchParams(
  searchParams: URLSearchParams,
): InsertColumnVariant | null {
  const value = searchParams.get(PR_INSERT_COLUMN_PARAM);
  if (!value) return null;
  return value as InsertColumnVariant;
}
