"use client";

import { ControlsPanelSelect } from "@prototype/components/platform-ui/controls-panel-select";
import { usePrototypeReviewOptional } from "@prototype/lib/prototypes/prototype-review-context";
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

  return null;
}
