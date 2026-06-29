"use client";

import { usePrototypeReviewOptional } from "@prototype/lib/prototypes/prototype-review-context";
import { useLayoutEffect } from "react";

export const PROTO_SHAPES_VARIANT_SET = {
  id: "proto-shapes",
  label: "Proto shapes",
} as const;

export const INVITE_COPY_VARIANT_SET = {
  id: "invite-copy",
  label: "Invite copy",
} as const;

export const PROTO_PARTNER_PAGE_VARIANT_SETS = [
  PROTO_SHAPES_VARIANT_SET,
  INVITE_COPY_VARIANT_SET,
] as const;

export type PartnerPageVariantSetId =
  (typeof PROTO_PARTNER_PAGE_VARIANT_SETS)[number]["id"];

export function useRegisterPartnerVariantSets() {
  const review = usePrototypeReviewOptional();
  const registerVariantSet = review?.registerVariantSet;
  const unregisterVariantSet = review?.unregisterVariantSet;

  useLayoutEffect(() => {
    if (!registerVariantSet || !unregisterVariantSet) return;

    for (const set of PROTO_PARTNER_PAGE_VARIANT_SETS) {
      registerVariantSet(set);
    }

    return () => {
      for (const set of PROTO_PARTNER_PAGE_VARIANT_SETS) {
        unregisterVariantSet(set.id);
      }
    };
  }, [registerVariantSet, unregisterVariantSet]);
}
