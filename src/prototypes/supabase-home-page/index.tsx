"use client";

import {
  PROTOTYPE_PAGE_CLASS,
  PROTOTYPE_SCROLL_CONTAINER_CLASS,
  PrototypeComponent,
  usePrototypeComments,
  usePrototypeReviewOptional,
  useSyncPrototypePreviewStateToUrl,
} from "proto-plugin";
import { cn } from "ui";
import { useCallback, useEffect, useState } from "react";

import { HomePageContent } from "./_components/home-page-content";
import {
  createLiveStateForPreview,
  DEFAULT_SUPABASE_HOME_PAGE_PREVIEW_STATE,
  normalizeSupabaseHomePageLiveState,
  withInferredPreviewState,
} from "./_components/supabase-home-page-preview-states";
import { SupabaseHomePagePreviewStateSelect } from "./_components/supabase-home-page-preview-state-select";
import { buildSupabaseHomePageStateCanvasConfig } from "./_components/supabase-home-page-state-canvas-config";
import type {
  ConnectSheetMode,
  SupabaseHomePageLiveState,
  SupabaseHomePagePreviewStateId,
} from "./_components/supabase-home-page-types";
import { SUPABASE_HOME_PAGE_PREVIEW_STATE_IDS } from "./_components/supabase-home-page-types";

const THEME_CLASS = "supabase-home-page-theme";

function createDefaultLiveState(): SupabaseHomePageLiveState {
  return createLiveStateForPreview(DEFAULT_SUPABASE_HOME_PAGE_PREVIEW_STATE);
}

export default function SupabaseHomePage() {
  const [liveState, setLiveState] = useState<SupabaseHomePageLiveState>(createDefaultLiveState);
  const review = usePrototypeReviewOptional();
  const setStateCanvasConfig = review?.setStateCanvasConfig;

  const onRestore = useCallback((restored: SupabaseHomePageLiveState) => {
    setLiveState(normalizeSupabaseHomePageLiveState(restored));
  }, []);

  usePrototypeComments(liveState, onRestore);

  const setPreviewState = useCallback((previewStateId: SupabaseHomePagePreviewStateId) => {
    setLiveState(createLiveStateForPreview(previewStateId));
  }, []);

  useSyncPrototypePreviewStateToUrl(liveState.previewStateId, setPreviewState, {
    validStateIds: SUPABASE_HOME_PAGE_PREVIEW_STATE_IDS,
  });

  useEffect(() => {
    if (!setStateCanvasConfig) return;
    setStateCanvasConfig(buildSupabaseHomePageStateCanvasConfig(setPreviewState));
    return () => setStateCanvasConfig(null);
  }, [setPreviewState, setStateCanvasConfig]);

  const handleConnectActionClick = useCallback((mode: ConnectSheetMode) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        connectSheet: mode,
        copyPopoverOpen: false,
      }),
    );
  }, []);

  const handleCloseConnectSheet = useCallback(() => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        connectSheet: "none",
      }),
    );
  }, []);

  const handleCopyPopoverOpenChange = useCallback((open: boolean) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        copyPopoverOpen: open,
        connectSheet: open ? "none" : current.connectSheet,
      }),
    );
  }, []);

  const handleDismissAdvisorToEmpty = useCallback(() => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        advisorMode: "empty",
      }),
    );
  }, []);

  return (
    <PrototypeComponent
      id="scroll-container"
      className={cn(
        PROTOTYPE_SCROLL_CONTAINER_CLASS,
        "bg-dash-sidebar",
        THEME_CLASS,
      )}
    >
      <PrototypeComponent id="page" className={cn(PROTOTYPE_PAGE_CLASS, "bg-dash-sidebar")}>
        <HomePageContent
          liveState={liveState}
          onConnectActionClick={handleConnectActionClick}
          onCloseConnectSheet={handleCloseConnectSheet}
          onCopyPopoverOpenChange={handleCopyPopoverOpenChange}
          onDismissAdvisorToEmpty={handleDismissAdvisorToEmpty}
        />
        <SupabaseHomePagePreviewStateSelect
          previewStateId={liveState.previewStateId}
          onPreviewStateChange={setPreviewState}
        />
      </PrototypeComponent>
    </PrototypeComponent>
  );
}
