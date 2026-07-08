"use client";

import { IconButton } from "@prototype/components/platform-ui/icon-button";
import { cn } from "@prototype/lib/utils";
import { MessageSquarePlus } from "lucide-react";

type CommentModeToggleButtonProps = {
  isActive: boolean;
  onClick: () => void;
};

export function CommentModeToggleButton({
  isActive,
  onClick,
}: CommentModeToggleButtonProps) {
  return (
    <IconButton
      type="button"
      variant="chrome"
      size="icon"
      onClick={onClick}
      onMouseDown={(event) => event.preventDefault()}
      data-prototype-comment-mode-toggle
      aria-label={isActive ? "Exit comment mode" : "Add comment"}
      aria-pressed={isActive}
      className={cn(
        "size-8 shrink-0",
        isActive && "bg-accent text-accent-foreground hover:bg-accent/90 hover:text-accent-foreground",
      )}
    >
      <MessageSquarePlus size={16} strokeWidth={2} />
    </IconButton>
  );
}
