"use client";

import { countUnresolvedAnnotations } from "../core/annotation-status";
import { useCommentStore } from "../react/CommentProvider";
import { CommentHeaderCount } from "./CommentHeaderCount";
import { CommentModeToggleButton } from "./CommentModeToggleButton";
import { CommentsGrid } from "./CommentsGrid";
import { Sidebar } from "@prototype/components/platform-ui/sidebar";

type CommentsSidebarProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  selectedId?: string | null;
  isCommentModeActive?: boolean;
  onToggleCommentMode?: () => void;
};

export function CommentsSidebar({
  open,
  onClose,
  onSelect,
  selectedId,
  isCommentModeActive = false,
  onToggleCommentMode,
}: CommentsSidebarProps) {
  const { annotations, deleteAnnotation, updateAnnotation, resolveAnnotation } =
    useCommentStore();
  const unresolvedCount = countUnresolvedAnnotations(annotations);
  const totalCount = annotations.length;

  return (
    <Sidebar
      open={open}
      text="Comments"
      titleAddon={
        <CommentHeaderCount unresolved={unresolvedCount} total={totalCount} />
      }
      onClose={onClose}
      ariaLabel="Comments"
      dataAttribute="data-comments-sidebar"
      widthCssVar="--comments-sidebar-width"
      headerActions={
        onToggleCommentMode ? (
          <CommentModeToggleButton
            isActive={isCommentModeActive}
            onClick={onToggleCommentMode}
          />
        ) : null
      }
    >
      <CommentsGrid
        annotations={annotations}
        layout="sidebar"
        onSelect={onSelect}
        onDelete={deleteAnnotation}
        onUpdateComment={updateAnnotation}
        onResolve={resolveAnnotation}
        selectedId={selectedId}
      />
    </Sidebar>
  );
}
