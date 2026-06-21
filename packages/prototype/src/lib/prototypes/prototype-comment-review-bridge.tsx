"use client";

import { useLayoutEffect, useRef } from "react";

import { usePrototypeReviewOptional } from "./prototype-review-context";
import { usePrototypeCommentRegistry } from "./prototype-comment-registry";
import type { PrototypeCommentReviewStateBridge } from "./prototype-comment-review-state";

/** Registers prod-reference toggle state with the comment capture/restore pipeline. */
export function PrototypeCommentReviewBridge() {
  const review = usePrototypeReviewOptional();
  const { registerReviewStateBridge } = usePrototypeCommentRegistry();
  const reviewRef = useRef(review);
  reviewRef.current = review;

  useLayoutEffect(() => {
    const currentReview = reviewRef.current;
    if (!currentReview?.prodReferenceAvailable) {
      registerReviewStateBridge(null);
      return;
    }

    const bridge: PrototypeCommentReviewStateBridge = {
      prodReferenceAvailable: true,
      getShowProdReference: () => reviewRef.current?.showProdReference ?? false,
      setShowProdReference: (show) => {
        reviewRef.current?.setShowProdReference(show);
      },
    };

    registerReviewStateBridge(bridge);
    return () => registerReviewStateBridge(null);
  }, [
    registerReviewStateBridge,
    review?.prodReferenceAvailable,
    review?.setShowProdReference,
  ]);

  return null;
}
