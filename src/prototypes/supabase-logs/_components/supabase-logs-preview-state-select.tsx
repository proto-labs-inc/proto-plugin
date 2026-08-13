"use client";

import { PrototypeControl, ControlsPanelSelect, usePrototypeReviewOptional } from "proto-plugin";
import { useLayoutEffect } from "react";

import {
  SUPABASE_LOGS_PREVIEW_OPTIONS,
  type SupabaseLogsPreviewStateId,
} from "./supabase-logs-preview-states";

type SupabaseLogsPreviewStateSelectProps = {
  previewStateId: SupabaseLogsPreviewStateId;
  onPreviewStateChange: (previewStateId: SupabaseLogsPreviewStateId) => void;
};

export function SupabaseLogsPreviewStateSelect({
  previewStateId,
  onPreviewStateChange,
}: SupabaseLogsPreviewStateSelectProps) {
  const review = usePrototypeReviewOptional();
  const setTweaksContent = review?.setTweaksContent;
  const setActivePreviewStateId = review?.setActivePreviewStateId;

  useLayoutEffect(() => {
    if (!setActivePreviewStateId) return;
    setActivePreviewStateId(previewStateId);
    return () => setActivePreviewStateId(null);
  }, [previewStateId, setActivePreviewStateId]);

  useLayoutEffect(() => {
    if (!setTweaksContent) return;

    setTweaksContent(
      <ControlsPanelSelect
        appearance="menuList"
        value={previewStateId}
        onValueChange={onPreviewStateChange}
        options={SUPABASE_LOGS_PREVIEW_OPTIONS}
      />,
    );

    return () => setTweaksContent(null);
  }, [onPreviewStateChange, previewStateId, setTweaksContent]);

  return <PrototypeControl id="supabase-logs-preview-state-select" />;
}
