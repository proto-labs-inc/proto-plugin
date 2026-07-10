"use client";

import { usePrototypeReviewOptional } from "proto-plugin";
import { useLayoutEffect } from "react";

export const AUTOMAT_ANALYTICS_VARIANT_SET = {
  id: "automat-analytics-layout",
  label: "Analytics layout",
} as const;

export const AUTOMAT_WORKFLOWS_PAGE_VARIANT_SETS = [AUTOMAT_ANALYTICS_VARIANT_SET] as const;

export type AutomatWorkflowsPageVariantSetId =
  (typeof AUTOMAT_WORKFLOWS_PAGE_VARIANT_SETS)[number]["id"];

export function useRegisterAutomatWorkflowsPageVariantSets() {
  const review = usePrototypeReviewOptional();
  const registerVariantSet = review?.registerVariantSet;
  const unregisterVariantSet = review?.unregisterVariantSet;

  useLayoutEffect(() => {
    if (!registerVariantSet || !unregisterVariantSet) return;

    for (const set of AUTOMAT_WORKFLOWS_PAGE_VARIANT_SETS) {
      registerVariantSet(set);
    }

    return () => {
      for (const set of AUTOMAT_WORKFLOWS_PAGE_VARIANT_SETS) {
        unregisterVariantSet(set.id);
      }
    };
  }, [registerVariantSet, unregisterVariantSet]);
}
