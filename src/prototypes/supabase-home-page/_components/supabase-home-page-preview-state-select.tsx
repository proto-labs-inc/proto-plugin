"use client";

import { PrototypeControl, ControlsPanelSelect, usePrototypeReviewOptional } from "proto-plugin";
import { useLayoutEffect } from "react";

import {
  SUPABASE_HOME_PAGE_PREVIEW_OPTIONS,
  type SupabaseHomePagePreviewStateId,
} from "./supabase-home-page-preview-states";

type SupabaseHomePagePreviewStateSelectProps = {
  previewStateId: SupabaseHomePagePreviewStateId;
  onPreviewStateChange: (previewStateId: SupabaseHomePagePreviewStateId) => void;
};

export function SupabaseHomePagePreviewStateSelect({
  previewStateId,
  onPreviewStateChange,
}: SupabaseHomePagePreviewStateSelectProps) {
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
        options={SUPABASE_HOME_PAGE_PREVIEW_OPTIONS}
      />,
    );

    return () => setTweaksContent(null);
  }, [onPreviewStateChange, previewStateId, setTweaksContent]);

  return <PrototypeControl id="supabase-home-page-preview-state-select" />;
}
