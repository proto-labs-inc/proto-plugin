import { cn } from "@prototype/lib/utils";

import styles from "./comment-author-avatar.module.scss";

export const DEFAULT_COMMENT_AUTHOR_INITIAL = "M";

export function getCommentAuthorInitial(name?: string | null): string {
  const trimmed = name?.trim();
  if (!trimmed) return DEFAULT_COMMENT_AUTHOR_INITIAL;
  return trimmed.charAt(0).toUpperCase();
}

type CommentAuthorAvatarProps = {
  name?: string | null;
  size?: "sm" | "md";
  className?: string;
};

export function CommentAuthorAvatar({
  name,
  size = "md",
  className,
}: CommentAuthorAvatarProps) {
  const trimmedName = name?.trim() ?? "";
  const initial = getCommentAuthorInitial(name);

  return (
    <span
      className={cn(
        styles.avatar,
        size === "sm" && styles.avatarSm,
        className,
      )}
      title={trimmedName || undefined}
      aria-label={trimmedName || "Unknown author"}
    >
      {initial}
    </span>
  );
}
