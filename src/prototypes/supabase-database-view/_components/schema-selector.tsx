"use client";

import { Check, ChevronsUpDown } from "lucide-react";
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

import { MOCK_SCHEMAS } from "./supabase-database-view-mock-data";

type SchemaSelectorProps = {
  selectedSchemaName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSchema: (name: string) => void;
};

export function SchemaSelector({
  selectedSchemaName,
  open,
  onOpenChange,
  onSelectSchema,
}: SchemaSelectorProps) {
  return (
    <PrototypeComponent id="schema-selector" className="w-[180px]">
      <Popover open={open} onOpenChange={onOpenChange} modal={false}>
        <PopoverTrigger asChild>
          <Button
            size="tiny"
            variant="default"
            className="w-full [&>span]:w-full pr-1! space-x-1"
            iconRight={
              <ChevronsUpDown className="text-foreground-muted" strokeWidth={2} size={14} />
            }
          >
            <div className="w-full flex gap-1">
              <p className="text-foreground-lighter">schema</p>
              <p className="text-foreground">{selectedSchemaName}</p>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 min-w-[200px] pointer-events-auto"
          side="bottom"
          align="start"
          sameWidthAsTrigger
        >
          <Command>
            <CommandInput className="text-xs" placeholder="Find schema..." />
            <CommandList>
              <CommandEmpty>No schemas found</CommandEmpty>
              <CommandGroup>
                <ScrollArea className={MOCK_SCHEMAS.length > 7 ? "h-[210px]" : ""}>
                  {MOCK_SCHEMAS.map((schema) => (
                    <CommandItem
                      key={schema}
                      className="cursor-pointer flex items-center justify-between space-x-2 w-full"
                      onSelect={() => onSelectSchema(schema)}
                    >
                      <span>{schema}</span>
                      {selectedSchemaName === schema ? (
                        <Check className="text-brand" strokeWidth={2} size={16} />
                      ) : null}
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
