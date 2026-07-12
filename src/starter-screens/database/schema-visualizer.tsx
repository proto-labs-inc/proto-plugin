import {
  ChevronDown,
  Copy,
  DiamondIcon,
  Fingerprint,
  Hash,
  Key,
  Search,
} from "lucide-react";
import { Button, Input, cn } from "ui";

import { MOCK_SCHEMA_TABLES } from "./mock-data";
import { SchemaTableNode } from "./schema-table-node";

function SchemaGraphLegend() {
  return (
    <div className="absolute bottom-0 left-0 border-t flex justify-center px-1 py-2 shadow-md bg-surface-100 w-full z-10">
      <ul className="flex flex-wrap items-center justify-center gap-4">
        <li className="flex items-center text-xs font-mono gap-1">
          <Key size={15} strokeWidth={1.5} className="shrink-0 text-light" />
          Primary key
        </li>
        <li className="flex items-center text-xs font-mono gap-1">
          <Hash size={15} strokeWidth={1.5} className="shrink-0 text-light" />
          Identity
        </li>
        <li className="flex items-center text-xs font-mono gap-1">
          <Fingerprint size={15} strokeWidth={1.5} className="shrink-0 text-light" />
          Unique
        </li>
        <li className="flex items-center text-xs font-mono gap-1">
          <DiamondIcon size={15} strokeWidth={1.5} className="shrink-0 text-light" />
          Nullable
        </li>
        <li className="flex items-center text-xs font-mono gap-1">
          <DiamondIcon
            size={15}
            strokeWidth={1.5}
            fill="currentColor"
            className="shrink-0 text-light"
          />
          Non-Nullable
        </li>
      </ul>
    </div>
  );
}

function SchemaMiniMap() {
  return (
    <div className="absolute bottom-12 right-4 z-10 w-28 h-20 border rounded-md shadow-xs bg-surface-100 overflow-hidden">
      <div className="relative w-full h-full opacity-60">
        {MOCK_SCHEMA_TABLES.map((table) => (
          <div
            key={table.name}
            className="absolute rounded-[1px] bg-[#111318]"
            style={{
              left: `${(table.x / 900) * 100}%`,
              top: `${(table.y / 500) * 100}%`,
              width: 12,
              height: 8,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function SchemaVisualizer() {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-dash-canvas">
      <div className="flex items-center justify-between gap-x-2 border-b border-default px-4 py-2">
        <div className="flex items-center gap-x-2">
          <Button
            type="button"
            variant="default"
            size="tiny"
            className="w-[180px] justify-between text-xs px-2.5 py-1 h-[26px]"
            iconRight={<ChevronDown size={12} />}
          >
            <span className="flex gap-1">
              <span className="text-foreground-lighter">schema</span>
              <span className="text-foreground">public</span>
            </span>
          </Button>

          <label className="relative">
            <span className="sr-only">Find table</span>
            <Input
              placeholder="Find table..."
              className="w-[180px] rounded-sm h-[26px] text-xs pl-7"
              readOnly
            />
            <Search
              size={14}
              strokeWidth={1.5}
              className="absolute left-2 top-0 bottom-0 my-auto text-foreground-muted"
            />
          </label>
        </div>

        <div className="flex items-center gap-x-2">
          <div className="flex items-center gap-0">
            <Button
              type="button"
              variant="default"
              size="tiny"
              className="rounded-r-none border-r-0 text-xs px-2.5 py-1 h-[26px]"
              icon={<Copy size={14} />}
            >
              Copy as SQL
            </Button>
            <Button
              type="button"
              variant="default"
              size="tiny"
              className="rounded-l-none pl-1 pr-0 h-[26px]"
              icon={<ChevronDown size={12} />}
            >
              <span className="sr-only">Export options</span>
            </Button>
          </div>
          <Button type="button" variant="default" size="tiny" className="text-xs px-2.5 py-1 h-[26px]">
            Auto layout
          </Button>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--foreground-muted) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[1]">
          <path
            d="M 200 120 C 280 120, 320 120, 360 120"
            fill="none"
            stroke="var(--border-stronger)"
            strokeWidth="1"
          />
          <path
            d="M 440 120 C 500 120, 540 120, 600 120"
            fill="none"
            stroke="var(--border-stronger)"
            strokeWidth="1"
          />
          <path
            d="M 120 220 C 120 250, 120 270, 120 280"
            fill="none"
            stroke="var(--border-stronger)"
            strokeWidth="1"
          />
          <path
            d="M 360 120 C 360 200, 360 240, 360 280"
            fill="none"
            stroke="var(--border-stronger)"
            strokeWidth="1"
          />
          <path
            d="M 600 220 C 680 220, 720 220, 760 220"
            fill="none"
            stroke="var(--border-stronger)"
            strokeWidth="1"
          />
          <path
            d="M 680 360 C 720 360, 740 360, 760 360"
            fill="none"
            stroke="var(--border-stronger)"
            strokeWidth="1"
          />
        </svg>

        <div className="absolute inset-0 z-[2]">
          {MOCK_SCHEMA_TABLES.map((table) => (
            <SchemaTableNode
              key={table.name}
              name={table.name}
              columns={table.columns}
              style={{ left: table.x, top: table.y }}
            />
          ))}
        </div>

        <SchemaMiniMap />
        <SchemaGraphLegend />
      </div>
    </div>
  );
}
