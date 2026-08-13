"use client";

import { TableEditor } from "icons";
import {
  Copy,
  DiamondIcon,
  Edit,
  Fingerprint,
  Hash,
  Key,
  MoreVertical,
  Table2,
} from "lucide-react";
import { PrototypeComponent } from "proto-plugin";
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "ui";

import { TABLE_NODE_WIDTH } from "./supabase-database-view-mock-data";
import type { SchemaTable } from "./supabase-database-view-types";

type SchemaTableNodeProps = {
  table: SchemaTable;
  actionsOpen: boolean;
  onActionsOpenChange: (open: boolean) => void;
};

export function SchemaTableNode({
  table,
  actionsOpen,
  onActionsOpenChange,
}: SchemaTableNodeProps) {
  return (
    <PrototypeComponent
      id={`schema-table-node.${table.id}`}
      className="absolute"
      style={{ left: table.x, top: table.y, width: TABLE_NODE_WIDTH }}
    >
      <article>
        <div
          className="border-[0.5px] overflow-hidden rounded-[4px] shadow-xs"
          style={{ width: TABLE_NODE_WIDTH }}
        >
          <header className="text-[0.55rem] pl-2 pr-1 bg-alternative flex gap-2 items-center justify-between h-[22px]">
            <div className="min-w-0 flex shrink gap-x-1 items-center">
              <Table2 strokeWidth={1} size={12} className="text-light" />
              <span className="whitespace-nowrap overflow-hidden text-ellipsis" title={table.name}>
                {table.name}
              </span>
            </div>
            <DropdownMenu open={actionsOpen} onOpenChange={onActionsOpenChange}>
              <DropdownMenuTrigger asChild>
                <Button variant="text" className="px-0 w-[16px] h-[16px] rounded-sm">
                  <MoreVertical size={10} />
                  <span className="sr-only">{table.name} actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" className="w-40">
                <DropdownMenuItem className="flex items-center space-x-2 whitespace-nowrap">
                  <Edit size={12} />
                  <p>Edit table</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center space-x-2 whitespace-nowrap">
                  <TableEditor size={12} />
                  <p>View in Table Editor</p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center space-x-2 whitespace-nowrap">
                  <Copy size={12} />
                  <span>Copy name</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="space-x-2">
                  <Copy size={12} />
                  <span>Copy as SQL</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="space-x-2">
                  <Copy size={12} />
                  <span>Copy as Markdown</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {table.columns.map((column) => (
            <div
              key={column.id}
              className={cn(
                "text-[8px] leading-5 relative flex flex-row justify-items-start",
                "bg-surface-100",
                "border-t",
                "border-t-[0.5px]",
                "hover:bg-scale-500 transition cursor-default",
                "group",
                "pr-1",
                "h-[22px]",
              )}
            >
              <div
                className={cn(
                  "gap-[0.24rem] flex mx-2 align-middle items-center justify-start",
                  column.isPrimary && "basis-1/5",
                )}
              >
                {column.isPrimary ? (
                  <Key size={8} strokeWidth={1} className="shrink-0 text-light" />
                ) : null}
                {column.isNullable ? (
                  <DiamondIcon size={8} strokeWidth={1} className="shrink-0 text-light" />
                ) : (
                  <DiamondIcon
                    size={8}
                    strokeWidth={1}
                    fill="currentColor"
                    className="shrink-0 text-light"
                  />
                )}
                {column.isUnique ? (
                  <Fingerprint size={8} strokeWidth={1} className="shrink-0 text-light" />
                ) : null}
                {column.isIdentity ? (
                  <Hash size={8} strokeWidth={1} className="shrink-0 text-light" />
                ) : null}
              </div>
              <div className="flex w-full justify-between min-w-0">
                <span
                  className="text-ellipsis overflow-hidden whitespace-nowrap min-w-0 max-w-[80%]"
                  title={column.name}
                >
                  {column.name}
                </span>
                <span className="shrink-0 pl-2 pr-1 inline-flex justify-end font-mono text-lighter text-[0.4rem] group-hover:hidden">
                  {column.format}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="text"
                    className="opacity-0 focus:opacity-100 group-hover:opacity-100 data-open:opacity-100 absolute right-0 top-1/2 -translate-y-1/2 px-0 mr-1 w-[16px] h-[16px] rounded-sm"
                  >
                    <MoreVertical size={10} />
                    <span className="sr-only">
                      {table.name} {column.name} actions
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end" className="w-32">
                  <DropdownMenuItem className="space-x-2">
                    <Edit size={12} />
                    <p>Edit column</p>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="space-x-2">
                    <Copy size={12} />
                    <span>Copy name</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </article>
    </PrototypeComponent>
  );
}
