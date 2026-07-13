import { PrototypeComponent, PROTOTYPE_VIEW_SHELL_CLASS } from "proto-plugin";
import { cn } from "ui";

import { EditRowPanel } from "./edit-row-panel";
import { InsertColumnPanel } from "./insert-column-panel";
import { InsertRowPanel } from "./insert-row-panel";
import { ProductSidebar, ProjectHeader } from "./project-shell";
import { TableEditorGrid } from "./table-editor-grid";
import { TableEditorMenu } from "./table-editor-menu";
import type { TableEditorFiltersLiveState } from "./table-editor-filters-types";
import type { GridEmptyStateVariant } from "./grid-empty-state-content";
import type { GridErrorStateVariant } from "./grid-error-state-content";
import type { InsertColumnVariant } from "./insert-column-content";

type TableEditorPageProps = {
  liveState: TableEditorFiltersLiveState;
  emptyStateVariant: GridEmptyStateVariant;
  errorStateVariant: GridErrorStateVariant;
  insertColumnVariant: InsertColumnVariant;
  onCloseSidePanel: () => void;
  onOpenInsertRow: () => void;
  onOpenInsertColumn: () => void;
  onOpenEditRow: (rowId: number) => void;
  onApplyFilter: (filterText: string) => void;
  onFilterInputChange: (filterInput: string) => void;
  onRemoveFilters: () => void;
  onTruncateTable: () => void;
  onImportData: () => void;
  onRefresh: () => void;
};

export function TableEditorPage({
  liveState,
  emptyStateVariant,
  errorStateVariant,
  insertColumnVariant,
  onCloseSidePanel,
  onOpenInsertRow,
  onOpenInsertColumn,
  onOpenEditRow,
  onApplyFilter,
  onFilterInputChange,
  onRemoveFilters,
  onTruncateTable,
  onImportData,
  onRefresh,
}: TableEditorPageProps) {
  return (
    <PrototypeComponent
      id="table-editor-page"
      className={cn(PROTOTYPE_VIEW_SHELL_CLASS, "flex h-full min-h-0 w-full flex-col bg-dash-sidebar")}
    >
      <ProjectHeader />

      <div className="flex flex-1 w-full overflow-y-hidden min-h-0">
        <ProductSidebar />

        <div className="flex flex-1 min-w-0 overflow-hidden relative">
          <div className="flex flex-row h-full w-full">
            <div className="flex h-full w-full">
              <div
                className="h-full shrink-0 overflow-hidden"
                style={{ width: "28%", minWidth: 240, maxWidth: 360 }}
              >
                <TableEditorMenu />
              </div>

              <div
                aria-orientation="vertical"
                className="relative w-px shrink-0 bg-border hidden md:block"
                role="separator"
              />

              <div className="h-full flex-1 min-w-0 overflow-hidden">
                <TableEditorGrid
                  dataMode={liveState.dataMode}
                  filterInput={liveState.filterInput}
                  activeFilter={liveState.activeFilter}
                  emptyStateVariant={emptyStateVariant}
                  errorStateVariant={errorStateVariant}
                  onOpenInsertRow={onOpenInsertRow}
                  onOpenInsertColumn={onOpenInsertColumn}
                  onOpenEditRow={onOpenEditRow}
                  onApplyFilter={onApplyFilter}
                  onFilterInputChange={onFilterInputChange}
                  onRemoveFilters={onRemoveFilters}
                  onTruncateTable={onTruncateTable}
                  onImportData={onImportData}
                  onRefresh={onRefresh}
                />
              </div>
            </div>
          </div>

          <InsertRowPanel
            visible={liveState.sidePanel === "insert-row"}
            onClose={onCloseSidePanel}
          />
          <EditRowPanel
            visible={liveState.sidePanel === "edit-row"}
            rowId={liveState.expandedRowId}
            onClose={onCloseSidePanel}
          />
          <InsertColumnPanel
            visible={liveState.sidePanel === "insert-column"}
            variant={insertColumnVariant}
            onClose={onCloseSidePanel}
          />
        </div>
      </div>
    </PrototypeComponent>
  );
}
