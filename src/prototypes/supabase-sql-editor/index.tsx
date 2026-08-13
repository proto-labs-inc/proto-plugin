"use client";

import {
  PROTOTYPE_PAGE_CLASS,
  PROTOTYPE_SCROLL_CONTAINER_CLASS,
  PROTOTYPE_VIEWPORT_ID,
  PrototypeComponent,
  usePrototypeComments,
  usePrototypeReviewOptional,
  useSyncPrototypePreviewStateToUrl,
} from "proto-plugin";
import { cn } from "ui";
import { useCallback, useEffect, useState } from "react";

import { SqlEditorPage } from "./_components/sql-editor-page";
import {
  createLiveStateForPreview,
  DEFAULT_SUPABASE_SQL_EDITOR_PREVIEW_STATE,
  normalizeSupabaseSqlEditorLiveState,
  withInferredPreviewState,
} from "./_components/supabase-sql-editor-preview-states";
import { SupabaseSqlEditorPreviewStateSelect } from "./_components/supabase-sql-editor-preview-state-select";
import { buildSupabaseSqlEditorStateCanvasConfig } from "./_components/supabase-sql-editor-state-canvas-config";
import type {
  ConnectSheetMode,
  SupabaseSqlEditorLiveState,
  SupabaseSqlEditorPreviewStateId,
} from "./_components/supabase-sql-editor-types";
import { SUPABASE_SQL_EDITOR_PREVIEW_STATE_IDS } from "./_components/supabase-sql-editor-types";

const THEME_CLASS = "supabase-sql-editor-theme";

function createDefaultLiveState(): SupabaseSqlEditorLiveState {
  return createLiveStateForPreview(DEFAULT_SUPABASE_SQL_EDITOR_PREVIEW_STATE);
}

export default function SupabaseSqlEditor() {
  const [liveState, setLiveState] = useState<SupabaseSqlEditorLiveState>(createDefaultLiveState);
  const review = usePrototypeReviewOptional();
  const setStateCanvasConfig = review?.setStateCanvasConfig;

  const onRestore = useCallback((restored: SupabaseSqlEditorLiveState) => {
    setLiveState(normalizeSupabaseSqlEditorLiveState(restored));
  }, []);

  usePrototypeComments(liveState, onRestore);

  const setPreviewState = useCallback((previewStateId: SupabaseSqlEditorPreviewStateId) => {
    setLiveState(createLiveStateForPreview(previewStateId));
  }, []);

  useSyncPrototypePreviewStateToUrl(liveState.previewStateId, setPreviewState, {
    validStateIds: SUPABASE_SQL_EDITOR_PREVIEW_STATE_IDS,
  });

  useEffect(() => {
    if (!setStateCanvasConfig) return;
    setStateCanvasConfig(buildSupabaseSqlEditorStateCanvasConfig(setPreviewState));
    return () => setStateCanvasConfig(null);
  }, [setPreviewState, setStateCanvasConfig]);

  useEffect(() => {
    const viewport = document.getElementById(PROTOTYPE_VIEWPORT_ID);
    if (!viewport) return;
    viewport.classList.add(THEME_CLASS);
    return () => {
      viewport.classList.remove(THEME_CLASS);
    };
  }, []);

  const handleConnectActionClick = useCallback((mode: ConnectSheetMode) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        connectSheet: mode,
        newQueryMenuOpen: false,
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

  const handleNewQueryMenuOpenChange = useCallback((open: boolean) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        newQueryMenuOpen: open,
        connectSheet: open ? "none" : current.connectSheet,
      }),
    );
  }, []);

  const handleToggleSqlMenu = useCallback(() => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        sqlMenuOpen: !current.sqlMenuOpen,
        newQueryMenuOpen: false,
      }),
    );
  }, []);

  const handleSelectExample = useCallback((id: string) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        selectedExampleId: id,
        newQueryMenuOpen: false,
        connectSheet: "none",
      }),
    );
  }, []);

  return (
    <PrototypeComponent
      id="scroll-container"
      className={cn(PROTOTYPE_SCROLL_CONTAINER_CLASS, "bg-dash-sidebar", THEME_CLASS)}
    >
      <PrototypeComponent id="page" className={cn(PROTOTYPE_PAGE_CLASS, "bg-dash-sidebar")}>
        <SqlEditorPage
          liveState={liveState}
          onConnectActionClick={handleConnectActionClick}
          onCloseConnectSheet={handleCloseConnectSheet}
          onNewQueryMenuOpenChange={handleNewQueryMenuOpenChange}
          onToggleSqlMenu={handleToggleSqlMenu}
          onSelectExample={handleSelectExample}
        />
        <SupabaseSqlEditorPreviewStateSelect
          previewStateId={liveState.previewStateId}
          onPreviewStateChange={setPreviewState}
        />
      </PrototypeComponent>
    </PrototypeComponent>
  );
}
