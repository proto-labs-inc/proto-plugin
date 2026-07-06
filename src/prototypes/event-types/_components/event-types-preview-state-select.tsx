"use client";

import { ControlsPanelSelect } from "@prototype/components/platform-ui/controls-panel-select";
import { usePrototypeReviewOptional } from "@prototype/lib/prototypes/prototype-review-context";
import { useLayoutEffect } from "react";

import {
  EVENT_TYPES_PREVIEW_OPTIONS,
  type EventTypesPreviewStateId,
} from "./event-types-preview-states";

type EventTypesPreviewStateSelectProps = {
  previewStateId: EventTypesPreviewStateId;
  onPreviewStateChange: (id: EventTypesPreviewStateId) => void;
};

export function EventTypesPreviewStateSelect({
  previewStateId,
  onPreviewStateChange,
}: EventTypesPreviewStateSelectProps) {
  const review = usePrototypeReviewOptional();
  const setTweaksContent = review?.setTweaksContent;

  useLayoutEffect(() => {
    if (!setTweaksContent) return;

    setTweaksContent(
      <ControlsPanelSelect
        appearance="menuList"
        value={previewStateId}
        onValueChange={onPreviewStateChange}
        options={EVENT_TYPES_PREVIEW_OPTIONS}
      />,
    );

    return () => setTweaksContent(null);
  }, [onPreviewStateChange, previewStateId, setTweaksContent]);

  return null;
}
