"use client";

import {
  PrototypeStateCanvasRegistrar,
  PrototypeStateCanvasView,
} from "@prototype/components/prototypes/prototype-state-canvas";
import { buildPrototypeTargetId } from "@prototype/components/prototypes/prototype-target";
import {
  encodeShareState,
  SHARE_STATE_PARAM,
  SHARE_TARGET_PARAM,
} from "@prototype/lib/prototypes/prototype-share-link";
import {
  getDefaultPrototypeStateMapPath,
  parseStateMapReturnTo,
} from "@prototype/lib/prototypes/prototype-state-canvas-types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { buildBookingFlowStateCanvasConfig } from "./_components/booking-flow-state-canvas-config";
import type { BookingFlowStepId } from "./_components/booking-flow-preview-states";
import type { BookingLiveState, BookingViewMode } from "./_components/booking-flow-types";
import { BOOKING_DEFAULT_DATE } from "./_components/booking-mock-data";

const BOOKING_FLOW_SLUG = "booking-flow";

function stepToViewMode(step: BookingFlowStepId): BookingViewMode {
  if (step === "week-grid" || step === "confirm-modal-week") return "week";
  if (step === "list-view" || step === "confirm-modal-list") return "list";
  return "month";
}

function liveStateForStep(step: BookingFlowStepId): BookingLiveState {
  return {
    step,
    viewMode: stepToViewMode(step),
    selectedDateIso: BOOKING_DEFAULT_DATE.toISOString(),
    selectedTime: "9:30am",
    use24h: false,
    overlayCalendar: false,
  };
}

export default function BookingFlowStateMapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pagePath = getDefaultPrototypeStateMapPath(BOOKING_FLOW_SLUG);
  const prototypePath = `/prototypes/${BOOKING_FLOW_SLUG}`;
  const backHref = useMemo(() => {
    const returnTo = parseStateMapReturnTo(searchParams);
    if (returnTo) return returnTo;
    return prototypePath;
  }, [prototypePath, searchParams]);

  const handleStepSelect = useCallback(
    (step: BookingFlowStepId) => {
      const url = new URL(backHref, window.location.origin);
      url.searchParams.set(
        SHARE_TARGET_PARAM,
        buildPrototypeTargetId(BOOKING_FLOW_SLUG, "page"),
      );
      url.searchParams.set(
        SHARE_STATE_PARAM,
        encodeShareState(liveStateForStep(step)),
      );
      router.push(`${url.pathname}${url.search}`);
    },
    [backHref, router],
  );

  const config = useMemo(
    () => buildBookingFlowStateCanvasConfig(handleStepSelect),
    [handleStepSelect],
  );

  return (
    <>
      <PrototypeStateCanvasRegistrar pagePath={pagePath} />
      <PrototypeStateCanvasView
        config={config}
        layout="page"
        backHref={backHref}
      />
    </>
  );
}
