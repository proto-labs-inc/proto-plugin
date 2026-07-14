"use client";

import { usePrototypeReviewOptional } from "proto-plugin";
import { useLayoutEffect } from "react";

export const SHAPE_COLOR_PICKER_VARIANT_SET = {
  id: "shape-color-picker",
  label: "Shape & color picker",
} as const;

export const PROTO_SHAPES_VARIANT_SET = {
  id: "proto-shapes",
  label: "Proto shapes",
} as const;

export const INVITE_COPY_VARIANT_SET = {
  id: "invite-copy",
  label: "Invite copy",
} as const;

export const INVITE_ANIMATIONS_VARIANT_SET = {
  id: "invite-animations",
  label: "Invite animations",
} as const;

export const MOBILE_PICKER_LAYOUT_VARIANT_SET = {
  id: "mobile-picker-layout",
  label: "Mobile picker layout",
} as const;

export const MOBILE_PANEL_MOTION_VARIANT_SET = {
  id: "mobile-panel-motion",
  label: "Mobile panel motion",
} as const;

export const SUBMIT_MODAL_VARIANT_SET = {
  id: "submit-modal",
  label: "Submit modal",
} as const;

export const INVITE_FOLLOW_UP_SHAPE_LAYOUT_VARIANT_SET = {
  id: "invite-follow-up-shape-layout",
  label: "Follow-up shape layout",
} as const;

export const CREATOR_ATTRIBUTION_VARIANT_SET = {
  id: "creator-attribution",
  label: "Creator attribution",
} as const;

export const PROTO_PARTNER_PAGE_VARIANT_SETS = [
  CREATOR_ATTRIBUTION_VARIANT_SET,
  SUBMIT_MODAL_VARIANT_SET,
  MOBILE_PANEL_MOTION_VARIANT_SET,
  MOBILE_PICKER_LAYOUT_VARIANT_SET,
  INVITE_FOLLOW_UP_SHAPE_LAYOUT_VARIANT_SET,
  INVITE_ANIMATIONS_VARIANT_SET,
  SHAPE_COLOR_PICKER_VARIANT_SET,
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
