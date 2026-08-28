"use client";

import { PrototypeComponent, PROTOTYPE_VIEW_SHELL_CLASS } from "proto-plugin";
import { cn } from "ui";

import { ConnectSheetPanel } from "./connect-sheet-panel";
import { ExamplesContent } from "./examples-content";
import { ProductSidebar, ProjectHeader } from "./project-shell";
import { SqlEditorMenu } from "./sql-editor-menu";
import type {
  ConnectSheetMode,
  SupabaseSqlEditorLiveState,
} from "./supabase-sql-editor-types";

type SqlEditorPageProps = {
  liveState: SupabaseSqlEditorLiveState;
  onConnectActionClick: (mode: ConnectSheetMode) => void;
  onCloseConnectSheet: () => void;
  onNewQueryMenuOpenChange: (open: boolean) => void;
  onToggleSqlMenu: () => void;
  onSelectExample: (id: string) => void;
};

export function SqlEditorPage({
  liveState,
  onConnectActionClick,
  onCloseConnectSheet,
  onNewQueryMenuOpenChange,
  onToggleSqlMenu,
  onSelectExample,
}: SqlEditorPageProps) {
  return (
    <PrototypeComponent
      id="sql-editor-page"
      className={cn(PROTOTYPE_VIEW_SHELL_CLASS, "flex flex-col h-full w-full bg-dash-sidebar")}
    >
      <ProjectHeader onConnectClick={() => onConnectActionClick("framework")} />

      <div className="flex flex-1 w-full overflow-hidden relative">
        <ProductSidebar />

        <div className="flex flex-1 w-full min-w-0 overflow-hidden">
          {liveState.sqlMenuOpen ? (
            <SqlEditorMenu
              newQueryMenuOpen={liveState.newQueryMenuOpen}
              onNewQueryMenuOpenChange={onNewQueryMenuOpenChange}
            />
          ) : null}

          <ExamplesContent
            sqlMenuOpen={liveState.sqlMenuOpen}
            selectedExampleId={liveState.selectedExampleId}
            onToggleSqlMenu={onToggleSqlMenu}
            onSelectExample={onSelectExample}
          />
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
