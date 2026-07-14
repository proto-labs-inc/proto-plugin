"use client";

import type { PrototypeComponentRegistry } from "@prototype/lib/prototypes/prototype-component-registry";

import { PrototypeCommentRoot } from "@prototype/components/prototypes/prototype-comment-provider";
import { PrototypeCommentToolbar } from "@prototype/components/prototypes/prototype-comment-toolbar";
import { PrototypeCommentReviewBridge } from "@prototype/lib/prototypes/prototype-comment-review-bridge";
import {
  PROTOTYPE_MOBILE_VIEWPORT_HEIGHT_PX,
  PROTOTYPE_MOBILE_VIEWPORT_WIDTH_PX,
  PrototypeReviewProvider,
  usePrototypeReview,
} from "@prototype/lib/prototypes/prototype-review-context";
import {
  PROTOTYPE_CHROME_ROOT_ID,
  PROTOTYPE_COMMENTS_SIDEBAR_ROOT_ID,
  PROTOTYPE_PREVIEW_STAGE_ID,
  PROTOTYPE_TOOL_OVERLAY_ROOT_ID,
  PROTOTYPE_VIEWPORT_ID,
} from "@prototype/lib/tool-portal";
import { cn } from "@prototype/lib/utils";

import { PrototypeProvider } from "@prototype/components/prototype-provider";

import { PrototypeScreenshotCapture } from "./prototype-screenshot-capture";
import { PrototypeStateScreenshotCapture } from "./prototype-state-screenshot-capture";
import styles from "./prototype-shell.module.scss";
import { usePathname } from "next/navigation";

type PrototypeShellProps = {
  slug: string;
  componentRegistry?: PrototypeComponentRegistry;
  children: React.ReactNode;
};

function PrototypeCommentsSidebarHost() {
  const review = usePrototypeReview();
  const isMobileViewport = review.viewportLayout === "mobile";
  const hideWhenClosed = isMobileViewport && !review.open;

  return (
    <div
      id={PROTOTYPE_COMMENTS_SIDEBAR_ROOT_ID}
      className={cn(
        styles.commentsSidebarRoot,
        "flex h-full min-h-0 shrink-0 flex-col overflow-hidden",
        hideWhenClosed && styles.commentsSidebarRootClosed,
      )}
    />
  );
}

function useOnStateMapPage(): boolean {
  const pathname = usePathname();
  const review = usePrototypeReview();
  const stateMapPath = review.stateCanvasPagePath;

  if (stateMapPath != null) {
    return pathname.startsWith(stateMapPath);
  }

  return /\/prototypes\/[^/]+\/states\/?$/.test(pathname);
}

function PrototypePreviewArea({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const review = usePrototypeReview();
  const isMobileViewport = review.viewportLayout === "mobile";
  const onStateMapPage = useOnStateMapPage();

  return (
    <div
      id={PROTOTYPE_PREVIEW_STAGE_ID}
      className={cn(
        styles.previewStage,
        onStateMapPage && styles.previewStageStateMap,
        isMobileViewport && styles.previewStageMobile,
        review.open && styles.previewStageSidebarOpen,
      )}
    >
      <div className={styles.previewStageBody}>
        <div
          id={PROTOTYPE_TOOL_OVERLAY_ROOT_ID}
          className={styles.toolOverlayRoot}
          data-prototype-tool-overlay-root
        />
        <div
          className={cn(
            styles.viewportFrame,
            isMobileViewport && styles.viewportFrameMobile,
          )}
        >
          <div
            id={PROTOTYPE_VIEWPORT_ID}
            {...(onStateMapPage ? {} : { "data-prototype-screenshot": true })}
            data-prototype-viewport-layout={review.viewportLayout}
            className={cn(
              styles.viewport,
              isMobileViewport && styles.viewportMobile,
            )}
            style={
              isMobileViewport
                ? {
                    ["--prototype-mobile-viewport-width" as string]: `${PROTOTYPE_MOBILE_VIEWPORT_WIDTH_PX}px`,
                    ["--prototype-mobile-viewport-height" as string]: `${PROTOTYPE_MOBILE_VIEWPORT_HEIGHT_PX}px`,
                  }
                : undefined
            }
          >
            <div className={styles.viewportContent}>
              <div className={styles.viewportPage}>{children}</div>
            </div>
            {!onStateMapPage ? (
              <>
                <PrototypeScreenshotCapture slug={slug} />
                <PrototypeStateScreenshotCapture
                  slug={slug}
                  stateId={review.activePreviewStateId}
                />
              </>
            ) : null}
          </div>
        </div>
      </div>
      {!onStateMapPage ? (
        <div
          id={PROTOTYPE_CHROME_ROOT_ID}
          className={styles.reviewFooter}
          data-prototype-review-footer
        />
      ) : null}
    </div>
  );
}

function PrototypeShellLayout({ children }: { children: React.ReactNode }) {
  const onStateMapPage = useOnStateMapPage();

  return (
    <PrototypeProvider
      className={cn(
        "flex h-svh w-full flex-col overflow-hidden",
        onStateMapPage ? "bg-[var(--tool-chrome-bg)]" : "bg-[var(--bg-ground)]",
      )}
    >
      {children}
    </PrototypeProvider>
  );
}

export function PrototypeShell({
  slug,
  componentRegistry,
  children,
}: PrototypeShellProps) {
  return (
    <PrototypeCommentRoot slug={slug} componentRegistry={componentRegistry}>
      <PrototypeReviewProvider slug={slug}>
        <PrototypeCommentReviewBridge />
        <PrototypeShellLayout>
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <PrototypePreviewArea slug={slug}>{children}</PrototypePreviewArea>
            <PrototypeCommentsSidebarHost />
          </div>
          <PrototypeCommentToolbar />
        </PrototypeShellLayout>
      </PrototypeReviewProvider>
    </PrototypeCommentRoot>
  );
}
