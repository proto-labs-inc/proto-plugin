"use client";

import { ControlsPanelSelect } from "@prototype/components/platform-ui/controls-panel-select";
import { PrototypeControl } from "@prototype/components/prototypes/prototype-control";
import { usePrototypeReviewOptional } from "@prototype/lib/prototypes/prototype-review-context";
import { useEffect } from "react";

import {
  BOOKING_FLOW_PREVIEW_OPTIONS,
  BOOKING_FLOW_PREVIEW_STATE_REGISTRY,
  type BookingFlowStepId,
} from "./booking-flow-preview-states";

type BookingFlowPreviewStateSelectProps = {
  step: BookingFlowStepId;
  onStepChange: (step: BookingFlowStepId) => void;
  registerOnly?: boolean;
};

export function BookingFlowPreviewStateSelect({
  step,
  onStepChange,
  registerOnly = false,
}: BookingFlowPreviewStateSelectProps) {
  const review = usePrototypeReviewOptional();

  useEffect(() => {
    if (!review) return;

    review.registerPreviewStates(BOOKING_FLOW_PREVIEW_STATE_REGISTRY.previewStates);
  }, [review]);

  if (registerOnly) {
    return null;
  }

  return (
    <PrototypeControl
      id="booking-flow-preview-state-select"
      className="border-subtle bg-default/95 absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border px-3 py-2 shadow-lg backdrop-blur-sm"
    >
      <span className="text-subtle hidden text-xs font-medium sm:inline">Step</span>
      <ControlsPanelSelect
        appearance="miniPill"
        miniPillLabel="Step"
        value={step}
        onValueChange={onStepChange}
        options={BOOKING_FLOW_PREVIEW_OPTIONS}
      />
    </PrototypeControl>
  );
}
