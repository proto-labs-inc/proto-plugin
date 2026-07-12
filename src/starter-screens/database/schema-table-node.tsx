import type { CSSProperties } from "react";
import {
  DiamondIcon,
  Fingerprint,
  Hash,
  Key,
  Table2,
} from "lucide-react";
import { cn } from "ui";

import type { SchemaColumn } from "./mock-data";

function ColumnIcon({ column }: { column: SchemaColumn }) {
  if (column.isPrimary) {
    return <Key size={8} strokeWidth={1} className="shrink-0 text-light" />;
  }
  if (column.isIdentity) {
    return <Hash size={8} strokeWidth={1} className="shrink-0 text-light" />;
  }
  if (column.isUnique) {
    return <Fingerprint size={8} strokeWidth={1} className="shrink-0 text-light" />;
  }
  if (column.isNullable) {
    return <DiamondIcon size={8} strokeWidth={1} className="shrink-0 text-light" />;
  }
  return (
    <DiamondIcon
      size={8}
      strokeWidth={1}
      fill="currentColor"
      className="shrink-0 text-light"
    />
  );
}

export function SchemaTableNode({
  name,
  columns,
  className,
  style,
}: {
  name: string;
  columns: SchemaColumn[];
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <article className={cn("absolute", className)} style={style}>
      <div
        className="border-[0.5px] overflow-hidden rounded-[4px] shadow-xs bg-surface-100"
        style={{ width: 160 }}
      >
        <header className="text-[0.55rem] pl-2 pr-1 bg-alternative flex gap-2 items-center justify-between h-[22px]">
          <div className="min-w-0 flex shrink gap-x-1 items-center">
            <Table2 strokeWidth={1} size={12} className="text-light" />
            <span className="whitespace-nowrap overflow-hidden text-ellipsis" title={name}>
              {name}
            </span>
          </div>
        </header>

        {columns.map((column) => (
          <div
            key={column.name}
            className={cn(
              "text-[8px] leading-5 relative flex flex-row justify-items-start",
              "bg-surface-100 border-t border-t-[0.5px] pr-1 h-[22px]",
            )}
          >
            <div className="gap-[0.24rem] flex mx-2 align-middle items-center justify-start">
              <ColumnIcon column={column} />
            </div>
            <div className="flex w-full justify-between min-w-0">
              <span className="text-ellipsis overflow-hidden whitespace-nowrap min-w-0 max-w-[80%]">
                {column.name}
              </span>
              <span className="shrink-0 pl-2 pr-1 inline-flex justify-end font-mono text-lighter text-[0.4rem]">
                {column.format}
              </span>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
