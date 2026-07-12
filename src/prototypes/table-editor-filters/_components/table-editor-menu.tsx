import {
  ChevronsUpDown,
  EllipsisVertical,
  Filter,
  Globe,
  Plus,
  Search,
  Table2,
} from "lucide-react";
import { PrototypeComponent } from "proto-plugin";
import { Badge, Button, cn, Input } from "ui";

import { MOCK_TABLES } from "./table-editor-filters-mock-data";

function TableListItem({
  name,
  isActive,
  hasApiAccess,
  isUnrestricted,
}: {
  name: string;
  isActive?: boolean;
  hasApiAccess?: boolean;
  isUnrestricted?: boolean;
}) {
  return (
    <a
      title={name}
      className={cn(
        "group relative transition-colors h-[28px] flex items-center gap-3 text-sm cursor-pointer select-none pl-4 pr-1",
        isActive
          ? "text-foreground !bg-selection hover:bg-control"
          : "text-foreground-light hover:bg-control",
      )}
      href="#"
    >
      {isActive ? <div className="absolute left-0 h-full w-0.5 bg-foreground" /> : null}
      <Table2
        size={15}
        strokeWidth={1.5}
        className={cn(
          "text-foreground-muted group-hover:text-foreground-lighter transition-colors shrink-0",
          isActive && "text-foreground-light",
        )}
      />
      <div className="overflow-hidden text-ellipsis whitespace-nowrap flex items-center gap-2 relative w-full min-w-0">
        <span
          className={cn(
            "text-sm transition truncate min-w-0",
            isActive ? "text-foreground" : "text-foreground-light group-hover:text-foreground",
          )}
        >
          {name}
        </span>
        {isUnrestricted ? (
          <Badge
            variant="destructive"
            className="inline-flex items-center gap-1 justify-center rounded-full whitespace-nowrap tracking-[0.07em] uppercase font-medium text-[9px] leading-none px-[5.5px] py-[3px] bg-destructive/10 text-destructive border border-border-destructive shrink-0"
          >
            Unrestricted
          </Badge>
        ) : hasApiAccess ? (
          <Globe size={14} strokeWidth={1} className="text-foreground-lighter shrink-0" />
        ) : null}
      </div>
      {isActive ? (
        <Button
          type="button"
          variant="text"
          size="tiny"
          className="border-transparent text-xs px-2.5 py-1 w-6 h-6 shrink-0 text-transparent group-hover:text-foreground"
        >
          <EllipsisVertical size={14} strokeWidth={2} />
        </Button>
      ) : null}
    </a>
  );
}

export function TableEditorMenu() {
  return (
    <PrototypeComponent
      id="table-editor-menu"
      className="flex flex-col w-full h-full bg-dash-sidebar border-r border-default"
    >
      <div className="border-default flex min-h-12 items-center border-b px-6">
        <h4 className="text-lg">Table Editor</h4>
      </div>

      <div className="grow overflow-y-hidden">
        <div className="flex flex-col grow gap-5 pt-5 h-full">
          <div className="flex flex-col gap-y-1.5">
            <div className="mx-4">
              <Button
                type="button"
                variant="default"
                size="tiny"
                className="text-xs px-2.5 py-1 h-[26px] w-full [&>span]:w-full pr-1! space-x-1"
                iconRight={
                  <ChevronsUpDown size={14} strokeWidth={2} className="text-foreground-muted shrink-0" />
                }
              >
                <span className="w-full flex gap-1">
                  <span className="text-foreground-lighter">schema</span>
                  <span className="text-foreground">public</span>
                </span>
              </Button>
            </div>

            <div className="grid gap-3 mx-4">
              <Button
                type="button"
                variant="default"
                size="tiny"
                className="w-full text-xs px-2.5 py-1 h-[26px] justify-start"
                icon={<Plus size={14} strokeWidth={1.5} className="text-foreground-muted" />}
              >
                New table
              </Button>
            </div>
          </div>

          <div className="grow min-h-0 flex flex-col gap-2 pb-4">
            <div className="flex px-2 gap-2 items-center mx-2">
              <label className="relative w-full">
                <span className="sr-only">Search tables</span>
                <Input
                  placeholder="Search tables..."
                  className="pl-7 pr-7 w-full rounded-sm h-[28px] text-xs"
                  readOnly
                />
                <Search
                  size={14}
                  strokeWidth={1.5}
                  className="absolute left-2 top-0 bottom-0 my-auto text-foreground-muted"
                />
              </label>
              <Button
                type="button"
                variant="dashed"
                size="tiny"
                aria-label="Filter"
                className="text-xs py-1 h-[28px] px-1.5 shrink-0"
              >
                <Filter size={14} />
              </Button>
            </div>

            <div className="flex flex-1 min-h-0 w-full overflow-auto">
              <div className="w-full">
                {MOCK_TABLES.map((table) => (
                  <TableListItem
                    key={table.name}
                    name={table.name}
                    isActive={table.name === "employees"}
                    hasApiAccess={table.hasApiAccess}
                    isUnrestricted={table.isUnrestricted}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrototypeComponent>
  );
}
