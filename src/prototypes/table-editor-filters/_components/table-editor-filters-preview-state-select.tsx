"use client";

import { PrototypeControl, ControlsPanelSelect, usePrototypeReviewOptional } from "proto-plugin";
import { useLayoutEffect } from "react";

import {
  TABLE_EDITOR_FILTERS_PREVIEW_OPTIONS,
  type TableEditorFiltersPreviewStateId,
} from "./table-editor-filters-preview-states";

type TableEditorFiltersPreviewStateSelectProps = {
  previewStateId: TableEditorFiltersPreviewStateId;
  onPreviewStateChange: (previewStateId: TableEditorFiltersPreviewStateId) => void;
};

export function TableEditorFiltersPreviewStateSelect({
  previewStateId,
  onPreviewStateChange,
}: TableEditorFiltersPreviewStateSelectProps) {
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
        options={TABLE_EDITOR_FILTERS_PREVIEW_OPTIONS}
      />,
    );

    return () => setTweaksContent(null);
  }, [onPreviewStateChange, previewStateId, setTweaksContent]);

  return <PrototypeControl id="table-editor-filters-preview-state-select" />;
}
