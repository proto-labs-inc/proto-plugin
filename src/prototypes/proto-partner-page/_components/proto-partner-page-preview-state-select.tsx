"use client";

import {
  ControlsPanelSelect,
  PrototypeControl,
  usePrototypeReviewOptional,
} from "proto-plugin";
import { useLayoutEffect } from "react";

import {
  PROTO_PARTNER_PAGE_PREVIEW_OPTIONS,
  type ProtoPartnerPagePreviewStateId,
} from "./proto-partner-page-preview-states";

type ProtoPartnerPagePreviewStateSelectProps = {
  previewStateId: ProtoPartnerPagePreviewStateId;
  onPreviewStateChange: (
    previewStateId: ProtoPartnerPagePreviewStateId,
  ) => void;
};

export function ProtoPartnerPagePreviewStateSelect({
  previewStateId,
  onPreviewStateChange,
}: ProtoPartnerPagePreviewStateSelectProps) {
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
        options={PROTO_PARTNER_PAGE_PREVIEW_OPTIONS}
      />,
    );

    return () => setTweaksContent(null);
  }, [onPreviewStateChange, previewStateId, setTweaksContent]);

  return <PrototypeControl id="proto-partner-page-preview-state-select" />;
}
