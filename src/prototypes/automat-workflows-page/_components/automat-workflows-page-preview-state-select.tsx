"use client";

import { PrototypeControl } from "proto-plugin";
import { ControlsPanelSelect } from "proto-plugin";
import { usePrototypeReviewOptional } from "proto-plugin";
import { useLayoutEffect } from "react";

import {
  AUTOMAT_WORKFLOWS_PAGE_PREVIEW_OPTIONS,
  type AutomatWorkflowsPagePreviewStateId,
} from "./automat-workflows-page-preview-states";

type AutomatWorkflowsPagePreviewStateSelectProps = {
  previewStateId: AutomatWorkflowsPagePreviewStateId;
  onPreviewStateChange: (id: AutomatWorkflowsPagePreviewStateId) => void;
};

export function AutomatWorkflowsPagePreviewStateSelect({
  previewStateId,
  onPreviewStateChange,
}: AutomatWorkflowsPagePreviewStateSelectProps) {
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
        options={AUTOMAT_WORKFLOWS_PAGE_PREVIEW_OPTIONS}
      />,
    );

    return () => setTweaksContent(null);
  }, [onPreviewStateChange, previewStateId, setTweaksContent]);

  return <PrototypeControl id="automat-workflows-page-preview-state-select" />;
}
