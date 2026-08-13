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

import { DatabaseViewPage } from "./_components/database-view-page";
import {
  createLiveStateForPreview,
  DEFAULT_SUPABASE_DATABASE_VIEW_PREVIEW_STATE,
  normalizeSupabaseDatabaseViewLiveState,
  withInferredPreviewState,
} from "./_components/supabase-database-view-preview-states";
import { SupabaseDatabaseViewPreviewStateSelect } from "./_components/supabase-database-view-preview-state-select";
import { buildSupabaseDatabaseViewStateCanvasConfig } from "./_components/supabase-database-view-state-canvas-config";
import type {
  ConnectSheetMode,
  SupabaseDatabaseViewLiveState,
  SupabaseDatabaseViewPreviewStateId,
} from "./_components/supabase-database-view-types";
import { SUPABASE_DATABASE_VIEW_PREVIEW_STATE_IDS } from "./_components/supabase-database-view-types";

const THEME_CLASS = "supabase-database-view-theme";

function createDefaultLiveState(): SupabaseDatabaseViewLiveState {
  return createLiveStateForPreview(DEFAULT_SUPABASE_DATABASE_VIEW_PREVIEW_STATE);
}

export default function SupabaseDatabaseView() {
  const [liveState, setLiveState] = useState<SupabaseDatabaseViewLiveState>(createDefaultLiveState);
  const review = usePrototypeReviewOptional();
  const setStateCanvasConfig = review?.setStateCanvasConfig;

  const onRestore = useCallback((restored: SupabaseDatabaseViewLiveState) => {
    setLiveState(normalizeSupabaseDatabaseViewLiveState(restored));
  }, []);

  usePrototypeComments(liveState, onRestore);

  const setPreviewState = useCallback((previewStateId: SupabaseDatabaseViewPreviewStateId) => {
    setLiveState(createLiveStateForPreview(previewStateId));
  }, []);

  useSyncPrototypePreviewStateToUrl(liveState.previewStateId, setPreviewState, {
    validStateIds: SUPABASE_DATABASE_VIEW_PREVIEW_STATE_IDS,
  });

  useEffect(() => {
    if (!setStateCanvasConfig) return;
    setStateCanvasConfig(buildSupabaseDatabaseViewStateCanvasConfig(setPreviewState));
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
        schemaSelectorOpen: false,
        findTableOpen: false,
        exportMenuOpen: false,
        autoLayoutOpen: false,
        tableActionsTableId: null,
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

  const handleSchemaSelectorOpenChange = useCallback((open: boolean) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        schemaSelectorOpen: open,
        findTableOpen: false,
        exportMenuOpen: false,
        autoLayoutOpen: false,
        tableActionsTableId: null,
        connectSheet: open ? "none" : current.connectSheet,
      }),
    );
  }, []);

  const handleSelectSchema = useCallback((name: string) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        selectedSchema: name,
        dataMode: name === "public" ? "populated" : "empty",
        schemaSelectorOpen: false,
        findTableOpen: false,
        exportMenuOpen: false,
        autoLayoutOpen: false,
        tableActionsTableId: null,
        connectSheet: "none",
      }),
    );
  }, []);

  const handleFindTableOpenChange = useCallback((open: boolean) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        findTableOpen: open,
        schemaSelectorOpen: false,
        exportMenuOpen: false,
        autoLayoutOpen: false,
        tableActionsTableId: null,
        connectSheet: open ? "none" : current.connectSheet,
      }),
    );
  }, []);

  const handleSelectTable = useCallback((_tableId: string) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        findTableOpen: false,
      }),
    );
  }, []);

  const handleExportMenuOpenChange = useCallback((open: boolean) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        exportMenuOpen: open,
        schemaSelectorOpen: false,
        findTableOpen: false,
        autoLayoutOpen: false,
        tableActionsTableId: null,
        connectSheet: open ? "none" : current.connectSheet,
      }),
    );
  }, []);

  const handleAutoLayoutOpenChange = useCallback((open: boolean) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        autoLayoutOpen: open,
        schemaSelectorOpen: false,
        findTableOpen: false,
        exportMenuOpen: false,
        tableActionsTableId: null,
        connectSheet: open ? "none" : current.connectSheet,
      }),
    );
  }, []);

  const handleTableActionsOpenChange = useCallback((tableId: string | null) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        tableActionsTableId: tableId,
        schemaSelectorOpen: false,
        findTableOpen: false,
        exportMenuOpen: false,
        autoLayoutOpen: false,
        connectSheet: tableId ? "none" : current.connectSheet,
      }),
    );
  }, []);

  return (
    <PrototypeComponent
      id="scroll-container"
      className={cn(PROTOTYPE_SCROLL_CONTAINER_CLASS, "bg-dash-sidebar", THEME_CLASS)}
    >
      <PrototypeComponent id="page" className={cn(PROTOTYPE_PAGE_CLASS, "bg-dash-sidebar")}>
        <DatabaseViewPage
          liveState={liveState}
          onConnectActionClick={handleConnectActionClick}
          onCloseConnectSheet={handleCloseConnectSheet}
          onSchemaSelectorOpenChange={handleSchemaSelectorOpenChange}
          onSelectSchema={handleSelectSchema}
          onFindTableOpenChange={handleFindTableOpenChange}
          onSelectTable={handleSelectTable}
          onExportMenuOpenChange={handleExportMenuOpenChange}
          onAutoLayoutOpenChange={handleAutoLayoutOpenChange}
          onTableActionsOpenChange={handleTableActionsOpenChange}
        />
        <SupabaseDatabaseViewPreviewStateSelect
          previewStateId={liveState.previewStateId}
          onPreviewStateChange={setPreviewState}
        />
      </PrototypeComponent>
    </PrototypeComponent>
  );
}
