"use client";

import {
  PROTOTYPE_PAGE_CLASS,
  PROTOTYPE_SCROLL_CONTAINER_CLASS,
  PrototypeComponent,
  usePrototypeComments,
} from "proto-plugin";
import { usePrototypeReviewOptional } from "proto-plugin";
import { cn } from "@coss/ui/lib/utils";
import { useCallback, useEffect, useState } from "react";

import styles from "./automat-workflows-page.module.scss";
import { AutomatShellLayout } from "./_components/automat-shell-layout";
import { AutomatWorkflowsDashboard } from "./_components/automat-workflows-dashboard";
import {
  createLiveStateForPreview,
  DEFAULT_AUTOMAT_WORKFLOWS_PAGE_PREVIEW_STATE,
  type AutomatWorkflowsPagePreviewStateId,
} from "./_components/automat-workflows-page-preview-states";
import { AutomatWorkflowsPagePreviewStateSelect } from "./_components/automat-workflows-page-preview-state-select";
import { buildAutomatWorkflowsPageStateCanvasConfig } from "./_components/automat-workflows-page-state-canvas-config";
import type {
  AutomatLiveState,
  AutomatStatusFilter,
} from "./_components/automat-workflows-page-types";

function createDefaultLiveState(): AutomatLiveState {
  return createLiveStateForPreview(DEFAULT_AUTOMAT_WORKFLOWS_PAGE_PREVIEW_STATE);
}

export default function AutomatWorkflowsPage() {
  const [liveState, setLiveState] = useState<AutomatLiveState>(createDefaultLiveState);
  const review = usePrototypeReviewOptional();

  const onRestore = useCallback((restored: AutomatLiveState) => {
    setLiveState(restored);
  }, []);

  usePrototypeComments(liveState, onRestore);

  const setPreviewState = useCallback((previewStateId: AutomatWorkflowsPagePreviewStateId) => {
    setLiveState(createLiveStateForPreview(previewStateId));
  }, []);

  const setSidebarOpen = useCallback((sidebarOpen: boolean) => {
    setLiveState((current) => ({ ...current, sidebarOpen }));
  }, []);

  const setSearchQuery = useCallback((searchQuery: string) => {
    setLiveState((current) => ({ ...current, searchQuery }));
  }, []);

  const setStatusFilter = useCallback((statusFilter: AutomatStatusFilter) => {
    setLiveState((current) => ({ ...current, statusFilter }));
  }, []);

  const setChatOpen = useCallback((chatOpen: boolean) => {
    setLiveState((current) => ({ ...current, chatOpen }));
  }, []);

  const setStateCanvasConfig = review?.setStateCanvasConfig;
  useEffect(() => {
    if (!setStateCanvasConfig) return;

    setStateCanvasConfig(buildAutomatWorkflowsPageStateCanvasConfig(setPreviewState));

    return () => setStateCanvasConfig(null);
  }, [setPreviewState, setStateCanvasConfig]);

  return (
    <PrototypeComponent
      id="scroll-container"
      className={cn(PROTOTYPE_SCROLL_CONTAINER_CLASS, styles.root, "antialiased")}
    >
      <PrototypeComponent id="page" className={cn(PROTOTYPE_PAGE_CLASS, "overflow-hidden")}>
        <AutomatShellLayout
          sidebarOpen={liveState.sidebarOpen}
          onSidebarOpenChange={setSidebarOpen}
          chatOpen={liveState.chatOpen}
          onChatOpenChange={setChatOpen}
        >
          <AutomatWorkflowsDashboard
            searchQuery={liveState.searchQuery}
            statusFilter={liveState.statusFilter}
            onSearchQueryChange={setSearchQuery}
            onStatusFilterChange={setStatusFilter}
          />
        </AutomatShellLayout>

        <AutomatWorkflowsPagePreviewStateSelect
          previewStateId={liveState.previewStateId}
          onPreviewStateChange={setPreviewState}
        />
      </PrototypeComponent>
    </PrototypeComponent>
  );
}
