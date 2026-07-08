"use client";

import { usePrototypeReviewOptional } from "proto-plugin";
import { useLayoutEffect } from "react";

export const EVENT_TYPES_PAGE_LAYOUT_VARIANT_SET = {
  id: "event-types-page-layout",
  label: "Page layout",
} as const;

export const EVENT_TYPES_SECRET_EVENTS_TRANSITION_VARIANT_SET = {
  id: "event-types-secret-events-filter",
  label: "Secret events filter",
} as const;

export const EVENT_TYPES_VARIANT_SETS = [
  EVENT_TYPES_SECRET_EVENTS_TRANSITION_VARIANT_SET,
  EVENT_TYPES_PAGE_LAYOUT_VARIANT_SET,
] as const;

export type EventTypesVariantSetId =
  (typeof EVENT_TYPES_VARIANT_SETS)[number]["id"];

export function useRegisterEventTypesVariantSets() {
  const review = usePrototypeReviewOptional();
  const registerVariantSet = review?.registerVariantSet;
  const unregisterVariantSet = review?.unregisterVariantSet;

  useLayoutEffect(() => {
    if (!registerVariantSet || !unregisterVariantSet) return;

    for (const set of EVENT_TYPES_VARIANT_SETS) {
      registerVariantSet(set);
    }

    return () => {
      for (const set of EVENT_TYPES_VARIANT_SETS) {
        unregisterVariantSet(set.id);
      }
    };
  }, [registerVariantSet, unregisterVariantSet]);
}
