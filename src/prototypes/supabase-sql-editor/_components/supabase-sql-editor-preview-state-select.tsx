"use client";

import { PrototypeControl, ControlsPanelSelect, usePrototypeReviewOptional } from "proto-plugin";
import { useLayoutEffect } from "react";

import {
  SUPABASE_SQL_EDITOR_PREVIEW_OPTIONS,
  type SupabaseSqlEditorPreviewStateId,
} from "./supabase-sql-editor-preview-states";

type SupabaseSqlEditorPreviewStateSelectProps = {
  previewStateId: SupabaseSqlEditorPreviewStateId;
  onPreviewStateChange: (previewStateId: SupabaseSqlEditorPreviewStateId) => void;
};

export function SupabaseSqlEditorPreviewStateSelect({
  previewStateId,
  onPreviewStateChange,
}: SupabaseSqlEditorPreviewStateSelectProps) {
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
        options={SUPABASE_SQL_EDITOR_PREVIEW_OPTIONS}
      />,
    );

    return () => setTweaksContent(null);
  }, [onPreviewStateChange, previewStateId, setTweaksContent]);

  return <PrototypeControl id="supabase-sql-editor-preview-state-select" />;
}
