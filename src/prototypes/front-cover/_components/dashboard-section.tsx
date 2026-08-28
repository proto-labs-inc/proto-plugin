import { PrototypeComponent } from "proto-plugin";
import { cn } from "ui";

import { DASHBOARD_TABS, DASHBOARD_TITLE } from "./front-cover-mock-data";
import type { FrontCoverDashboardTab } from "./front-cover-types";

type DashboardSectionProps = {
  dashboardTab: FrontCoverDashboardTab;
  onDashboardTabChange: (tab: FrontCoverDashboardTab) => void;
};

function TableEditorPanel() {
  const rows = [
    ["1", "Ada Lovelace", "ada@supabase.com", "admin"],
    ["2", "Alan Turing", "alan@supabase.com", "editor"],
    ["3", "Grace Hopper", "grace@supabase.com", "viewer"],
  ];

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="grid grid-cols-4 border-b border-border bg-surface-100 text-xs text-foreground-lighter">
        {["id", "name", "email", "role"].map((col) => (
          <div key={col} className="border-r border-border px-3 py-2 last:border-r-0">
            {col}
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-4 content-start text-xs text-foreground">
        {rows.flatMap((row, rowIndex) =>
          row.map((cell, cellIndex) => (
            <div
              key={`${rowIndex}-${cellIndex}`}
              className="border-b border-r border-border px-3 py-2.5 last:border-r-0"
            >
              {cell}
            </div>
          )),
        )}
      </div>
    </div>
  );
}

function SqlEditorPanel() {
  return (
    <pre className="h-full overflow-hidden bg-foreground p-4 font-mono text-xs leading-relaxed text-brand">
      {`select id, email, created_at
from auth.users
where last_sign_in_at > now() - interval '7 days';`}
    </pre>
  );
}

function RlsPanel() {
  return (
    <div className="flex h-full flex-col gap-3 bg-background p-4">
      <div className="rounded-md border border-border p-3">
        <p className="text-sm text-foreground">Enable read access for all users</p>
        <p className="mt-1 font-mono text-xs text-foreground-lighter">
          {`create policy "Public profiles" on profiles for select using (true);`}
        </p>
      </div>
      <div className="rounded-md border border-border p-3">
        <p className="text-sm text-foreground">Restrict writes to owners</p>
        <p className="mt-1 font-mono text-xs text-foreground-lighter">
          {`using (auth.uid() = user_id)`}
        </p>
      </div>
    </div>
  );
}

export function DashboardSection({
  dashboardTab,
  onDashboardTabChange,
}: DashboardSectionProps) {
  return (
    <PrototypeComponent id="dashboard-section" className="border-b border-border">
      <div className="section-container space-y-8 overflow-hidden pb-4 pt-10">
        <div className="flex flex-col gap-8 pt-12">
          <h3 className="text-2xl text-foreground-lighter md:text-4xl">
            <span className="text-foreground">{DASHBOARD_TITLE.lead}</span>
            <br className="hidden sm:block" /> {DASHBOARD_TITLE.rest}
          </h3>
          <PrototypeComponent id="dashboard-section.tabs" className="flex gap-2" role="tablist">
            {DASHBOARD_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={dashboardTab === tab.id}
                onClick={() => onDashboardTabChange(tab.id)}
                className={cn(
                  "rounded-full border bg-alternative px-3 py-1.5 text-sm opacity-80 transition-all hover:border-foreground-lighter hover:text-foreground lg:px-8 lg:py-2",
                  dashboardTab === tab.id && "border-foreground opacity-100",
                )}
              >
                {tab.label}
              </button>
            ))}
          </PrototypeComponent>
        </div>
        <PrototypeComponent
          id="dashboard-section.frame"
          className="mx-auto w-full overflow-hidden rounded-xl border border-border bg-default -mb-16"
        >
          <div className="flex items-center gap-1.5 border-b border-border bg-surface-100 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-brand/70" />
            <span className="ml-3 text-xs text-foreground-muted">app.supabase.com</span>
          </div>
          <div className="aspect-video overflow-hidden">
            {dashboardTab === "table-editor" ? (
              <TableEditorPanel />
            ) : dashboardTab === "sql-editor" ? (
              <SqlEditorPanel />
            ) : (
              <RlsPanel />
            )}
          </div>
        </PrototypeComponent>
      </div>
    </PrototypeComponent>
  );
}
