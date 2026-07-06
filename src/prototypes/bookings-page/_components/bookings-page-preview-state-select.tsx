"use client";

import { ControlsPanelSelect } from "@prototype/components/platform-ui/controls-panel-select";
import { PrototypeControl } from "@prototype/components/prototypes/prototype-control";
import { usePrototypeReviewOptional } from "@prototype/lib/prototypes/prototype-review-context";
import { useEffect } from "react";

import {
  BOOKINGS_PAGE_PREVIEW_OPTIONS,
  BOOKINGS_PAGE_PREVIEW_STATE_REGISTRY,
  type BookingsPagePreviewStateId,
} from "./bookings-page-preview-states";

type BookingsPagePreviewStateSelectProps = {
  previewStateId: BookingsPagePreviewStateId;
  onPreviewStateChange: (id: BookingsPagePreviewStateId) => void;
  registerOnly?: boolean;
};

export function BookingsPagePreviewStateSelect({
  previewStateId,
  onPreviewStateChange,
  registerOnly = false,
}: BookingsPagePreviewStateSelectProps) {
  const review = usePrototypeReviewOptional();

  useEffect(() => {
    if (!review) return;
    review.registerPreviewStates(BOOKINGS_PAGE_PREVIEW_STATE_REGISTRY.previewStates);
  }, [review]);

  if (registerOnly) {
    return null;
  }

  return (
    <PrototypeControl
      id="bookings-page-preview-state-select"
      className="border-subtle bg-default/95 absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border px-3 py-2 shadow-lg backdrop-blur-sm"
    >
      <span className="text-subtle hidden text-xs font-medium sm:inline">State</span>
      <ControlsPanelSelect
        appearance="miniPill"
        miniPillLabel="State"
        value={previewStateId}
        onValueChange={onPreviewStateChange}
        options={BOOKINGS_PAGE_PREVIEW_OPTIONS}
      />
    </PrototypeControl>
  );
}
