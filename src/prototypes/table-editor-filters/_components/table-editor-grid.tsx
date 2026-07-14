import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  EllipsisVertical,
  Key,
  List,
  Lock,
  Maximize2,
  PanelLeftClose,
  Plus,
  RefreshCw,
  Search,
  Table2,
  X,
} from "lucide-react";
import { PrototypeComponent } from "proto-plugin";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Skeleton,
} from "ui";

import {
  MOCK_COLUMNS,
  MOCK_EMPLOYEES,
  type EmployeeRow,
} from "./table-editor-filters-mock-data";
import type {
  TableEditorActiveFilter,
  TableEditorDataMode,
} from "./table-editor-filters-types";
import { filterEmployeesByQuery } from "./table-editor-filters-utils";
import {
  DEFAULT_GRID_EMPTY_STATE_VARIANT,
  GridEmptyStateBlock,
  type GridEmptyStateVariant,
} from "./grid-empty-state-content";
import {
  DEFAULT_GRID_ERROR_STATE_VARIANT,
  GridErrorStateBlock,
  type GridErrorStateVariant,
} from "./grid-error-state-content";

const FILTER_PLACEHOLDER = "Filter by id, name, email... or ask AI";

function GridHeaderCell({
  name,
  format,
  isPrimaryKey,
}: {
  name: string;
  format: string;
  isPrimaryKey?: boolean;
}) {
  return (
    <div className="flex items-center h-[35px] px-2 border-r border-b border-secondary bg-dash-canvas min-w-0">
      <div className="flex items-center gap-1 min-w-0 flex-1">
        {isPrimaryKey ? (
          <Key
            size={14}
            strokeWidth={2}
            className="text-foreground-lighter shrink-0"
          />
        ) : null}
        <span className="font-medium text-foreground truncate text-xs">
          {name}
        </span>
        <span className="text-foreground-light shrink-0 text-xs font-normal">
          {format}
        </span>
      </div>
      <Button
        type="button"
        variant="text"
        size="tiny"
        className="border-transparent opacity-50 h-[26px] p-[3px] shrink-0"
      >
        <ChevronDown size={14} />
      </Button>
    </div>
  );
}

function GridRow({
  row,
  checked,
  onCheckedChange,
  onExpand,
}: {
  row: EmployeeRow;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onExpand: () => void;
}) {
  const cellClass =
    "flex items-center px-2 border-r border-secondary shrink-0 text-xs text-foreground";

  return (
    <div className="group flex items-stretch border-b border-secondary text-xs min-h-[35px] bg-dash-sidebar hover:bg-surface-200 transition-colors">
      <div className="flex items-center gap-1 px-2 border-r border-secondary w-[65px] shrink-0 sticky left-0 bg-inherit z-[1]">
        <Checkbox
          aria-label={`Select row ${row.id}`}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
        />
        <Button
          type="button"
          variant="text"
          size="tiny"
          aria-label={`Expand row ${row.id}`}
          className="border-transparent h-[26px] px-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          onClick={onExpand}
        >
          <Maximize2 size={14} />
        </Button>
      </div>
      <div className={cn(cellClass, "w-[120px]")}>{row.id}</div>
      <div className={cn(cellClass, "w-[250px]")}>{row.name}</div>
      <div className={cn(cellClass, "w-[250px]")}>
        <span className="text-foreground-lighter italic">NULL</span>
      </div>
      <div className={cn(cellClass, "w-[189px]")}>{row.created_at}</div>
      <div className={cn(cellClass, "w-[250px]")}>{row.department}</div>
      <div className="w-[100px] shrink-0" />
    </div>
  );
}

function FilterChip({
  filter,
  onRemove,
}: {
  filter: TableEditorActiveFilter;
  onRemove: () => void;
}) {
  return (
    <span
      data-filter-chip
      className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md border border-default bg-surface-200 px-2 py-0.5 text-xs text-foreground"
    >
      <span className="text-foreground-light">{filter.column}</span>
      <span className="text-foreground-muted">{filter.operator}</span>
      <span>{filter.value}</span>
      <button
        type="button"
        className="text-foreground-lighter hover:text-foreground"
        aria-label="Remove filter"
        onClick={onRemove}
      >
        <X size={12} />
      </button>
    </span>
  );
}

function GridErrorState({
  errorStateVariant,
  onRefresh,
}: {
  errorStateVariant: GridErrorStateVariant;
  onRefresh: () => void;
}) {
  return (
    <PrototypeComponent
      id="grid-error-state"
      className="flex flex-col items-center justify-center max-w-md pointer-events-auto"
    >
      <GridErrorStateBlock
        variant={errorStateVariant}
        onRefresh={onRefresh}
        onContactSupport={() => undefined}
      />
    </PrototypeComponent>
  );
}

function GridEmptyState({
  dataMode,
  activeFilter,
  emptyStateVariant,
  onRemoveFilters,
  onImportData,
}: {
  dataMode: TableEditorDataMode;
  activeFilter: TableEditorActiveFilter | null;
  emptyStateVariant: GridEmptyStateVariant;
  onRemoveFilters: () => void;
  onImportData: () => void;
}) {
  const componentId =
    dataMode === "filtered-empty"
      ? "grid-filtered-empty-state"
      : "grid-empty-state";

  return (
    <PrototypeComponent
      id={componentId}
      className="flex h-full w-full flex-col items-center justify-center"
    >
      <GridEmptyStateBlock
        variant={emptyStateVariant}
        dataMode={dataMode}
        activeFilter={activeFilter}
        onRemoveFilters={onRemoveFilters}
        onImportData={onImportData}
        className={dataMode === "empty-table" ? "mt-9" : undefined}
      />
    </PrototypeComponent>
  );
}

const GRID_COLUMN_WIDTHS = {
  id: "w-[120px]",
  name: "w-[250px]",
  email: "w-[250px]",
  created_at: "w-[189px]",
  department: "w-[250px]",
} as const;

const LOADING_ROW_COUNT = 12;

function SkeletonGridHeaderCell({
  columnName,
}: {
  columnName: keyof typeof GRID_COLUMN_WIDTHS;
}) {
  return (
    <div
      className={cn(
        "flex items-center h-[35px] px-2 border-r border-b border-secondary bg-dash-canvas min-w-0",
        GRID_COLUMN_WIDTHS[columnName],
      )}
    >
      <Skeleton className="h-3 w-14" />
    </div>
  );
}

function SkeletonGridRow({ rowIndex }: { rowIndex: number }) {
  const opacity = Math.max(0.2, 1 - rowIndex * 0.07);

  return (
    <div
      className="flex items-stretch border-b border-secondary min-h-[35px] bg-dash-sidebar"
      style={{ opacity }}
    >
      <div className="flex items-center gap-1 px-2 border-r border-secondary w-[65px] shrink-0 sticky left-0 bg-dash-sidebar z-[1]">
        <Skeleton className="h-4 w-4 rounded-sm" />
      </div>
      {MOCK_COLUMNS.map((column, columnIndex) => (
        <div
          key={column.name}
          className={cn(
            "flex items-center px-2 border-r border-secondary shrink-0",
            GRID_COLUMN_WIDTHS[column.name],
          )}
        >
          <Skeleton
            className={cn(
              "h-3",
              columnIndex === 0 && "w-8",
              columnIndex === 1 && "w-28",
              columnIndex === 2 && "w-12",
              columnIndex === 3 && "w-36",
              columnIndex === 4 && "w-20",
            )}
          />
        </div>
      ))}
      <div className="w-[100px] shrink-0" />
    </div>
  );
}

type TableEditorGridProps = {
  dataMode: TableEditorDataMode;
  filterInput: string;
  activeFilter: TableEditorActiveFilter | null;
  emptyStateVariant?: GridEmptyStateVariant;
  errorStateVariant?: GridErrorStateVariant;
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

export function TableEditorGrid({
  dataMode,
  filterInput,
  activeFilter,
  emptyStateVariant = DEFAULT_GRID_EMPTY_STATE_VARIANT,
  errorStateVariant = DEFAULT_GRID_ERROR_STATE_VARIANT,
  onOpenInsertRow,
  onOpenInsertColumn,
  onOpenEditRow,
  onApplyFilter,
  onFilterInputChange,
  onRemoveFilters,
  onTruncateTable,
  onImportData,
  onRefresh,
}: TableEditorGridProps) {
  const isLoading = dataMode === "loading";
  const isError = dataMode === "error";
  const hasActiveFilter = activeFilter !== null;
  const filterRowRef = useRef<HTMLDivElement>(null);
  const placeholderMeasureRef = useRef<HTMLSpanElement>(null);
  const [showFilterPlaceholder, setShowFilterPlaceholder] = useState(true);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(
    () => new Set(),
  );

  useLayoutEffect(() => {
    const row = filterRowRef.current;
    const measureEl = placeholderMeasureRef.current;
    if (!row || !measureEl) return;

    const measure = () => {
      if (!hasActiveFilter) {
        setShowFilterPlaceholder(true);
        return;
      }

      const chip = row.querySelector<HTMLElement>("[data-filter-chip]");
      const reservedWidth = (chip?.getBoundingClientRect().width ?? 0) + 48;
      const availableWidth = row.clientWidth - reservedWidth;
      const placeholderWidth = measureEl.getBoundingClientRect().width + 16;

      setShowFilterPlaceholder(availableWidth >= placeholderWidth);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(row);

    return () => observer.disconnect();
  }, [hasActiveFilter]);

  const rows =
    dataMode === "populated"
      ? activeFilter
        ? filterEmployeesByQuery(MOCK_EMPLOYEES, activeFilter.value)
        : MOCK_EMPLOYEES
      : [];

  const toggleRowSelection = useCallback((rowId: number, checked: boolean) => {
    setSelectedRowIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(rowId);
      } else {
        next.delete(rowId);
      }
      return next;
    });
  }, []);

  const selectedCount = rows.reduce(
    (count, row) => (selectedRowIds.has(row.id) ? count + 1 : count),
    0,
  );
  const allRowsSelected = rows.length > 0 && selectedCount === rows.length;
  const someRowsSelected = selectedCount > 0 && !allRowsSelected;
  const selectAllChecked = allRowsSelected
    ? true
    : someRowsSelected
      ? "indeterminate"
      : false;

  const handleSelectAllChange = useCallback(
    (checked: boolean | "indeterminate") => {
      if (checked === true) {
        setSelectedRowIds(new Set(rows.map((row) => row.id)));
        return;
      }

      setSelectedRowIds(new Set());
    },
    [rows],
  );
  const showEmptyOverlay =
    !isLoading &&
    !isError &&
    (dataMode === "filtered-empty" || dataMode === "empty-table");
  const showErrorOverlay = isError;
  const recordCount =
    dataMode === "populated"
      ? rows.length
      : dataMode === "empty-table" ||
          dataMode === "filtered-empty" ||
          dataMode === "error"
        ? 0
        : 3;

  return (
    <PrototypeComponent
      id="table-editor-grid"
      className="h-full flex flex-col w-full bg-dash-sidebar"
    >
      <div className="h-10 md:min-h-12 flex items-center bg-surface-200">
        <div className="w-full flex">
          <button
            type="button"
            className="hidden md:flex items-center justify-center w-10 h-12 hover:bg-surface-100 shrink-0 border-b border-b-default"
          >
            <PanelLeftClose
              size={16}
              strokeWidth={1.5}
              className="text-foreground-lighter"
            />
          </button>

          <div className="border-b rounded-b-none gap-0 min-h-12 flex items-center w-full bg-surface-200 border-none text-clip overflow-x-auto">
            <div className="flex items-center h-12 border-l border-default">
              <button
                type="button"
                className="group flex items-center gap-2 pl-3 pr-2.5 text-xs bg-dash-sidebar border-b border-default relative h-full hover:bg-surface-300"
              >
                <Table2
                  size={15}
                  strokeWidth={1.5}
                  className="text-foreground-muted"
                />
                <span>employees</span>
                <span className="relative ml-1 flex size-5 items-center justify-center opacity-0 group-hover:opacity-100">
                  <X size={12} className="text-foreground-light" />
                </span>
                <div className="absolute w-full top-0 left-0 right-0 h-px bg-foreground" />
              </button>
              <div className="h-full w-px bg-border" />
            </div>
            <button
              type="button"
              className="flex items-center justify-center w-10 min-h-12 hover:bg-surface-100 shrink-0 border-b border-default"
            >
              <Plus
                size={16}
                strokeWidth={1.5}
                className="text-foreground-lighter"
              />
            </button>
            <div className="grow h-full border-b border-default pr-6" />
          </div>
        </div>
      </div>

      <PrototypeComponent
        id="table-editor-toolbar"
        className="flex flex-wrap md:min-h-10 items-center bg-dash-sidebar border-b border-default md:border-none"
      >
        <div className="w-full flex items-center justify-between gap-2 pr-1.5 pt-1 md:pt-0">
          <div className="flex-1 min-w-0 px-1.5">
            <div
              ref={filterRowRef}
              className="relative flex items-center gap-2 w-full rounded-md h-full min-w-0 flex-nowrap"
            >
              <span
                ref={placeholderMeasureRef}
                aria-hidden
                className="invisible absolute left-0 top-0 text-xs whitespace-nowrap pointer-events-none"
              >
                {FILTER_PLACEHOLDER}
              </span>
              <div className="relative flex items-center justify-center shrink-0 px-2">
                <Search
                  size={16}
                  strokeWidth={2}
                  className="text-foreground-muted w-4 h-4"
                />
              </div>
              <Input
                data-filter-input
                value={filterInput}
                placeholder={
                  showFilterPlaceholder ? FILTER_PLACEHOLDER : undefined
                }
                className="border-none bg-transparent text-xs focus:ring-0 focus-visible:ring-0 flex-1 h-auto min-w-0 px-2 py-1"
                onChange={(event) => onFilterInputChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onApplyFilter(event.currentTarget.value);
                  }
                }}
              />
              {activeFilter ? (
                <FilterChip filter={activeFilter} onRemove={onRemoveFilters} />
              ) : null}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 overflow-x-auto pr-1.5">
            <Button
              type="button"
              variant="text"
              size="tiny"
              className="text-xs px-2.5 py-1 h-[26px]"
              icon={<List size={14} />}
            >
              Sort
            </Button>

            <Button
              type="button"
              variant="danger"
              size="tiny"
              className="text-xs px-2.5 py-1 h-[26px]"
              icon={
                <Lock
                  size={14}
                  strokeWidth={1.5}
                  className="text-destructive"
                />
              }
            >
              RLS disabled
            </Button>

            <Button
              type="button"
              variant="default"
              size="tiny"
              className="text-xs px-2.5 py-1 h-[26px] pr-3 gap-0"
            >
              <span className="flex items-center gap-1">
                <span className="text-foreground-muted">Role</span>
                <span>postgres</span>
                <ChevronDown size={12} className="text-muted" />
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="default"
                  size="tiny"
                  aria-label="More actions"
                  className="text-xs h-7 w-7 p-0"
                  icon={<EllipsisVertical size={14} strokeWidth={2} />}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onTruncateTable}>
                  Truncate table
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              type="button"
              variant="outline"
              size="tiny"
              aria-label="Refresh table data"
              disabled={isLoading}
              className="text-xs h-[26px] w-7 p-0"
              onClick={onRefresh}
            >
              <RefreshCw
                size={14}
                className={cn(isLoading && "animate-spin")}
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="primary"
                  size="tiny"
                  className="text-xs px-2.5 py-1 h-[26px]"
                  icon={
                    <ChevronDown
                      size={14}
                      strokeWidth={1.5}
                      className="text-brand-600"
                    />
                  }
                >
                  Insert
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={onOpenInsertRow}>
                  Insert row
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onOpenInsertColumn}>
                  Insert column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </PrototypeComponent>

      <PrototypeComponent
        id="grid-loading-skeleton"
        className={cn(
          "flex flex-col relative flex-1 min-h-0 overflow-auto bg-dash-canvas border-t border-default",
          isLoading &&
            "[mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]",
        )}
      >
        <div className="sticky top-0 z-[2] flex min-w-max">
          <div className="flex items-center px-2 border-r border-b border-secondary w-[65px] shrink-0 h-[35px] sticky left-0 bg-dash-canvas z-[3]">
            {isLoading ? (
              <Skeleton className="h-4 w-4 rounded-sm" />
            ) : (
              <Checkbox
                aria-label="Select All"
                checked={selectAllChecked}
                onCheckedChange={handleSelectAllChange}
              />
            )}
          </div>
          {isLoading
            ? MOCK_COLUMNS.map((column) => (
                <SkeletonGridHeaderCell
                  key={column.name}
                  columnName={column.name}
                />
              ))
            : MOCK_COLUMNS.map((column) => (
                <div
                  key={column.name}
                  className={GRID_COLUMN_WIDTHS[column.name]}
                >
                  <GridHeaderCell
                    name={column.name}
                    format={column.format}
                    isPrimaryKey={
                      "isPrimaryKey" in column ? column.isPrimaryKey : false
                    }
                  />
                </div>
              ))}
          <div className="w-[100px] shrink-0" />
        </div>

        <div className="min-w-max">
          {isLoading
            ? Array.from({ length: LOADING_ROW_COUNT }, (_, rowIndex) => (
                <SkeletonGridRow key={rowIndex} rowIndex={rowIndex} />
              ))
            : rows.map((row) => (
                <GridRow
                  key={row.id}
                  row={row}
                  checked={selectedRowIds.has(row.id)}
                  onCheckedChange={(checked) =>
                    toggleRowSelection(row.id, checked)
                  }
                  onExpand={() => onOpenEditRow(row.id)}
                />
              ))}
        </div>

        {showEmptyOverlay ? (
          <div className="absolute w-full inset-0 flex flex-col items-center justify-center p-2 z-1 pointer-events-none">
            <GridEmptyState
              dataMode={dataMode}
              activeFilter={activeFilter}
              emptyStateVariant={emptyStateVariant}
              onRemoveFilters={onRemoveFilters}
              onImportData={onImportData}
            />
          </div>
        ) : null}
        {showErrorOverlay ? (
          <div className="absolute w-full inset-0 flex flex-col items-center justify-center p-2 z-1 pointer-events-none">
            <GridErrorState
              errorStateVariant={errorStateVariant}
              onRefresh={onRefresh}
            />
          </div>
        ) : null}
      </PrototypeComponent>

      <PrototypeComponent
        id="table-editor-footer"
        aria-label="Table grid footer"
        className="flex min-h-10 h-10 overflow-hidden items-center justify-between px-2 w-full border-t border-default gap-x-8 shrink-0 bg-dash-sidebar"
      >
        <div className="flex items-center gap-x-4 min-w-fit">
          <div className="flex items-center gap-x-2">
            <Button
              type="button"
              variant="outline"
              size="tiny"
              aria-label="Previous page"
              disabled
              className="text-xs py-1 h-[26px] opacity-50 px-1.5"
            >
              <ArrowLeft size={14} />
            </Button>
            <p className="text-xs text-foreground-light">Page</p>
            <Input
              value="1"
              readOnly
              className="text-xs px-2.5 py-1 h-[26px] w-12 text-center"
            />
            <p className="text-xs text-foreground-light">of 1</p>
            <Button
              type="button"
              variant="outline"
              size="tiny"
              aria-label="Next page"
              disabled
              className="text-xs py-1 h-[26px] opacity-50 px-1.5"
            >
              <ArrowRight size={14} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="tiny"
              className="text-xs px-2.5 py-1 h-[26px]"
            >
              100 rows
            </Button>
          </div>
          <p className="text-xs text-foreground-light">
            {isLoading ? (
              <Skeleton className="inline-block h-3 w-16 align-middle" />
            ) : (
              `${recordCount} records`
            )}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-x-2">
          <div
            className="relative border border-default rounded-md h-7"
            style={{ padding: 1, width: 152 }}
          >
            <span
              aria-hidden
              className="z-0 inline-block rounded-sm h-full bg-overlay-hover shadow-sm border border-strong absolute left-0 top-0"
              style={{ width: 75 }}
            />
            <span
              className="text-foreground-light right-0 absolute top-0 z-[1] text-xs inline-flex h-full items-center justify-center font-medium cursor-pointer capitalize"
              style={{ width: 76 }}
            >
              definition
            </span>
            <span
              className="text-foreground left-0 absolute top-0 z-[1] text-xs inline-flex h-full items-center justify-center font-medium cursor-pointer capitalize"
              style={{ width: 76 }}
            >
              data
            </span>
          </div>
        </div>
      </PrototypeComponent>
    </PrototypeComponent>
  );
}
