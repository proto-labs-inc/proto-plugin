"use client";

import { PrototypeComponent, PROTOTYPE_VIEW_SHELL_CLASS } from "proto-plugin";
import { cn } from "ui";

import { ConnectSheetPanel } from "./connect-sheet-panel";
import { LogsExplorerContent } from "./logs-explorer-content";
import { LogsMenu } from "./logs-menu";
import { ProductSidebar, ProjectHeader } from "./project-shell";
import type {
  ConnectSheetMode,
  LogsOverlay,
  SupabaseLogsLiveState,
} from "./supabase-logs-types";

type LogsExplorerPageProps = {
  liveState: SupabaseLogsLiveState;
  onConnectActionClick: (mode: ConnectSheetMode) => void;
  onCloseConnectSheet: () => void;
  onOverlayChange: (overlay: LogsOverlay) => void;
  onSelectSource: (source: string) => void;
  onSelectTemplate: (label: string) => void;
  onSelectDateRange: (text: string) => void;
  onFieldSourceChange: (reference: string) => void;
  onRun: () => void;
  onSqlChange: (sql: string) => void;
};

export function LogsExplorerPage({
  liveState,
  onConnectActionClick,
  onCloseConnectSheet,
  onOverlayChange,
  onSelectSource,
  onSelectTemplate,
  onSelectDateRange,
  onFieldSourceChange,
  onRun,
  onSqlChange,
}: LogsExplorerPageProps) {
  return (
    <PrototypeComponent
      id="logs-explorer-page"
      className={cn(PROTOTYPE_VIEW_SHELL_CLASS, "flex flex-col h-full w-full bg-dash-sidebar")}
    >
      <ProjectHeader onConnectClick={() => onConnectActionClick("framework")} />

      <div className="flex flex-1 w-full overflow-hidden relative">
        <ProductSidebar />

        <div className="flex flex-1 w-full min-w-0 overflow-hidden">
          <div className="h-full shrink-0 overflow-hidden hidden md:block" style={{ width: 256 }}>
            <LogsMenu />
          </div>

          <div
            aria-orientation="vertical"
            className="relative w-px shrink-0 bg-border hidden md:block"
            role="separator"
          />

          <div className="h-full flex-1 min-w-0 overflow-hidden">
            <LogsExplorerContent
              liveState={liveState}
              onOverlayChange={onOverlayChange}
              onSelectSource={onSelectSource}
              onSelectTemplate={onSelectTemplate}
              onSelectDateRange={onSelectDateRange}
              onFieldSourceChange={onFieldSourceChange}
              onRun={onRun}
              onSqlChange={onSqlChange}
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
