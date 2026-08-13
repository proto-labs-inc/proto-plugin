"use client";

import { Check, ChevronDown, Copy, Download, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@prototype/components/ui/dialog";
import { PrototypeComponent } from "proto-plugin";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "ui";
import { Admonition } from "ui-patterns/admonition";

import { FindTableSelector } from "./find-table-selector";
import { SchemaGraphLegend } from "./schema-graph-legend";
import { SchemaSelector } from "./schema-selector";
import { SchemaTableNode } from "./schema-table-node";
import {
  GRAPH_VIEWPORT,
  MINIMAP_GHOST_TABLES,
  PUBLIC_SCHEMA_EDGES,
  PUBLIC_SCHEMA_TABLES,
  TABLE_HEADER_HEIGHT,
  TABLE_NODE_WIDTH,
  TABLE_ROW_HEIGHT,
  tableHeight,
} from "./supabase-database-view-mock-data";
import type { SupabaseDatabaseViewLiveState } from "./supabase-database-view-types";

const LOCKED_SCHEMAS = new Set(["auth", "storage", "extensions", "graphql_public", "realtime"]);
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const DOT_SIZE = 16;

type GraphViewport = {
  x: number;
  y: number;
  zoom: number;
};

function clampZoom(zoom: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

function zoomAtPoint(viewport: GraphViewport, point: { x: number; y: number }, nextZoom: number): GraphViewport {
  const zoom = clampZoom(nextZoom);
  return {
    x: point.x - ((point.x - viewport.x) / viewport.zoom) * zoom,
    y: point.y - ((point.y - viewport.y) / viewport.zoom) * zoom,
    zoom,
  };
}

function isCanvasChrome(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest("article") ||
      target.closest("button") ||
      target.closest("[data-schema-minimap]") ||
      target.closest("[data-schema-legend]"),
  );
}

type SchemaVisualizerProps = {
  liveState: SupabaseDatabaseViewLiveState;
  onSchemaSelectorOpenChange: (open: boolean) => void;
  onSelectSchema: (name: string) => void;
  onFindTableOpenChange: (open: boolean) => void;
  onSelectTable: (tableId: string) => void;
  onExportMenuOpenChange: (open: boolean) => void;
  onAutoLayoutOpenChange: (open: boolean) => void;
  onTableActionsOpenChange: (tableId: string | null) => void;
};

function columnCenterY(tableId: string, columnId: string) {
  const table = PUBLIC_SCHEMA_TABLES.find((item) => item.id === tableId);
  if (!table) return 0;
  const index = table.columns.findIndex((column) => column.id === columnId);
  return table.y + TABLE_HEADER_HEIGHT + (Math.max(index, 0) + 0.5) * TABLE_ROW_HEIGHT;
}

function edgePath(sourceTableId: string, sourceColumnId: string, targetTableId: string, targetColumnId: string) {
  const source = PUBLIC_SCHEMA_TABLES.find((item) => item.id === sourceTableId);
  const target = PUBLIC_SCHEMA_TABLES.find((item) => item.id === targetTableId);
  if (!source || !target) return "";
  const sx = source.x + TABLE_NODE_WIDTH;
  const sy = columnCenterY(sourceTableId, sourceColumnId);
  const tx = target.x;
  const ty = columnCenterY(targetTableId, targetColumnId);
  const midX = (sx + tx) / 2;
  return `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${ty} L ${tx} ${ty}`;
}

function SchemaMinimap({
  viewport,
  canvasSize,
}: {
  viewport: GraphViewport;
  canvasSize: { width: number; height: number };
}) {
  const bounds = useMemo(() => {
    const nodes = [
      ...PUBLIC_SCHEMA_TABLES.map((table) => ({
        x: table.x,
        y: table.y,
        width: TABLE_NODE_WIDTH,
        height: tableHeight(table),
      })),
      ...MINIMAP_GHOST_TABLES.map((ghost) => ({
        x: ghost.x,
        y: ghost.y,
        width: TABLE_NODE_WIDTH,
        height: ghost.height,
      })),
    ];
    const minX = Math.min(...nodes.map((node) => node.x));
    const minY = Math.min(...nodes.map((node) => node.y));
    const maxX = Math.max(...nodes.map((node) => node.x + node.width));
    const maxY = Math.max(...nodes.map((node) => node.y + node.height));
    return { minX, minY, maxX, maxY, nodes };
  }, []);

  const width = 200;
  const height = 150;
  const scale = Math.min(width / (bounds.maxX - bounds.minX), height / (bounds.maxY - bounds.minY));
  const viewX = -viewport.x / viewport.zoom;
  const viewY = -viewport.y / viewport.zoom;
  const viewW = canvasSize.width / viewport.zoom;
  const viewH = canvasSize.height / viewport.zoom;

  return (
    <div
      data-schema-minimap
      className="absolute right-2 bottom-0 border rounded-md shadow-xs mb-11! overflow-hidden bg-background z-10"
    >
      <div className="relative" style={{ width, height }}>
        {bounds.nodes.map((node, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              left: (node.x - bounds.minX) * scale,
              top: (node.y - bounds.minY) * scale,
              width: node.width * scale,
              height: node.height * scale,
              background: "#111318",
            }}
          />
        ))}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "rgb(237, 237, 237, .8)" }}
        />
        <div
          className="absolute border border-foreground pointer-events-none"
          style={{
            left: (viewX - bounds.minX) * scale,
            top: (viewY - bounds.minY) * scale,
            width: Math.max(viewW * scale, 8),
            height: Math.max(viewH * scale, 8),
          }}
        />
      </div>
    </div>
  );
}

export function SchemaVisualizer({
  liveState,
  onSchemaSelectorOpenChange,
  onSelectSchema,
  onFindTableOpenChange,
  onSelectTable,
  onExportMenuOpenChange,
  onAutoLayoutOpenChange,
  onTableActionsOpenChange,
}: SchemaVisualizerProps) {
  const [copied, setCopied] = useState(false);
  const [viewport, setViewport] = useState<GraphViewport>(GRAPH_VIEWPORT);
  const [isPanning, setIsPanning] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 649, height: 775 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; lastX: number; lastY: number } | null>(null);
  const showTables = liveState.dataMode === "populated";
  const isLockedSchema = LOCKED_SCHEMAS.has(liveState.selectedSchema);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setCanvasSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [showTables]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      const factor = event.deltaMode === 1 ? 20 : 1;
      setViewport((current) =>
        zoomAtPoint(current, point, current.zoom * 2 ** (-event.deltaY * factor * 0.002)),
      );
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [showTables]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || isCanvasChrome(event.target)) return;
    dragRef.current = { pointerId: event.pointerId, lastX: event.clientX, lastY: event.clientY };
    setIsPanning(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.lastX;
    const dy = event.clientY - drag.lastY;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    setViewport((current) => ({ ...current, x: current.x + dx, y: current.y + dy }));
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsPanning(false);
  };

  const handleSelectTable = (tableId: string) => {
    const table = PUBLIC_SCHEMA_TABLES.find((item) => item.id === tableId);
    const canvas = canvasRef.current;
    if (table && canvas) {
      const rect = canvas.getBoundingClientRect();
      setViewport((current) => ({
        x: rect.width / 2 - (table.x + TABLE_NODE_WIDTH / 2) * current.zoom,
        y: rect.height / 2 - (table.y + tableHeight(table) / 2) * current.zoom,
        zoom: current.zoom,
      }));
    }
    onSelectTable(tableId);
  };

  return (
    <PrototypeComponent id="schema-visualizer" className="flex flex-col h-full w-full min-w-0 bg-dash-canvas">
      <div className="flex items-center justify-between p-4 border-b border-muted h-(--header-height)">
        <div className="flex items-center gap-x-2">
          <SchemaSelector
            selectedSchemaName={liveState.selectedSchema}
            open={liveState.schemaSelectorOpen}
            onOpenChange={onSchemaSelectorOpenChange}
            onSelectSchema={onSelectSchema}
          />
          {showTables ? (
            <FindTableSelector
              open={liveState.findTableOpen}
              onOpenChange={onFindTableOpenChange}
              onSelect={handleSelectTable}
            />
          ) : null}
        </div>
        {showTables ? (
          <div className="flex items-center gap-x-2">
            <div className="flex items-center gap-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    className="rounded-r-none border-r-0"
                    icon={copied ? <Check /> : <Copy />}
                    onClick={() => {
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 1600);
                    }}
                  >
                    Copy as SQL
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <div className="max-w-[180px] space-y-2 text-foreground-light">
                    <p className="text-foreground">Note</p>
                    <p>
                      This schema is for context or debugging only. Table order and constraints may
                      be invalid. Not meant to be run as-is.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
              <DropdownMenu open={liveState.exportMenuOpen} onOpenChange={onExportMenuOpenChange}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    size="tiny"
                    className="rounded-l-none pl-1 pr-0"
                    icon={<ChevronDown size={12} />}
                  >
                    <span className="sr-only">Export options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem className="flex items-center space-x-2 whitespace-nowrap">
                    <Copy size={12} />
                    <span>Copy as Markdown</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center space-x-2 whitespace-nowrap">
                    <Download size={12} />
                    <span>Download as PNG</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center space-x-2 whitespace-nowrap">
                    <Download size={12} />
                    <span>Download as SVG</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button variant="default" onClick={() => onAutoLayoutOpenChange(true)}>
              Auto layout
            </Button>
          </div>
        ) : null}
      </div>

      {liveState.dataMode === "loading" ? (
        <div className="w-full h-full flex items-center justify-center gap-x-2">
          <Loader2 className="animate-spin text-foreground-light" size={16} />
          <p className="text-sm text-foreground-light">Loading tables</p>
        </div>
      ) : null}

      {liveState.dataMode === "error" ? (
        <div className="w-full h-full flex items-center justify-center px-20">
          <Admonition
            type="warning"
            title="Failed to retrieve tables"
            description="Try refreshing your browser, but if the issue persists for more than a few minutes, please reach out to us via support."
            actions={
              <Button type="button" variant="default" className="w-min">
                Contact support
              </Button>
            }
          />
        </div>
      ) : null}

      {liveState.dataMode === "empty" ? (
        <div className="flex items-center justify-center w-full h-full">
          <Admonition
            type="default"
            className="max-w-md"
            title="No tables in schema"
            description={
              isLockedSchema
                ? `The “${liveState.selectedSchema}” schema is managed by Supabase and is read-only through the dashboard.`
                : `The “${liveState.selectedSchema}” schema doesn’t have any tables.`
            }
          />
        </div>
      ) : null}

      {showTables ? (
        <div
          ref={canvasRef}
          className={cn(
            "relative w-full h-full overflow-hidden overscroll-none",
            isPanning ? "cursor-grabbing select-none" : "cursor-grab",
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--border) 0.85px, transparent 0.85px)",
              backgroundSize: `${DOT_SIZE * viewport.zoom}px ${DOT_SIZE * viewport.zoom}px`,
              backgroundPosition: `${viewport.x}px ${viewport.y}px`,
            }}
          />
          <div
            className="absolute inset-0 origin-top-left"
            style={{
              transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            }}
          >
            <svg
              className="absolute overflow-visible pointer-events-none"
              width={1}
              height={1}
              style={{ overflow: "visible" }}
            >
              {PUBLIC_SCHEMA_EDGES.map((edge) => (
                <path
                  key={edge.id}
                  d={edgePath(
                    edge.sourceTableId,
                    edge.sourceColumnId,
                    edge.targetTableId,
                    edge.targetColumnId,
                  )}
                  fill="none"
                  stroke="var(--border-stronger)"
                  strokeWidth={1.25}
                />
              ))}
            </svg>
            {PUBLIC_SCHEMA_TABLES.map((table) => (
              <SchemaTableNode
                key={table.id}
                table={table}
                actionsOpen={liveState.tableActionsTableId === table.id}
                onActionsOpenChange={(open) =>
                  onTableActionsOpenChange(open ? table.id : null)
                }
              />
            ))}
          </div>
          <SchemaMinimap viewport={viewport} canvasSize={canvasSize} />
          <div data-schema-legend>
            <SchemaGraphLegend />
          </div>
        </div>
      ) : null}

      <Dialog
        open={liveState.autoLayoutOpen}
        onOpenChange={onAutoLayoutOpenChange}
        modal={false}
      >
        <DialogContent portalScope="viewport" showCloseButton={false} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm to rearrange all nodes</DialogTitle>
            <DialogDescription>
              Auto layout will rearrange all nodes in the graph. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="default" onClick={() => onAutoLayoutOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => onAutoLayoutOpenChange(false)}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PrototypeComponent>
  );
}
