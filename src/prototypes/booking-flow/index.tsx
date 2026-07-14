"use client";

import { PrototypeComponent } from "proto-plugin";
import { usePrototypeComments } from "proto-plugin";
import { usePrototypeReviewOptional } from "proto-plugin";
import { useSyncPrototypePreviewStateToUrl } from "proto-plugin";
import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BookingConfirmModalContent, BookingFormView } from "./_components/booking-form-view";
import {
  BOOKING_FLOW_STEP_IDS,
  DEFAULT_BOOKING_FLOW_STEP,
  type BookingFlowStepId,
} from "./_components/booking-flow-preview-states";
import { BookingFlowPreviewStateSelect } from "./_components/booking-flow-preview-state-select";
import { buildBookingFlowStateCanvasConfig } from "./_components/booking-flow-state-canvas-config";
import type {
  BookingLiveState,
  BookingViewMode,
} from "./_components/booking-flow-types";
import { BookingListView } from "./_components/booking-list-view";
import { BookingModalBackdrop, BookingPageTransition, BookingViewTransition } from "./_components/booking-motion";
import { BookingMonthView } from "./_components/booking-month-view";
import { BookingSuccessView } from "./_components/booking-success-view";
import { BookingWeekView } from "./_components/booking-week-view";
import {
  BOOKING_DEFAULT_DATE,
  formatBookingTime,
} from "./_components/booking-mock-data";

function stepToViewMode(step: BookingFlowStepId): BookingViewMode {
  if (step === "week-grid" || step === "confirm-modal-week") return "week";
  if (step === "list-view" || step === "confirm-modal-list") return "list";
  return "month";
}

function createDefaultLiveState(): BookingLiveState {
  return {
    step: DEFAULT_BOOKING_FLOW_STEP,
    viewMode: "month",
    selectedDateIso: BOOKING_DEFAULT_DATE.toISOString(),
    selectedTime: "9:30am",
    use24h: false,
    overlayCalendar: false,
  };
}

function timeFromParts(hour: number, minute: number): string {
  return formatBookingTime(hour, minute, false)
    .replace(":00", "")
    .replace(" ", "");
}

export default function BookingFlowPage() {
  const [liveState, setLiveState] = useState<BookingLiveState>(createDefaultLiveState);
  const review = usePrototypeReviewOptional();

  const selectedDate = useMemo(
    () => new Date(liveState.selectedDateIso),
    [liveState.selectedDateIso],
  );

  const setViewMode = useCallback((viewMode: BookingViewMode) => {
    setLiveState((current) => {
      const nextStep: BookingFlowStepId =
        viewMode === "week"
          ? "week-grid"
          : viewMode === "list"
            ? "list-view"
            : "month-picker";

      if (
        current.step === "confirm-modal-week" ||
        current.step === "confirm-modal-list" ||
        current.step === "form-page" ||
        current.step === "success"
      ) {
        return { ...current, viewMode };
      }

      return { ...current, viewMode, step: nextStep };
    });
  }, []);

  const onRestore = useCallback((restored: BookingLiveState) => {
    setLiveState(restored);
  }, []);

  usePrototypeComments(liveState, onRestore);

  const setStep = useCallback((step: BookingFlowStepId) => {
    setLiveState((current) => ({
      ...current,
      step,
      viewMode: stepToViewMode(step),
    }));
  }, []);

  useSyncPrototypePreviewStateToUrl(liveState.step, setStep, {
    validStateIds: BOOKING_FLOW_STEP_IDS,
  });

  const setStateCanvasConfig = review?.setStateCanvasConfig;
  useEffect(() => {
    if (!setStateCanvasConfig) return;

    setStateCanvasConfig(buildBookingFlowStateCanvasConfig(setStep));

    return () => setStateCanvasConfig(null);
  }, [setStateCanvasConfig, setStep]);

  const handleSelectDate = useCallback((date: Date) => {
    setLiveState((current) => ({
      ...current,
      selectedDateIso: date.toISOString(),
    }));
  }, []);

  const handleSelectTimeFromMonth = useCallback((time: string) => {
    setLiveState((current) => ({
      ...current,
      selectedTime: time,
      step: "form-page",
    }));
  }, []);

  const handleSelectSlot = useCallback((date: Date, hour: number, minute: number) => {
    setLiveState((current) => ({
      ...current,
      selectedDateIso: date.toISOString(),
      selectedTime: timeFromParts(hour, minute),
      step: current.viewMode === "list" ? "confirm-modal-list" : "confirm-modal-week",
    }));
  }, []);

  const handleConfirm = useCallback(() => {
    setLiveState((current) => ({ ...current, step: "success" }));
  }, []);

  const handleBackFromForm = useCallback(() => {
    setLiveState((current) => ({ ...current, step: "month-picker", viewMode: "month" }));
  }, []);

  const handleBackFromModal = useCallback(() => {
    setLiveState((current) => ({
      ...current,
      step: current.viewMode === "list" ? "list-view" : "week-grid",
    }));
  }, []);

  const handleBackToBookings = useCallback(() => {
    setLiveState(createDefaultLiveState());
  }, []);

  const sharedSchedulingProps = {
    selectedDate,
    onSelectDate: handleSelectDate,
    use24h: liveState.use24h,
    onUse24hChange: (use24h: boolean) =>
      setLiveState((current) => ({ ...current, use24h })),
    overlayCalendar: liveState.overlayCalendar,
    onOverlayCalendarChange: (overlayCalendar: boolean) =>
      setLiveState((current) => ({ ...current, overlayCalendar })),
    viewMode: liveState.viewMode,
    onViewModeChange: setViewMode,
  };

  return (
    <PrototypeComponent
      id="scroll-container"
      className="bg-default text-default flex h-full min-h-0 flex-1 flex-col overflow-hidden"
      data-cal-design-system
    >
      <PrototypeComponent
        id="page"
        className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {liveState.step === "month-picker" ? (
            <BookingViewTransition key="month-picker">
              <BookingMonthView
                {...sharedSchedulingProps}
                onSelectTime={handleSelectTimeFromMonth}
              />
            </BookingViewTransition>
          ) : null}

          {liveState.step === "week-grid" ? (
            <BookingViewTransition key="week-grid">
              <BookingWeekView
                {...sharedSchedulingProps}
                onSelectSlot={handleSelectSlot}
              />
            </BookingViewTransition>
          ) : null}

          {liveState.step === "list-view" ? (
            <BookingViewTransition key="list-view">
              <BookingListView
                {...sharedSchedulingProps}
                onSelectSlot={handleSelectSlot}
              />
            </BookingViewTransition>
          ) : null}

          {liveState.step === "form-page" ? (
            <BookingPageTransition key="form-page">
              <BookingFormView
                selectedDate={selectedDate}
                selectedTime={liveState.selectedTime}
                use24h={liveState.use24h}
                onBack={handleBackFromForm}
                onConfirm={handleConfirm}
              />
            </BookingPageTransition>
          ) : null}

          {liveState.step === "success" ? (
            <BookingPageTransition key="success">
              <BookingSuccessView
                selectedDate={selectedDate}
                selectedTime={liveState.selectedTime}
                use24h={liveState.use24h}
                onBackToBookings={handleBackToBookings}
              />
            </BookingPageTransition>
          ) : null}
        </AnimatePresence>

        {liveState.step === "confirm-modal-week" ? (
          <div className="absolute inset-0 min-h-full">
            <BookingWeekView
              {...sharedSchedulingProps}
              onSelectSlot={handleSelectSlot}
              dimmed
            />
            <BookingModalBackdrop onClose={handleBackFromModal}>
              <BookingConfirmModalContent
                selectedDate={selectedDate}
                selectedTime={liveState.selectedTime}
                use24h={liveState.use24h}
                onBack={handleBackFromModal}
                onConfirm={handleConfirm}
              />
            </BookingModalBackdrop>
          </div>
        ) : null}

        {liveState.step === "confirm-modal-list" ? (
          <div className="absolute inset-0 min-h-full">
            <BookingListView
              {...sharedSchedulingProps}
              onSelectSlot={handleSelectSlot}
              dimmed
            />
            <BookingModalBackdrop onClose={handleBackFromModal}>
              <BookingConfirmModalContent
                selectedDate={selectedDate}
                selectedTime={liveState.selectedTime}
                use24h={liveState.use24h}
                onBack={handleBackFromModal}
                onConfirm={handleConfirm}
              />
            </BookingModalBackdrop>
          </div>
        ) : null}

        <BookingFlowPreviewStateSelect step={liveState.step} onStepChange={setStep} />
      </PrototypeComponent>
    </PrototypeComponent>
  );
}
