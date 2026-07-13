import type { DesignExplorationRationale } from "proto-plugin";
import { PrototypeComponent } from "proto-plugin";
import { AlertTriangle, LifeBuoy, RefreshCw } from "lucide-react";
import { Button, cn } from "ui";
import { Admonition } from "ui-patterns/admonition";

export type GridErrorStateVariant =
  | "support-primary"
  | "diagnostic-panel"
  | "illustration-card"
  | "split-actions"
  | "inline-admonition"
  | "warning-banner";

export const GRID_ERROR_STATE_COPY = {
  title: "Failed to load table data",
  errorMessage: "permission denied for table employees",
  instructions:
    "Try refreshing your browser, but if the issue persists for more than a few minutes, please reach out to us via support.",
  retryLabel: "Refresh",
  supportLabel: "Contact support",
} as const;

export const GRID_ERROR_STATE_VARIANT_OPTIONS: Array<{
  value: GridErrorStateVariant;
  label: string;
  hint?: string;
  rationale?: DesignExplorationRationale;
}> = [
  {
    value: "support-primary",
    label: "Support primary",
    hint: "Contact support as the main CTA with refresh as a secondary outline action",
    rationale: {
      good: "Signals persistent permission errors need human help — matches AlertError guidance.",
      bad: "Over-emphasizes support for transient network blips where retry alone would suffice.",
    },
  },
  {
    value: "diagnostic-panel",
    label: "Diagnostic panel",
    hint: "Monospace error detail, numbered troubleshooting steps, and stacked actions",
    rationale: {
      good: "Helps power users self-serve with the exact Postgres error and clear next steps.",
      bad: "Feels technical and dense for casual table editors.",
    },
  },
  {
    value: "illustration-card",
    label: "Illustration card",
    hint: "Centered card with warning icon, headline, error line, and retry + support buttons",
    rationale: {
      good: "Visually separates the error from grid chrome — easy to scan over column headers.",
      bad: "Adds visual weight similar to empty-state cards; may compete with toolbar context.",
    },
  },
  {
    value: "split-actions",
    label: "Split actions",
    hint: "Copy block on the left with retry and contact support aligned on the right",
    rationale: {
      good: "Uses horizontal space efficiently on wide table layouts.",
      bad: "Wraps awkwardly in narrow preview frames and mobile widths.",
    },
  },
  {
    value: "inline-admonition",
    label: "Inline admonition",
    hint: "AlertError-style warning admonition with error line, instructions, and support CTA",
    rationale: {
      good: "Aligns with existing dashboard AlertError patterns used in logs and data tables.",
      bad: "Less visually distinct than a centered card when floating over an empty grid.",
    },
  },
];

export const GRID_ERROR_STATE_BASELINE = {
  value: "warning-banner" as const satisfies GridErrorStateVariant,
  label: "Warning banner",
  hint: "Warning callout with error detail, instructions, and a single refresh button — current table editor error state",
  rationale: {
    good: "Compact and familiar — keeps the grid headers visible with minimal overlay chrome.",
    bad: "Contact support is only mentioned in copy, not as an explicit action.",
  },
};

export const DEFAULT_GRID_ERROR_STATE_VARIANT: GridErrorStateVariant =
  "inline-admonition";

type GridErrorStateBlockProps = {
  variant: GridErrorStateVariant;
  onRefresh: () => void;
  onContactSupport?: () => void;
  className?: string;
};

function ErrorActions({
  onRefresh,
  onContactSupport,
  primary = "refresh",
  layout = "stacked",
}: {
  onRefresh: () => void;
  onContactSupport?: () => void;
  primary?: "refresh" | "support";
  layout?: "stacked" | "inline";
}) {
  const refreshButton = (
    <Button
      type="button"
      variant={primary === "refresh" ? "default" : "outline"}
      className="pointer-events-auto"
      icon={<RefreshCw size={14} />}
      onClick={onRefresh}
    >
      {GRID_ERROR_STATE_COPY.retryLabel}
    </Button>
  );

  const supportButton = (
    <Button
      type="button"
      variant={primary === "support" ? "default" : "outline"}
      className="pointer-events-auto"
      icon={<LifeBuoy size={14} />}
      onClick={onContactSupport}
    >
      {GRID_ERROR_STATE_COPY.supportLabel}
    </Button>
  );

  return (
    <div
      className={cn(
        "flex pointer-events-auto",
        layout === "stacked" ? "flex-col items-center gap-2" : "items-center gap-2",
      )}
    >
      {primary === "support" ? (
        <>
          {supportButton}
          {refreshButton}
        </>
      ) : (
        <>
          {refreshButton}
          {supportButton}
        </>
      )}
    </div>
  );
}

export function GridErrorStateBlock({
  variant,
  onRefresh,
  onContactSupport,
  className,
}: GridErrorStateBlockProps) {
  const content = renderGridErrorStateContent({
    variant,
    className,
    onRefresh,
    onContactSupport,
  });

  return (
    <PrototypeComponent id="grid-error-state-content.grid-error-state-block">
      {content}
    </PrototypeComponent>
  );
}

function renderGridErrorStateContent({
  variant,
  className,
  onRefresh,
  onContactSupport,
}: {
  variant: GridErrorStateVariant;
  className?: string;
  onRefresh: () => void;
  onContactSupport?: () => void;
}) {
  if (variant === "warning-banner") {
    return (
      <div
        className={cn(
          "pointer-events-auto flex max-w-md flex-col items-center justify-center",
          className,
        )}
      >
        <div className="w-full rounded-md border border-warning-500 bg-warning-100 px-4 py-3 text-left">
          <p className="text-sm font-medium text-foreground">{GRID_ERROR_STATE_COPY.title}</p>
          <p className="mt-1 text-xs text-foreground-light">
            Error: {GRID_ERROR_STATE_COPY.errorMessage}
          </p>
          <p className="mt-2 text-xs text-foreground-light">
            Try refreshing your browser. If the issue persists, contact support.
          </p>
        </div>
        <Button
          type="button"
          variant="default"
          className="mt-4 pointer-events-auto"
          onClick={onRefresh}
        >
          {GRID_ERROR_STATE_COPY.retryLabel}
        </Button>
      </div>
    );
  }

  if (variant === "inline-admonition") {
    return (
      <div className={cn("pointer-events-auto w-full max-w-lg text-left", className)}>
        <Admonition
          type="warning"
          layout="vertical"
          title={GRID_ERROR_STATE_COPY.title}
          description={
            <>
              <p>Error: {GRID_ERROR_STATE_COPY.errorMessage}</p>
              <p>{GRID_ERROR_STATE_COPY.instructions}</p>
            </>
          }
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" onClick={onRefresh}>
                {GRID_ERROR_STATE_COPY.retryLabel}
              </Button>
              <Button type="button" variant="default" onClick={onContactSupport}>
                {GRID_ERROR_STATE_COPY.supportLabel}
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  if (variant === "illustration-card") {
    return (
      <div
        className={cn(
          "pointer-events-auto flex max-w-sm flex-col items-center rounded-lg border border-default bg-surface-100 px-6 py-8 text-center shadow-sm",
          className,
        )}
      >
        <span className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-warning-100 text-warning-600">
          <AlertTriangle size={22} strokeWidth={1.5} />
        </span>
        <p className="text-sm font-medium text-foreground">{GRID_ERROR_STATE_COPY.title}</p>
        <p className="mt-2 text-sm text-light">
          Error: {GRID_ERROR_STATE_COPY.errorMessage}
        </p>
        <p className="mt-2 text-xs text-foreground-light">{GRID_ERROR_STATE_COPY.instructions}</p>
        <div className="mt-5">
          <ErrorActions
            onRefresh={onRefresh}
            onContactSupport={onContactSupport}
            layout="stacked"
          />
        </div>
      </div>
    );
  }

  if (variant === "diagnostic-panel") {
    const steps = [
      "Confirm you are signed in with a role that can read this table.",
      "Check RLS policies on the employees table for the postgres role.",
      "Refresh the grid or open SQL editor to verify the query succeeds.",
    ];

    return (
      <div
        className={cn(
          "pointer-events-auto w-full max-w-md rounded-lg border border-default bg-surface-100 px-5 py-6 text-left",
          className,
        )}
      >
        <p className="text-sm font-medium text-foreground">{GRID_ERROR_STATE_COPY.title}</p>
        <pre className="mt-3 overflow-x-auto rounded-md border border-default bg-surface-200 px-3 py-2 font-mono text-xs text-foreground">
          {GRID_ERROR_STATE_COPY.errorMessage}
        </pre>
        <ol className="mt-4 space-y-2">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm text-light">
              <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-200 text-[11px] font-medium text-foreground">
                {index + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button type="button" variant="default" onClick={onRefresh}>
            {GRID_ERROR_STATE_COPY.retryLabel}
          </Button>
          <Button type="button" variant="outline" onClick={onContactSupport}>
            {GRID_ERROR_STATE_COPY.supportLabel}
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
          <p className="text-sm font-medium text-foreground">{GRID_ERROR_STATE_COPY.title}</p>
          <p className="mt-1 text-sm text-light">
            Error: {GRID_ERROR_STATE_COPY.errorMessage}
          </p>
          <p className="mt-2 text-xs text-foreground-light">{GRID_ERROR_STATE_COPY.instructions}</p>
        </div>
        <ErrorActions
          onRefresh={onRefresh}
          onContactSupport={onContactSupport}
          layout="stacked"
        />
      </div>
    );
  }

  if (variant === "support-primary") {
    return (
      <div
        className={cn(
          "pointer-events-auto flex max-w-sm flex-col items-center text-center",
          className,
        )}
      >
        <p className="text-sm font-medium text-foreground">{GRID_ERROR_STATE_COPY.title}</p>
        <p className="mt-2 text-sm text-light">
          Error: {GRID_ERROR_STATE_COPY.errorMessage}
        </p>
        <p className="mt-2 text-xs text-foreground-light">{GRID_ERROR_STATE_COPY.instructions}</p>
        <div className="mt-5">
          <ErrorActions
            onRefresh={onRefresh}
            onContactSupport={onContactSupport}
            primary="support"
            layout="stacked"
          />
        </div>
      </div>
    );
  }

  return null;
}
