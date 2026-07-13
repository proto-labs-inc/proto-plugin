"use client";

import {
  buildPrAgentPrompt,
  PROTOTYPE_PAGE_CLASS,
  PROTOTYPE_SCROLL_CONTAINER_CLASS,
  PrototypeComponent,
  PrototypeSpecPanelContent,
  usePrototypeComments,
  useRegisterPrototypeReferenceDocs,
  usePrototypeReviewOptional,
  useSyncPrototypePreviewStateToUrl,
  type PrSplitEntry,
} from "proto-plugin";
import { cn } from "ui";
import { useCallback, useEffect, useRef, useState } from "react";

import { TableEditorPage } from "./_components/table-editor-page";
import { GridEmptyStateVariantToggle } from "./_components/grid-empty-state-variant-toggle";
import { GridErrorStateVariantToggle } from "./_components/grid-error-state-variant-toggle";
import { InsertColumnVariantToggle } from "./_components/insert-column-variant-toggle";
import {
  DEFAULT_GRID_EMPTY_STATE_VARIANT,
  type GridEmptyStateVariant,
} from "./_components/grid-empty-state-content";
import {
  DEFAULT_GRID_ERROR_STATE_VARIANT,
  type GridErrorStateVariant,
} from "./_components/grid-error-state-content";
import {
  DEFAULT_INSERT_COLUMN_VARIANT,
  type InsertColumnVariant,
} from "./_components/insert-column-content";
import {
  createLiveStateForPreview,
  DEFAULT_TABLE_EDITOR_FILTERS_PREVIEW_STATE,
  normalizeTableEditorFiltersLiveState,
  withInferredPreviewState,
} from "./_components/table-editor-filters-preview-states";
import { MOCK_EMPLOYEES } from "./_components/table-editor-filters-mock-data";
import { filterEmployeesByQuery } from "./_components/table-editor-filters-utils";
import { useRegisterTableEditorFiltersVariantSets } from "./_components/table-editor-filters-variant-sets";
import { TableEditorFiltersPreviewStateSelect } from "./_components/table-editor-filters-preview-state-select";
import {
  findPrSplitEntry,
  PR_SPLIT_CONFIG,
  PR_SPLIT_ENTRIES,
  readEmptyStateVariantFromSearchParams,
  readErrorStateVariantFromSearchParams,
  readInsertColumnVariantFromSearchParams,
  readLiveStateFromSearchParams,
  type TableEditorFiltersPrSplitEntry,
  type TableEditorFiltersPrSplitWireframeId,
} from "./_components/pr-split-config";
import { PrSplitWireframe } from "./_components/pr-split-wireframes";
import { buildTableEditorFiltersStateCanvasConfig } from "./_components/table-editor-filters-state-canvas-config";
import type {
  TableEditorFiltersLiveState,
  TableEditorFiltersPreviewStateId,
  TableEditorDataMode,
} from "./_components/table-editor-filters-types";
import { TABLE_EDITOR_FILTERS_PREVIEW_STATE_IDS } from "./_components/table-editor-filters-types";
import { REFERENCE_DOCS } from "./reference-docs";

const REFRESH_LOADING_MS = 1200;

function createDefaultLiveState(): TableEditorFiltersLiveState {
  return createLiveStateForPreview(DEFAULT_TABLE_EDITOR_FILTERS_PREVIEW_STATE);
}

export default function TableEditorFiltersPage() {
  const [liveState, setLiveState] = useState<TableEditorFiltersLiveState>(createDefaultLiveState);
  const [emptyStateVariant, setEmptyStateVariant] = useState<GridEmptyStateVariant>(
    DEFAULT_GRID_EMPTY_STATE_VARIANT,
  );
  const [errorStateVariant, setErrorStateVariant] = useState<GridErrorStateVariant>(
    DEFAULT_GRID_ERROR_STATE_VARIANT,
  );
  const [insertColumnVariant, setInsertColumnVariant] = useState<InsertColumnVariant>(
    DEFAULT_INSERT_COLUMN_VARIANT,
  );
  const [selectedPrOrder, setSelectedPrOrder] = useState<number | null>(null);
  const review = usePrototypeReviewOptional();
  const setSpecContent = review?.setSpecContent;
  const focusShareTarget = review?.focusShareTarget;
  const refreshReturnModeRef = useRef<TableEditorDataMode>("populated");
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onRestore = useCallback((restored: TableEditorFiltersLiveState) => {
    setLiveState(normalizeTableEditorFiltersLiveState(restored));
  }, []);

  usePrototypeComments(liveState, onRestore);
  useRegisterPrototypeReferenceDocs(REFERENCE_DOCS);

  const setPreviewState = useCallback((previewStateId: TableEditorFiltersPreviewStateId) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    setLiveState(createLiveStateForPreview(previewStateId));
  }, []);

  const handleErrorStateLayoutActivate = useCallback(() => {
    setPreviewState("error");
  }, [setPreviewState]);

  const handleEmptyStateLayoutActivate = useCallback(() => {
    setPreviewState("empty-table");
  }, [setPreviewState]);

  const handleInsertColumnLayoutActivate = useCallback(() => {
    setPreviewState("insert-column");
  }, [setPreviewState]);

  useRegisterTableEditorFiltersVariantSets({
    onErrorStateLayoutActivate: handleErrorStateLayoutActivate,
    onEmptyStateLayoutActivate: handleEmptyStateLayoutActivate,
    onInsertColumnLayoutActivate: handleInsertColumnLayoutActivate,
  });

  useSyncPrototypePreviewStateToUrl(liveState.previewStateId, setPreviewState, {
    validStateIds: TABLE_EDITOR_FILTERS_PREVIEW_STATE_IDS,
  });

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const setDataMode = useCallback((dataMode: TableEditorDataMode) => {
    setLiveState((current) =>
      withInferredPreviewState(current, { dataMode, sidePanel: "none", expandedRowId: null }),
    );
  }, []);

  const handleCloseSidePanel = useCallback(() => {
    setLiveState((current) =>
      withInferredPreviewState(current, { sidePanel: "none", expandedRowId: null }),
    );
  }, []);

  const handleOpenInsertRow = useCallback(() => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        dataMode: "populated",
        sidePanel: "insert-row",
        expandedRowId: null,
      }),
    );
  }, []);

  const handleOpenInsertColumn = useCallback(() => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        dataMode: "populated",
        sidePanel: "insert-column",
        expandedRowId: null,
      }),
    );
  }, []);

  const handleOpenEditRow = useCallback((rowId: number) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        dataMode: "populated",
        sidePanel: "edit-row",
        expandedRowId: rowId,
      }),
    );
  }, []);

  const handleApplyFilter = useCallback((filterText: string) => {
    const trimmed = filterText.trim();
    if (!trimmed) {
      setLiveState((current) =>
        withInferredPreviewState(current, {
          filterInput: "",
          activeFilter: null,
          dataMode: "populated",
          sidePanel: "none",
          expandedRowId: null,
        }),
      );
      return;
    }

    const activeFilter = { column: "name", operator: "~~*", value: trimmed };
    const matchingRows = filterEmployeesByQuery(MOCK_EMPLOYEES, trimmed);

    setLiveState((current) =>
      withInferredPreviewState(current, {
        filterInput: trimmed,
        activeFilter,
        dataMode: matchingRows.length === 0 ? "filtered-empty" : "populated",
        sidePanel: "none",
        expandedRowId: null,
      }),
    );
  }, []);

  const handleFilterInputChange = useCallback((filterInput: string) => {
    setLiveState((current) => ({ ...current, filterInput }));
  }, []);

  const handleRemoveFilters = useCallback(() => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        filterInput: "",
        activeFilter: null,
        dataMode: "populated",
      }),
    );
  }, []);

  const handleTruncateTable = useCallback(() => {
    setDataMode("empty-table");
  }, [setDataMode]);

  const handleImportData = useCallback(() => {
    setDataMode("populated");
  }, [setDataMode]);

  const handleRefresh = useCallback(() => {
    if (liveState.dataMode === "loading" || liveState.dataMode === "error") return;

    refreshReturnModeRef.current =
      liveState.dataMode === "empty-table" || liveState.dataMode === "filtered-empty"
        ? liveState.dataMode
        : "populated";

    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    setLiveState((current) =>
      withInferredPreviewState(current, {
        dataMode: "loading",
        sidePanel: "none",
        expandedRowId: null,
      }),
    );

    refreshTimeoutRef.current = setTimeout(() => {
      refreshTimeoutRef.current = null;
      setLiveState((current) => {
        if (current.dataMode !== "loading") return current;
        return withInferredPreviewState(current, {
          dataMode: refreshReturnModeRef.current,
          sidePanel: "none",
          expandedRowId: null,
        });
      });
    }, REFRESH_LOADING_MS);
  }, [liveState.dataMode]);

  const setStateCanvasConfig = review?.setStateCanvasConfig;
  useEffect(() => {
    if (!setStateCanvasConfig) return;

    setStateCanvasConfig(buildTableEditorFiltersStateCanvasConfig(setPreviewState));

    return () => setStateCanvasConfig(null);
  }, [setPreviewState, setStateCanvasConfig]);

  const applyPrSplitEntry = useCallback((entry: TableEditorFiltersPrSplitEntry) => {
    setLiveState(entry.liveState);
    setEmptyStateVariant(entry.emptyStateVariant);
    setErrorStateVariant(entry.errorStateVariant);
    setInsertColumnVariant(entry.insertColumnVariant);
  }, []);

  const syncPrSplitToUrl = useCallback((entry: TableEditorFiltersPrSplitEntry | null) => {
    const url = new URL(window.location.href);
    if (!entry) {
      url.searchParams.delete("prSplit");
      url.searchParams.delete("prEmptyState");
      url.searchParams.delete("prErrorState");
      url.searchParams.delete("prInsertColumn");
      url.searchParams.delete("shareState");
    } else {
      PR_SPLIT_CONFIG.writeEntryToSearchParams(url.searchParams, entry);
      url.searchParams.set("prSplit", String(entry.order));
    }
    window.history.replaceState(null, "", url);
  }, []);

  const handlePrNavigate = useCallback(
    (entry: PrSplitEntry<TableEditorFiltersPrSplitWireframeId, TableEditorFiltersLiveState>) => {
      const tableEditorEntry = entry as TableEditorFiltersPrSplitEntry;
      setSelectedPrOrder(tableEditorEntry.order);
      applyPrSplitEntry(tableEditorEntry);
      syncPrSplitToUrl(tableEditorEntry);
      focusShareTarget?.(tableEditorEntry.targetId);
    },
    [applyPrSplitEntry, focusShareTarget, syncPrSplitToUrl],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prSplit = params.get("prSplit");
    if (!prSplit) return;

    const order = Number(prSplit);
    const entry = findPrSplitEntry(order);
    if (!entry) return;

    setSelectedPrOrder(order);
    applyPrSplitEntry(entry);

    const restoredLiveState = readLiveStateFromSearchParams(params);
    if (restoredLiveState) {
      setLiveState(restoredLiveState);
    }

    const emptyStateVariant = readEmptyStateVariantFromSearchParams(params);
    if (emptyStateVariant) {
      setEmptyStateVariant(emptyStateVariant);
    }

    const errorStateVariant = readErrorStateVariantFromSearchParams(params);
    if (errorStateVariant) {
      setErrorStateVariant(errorStateVariant);
    }

    const insertColumnVariant = readInsertColumnVariantFromSearchParams(params);
    if (insertColumnVariant) {
      setInsertColumnVariant(insertColumnVariant);
    }

    const timer = window.setTimeout(() => {
      focusShareTarget?.(entry.targetId);
    }, 150);
    return () => clearTimeout(timer);
  }, [applyPrSplitEntry, focusShareTarget]);

  useEffect(() => {
    if (!setSpecContent) return;

    setSpecContent(
      <PrototypeSpecPanelContent
        entries={PR_SPLIT_ENTRIES}
        renderWireframe={(id) => <PrSplitWireframe id={id} embedded />}
        buildAgentPrompt={(entry, origin) =>
          buildPrAgentPrompt(entry, PR_SPLIT_ENTRIES, PR_SPLIT_CONFIG, origin)
        }
        onPrNavigate={handlePrNavigate}
        selectedPrOrder={selectedPrOrder}
        defaultPreviewPath={PR_SPLIT_CONFIG.defaultPreviewPath}
        vercelProjectName={PR_SPLIT_CONFIG.vercelProjectName}
      />,
    );

    return () => setSpecContent(null);
  }, [handlePrNavigate, selectedPrOrder, setSpecContent]);

  return (
    <PrototypeComponent
      id="scroll-container"
      className={cn(PROTOTYPE_SCROLL_CONTAINER_CLASS, "bg-dash-sidebar text-default")}
    >
      <PrototypeComponent id="page" className={cn(PROTOTYPE_PAGE_CLASS, "bg-dash-sidebar")}>
        <TableEditorPage
          liveState={liveState}
          emptyStateVariant={emptyStateVariant}
          errorStateVariant={errorStateVariant}
          insertColumnVariant={insertColumnVariant}
          onCloseSidePanel={handleCloseSidePanel}
          onOpenInsertRow={handleOpenInsertRow}
          onOpenInsertColumn={handleOpenInsertColumn}
          onOpenEditRow={handleOpenEditRow}
          onApplyFilter={handleApplyFilter}
          onFilterInputChange={handleFilterInputChange}
          onRemoveFilters={handleRemoveFilters}
          onTruncateTable={handleTruncateTable}
          onImportData={handleImportData}
          onRefresh={handleRefresh}
        />
        <div className="sr-only" aria-hidden>
          <GridErrorStateVariantToggle
            variant={errorStateVariant}
            onVariantChange={setErrorStateVariant}
            registerOnly
          />
          <GridEmptyStateVariantToggle
            variant={emptyStateVariant}
            onVariantChange={setEmptyStateVariant}
            registerOnly
          />
          <InsertColumnVariantToggle
            variant={insertColumnVariant}
            onVariantChange={setInsertColumnVariant}
            registerOnly
          />
        </div>
        <TableEditorFiltersPreviewStateSelect
          previewStateId={liveState.previewStateId}
          onPreviewStateChange={setPreviewState}
        />
      </PrototypeComponent>
    </PrototypeComponent>
  );
}
