"use client";

import { usePrototypeCommentRegistry } from "@prototype/lib/prototypes/prototype-comment-registry";
import { usePrototypeReviewOptional } from "@prototype/lib/prototypes/prototype-review-context";
import {
  clearShareComponentParams,
  readShareLinkParams,
  scrollPrototypeTargetIntoView,
} from "@prototype/lib/prototypes/prototype-share-link";
import { useEffect, useRef } from "react";

const HANDLER_RETRY_MS = 50;
const HANDLER_RETRY_LIMIT = 40;

export function PrototypeShareLinkRestore() {
  const { readHandlers } = usePrototypeCommentRegistry();
  const review = usePrototypeReviewOptional();
  const restoredRef = useRef(false);

  useEffect(() => {
    if (restoredRef.current || !review) return;

    const shareParams = readShareLinkParams(
      new URLSearchParams(window.location.search),
    );
    if (!shareParams) return;

    let attempts = 0;

    const completeRestore = () => {
      restoredRef.current = true;

      const targetId = shareParams.targetId;

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          scrollPrototypeTargetIntoView(targetId);
          review.focusShareTarget(targetId);

          const url = new URL(window.location.href);
          clearShareComponentParams(url);
          window.history.replaceState(null, "", url);
        });
      });
    };

    const tryRestore = () => {
      if (restoredRef.current) return;

      const handlers = readHandlers();
      const needsStateRestore = shareParams.state != null;

      if (needsStateRestore && !handlers?.onRestore) {
        if (attempts >= HANDLER_RETRY_LIMIT) {
          completeRestore();
          return;
        }

        attempts += 1;
        window.setTimeout(tryRestore, HANDLER_RETRY_MS);
        return;
      }

      if (needsStateRestore && handlers?.onRestore) {
        handlers.onRestore(shareParams.state);
      }

      completeRestore();
    };

    tryRestore();
  }, [readHandlers, review]);

  return null;
}
