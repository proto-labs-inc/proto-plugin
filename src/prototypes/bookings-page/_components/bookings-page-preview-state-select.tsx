"use client";

import { PrototypeControl } from "proto";
import { ControlsPanelSelect } from "proto";
import { usePrototypeReviewOptional } from "proto";
import { useLayoutEffect } from "react";

import {
  BOOKINGS_PAGE_PREVIEW_OPTIONS,
  type BookingsPagePreviewStateId,
} from "./bookings-page-preview-states";

type BookingsPagePreviewStateSelectProps = {
  previewStateId: BookingsPagePreviewStateId;
  onPreviewStateChange: (id: BookingsPagePreviewStateId) => void;
};

export function BookingsPagePreviewStateSelect({
  previewStateId,
  onPreviewStateChange,
}: BookingsPagePreviewStateSelectProps) {
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
        options={BOOKINGS_PAGE_PREVIEW_OPTIONS}
      />,
    );

    return () => setTweaksContent(null);
  }, [onPreviewStateChange, previewStateId, setTweaksContent]);

  return <PrototypeControl id="bookings-page-preview-state-select" />;
}
