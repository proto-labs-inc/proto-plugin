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
import { Button, Checkbox, cn, Input } from "ui";

import { MOCK_COLUMNS, MOCK_EMPLOYEES } from "./mock-data";

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
    <div className="flex items-center h-[35px] px-2 border-r border-b border-secondary bg-dash-canvas text-grid min-w-0">
      <div className="flex items-center gap-1 min-w-0 flex-1">
        {isPrimaryKey ? (
          <Key size={14} strokeWidth={2} className="text-foreground-lighter shrink-0" />
        ) : null}
        <span className="font-medium text-foreground truncate text-xs">{name}</span>
        <span className="text-foreground-light shrink-0 text-xs font-normal">{format}</span>
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
}: {
  row: (typeof MOCK_EMPLOYEES)[number];
}) {
  return (
    <div className="group flex items-stretch border-b border-secondary text-grid min-h-[35px] bg-dash-sidebar hover:bg-surface-200 transition-colors">
      <div className="flex items-center gap-1 px-2 border-r border-secondary w-[65px] shrink-0 sticky left-0 bg-inherit z-[1]">
        <Checkbox />
        <Button
          type="button"
          variant="text"
          size="tiny"
          className="border-transparent h-[26px] px-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Maximize2 size={14} />
        </Button>
      </div>
      <div className="flex items-center px-2 border-r border-secondary w-[120px] shrink-0 text-foreground">
        {row.id}
      </div>
      <div className="flex items-center px-2 border-r border-secondary w-[250px] shrink-0 text-foreground">
        {row.name}
      </div>
      <div className="flex items-center px-2 border-r border-secondary w-[250px] shrink-0">
        <span className="text-foreground-lighter italic">NULL</span>
      </div>
      <div className="flex items-center px-2 border-r border-secondary w-[189px] shrink-0 text-foreground">
        {row.created_at}
      </div>
      <div className="flex items-center px-2 border-r border-secondary w-[250px] shrink-0 text-foreground">
        {row.department}
      </div>
      <div className="w-[100px] shrink-0" />
    </div>
  );
}

export function TableEditorGrid() {
  return (
    <div className="h-full flex flex-col w-full bg-dash-sidebar">
      <div className="h-10 md:min-h-12 flex items-center bg-surface-200">
        <div className="w-full flex">
          <button
            type="button"
            className="hidden md:flex items-center justify-center w-10 h-12 hover:bg-surface-100 shrink-0 border-b border-b-default"
          >
            <PanelLeftClose size={16} strokeWidth={1.5} className="text-foreground-lighter" />
          </button>

          <div className="border-b rounded-b-none gap-0 min-h-12 flex items-center w-full bg-surface-200 border-none text-clip overflow-x-auto">
            <div className="flex items-center h-12 border-l border-default">
              <button
                type="button"
                className="group flex items-center gap-2 pl-3 pr-2.5 text-xs bg-dash-sidebar border-b border-default relative h-full hover:bg-surface-300"
              >
                <Table2 size={15} strokeWidth={1.5} className="text-foreground-muted" />
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
              <Plus size={16} strokeWidth={1.5} className="text-foreground-lighter" />
            </button>
            <div className="grow h-full border-b border-default pr-6" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap md:min-h-10 items-center bg-dash-sidebar border-b border-default md:border-none">
        <div className="w-full flex items-center justify-between gap-2 pr-1.5 pt-1 md:pt-0">
          <div className="flex-1 min-w-0 px-1.5">
            <div className="relative flex items-stretch gap-0 w-full rounded-md h-full">
              <div className="relative flex items-center justify-center shrink-0 px-2">
                <Search size={16} strokeWidth={2} className="text-foreground-muted w-4 h-4" />
              </div>
              <Input
                placeholder="Filter by id, name, email... or ask AI"
                className="border-none bg-transparent text-xs focus:ring-0 focus-visible:ring-0 w-full flex-1 h-auto min-w-0 px-2 py-1"
                readOnly
              />
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
              icon={<Lock size={14} strokeWidth={1.5} className="text-destructive" />}
            >
              RLS disabled
            </Button>

            <Button type="button" variant="default" size="tiny" className="text-xs px-2.5 py-1 h-[26px] pr-3 gap-0">
              <span className="flex items-center gap-1">
                <span className="text-foreground-muted">Role</span>
                <span>postgres</span>
                <ChevronDown size={12} className="text-muted" />
              </span>
            </Button>

            <Button
              type="button"
              variant="default"
              size="tiny"
              aria-label="More actions"
              className="text-xs h-7 w-7 p-0"
              icon={<EllipsisVertical size={14} strokeWidth={2} />}
            />

            <Button
              type="button"
              variant="outline"
              size="tiny"
              aria-label="Refresh table data"
              className="text-xs h-[26px] w-7 p-0"
            >
              <RefreshCw size={14} />
            </Button>

            <Button
              type="button"
              variant="primary"
              size="tiny"
              className="text-xs px-2.5 py-1 h-[26px]"
              icon={<ChevronDown size={14} strokeWidth={1.5} className="text-brand-600" />}
            >
              Insert
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col relative flex-1 min-h-0 overflow-auto bg-dash-canvas border-t border-default">
        <div className="sticky top-0 z-[2] flex min-w-max">
          <div className="flex items-center px-2 border-r border-b border-secondary w-[65px] shrink-0 h-[35px] sticky left-0 bg-dash-canvas z-[3]">
            <Checkbox aria-label="Select All" />
          </div>
          {MOCK_COLUMNS.map((column) => (
            <div
              key={column.name}
              className={cn(
                column.name === "id" && "w-[120px]",
                column.name === "name" && "w-[250px]",
                column.name === "email" && "w-[250px]",
                column.name === "created_at" && "w-[189px]",
                column.name === "department" && "w-[250px]",
              )}
            >
              <GridHeaderCell
                name={column.name}
                format={column.format}
                isPrimaryKey={"isPrimaryKey" in column ? column.isPrimaryKey : false}
              />
            </div>
          ))}
          <div className="w-[100px] shrink-0" />
        </div>

        <div className="min-w-max">
          {MOCK_EMPLOYEES.map((row) => (
            <GridRow key={row.id} row={row} />
          ))}
        </div>
      </div>

      <div
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
            <Button type="button" variant="outline" size="tiny" className="text-xs px-2.5 py-1 h-[26px]">
              100 rows
            </Button>
          </div>
          <p className="text-xs text-foreground-light">3 records</p>
        </div>

        <div className="ml-auto flex items-center gap-x-2">
          <div className="relative border border-default rounded-md h-7" style={{ padding: 1, width: 152 }}>
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
      </div>
    </div>
  );
}
