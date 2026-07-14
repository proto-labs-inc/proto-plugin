import type { DesignExplorationRationale } from "proto-plugin";
import { PrototypeComponent } from "proto-plugin";
import {
  FilterX,
  Table2,
  Upload,
} from "lucide-react";
import { Button, cn } from "ui";

import type { TableEditorActiveFilter, TableEditorDataMode } from "./table-editor-filters-types";

export type GridEmptyStateVariant =
  | "illustration-card"
  | "drop-zone"
  | "filter-context"
  | "step-guide"
  | "split-actions"
  | "centered-copy";

export const GRID_EMPTY_STATE_COPY = {
  filtered: {
    title: "No matching rows",
    body: "The filters applied have returned no results from this table",
    primaryLabel: "Remove all filters",
  },
  empty: {
    title: "This table is empty",
    body: "Add rows manually or import a CSV to populate this table.",
    primaryLabel: "Import data from CSV",
    secondaryHint: "or drag and drop a CSV file here",
  },
} as const;

export const GRID_EMPTY_STATE_VARIANT_OPTIONS: Array<{
  value: GridEmptyStateVariant;
  label: string;
  hint?: string;
  rationale?: DesignExplorationRationale;
}> = [
  {
    value: "illustration-card",
    label: "Illustration card",
    hint: "Bordered card with icon, headline, supporting copy, and stacked actions",
    rationale: {
      good: "Groups empty-state content into a scannable panel that reads clearly over the grid.",
      bad: "Adds chrome weight and can feel heavy on dense table layouts.",
    },
  },
  {
    value: "drop-zone",
    label: "Drop zone",
    hint: "Dashed upload target with import CTA — filter-aware copy when filters are active",
    rationale: {
      good: "Makes CSV import the hero affordance and reinforces drag-and-drop for empty tables.",
      bad: "Less relevant when the table has data but filters return zero rows.",
    },
  },
  {
    value: "filter-context",
    label: "Filter context",
    hint: "Shows the active filter chip above explanation and a clear-filters action",
    rationale: {
      good: "Ties the empty result directly to what the user applied — reduces confusion.",
      bad: "Only applies to filtered-empty; empty-table needs a different message path.",
    },
  },
  {
    value: "step-guide",
    label: "Step guide",
    hint: "Numbered getting-started steps with a primary CTA at the bottom",
    rationale: {
      good: "Educates first-time users on multiple ways to add data beyond a single button.",
      bad: "Longer copy pushes actions below the fold on short viewports.",
    },
  },
  {
    value: "split-actions",
    label: "Split actions",
    hint: "Headline and body on the left with primary and secondary actions on the right",
    rationale: {
      good: "Uses horizontal space efficiently and surfaces a secondary path beside the main CTA.",
      bad: "Wraps awkwardly in narrow grid columns and mobile preview frames.",
    },
  },
];

export const GRID_EMPTY_STATE_BASELINE = {
  value: "centered-copy" as const satisfies GridEmptyStateVariant,
  label: "Centered copy",
  hint: "Single line of copy with one primary button — current table editor empty state",
  rationale: {
    good: "Minimal and familiar — stays out of the way when the grid headers carry context.",
    bad: "Offers little guidance beyond the one action; filter context is easy to miss.",
  },
};

export const DEFAULT_GRID_EMPTY_STATE_VARIANT: GridEmptyStateVariant =
  GRID_EMPTY_STATE_VARIANT_OPTIONS[0].value;

function FilterChip({ filter }: { filter: TableEditorActiveFilter }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-default bg-surface-200 px-2 py-1 text-xs text-foreground">
      <span className="text-foreground-light">{filter.column}</span>
      <span className="text-foreground-lighter">{filter.operator}</span>
      <span className="font-medium">{filter.value}</span>
    </span>
  );
}

type GridEmptyStateBlockProps = {
  variant: GridEmptyStateVariant;
  dataMode: TableEditorDataMode;
  activeFilter?: TableEditorActiveFilter | null;
  onRemoveFilters: () => void;
  onImportData: () => void;
  className?: string;
};

export function GridEmptyStateBlock({
  variant,
  dataMode,
  activeFilter = null,
  onRemoveFilters,
  onImportData,
  className,
}: GridEmptyStateBlockProps) {
  const isFiltered = dataMode === "filtered-empty";
  const copy = isFiltered ? GRID_EMPTY_STATE_COPY.filtered : GRID_EMPTY_STATE_COPY.empty;

  const content = renderGridEmptyStateContent({
    variant,
    isFiltered,
    activeFilter,
    copy,
    className,
    onRemoveFilters,
    onImportData,
  });

  return (
    <PrototypeComponent id="grid-empty-state-content.grid-empty-state-block">
      {content}
    </PrototypeComponent>
  );
}

function renderGridEmptyStateContent({
  variant,
  isFiltered,
  activeFilter,
  copy,
  className,
  onRemoveFilters,
  onImportData,
}: {
  variant: GridEmptyStateVariant;
  isFiltered: boolean;
  activeFilter: TableEditorActiveFilter | null;
  copy: (typeof GRID_EMPTY_STATE_COPY)[keyof typeof GRID_EMPTY_STATE_COPY];
  className?: string;
  onRemoveFilters: () => void;
  onImportData: () => void;
}) {
  if (variant === "centered-copy") {
    if (isFiltered) {
      return (
        <div className={className}>
          <p className="text-sm text-light pointer-events-auto">{copy.body}</p>
          <div className="mt-4 flex items-center space-x-2">
            <Button
              type="button"
              variant="default"
              className="pointer-events-auto"
              onClick={onRemoveFilters}
            >
              {copy.primaryLabel}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className={className}>
        <p className="text-sm text-light pointer-events-auto">{copy.title}</p>
        <div className="mt-4 flex flex-col items-center gap-4">
          <Button
            type="button"
            variant="default"
            className="pointer-events-auto"
            onClick={onImportData}
          >
            {copy.primaryLabel}
          </Button>
          <p className="text-xs text-foreground-light pointer-events-auto">
            {GRID_EMPTY_STATE_COPY.empty.secondaryHint}
          </p>
        </div>
      </div>
    );
  }

  if (variant === "illustration-card") {
    const Icon = isFiltered ? FilterX : Table2;

    return (
      <div
        className={cn(
          "pointer-events-auto flex max-w-sm flex-col items-center rounded-lg border border-default bg-surface-100 px-6 py-8 text-center shadow-sm",
          className,
        )}
      >
        <span className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-surface-200 text-foreground-light">
          <Icon size={22} strokeWidth={1.5} />
        </span>
        <p className="text-sm font-medium text-foreground">{copy.title}</p>
        <p className="mt-2 text-sm text-light">{isFiltered ? copy.body : copy.body}</p>
        <div className="mt-5 flex flex-col items-center gap-2">
          <Button
            type="button"
            variant="default"
            onClick={isFiltered ? onRemoveFilters : onImportData}
          >
            {copy.primaryLabel}
          </Button>
          {!isFiltered ? (
            <p className="text-xs text-foreground-light">
              {GRID_EMPTY_STATE_COPY.empty.secondaryHint}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  if (variant === "drop-zone") {
    return (
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-md flex-col items-center rounded-lg border border-dashed border-strong bg-surface-100/80 px-6 py-10 text-center",
          className,
        )}
      >
        <span className="mb-3 inline-flex size-10 items-center justify-center rounded-md bg-surface-200 text-foreground-light">
          {isFiltered ? <FilterX size={18} strokeWidth={1.5} /> : <Upload size={18} strokeWidth={1.5} />}
        </span>
        <p className="text-sm font-medium text-foreground">{copy.title}</p>
        <p className="mt-2 max-w-xs text-sm text-light">
          {isFiltered
            ? copy.body
            : "Drop a CSV file here or use the button below to import rows."}
        </p>
        <Button
          type="button"
          variant="default"
          className="mt-5"
          onClick={isFiltered ? onRemoveFilters : onImportData}
        >
          {copy.primaryLabel}
        </Button>
      </div>
    );
  }

  if (variant === "filter-context") {
    if (isFiltered) {
      return (
        <div className={cn("pointer-events-auto flex max-w-md flex-col items-center gap-4 text-center", className)}>
          {activeFilter ? <FilterChip filter={activeFilter} /> : null}
          <div>
            <p className="text-sm font-medium text-foreground">{copy.title}</p>
            <p className="mt-1 text-sm text-light">{copy.body}</p>
          </div>
          <Button type="button" variant="default" onClick={onRemoveFilters}>
            {copy.primaryLabel}
          </Button>
        </div>
      );
    }

    return (
      <div className={cn("pointer-events-auto flex max-w-md flex-col items-center gap-3 text-center", className)}>
        <p className="text-sm font-medium text-foreground">{copy.title}</p>
        <p className="text-sm text-light">{copy.body}</p>
        <Button type="button" variant="default" onClick={onImportData}>
          {copy.primaryLabel}
        </Button>
        <p className="text-xs text-foreground-light">
          {GRID_EMPTY_STATE_COPY.empty.secondaryHint}
        </p>
      </div>
    );
  }

  if (variant === "step-guide") {
    const steps = isFiltered
      ? [
          "Review the active filter chip in the toolbar",
          "Broaden or remove filter conditions",
          "Refresh the grid to see matching rows",
        ]
      : [
          "Import a CSV with column headers that match this table",
          "Insert rows manually from the grid toolbar",
          "Connect an API or edge function to sync data",
        ];

    return (
      <div
        className={cn(
          "pointer-events-auto w-full max-w-md rounded-lg border border-default bg-surface-100 px-5 py-6",
          className,
        )}
      >
        <p className="text-sm font-medium text-foreground">{copy.title}</p>
        <ol className="mt-4 space-y-3 text-left">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm text-light">
              <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-200 text-[11px] font-medium text-foreground">
                {index + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-5 flex justify-center">
          <Button
            type="button"
            variant="default"
            onClick={isFiltered ? onRemoveFilters : onImportData}
          >
            {copy.primaryLabel}
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "split-actions") {
    return (
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-lg flex-col items-start gap-4 rounded-lg border border-default bg-surface-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between",
          className,
        )}
      >
        <div className="min-w-0 text-left">
          <p className="text-sm font-medium text-foreground">{copy.title}</p>
          <p className="mt-1 text-sm text-light">
            {isFiltered ? copy.body : copy.body}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          {!isFiltered ? (
            <Button type="button" variant="outline" onClick={onImportData}>
              Insert row
            </Button>
          ) : (
            <Button type="button" variant="link" onClick={onRemoveFilters}>
              Clear filters
            </Button>
          )}
          <Button
            type="button"
            variant="default"
            onClick={isFiltered ? onRemoveFilters : onImportData}
          >
            {copy.primaryLabel}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
