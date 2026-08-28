import { PrototypeComponent, PROTOTYPE_VIEW_SHELL_CLASS } from "proto-plugin";
import { cn } from "ui";

import { AdvisorSection } from "./advisor-section";
import { ConnectSheetPanel } from "./connect-sheet-panel";
import { ProductSidebar, ProjectHeader } from "./home-page-shell";
import {
  ConnectSection,
  ProjectTopSection,
  SCAFFOLD_CONTAINER_CLASS,
  SCAFFOLD_SECTION_CLASS,
} from "./project-home-sections";
import type { SupabaseHomePageLiveState } from "./supabase-home-page-types";
import type { ConnectSheetMode } from "./supabase-home-page-types";

type HomePageContentProps = {
  liveState: SupabaseHomePageLiveState;
  onConnectActionClick: (mode: ConnectSheetMode) => void;
  onCloseConnectSheet: () => void;
  onCopyPopoverOpenChange: (open: boolean) => void;
  onDismissAdvisorToEmpty: () => void;
};

export function HomePageContent({
  liveState,
  onConnectActionClick,
  onCloseConnectSheet,
  onCopyPopoverOpenChange,
  onDismissAdvisorToEmpty,
}: HomePageContentProps) {
  return (
    <PrototypeComponent
      id="home-page-content"
      className={cn(PROTOTYPE_VIEW_SHELL_CLASS, "flex flex-col h-full w-full bg-dash-sidebar")}
    >
      <ProjectHeader
        onConnectClick={() => onConnectActionClick("framework")}
        hasAdvisorIssue={liveState.advisorMode === "issue"}
      />

      <div className="flex flex-1 w-full overflow-hidden relative">
        <ProductSidebar />

        <main className="h-full flex flex-col flex-1 w-full overflow-y-auto overflow-x-hidden min-w-0">
          <div className={SCAFFOLD_CONTAINER_CLASS}>
            <div className={cn(SCAFFOLD_SECTION_CLASS, "pb-0")}>
              <ProjectTopSection
                copyPopoverOpen={liveState.copyPopoverOpen}
                onCopyPopoverOpenChange={onCopyPopoverOpenChange}
                onGetConnected={() => onConnectActionClick("framework")}
              />
            </div>
          </div>

          <div className={SCAFFOLD_CONTAINER_CLASS}>
            <div className={cn(SCAFFOLD_SECTION_CLASS, "gap-12 pb-32")}>
              <ConnectSection onConnectActionClick={onConnectActionClick} />
              <AdvisorSection
                advisorMode={liveState.advisorMode}
                onDismissToEmpty={onDismissAdvisorToEmpty}
              />
            </div>
          </div>
        </main>

        <ConnectSheetPanel
          connectSheet={liveState.connectSheet}
          onClose={onCloseConnectSheet}
          onModeChange={onConnectActionClick}
        />
      </div>
    </PrototypeComponent>
  );
}
