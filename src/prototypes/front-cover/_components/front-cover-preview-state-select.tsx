"use client";

import { ControlsPanelSelect, PrototypeControl, usePrototypeReviewOptional } from "proto-plugin";
import { useLayoutEffect } from "react";

import {
  FRONT_COVER_PREVIEW_OPTIONS,
  type FrontCoverPreviewStateId,
} from "./front-cover-preview-states";

type FrontCoverPreviewStateSelectProps = {
  previewStateId: FrontCoverPreviewStateId;
  onPreviewStateChange: (previewStateId: FrontCoverPreviewStateId) => void;
};

export function FrontCoverPreviewStateSelect({
  previewStateId,
  onPreviewStateChange,
}: FrontCoverPreviewStateSelectProps) {
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
        options={FRONT_COVER_PREVIEW_OPTIONS}
      />,
    );

    return () => setTweaksContent(null);
  }, [onPreviewStateChange, previewStateId, setTweaksContent]);

  return <PrototypeControl id="front-cover-preview-state-select" />;
}
