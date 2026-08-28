"use client";

import { PrototypeComponent, PROTOTYPE_VIEW_SHELL_CLASS } from "proto-plugin";
import { cn } from "ui";

import { ConnectSheetPanel } from "./connect-sheet-panel";
import { DatabaseMenu } from "./database-menu";
import { ProductSidebar, ProjectHeader } from "./project-shell";
import { SchemaVisualizer } from "./schema-visualizer";
import type {
  ConnectSheetMode,
  SupabaseDatabaseViewLiveState,
} from "./supabase-database-view-types";

type DatabaseViewPageProps = {
  liveState: SupabaseDatabaseViewLiveState;
  onConnectActionClick: (mode: ConnectSheetMode) => void;
  onCloseConnectSheet: () => void;
  onSchemaSelectorOpenChange: (open: boolean) => void;
  onSelectSchema: (name: string) => void;
  onFindTableOpenChange: (open: boolean) => void;
  onSelectTable: (tableId: string) => void;
  onExportMenuOpenChange: (open: boolean) => void;
  onAutoLayoutOpenChange: (open: boolean) => void;
  onTableActionsOpenChange: (tableId: string | null) => void;
};

export function DatabaseViewPage({
  liveState,
  onConnectActionClick,
  onCloseConnectSheet,
  onSchemaSelectorOpenChange,
  onSelectSchema,
  onFindTableOpenChange,
  onSelectTable,
  onExportMenuOpenChange,
  onAutoLayoutOpenChange,
  onTableActionsOpenChange,
}: DatabaseViewPageProps) {
  return (
    <PrototypeComponent
      id="database-view-page"
      className={cn(PROTOTYPE_VIEW_SHELL_CLASS, "flex flex-col h-full w-full bg-dash-sidebar")}
    >
      <ProjectHeader onConnectClick={() => onConnectActionClick("framework")} />

      <div className="flex flex-1 w-full overflow-hidden relative">
        <ProductSidebar />

        <div className="flex flex-1 w-full min-w-0 overflow-hidden">
          <div
            className="h-full shrink-0 overflow-hidden hidden md:block"
            style={{ width: "33%", minWidth: 256, maxWidth: 400 }}
          >
            <DatabaseMenu />
          </div>

          <div
            aria-orientation="vertical"
            className="relative w-px shrink-0 bg-border hidden md:block"
            role="separator"
          />

          <div className="h-full flex-1 min-w-0 overflow-hidden">
            <SchemaVisualizer
              liveState={liveState}
              onSchemaSelectorOpenChange={onSchemaSelectorOpenChange}
              onSelectSchema={onSelectSchema}
              onFindTableOpenChange={onFindTableOpenChange}
              onSelectTable={onSelectTable}
              onExportMenuOpenChange={onExportMenuOpenChange}
              onAutoLayoutOpenChange={onAutoLayoutOpenChange}
              onTableActionsOpenChange={onTableActionsOpenChange}
            />
          </div>
        </div>

        <ConnectSheetPanel
          connectSheet={liveState.connectSheet}
          onClose={onCloseConnectSheet}
          onModeChange={onConnectActionClick}
        />
      </div>
    </PrototypeComponent>
  );
}
