"use client";

import { PrototypeReviewChrome } from "@prototype/components/prototypes/prototype-review-chrome";
import { PrototypeShareLinkRestore } from "@prototype/components/prototypes/prototype-share-link-restore";
import { PrototypeShareMode } from "@prototype/components/prototypes/prototype-share-mode";
import {
  CommentCaptureToolbar,
  useCommentCaptureBridge,
} from "@prototype/lib/prototype-comments/react/CommentCaptureToolbar";
import { usePrototypeCommentRegistry } from "@prototype/lib/prototypes/prototype-comment-registry";
import { usePrototypeReviewOptional } from "@prototype/lib/prototypes/prototype-review-context";
import { usePathname } from "next/navigation";

function IntegratedReviewChrome() {
  const bridge = useCommentCaptureBridge();

  return (
    <PrototypeReviewChrome
      onSelect={bridge.onSelect}
      selectedId={bridge.selectedId}
      onOpenCommentsPanel={bridge.onOpenCommentsPanel}
      isCommentModeActive={bridge.isCommentModeActive}
      onToggleCommentMode={bridge.onToggleCommentMode}
      onClose={bridge.onClose}
    />
  );
}

function useOnStateMapPage(): boolean {
  const pathname = usePathname();
  const review = usePrototypeReviewOptional();
  const stateMapPath = review?.stateCanvasPagePath;

  if (stateMapPath != null) {
    return pathname.startsWith(stateMapPath);
  }

  return /\/prototypes\/[^/]+\/states\/?$/.test(pathname);
}

export function PrototypeCommentToolbar() {
  const { readHandlers } = usePrototypeCommentRegistry();
  const review = usePrototypeReviewOptional();
  const onStateMapPage = useOnStateMapPage();

  if (onStateMapPage) {
    return null;
  }

  return (
    <CommentCaptureToolbar
      resolveTargetOptions={() =>
        readHandlers()?.resolveTargetOptions?.() ?? {}
      }
    >
      {review ? (
        <>
          <IntegratedReviewChrome />
          <PrototypeShareMode />
          <PrototypeShareLinkRestore />
        </>
      ) : null}
    </CommentCaptureToolbar>
  );
}
