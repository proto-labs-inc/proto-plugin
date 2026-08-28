"use client";

import { Search } from "lucide-react";
import { PrototypeComponent } from "proto-plugin";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
} from "ui";

import { PUBLIC_SCHEMA_TABLES } from "./supabase-database-view-mock-data";

type FindTableSelectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (tableId: string) => void;
};

export function FindTableSelector({ open, onOpenChange, onSelect }: FindTableSelectorProps) {
  return (
    <PrototypeComponent id="find-table-selector">
      <Popover open={open} onOpenChange={onOpenChange} modal={false}>
        <PopoverTrigger asChild>
          <Button
            size="tiny"
            variant="default"
            icon={<Search size={14} strokeWidth={1.5} className="text-foreground-muted" />}
          >
            <span className="text-foreground-lighter">Find table…</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[260px] pointer-events-auto" side="bottom" align="start">
          <Command>
            <CommandInput className="text-xs" placeholder="Find table…" />
            <CommandList>
              <CommandEmpty>No tables found</CommandEmpty>
              <CommandGroup>
                <ScrollArea className={PUBLIC_SCHEMA_TABLES.length > 7 ? "h-[210px]" : ""}>
                  {PUBLIC_SCHEMA_TABLES.map((table) => (
                    <CommandItem
                      key={table.id}
                      value={table.name}
                      className="cursor-pointer flex items-center justify-between space-x-2 w-full"
                      onSelect={() => onSelect(table.id)}
                    >
                      <span>{table.name}</span>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </PrototypeComponent>
  );
}
