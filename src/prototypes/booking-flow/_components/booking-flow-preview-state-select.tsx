"use client";

import { PrototypeControl } from "proto-plugin";
import { ControlsPanelSelect } from "proto-plugin";
import { usePrototypeReviewOptional } from "proto-plugin";
import { useLayoutEffect } from "react";

import {
  BOOKING_FLOW_PREVIEW_OPTIONS,
  type BookingFlowStepId,
} from "./booking-flow-preview-states";

type BookingFlowPreviewStateSelectProps = {
  step: BookingFlowStepId;
  onStepChange: (step: BookingFlowStepId) => void;
};

export function BookingFlowPreviewStateSelect({
  step,
  onStepChange,
}: BookingFlowPreviewStateSelectProps) {
  const review = usePrototypeReviewOptional();
  const setTweaksContent = review?.setTweaksContent;
  const setActivePreviewStateId = review?.setActivePreviewStateId;

  useLayoutEffect(() => {
    if (!setActivePreviewStateId) return;
    setActivePreviewStateId(step);
    return () => setActivePreviewStateId(null);
  }, [setActivePreviewStateId, step]);

  useLayoutEffect(() => {
    if (!setTweaksContent) return;

    setTweaksContent(
      <ControlsPanelSelect
        appearance="menuList"
        value={step}
        onValueChange={onStepChange}
        options={BOOKING_FLOW_PREVIEW_OPTIONS}
      />,
    );

    return () => setTweaksContent(null);
  }, [onStepChange, setTweaksContent, step]);

  return <PrototypeControl id="booking-flow-preview-state-select" />;
}
