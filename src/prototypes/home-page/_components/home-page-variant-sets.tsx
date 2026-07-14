"use client";

import { usePrototypeReviewOptional } from "proto-plugin";
import { useLayoutEffect } from "react";

export const SHAPE_COLORS_VARIANT_SET = {
  id: "shape-colors",
  label: "Shape colors",
} as const;

export const HOME_PAGE_VARIANT_SETS = [SHAPE_COLORS_VARIANT_SET] as const;

export type HomePageVariantSetId =
  (typeof HOME_PAGE_VARIANT_SETS)[number]["id"];

export function useRegisterHomeVariantSets() {
  const review = usePrototypeReviewOptional();
  const registerVariantSet = review?.registerVariantSet;
  const unregisterVariantSet = review?.unregisterVariantSet;

  useLayoutEffect(() => {
    if (!registerVariantSet || !unregisterVariantSet) return;

    for (const set of HOME_PAGE_VARIANT_SETS) {
      registerVariantSet(set);
    }

    return () => {
      for (const set of HOME_PAGE_VARIANT_SETS) {
        unregisterVariantSet(set.id);
      }
    };
  }, [registerVariantSet, unregisterVariantSet]);
}
