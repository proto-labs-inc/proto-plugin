"use client";

import { Button } from "@prototype/components/ui/button";
import {
  buildCommentStorageSetupCopyText,
  COMMENT_STORAGE_NOT_CONFIGURED_MESSAGE,
} from "@prototype/lib/prototypes/comment-storage-setup-prompt";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";

type PrototypeCommentStorageEmptyStateProps = {
  message?: string;
  vercelProjectName?: string;
};

export function PrototypeCommentStorageEmptyState({
  message = COMMENT_STORAGE_NOT_CONFIGURED_MESSAGE,
  vercelProjectName,
}: PrototypeCommentStorageEmptyStateProps) {
  const { copy, icon, isCopied } = useCopyToClipboard();

  return (
    <div className="px-1 py-2">
      <p className="text-sm text-muted-foreground">{message}</p>
      <div className="mt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 cursor-pointer gap-1.5"
          onClick={() => {
            copy(buildCommentStorageSetupCopyText({ vercelProjectName }));
          }}
          aria-label="Copy comment storage setup prompt"
        >
          {isCopied ? "Copied prompt" : "Copy setup prompt"}
          {icon}
        </Button>
      </div>
    </div>
  );
}
