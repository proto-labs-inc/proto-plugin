"use client";

import { usePrototypeReviewOptional } from "proto-plugin";
import { useLayoutEffect } from "react";

import type { ProtoPartnerPagePreviewStateId } from "./proto-partner-page-preview-states";

export const SHAPE_COLOR_PICKER_VARIANT_SET = {
  id: "shape-color-picker",
  label: "Shape & color picker",
} as const;

export const INVITE_COPY_VARIANT_SET = {
  id: "invite-copy",
  label: "Invite copy",
} as const;

export const INVITE_ANIMATIONS_VARIANT_SET = {
  id: "invite-animations",
  label: "Invite animations",
} as const;

export const SUBMIT_MODAL_VARIANT_SET = {
  id: "submit-modal",
  label: "Submit modal",
} as const;

export const INVITE_FOLLOW_UP_SHAPE_LAYOUT_VARIANT_SET = {
  id: "invite-follow-up-shape-layout",
  label: "Follow-up shape layout",
} as const;

export const PROTO_PARTNER_PAGE_VARIANT_SETS = [
  SUBMIT_MODAL_VARIANT_SET,
  INVITE_FOLLOW_UP_SHAPE_LAYOUT_VARIANT_SET,
  INVITE_ANIMATIONS_VARIANT_SET,
  SHAPE_COLOR_PICKER_VARIANT_SET,
  INVITE_COPY_VARIANT_SET,
] as const;

export type PartnerPageVariantSetId =
  (typeof PROTO_PARTNER_PAGE_VARIANT_SETS)[number]["id"];

/** Preview state to open when a design exploration is activated. */
export const PARTNER_VARIANT_SET_PREVIEW_STATE = {
  "invite-copy": "invite",
  "invite-animations": "invite",
  "invite-follow-up-shape-layout": "invite-follow-up",
  "shape-color-picker": "customize",
  "submit-modal": "submit-modal",
} as const satisfies Record<
  PartnerPageVariantSetId,
  ProtoPartnerPagePreviewStateId
>;

type UseRegisterPartnerVariantSetsOptions = {
  onActivate?: (setId: PartnerPageVariantSetId) => void;
};

export function useRegisterPartnerVariantSets(
  options: UseRegisterPartnerVariantSetsOptions = {},
) {
  const review = usePrototypeReviewOptional();
  const registerVariantSet = review?.registerVariantSet;
  const unregisterVariantSet = review?.unregisterVariantSet;
  const { onActivate } = options;

  useLayoutEffect(() => {
    if (!registerVariantSet || !unregisterVariantSet) return;

    for (const set of PROTO_PARTNER_PAGE_VARIANT_SETS) {
      registerVariantSet({
        ...set,
        onActivate: onActivate ? () => onActivate(set.id) : undefined,
      });
    }

    return () => {
      for (const set of PROTO_PARTNER_PAGE_VARIANT_SETS) {
        unregisterVariantSet(set.id);
      }
    };
  }, [onActivate, registerVariantSet, unregisterVariantSet]);
}
