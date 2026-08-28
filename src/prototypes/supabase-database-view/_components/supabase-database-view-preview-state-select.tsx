"use client";

import { PrototypeControl, ControlsPanelSelect, usePrototypeReviewOptional } from "proto-plugin";
import { useLayoutEffect } from "react";

import {
  SUPABASE_DATABASE_VIEW_PREVIEW_OPTIONS,
  type SupabaseDatabaseViewPreviewStateId,
} from "./supabase-database-view-preview-states";

type SupabaseDatabaseViewPreviewStateSelectProps = {
  previewStateId: SupabaseDatabaseViewPreviewStateId;
  onPreviewStateChange: (previewStateId: SupabaseDatabaseViewPreviewStateId) => void;
};

export function SupabaseDatabaseViewPreviewStateSelect({
  previewStateId,
  onPreviewStateChange,
}: SupabaseDatabaseViewPreviewStateSelectProps) {
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
        options={SUPABASE_DATABASE_VIEW_PREVIEW_OPTIONS}
      />,
    );

    return () => setTweaksContent(null);
  }, [onPreviewStateChange, previewStateId, setTweaksContent]);

  return <PrototypeControl id="supabase-database-view-preview-state-select" />;
}
