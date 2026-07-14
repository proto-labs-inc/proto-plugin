import { isRootAnnotation } from "./comment-threads";
import type { CommentAnnotationFields } from "./types";

export function isAnnotationDeleted(
  annotation: Pick<CommentAnnotationFields, "deleted">,
): boolean {
  return annotation.deleted === true;
}

export function isAnnotationResolved(
  annotation: Pick<CommentAnnotationFields, "status">,
): boolean {
  return annotation.status === "resolved";
}

export function isVisibleAnnotation(
  annotation: Pick<CommentAnnotationFields, "deleted">,
): boolean {
  return !isAnnotationDeleted(annotation);
}

export function countUnresolvedAnnotations(
  annotations: readonly Pick<
    CommentAnnotationFields,
    "status" | "deleted" | "parentId"
  >[],
): number {
  return annotations.filter(
    (a) =>
      isVisibleAnnotation(a) &&
      isRootAnnotation(a) &&
      !isAnnotationResolved(a),
  ).length;
}

/** Skips deleted root annotations. Default order is newest first. */
export function sortAnnotationsForDisplay<T extends CommentAnnotationFields>(
  annotations: readonly T[],
  order: "newest" | "oldest" = "newest",
): T[] {
  return [...annotations]
    .filter(isVisibleAnnotation)
    .filter(isRootAnnotation)
    .sort((a, b) =>
      order === "newest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp,
    );
}

export function getAdjacentDisplayCommentId<T extends CommentAnnotationFields>(
  sorted: readonly T[],
  currentId: string,
  direction: "prev" | "next",
): string | null {
  const index = sorted.findIndex((annotation) => annotation.id === currentId);
  if (index === -1) return null;

  const nextIndex = direction === "prev" ? index - 1 : index + 1;
  if (nextIndex < 0 || nextIndex >= sorted.length) return null;
  return sorted[nextIndex]?.id ?? null;
}
