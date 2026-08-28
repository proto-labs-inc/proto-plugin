"use client";

import { BookOpen, Check, ChevronDown, ChevronsUpDown, Clock, Copy, Play, Search } from "lucide-react";
import { PrototypeComponent, usePrototypeProductOverlayPortal } from "proto-plugin";
import { useMemo, useState } from "react";
import {
  Button,
  Calendar,
  Card,
  cn,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetSection,
  SheetTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ui";

import {
  DATE_RANGE_HELPERS,
  FIELD_SCHEMAS,
  LOG_SOURCES,
  LOG_TEMPLATES,
  MOCK_LOG_ROWS,
} from "./supabase-logs-mock-data";
import type { LogsOverlay, SupabaseLogsLiveState } from "./supabase-logs-types";

const SQL_KEYWORDS = new Set([
  "select",
  "from",
  "limit",
  "where",
  "as",
  "left",
  "join",
  "unnest",
  "on",
  "true",
  "group",
  "by",
  "order",
  "desc",
  "and",
  "or",
  "cross",
  "count",
  "cast",
  "datetime",
]);

function highlightSqlLine(line: string) {
  const parts = line.split(/(\s+|,)/);
  return parts.map((part, index) => {
    if (/^\s+$/.test(part) || part === ",") {
      return (
        <span key={index} className="text-foreground-muted">
          {part}
        </span>
      );
    }
    if (SQL_KEYWORDS.has(part.toLowerCase())) {
      return (
        <span key={index} className="text-blue-1100">
          {part}
        </span>
      );
    }
    if (/^\d+$/.test(part)) {
      return (
        <span key={index} className="text-brand">
          {part}
        </span>
      );
    }
    return (
      <span key={index} className="text-foreground">
        {part}
      </span>
    );
  });
}

type LogsExplorerContentProps = {
  liveState: SupabaseLogsLiveState;
  onOverlayChange: (overlay: LogsOverlay) => void;
  onSelectSource: (source: string) => void;
  onSelectTemplate: (label: string) => void;
  onSelectDateRange: (text: string) => void;
  onFieldSourceChange: (reference: string) => void;
  onRun: () => void;
  onSqlChange: (sql: string) => void;
};

export function LogsExplorerContent({
  liveState,
  onOverlayChange,
  onSelectSource,
  onSelectTemplate,
  onSelectDateRange,
  onFieldSourceChange,
  onRun,
  onSqlChange,
}: LogsExplorerContentProps) {
  const portalContainer = usePrototypeProductOverlayPortal();
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [sourceSearchOpen, setSourceSearchOpen] = useState(false);

  const lines = liveState.sql.split("\n");
  const selectedSchema =
    FIELD_SCHEMAS.find((schema) => schema.reference === liveState.fieldSource) ?? FIELD_SCHEMAS[0];
  const resultCount = liveState.dataMode === "results" ? MOCK_LOG_ROWS.length : 0;

  const emptyState = useMemo(() => {
    if (liveState.dataMode === "error") {
      return (
        <div className="flex flex-col items-center justify-center gap-2 text-center h-full px-5">
          <h3 className="text-lg text-foreground">Add a LIMIT to your query</h3>
          <p className="text-sm max-w-sm text-foreground-lighter">
            Queries must include a LIMIT clause to avoid scanning large amounts of data. Add a LIMIT
            (for example, <span className="font-mono">LIMIT 100</span>) and run the query again.
          </p>
        </div>
      );
    }

    if (liveState.dataMode === "results") {
      return null;
    }

    return (
      <div className="flex scale-100 flex-col items-center justify-center gap-6 text-center opacity-100 h-full">
        <div className="flex flex-col gap-1 relative">
          <div className="relative flex h-4 w-32 items-center rounded-sm border border-dashed border-stronger px-2" />
          <div className="relative flex h-4 w-32 items-center rounded-sm border border-dashed border-stronger px-2" />
          <div className="relative flex h-4 w-32 items-center rounded-sm border border-dashed border-stronger px-2" />
          <Search size={30} className="absolute right-3 -bottom-2 text-foreground-lighter" />
        </div>
        <div className="flex flex-col gap-1 px-5">
          <h3 className="text-lg text-foreground">No results found</h3>
          <p className="text-sm max-w-xs text-foreground-lighter">
            Try another search or adjust the filters
          </p>
        </div>
      </div>
    );
  }, [liveState.dataMode]);

  return (
    <PrototypeComponent
      id="logs-explorer-content"
      className="h-full flex flex-col w-full xl:min-w-[600px] bg-dash-sidebar"
    >
      <div className="w-full h-full mx-auto flex flex-col min-h-0">
        <div className="flex flex-col w-full flex-1 min-h-0">
          <div className="flex items-center border-b bg-surface-100 h-(--header-height) shrink-0">
            <div className="flex w-full items-center justify-between px-4 md:px-5 py-2 overflow-x-scroll no-scrollbar">
              <div className="flex w-full flex-row items-center justify-between gap-x-4">
                <div className="flex items-center gap-2">
                  <DropdownMenu
                    open={liveState.overlay === "insert-source"}
                    onOpenChange={(open) => onOverlayChange(open ? "insert-source" : "none")}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button variant="default" size="tiny" iconRight={<ChevronDown />}>
                        Insert source
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="bottom"
                      align="start"
                      className="max-h-[390px] overflow-auto"
                    >
                      {LOG_SOURCES.map((source) => (
                        <DropdownMenuItem
                          key={source.name}
                          onClick={() => onSelectSource(source.name)}
                        >
                          <div className="grid gap-1">
                            <div className="font-mono font-bold">{source.name}</div>
                            <div className="text-foreground-light">{source.desc}</div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu
                    open={liveState.overlay === "templates"}
                    onOpenChange={(open) => onOverlayChange(open ? "templates" : "none")}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button variant="default" size="tiny" iconRight={<ChevronDown />}>
                        Templates
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="start">
                      {LOG_TEMPLATES.map((template) => (
                        <DropdownMenuItem
                          key={template.label}
                          onClick={() => onSelectTemplate(template.label)}
                        >
                          <p>{template.label}</p>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Popover
                    open={liveState.overlay === "date-picker"}
                    onOpenChange={(open) => onOverlayChange(open ? "date-picker" : "none")}
                  >
                    <PopoverTrigger asChild>
                      <Button variant="default" size="tiny" icon={<Clock size={12} />}>
                        {liveState.dateRangeText}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="flex w-full p-0" side="bottom" align="start">
                      <div className="border-r p-2 flex flex-col gap-px">
                        <Input
                          type="text"
                          placeholder="e.g. 2h, 30m, 7d"
                          className="mb-2 text-xs h-7 rounded-xs"
                        />
                        <RadioGroup
                          value={liveState.dateRangeText}
                          onValueChange={onSelectDateRange}
                          className="flex flex-col gap-px"
                        >
                          {DATE_RANGE_HELPERS.map((helper) => (
                            <Label
                              key={helper}
                              className="[&:has([data-state=checked])]:bg-background-overlay-hover [&:has([data-state=checked])]:text-foreground px-4 py-1.5 text-foreground-light flex items-center gap-2 hover:bg-background-overlay-hover hover:text-foreground transition-all rounded-xs text-xs w-full"
                            >
                              <RadioGroupItem hidden value={helper} />
                              {helper}
                            </Label>
                          ))}
                        </RadioGroup>
                      </div>
                      <div className="w-fit max-w-full">
                        <div className="border-t">
                          <Calendar mode="range" />
                        </div>
                        <div className="flex items-center justify-end gap-2 p-2 border-t">
                          <Button variant="default" size="tiny">
                            Today
                          </Button>
                          <Button
                            size="tiny"
                            onClick={() => onOverlayChange("none")}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="text"
                    size="tiny"
                    icon={<BookOpen />}
                    className="px-2"
                    onClick={() =>
                      onOverlayChange(
                        liveState.overlay === "field-reference" ? "none" : "field-reference",
                      )
                    }
                  >
                    <span>Field Reference</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex-1 min-h-0">
            {liveState.dataMode === "loading" ? (
              <div className="absolute inset-x-0 top-0 h-px overflow-hidden z-10">
                <div className="h-full w-1/3 bg-brand animate-pulse" />
              </div>
            ) : null}
            <div className="h-full w-full overflow-hidden bg-background flex pt-1">
              <div className="w-[57px] shrink-0 py-0 select-none">
                {lines.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-5 text-right pr-2 text-[13px] leading-5 font-mono text-foreground-muted",
                      index === lines.length - 1 && "text-foreground bg-surface-100",
                    )}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
              <textarea
                aria-label="Editor content"
                value={liveState.sql}
                onChange={(event) => onSqlChange(event.target.value)}
                spellCheck={false}
                className="absolute inset-0 opacity-0 caret-foreground"
              />
              <pre className="flex-1 overflow-auto font-mono text-[13px] leading-5">
                {lines.map((line, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-5 px-2 whitespace-pre",
                      index === lines.length - 1 && "bg-surface-100",
                    )}
                  >
                    {highlightSqlLine(line)}
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>

        <div className="h-px bg-border shrink-0" />

        <section className="flex w-full flex-col flex-1 min-h-0">
          <div className="flex w-full items-center justify-between border-t bg-surface-100 px-5 py-2 shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant="text"
                size="tiny"
                iconRight={<ChevronDown />}
                disabled={resultCount === 0}
              >
                {`Results ${resultCount ? `(${resultCount})` : ""}`}
              </Button>
            </div>
            <div className="gap-x-2 flex items-center">
              <Button
                title="run-logs-query"
                variant="primary"
                size="tiny"
                iconRight={<Play size={12} />}
                loading={liveState.dataMode === "loading"}
                onClick={onRun}
              >
                Run
              </Button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-auto">
            {liveState.dataMode === "results" ? (
              <div className="h-full min-h-0 overflow-auto">
                <div
                  className="grid text-[13px] font-mono tracking-tight"
                  style={{ gridTemplateColumns: "220px 1fr 1fr" }}
                >
                  <div className="h-7 px-3 flex items-center border-b border-default text-foreground-light">
                    timestamp
                  </div>
                  <div className="h-7 px-3 flex items-center border-b border-default text-foreground-light">
                    event_message
                  </div>
                  <div className="h-7 px-3 flex items-center border-b border-default text-foreground-light">
                    metadata
                  </div>
                  {MOCK_LOG_ROWS.map((row, index) => (
                    <PrototypeComponent
                      key={row.timestamp}
                      id={`logs-explorer-content.row.${index}`}
                      className="contents"
                    >
                      <div className="h-10 px-3 flex items-center border-b border-muted bg-studio hover:bg-surface-100 cursor-pointer truncate">
                        {row.timestamp}
                      </div>
                      <div className="h-10 px-3 flex items-center border-b border-muted bg-studio hover:bg-surface-100 cursor-pointer truncate">
                        {row.event_message}
                      </div>
                      <div className="h-10 px-3 flex items-center border-b border-muted bg-studio hover:bg-surface-100 cursor-pointer truncate text-foreground-light">
                        {row.metadata}
                      </div>
                    </PrototypeComponent>
                  ))}
                </div>
              </div>
            ) : (
              <div className={cn("h-full", liveState.dataMode === "loading" && "opacity-50")}>
                {emptyState}
              </div>
            )}
          </div>
        </section>
      </div>

      <Sheet
        open={liveState.overlay === "field-reference"}
        onOpenChange={(open) => onOverlayChange(open ? "field-reference" : "none")}
        modal={false}
      >
        <SheetContent
          size="lg"
          portalContainer={portalContainer}
          className="flex w-full flex-col gap-0 p-0"
        >
          <SheetHeader>
            <SheetTitle>Field Reference</SheetTitle>
            <SheetDescription>
              The following table shows all the available paths that can be queried from each
              respective source. Do note that to access nested keys, you would need to perform the
              necessary unnesting joins.
            </SheetDescription>
          </SheetHeader>
          <SheetSection className="flex flex-col gap-y-4 overflow-y-auto">
            <Popover open={sourceSearchOpen} onOpenChange={setSourceSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  role="combobox"
                  size="small"
                  aria-expanded={sourceSearchOpen}
                  className="w-full justify-between"
                  iconRight={<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
                >
                  {selectedSchema.name}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" sameWidthAsTrigger>
                <Command>
                  <CommandInput placeholder="Search source..." />
                  <CommandList>
                    <CommandEmpty>No source found.</CommandEmpty>
                    <CommandGroup>
                      {FIELD_SCHEMAS.map((schema) => (
                        <CommandItem
                          key={schema.reference}
                          value={schema.reference}
                          onSelect={() => {
                            onFieldSourceChange(schema.reference);
                            setSourceSearchOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedSchema.reference === schema.reference
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {schema.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Card className="overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs p-2!">Path</TableHead>
                    <TableHead className="text-xs p-2!">Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedSchema.fields.map((field) => (
                    <TableRow key={field.path}>
                      <TableCell
                        className="font-mono text-xs p-2! cursor-pointer hover:text-foreground transition flex items-center space-x-2"
                        onClick={() => {
                          setCopiedPath(field.path);
                          window.setTimeout(() => setCopiedPath(null), 2000);
                        }}
                      >
                        <span>{field.path}</span>
                        {copiedPath === field.path ? (
                          <Check size={14} strokeWidth={3} className="text-brand" />
                        ) : (
                          <Copy size={14} strokeWidth={1.5} />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs p-2!">{field.type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </SheetSection>
        </SheetContent>
      </Sheet>
    </PrototypeComponent>
  );
}
