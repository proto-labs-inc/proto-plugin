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

import { LogsExplorerPage } from "./_components/logs-explorer-page";
import { DEFAULT_LOGS_SQL, TEMPLATE_SQL } from "./_components/supabase-logs-mock-data";
import {
  createLiveStateForPreview,
  DEFAULT_SUPABASE_LOGS_PREVIEW_STATE,
  normalizeSupabaseLogsLiveState,
  withInferredPreviewState,
} from "./_components/supabase-logs-preview-states";
import { SupabaseLogsPreviewStateSelect } from "./_components/supabase-logs-preview-state-select";
import { buildSupabaseLogsStateCanvasConfig } from "./_components/supabase-logs-state-canvas-config";
import type {
  ConnectSheetMode,
  LogsOverlay,
  SupabaseLogsLiveState,
  SupabaseLogsPreviewStateId,
} from "./_components/supabase-logs-types";
import { SUPABASE_LOGS_PREVIEW_STATE_IDS } from "./_components/supabase-logs-types";

const THEME_CLASS = "supabase-logs-theme";

function createDefaultLiveState(): SupabaseLogsLiveState {
  return createLiveStateForPreview(DEFAULT_SUPABASE_LOGS_PREVIEW_STATE);
}

function hasLimitClause(sql: string) {
  return /\blimit\b/i.test(sql);
}

function insertSourceIntoSql(sql: string, source: string) {
  const fromMatch = sql.match(/\bfrom\b/i);
  if (!fromMatch || fromMatch.index === undefined) {
    return `${sql} ${source}`;
  }
  const afterFrom = sql.slice(fromMatch.index + 4);
  const tableMatch = afterFrom.match(/^\s+\S+/);
  if (!tableMatch) {
    return `${sql.slice(0, fromMatch.index + 4)} ${source}${afterFrom}`;
  }
  return `${sql.slice(0, fromMatch.index + 4)} ${source}${afterFrom.slice(tableMatch[0].length)}`;
}

export default function SupabaseLogs() {
  const [liveState, setLiveState] = useState<SupabaseLogsLiveState>(createDefaultLiveState);
  const review = usePrototypeReviewOptional();
  const setStateCanvasConfig = review?.setStateCanvasConfig;

  const onRestore = useCallback((restored: SupabaseLogsLiveState) => {
    setLiveState(normalizeSupabaseLogsLiveState(restored));
  }, []);

  usePrototypeComments(liveState, onRestore);

  const setPreviewState = useCallback((previewStateId: SupabaseLogsPreviewStateId) => {
    setLiveState(createLiveStateForPreview(previewStateId));
  }, []);

  useSyncPrototypePreviewStateToUrl(liveState.previewStateId, setPreviewState, {
    validStateIds: SUPABASE_LOGS_PREVIEW_STATE_IDS,
  });

  useEffect(() => {
    if (!setStateCanvasConfig) return;
    setStateCanvasConfig(buildSupabaseLogsStateCanvasConfig(setPreviewState));
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
        overlay: "none",
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

  const handleOverlayChange = useCallback((overlay: LogsOverlay) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        overlay,
        connectSheet: overlay === "none" ? current.connectSheet : "none",
      }),
    );
  }, []);

  const handleSelectSource = useCallback((source: string) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        sql: insertSourceIntoSql(current.sql, source),
        overlay: "none",
        fieldSource: source,
      }),
    );
  }, []);

  const handleSelectTemplate = useCallback((label: string) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        sql: TEMPLATE_SQL[label] ?? current.sql,
        overlay: "none",
        dataMode: "empty",
      }),
    );
  }, []);

  const handleSelectDateRange = useCallback((text: string) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        dateRangeText: text,
        overlay: "none",
      }),
    );
  }, []);

  const handleFieldSourceChange = useCallback((reference: string) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        fieldSource: reference,
      }),
    );
  }, []);

  const handleSqlChange = useCallback((sql: string) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        sql,
      }),
    );
  }, []);

  const handleRun = useCallback(() => {
    setLiveState((current) => {
      const nextSql = current.sql || DEFAULT_LOGS_SQL;
      if (!hasLimitClause(nextSql)) {
        return withInferredPreviewState(current, {
          overlay: "none",
          connectSheet: "none",
          dataMode: "error",
        });
      }
      return withInferredPreviewState(current, {
        overlay: "none",
        connectSheet: "none",
        dataMode: "results",
      });
    });
  }, []);

  return (
    <PrototypeComponent
      id="scroll-container"
      className={cn(PROTOTYPE_SCROLL_CONTAINER_CLASS, "bg-dash-sidebar", THEME_CLASS)}
    >
      <PrototypeComponent id="page" className={cn(PROTOTYPE_PAGE_CLASS, "bg-dash-sidebar")}>
        <LogsExplorerPage
          liveState={liveState}
          onConnectActionClick={handleConnectActionClick}
          onCloseConnectSheet={handleCloseConnectSheet}
          onOverlayChange={handleOverlayChange}
          onSelectSource={handleSelectSource}
          onSelectTemplate={handleSelectTemplate}
          onSelectDateRange={handleSelectDateRange}
          onFieldSourceChange={handleFieldSourceChange}
          onRun={handleRun}
          onSqlChange={handleSqlChange}
        />
        <SupabaseLogsPreviewStateSelect
          previewStateId={liveState.previewStateId}
          onPreviewStateChange={setPreviewState}
        />
      </PrototypeComponent>
    </PrototypeComponent>
  );
}
