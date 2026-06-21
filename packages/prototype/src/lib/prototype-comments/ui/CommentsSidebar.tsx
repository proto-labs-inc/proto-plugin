"use client";

import { countUnresolvedAnnotations } from "../core/annotation-status";
import { useCommentStore } from "../react/CommentProvider";
import { CommentHeaderCount } from "./CommentHeaderCount";
import { CommentsGrid } from "./CommentsGrid";
import {
  SIDEBAR_ICON_BUTTON_CLASS,
  Sidebar,
} from "@prototype/components/platform-ui/sidebar";
import { IconButton } from "@prototype/components/platform-ui/icon-button";
import { cn } from "@prototype/lib/utils";
import { MessageSquarePlus } from "lucide-react";

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
          <IconButton
            type="button"
            onClick={onToggleCommentMode}
            onMouseDown={(event) => event.preventDefault()}
            aria-label={isCommentModeActive ? "Exit comment mode" : "Add comment"}
            aria-pressed={isCommentModeActive}
            className={cn(
              SIDEBAR_ICON_BUTTON_CLASS,
              isCommentModeActive && "bg-accent text-accent-foreground",
            )}
          >
            <MessageSquarePlus size={16} strokeWidth={2} />
          </IconButton>
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
