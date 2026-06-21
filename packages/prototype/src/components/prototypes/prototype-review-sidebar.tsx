"use client";

import { filterAnnotationsByChannel } from "@prototype/lib/prototype-comments/core/annotation-channel";
import { countUnresolvedAnnotations } from "@prototype/lib/prototype-comments/core/annotation-status";
import { getRootAnnotations } from "@prototype/lib/prototype-comments/core/comment-threads";
import { useCommentStore } from "@prototype/lib/prototype-comments/react/CommentProvider";
import { CommentHeaderCount } from "@prototype/lib/prototype-comments/ui/CommentHeaderCount";
import { CommentsGrid } from "@prototype/lib/prototype-comments/ui/CommentsGrid";
import { usePrototypeReview } from "@prototype/lib/prototypes/prototype-review-context";
import {
  SIDEBAR_ICON_BUTTON_CLASS,
  Sidebar,
} from "@prototype/components/platform-ui/sidebar";
import { IconButton } from "@prototype/components/platform-ui/icon-button";
import { cn } from "@prototype/lib/utils";
import { EmptyState } from "@prototype/components/platform-ui/empty-state";
import { PrototypeChangeLogPanel } from "@prototype/components/prototypes/prototype-change-log-panel";
import { miniPillTextFromLabel } from "@prototype/components/prototypes/mini-pill-label";
import { MessageSquarePlus } from "lucide-react";
import { useMemo } from "react";

type PrototypeReviewSidebarProps = {
  onSelect: (id: string) => void;
  selectedId?: string | null;
  onClose: () => void;
  isCommentModeActive?: boolean;
  onToggleCommentMode?: () => void;
};

export function PrototypeReviewSidebar({
  onSelect,
  selectedId,
  onClose,
  isCommentModeActive = false,
  onToggleCommentMode,
}: PrototypeReviewSidebarProps) {
  const review = usePrototypeReview();
  const { annotations, deleteAnnotation, updateAnnotation, resolveAnnotation, storageError, storageReady } = useCommentStore();
  const isVariantsPanel = review.sidebarPanel === "variants";
  const isChangeLogPanel = review.sidebarPanel === "change-log";
  const isSpecPanel = review.sidebarPanel === "spec";

  const activeVariantLabel = useMemo(() => {
    if (!review.activeVariantSetId) return "Variants";
    const label = review.variantSets.find(
      (set) => set.id === review.activeVariantSetId,
    )?.label;
    return label ? miniPillTextFromLabel(label) : "Variants";
  }, [review.activeVariantSetId, review.variantSets]);

  const variantsContent = useMemo(() => {
    if (!isVariantsPanel) return null;
    if (review.activeVariantSetId) {
      return review.getVariantSidebarContent(review.activeVariantSetId);
    }
    return review.getLegacyVariantSidebarContent();
  }, [
    isVariantsPanel,
    review.activeVariantSetId,
    review.variantSidebarRevision,
    review.getVariantSidebarContent,
    review.getLegacyVariantSidebarContent,
  ]);

  const commentAnnotations = useMemo(
    () => filterAnnotationsByChannel(annotations, "comment"),
    [annotations],
  );
  const unresolvedCount = countUnresolvedAnnotations(commentAnnotations);
  const totalCount = getRootAnnotations(commentAnnotations).length;

  const specContent = isSpecPanel ? review.specContentRef.current : null;

  const isCommentsPanel =
    !isVariantsPanel && !isChangeLogPanel && !isSpecPanel;

  const sidebarText = isVariantsPanel
    ? activeVariantLabel
    : isChangeLogPanel
      ? "Overview"
      : isSpecPanel
        ? "PRs"
        : "Comments";

  return (
    <Sidebar
      open={review.open}
      text={sidebarText}
      titleAddon={
        isCommentsPanel ? (
          <CommentHeaderCount
            unresolved={unresolvedCount}
            total={totalCount}
          />
        ) : undefined
      }
      headerActions={
        isCommentsPanel && onToggleCommentMode ? (
          <IconButton
            type="button"
            onClick={onToggleCommentMode}
            onMouseDown={(event) => event.preventDefault()}
            aria-label={
              isCommentModeActive ? "Exit comment mode" : "Add comment"
            }
            aria-pressed={isCommentModeActive}
            className={cn(
              SIDEBAR_ICON_BUTTON_CLASS,
              isCommentModeActive && "bg-accent text-accent-foreground",
            )}
          >
            <MessageSquarePlus size={16} strokeWidth={2} />
          </IconButton>
        ) : undefined
      }
      onClose={
        isVariantsPanel
          ? review.closeVariants
          : isSpecPanel
            ? review.closeSidebar
            : isChangeLogPanel
              ? review.closeSidebar
              : onClose
      }
      ariaLabel={
        isVariantsPanel
          ? "Variants panel"
          : isChangeLogPanel
            ? "Overview panel"
            : isSpecPanel
              ? "PRs panel"
              : "Review panel"
      }
      dataAttribute="data-prototype-review-sidebar"
      widthCssVar="--comments-sidebar-width"
    >
      {isSpecPanel ? (
        specContent ?? (
          <EmptyState>
            No PRs configured yet. Add a PR split spec on this prototype to
            see implementation cards here.
          </EmptyState>
        )
      ) : isVariantsPanel ? (
        variantsContent ?? (
          <EmptyState>No variant overview available.</EmptyState>
        )
      ) : isChangeLogPanel ? (
        <PrototypeChangeLogPanel onSelect={onSelect} selectedId={selectedId} />
      ) : !storageReady ? (
        <EmptyState>Loading comments…</EmptyState>
      ) : storageError ? (
        <EmptyState>{storageError}</EmptyState>
      ) : (
        <CommentsGrid
          annotations={commentAnnotations}
          layout="sidebar"
          onSelect={onSelect}
          onDelete={deleteAnnotation}
          onUpdateComment={updateAnnotation}
          onResolve={resolveAnnotation}
          selectedId={selectedId}
        />
      )}
    </Sidebar>
  );
}
