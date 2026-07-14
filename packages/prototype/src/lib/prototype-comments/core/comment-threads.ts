import type { CommentAnnotationFields } from "./types";
import { isVisibleAnnotation } from "./annotation-status";

export function isRootAnnotation(
  annotation: Pick<CommentAnnotationFields, "parentId">,
): boolean {
  return !annotation.parentId;
}

export function getThreadRootId(
  annotation: Pick<CommentAnnotationFields, "id" | "parentId">,
): string {
  return annotation.parentId ?? annotation.id;
}

export function getRepliesForParent<T extends CommentAnnotationFields>(
  annotations: readonly T[],
  parentId: string,
): T[] {
  return annotations
    .filter(
      (a) =>
        isVisibleAnnotation(a) &&
        a.parentId === parentId,
    )
    .sort((a, b) => a.timestamp - b.timestamp);
}

export function getRootAnnotations<T extends CommentAnnotationFields>(
  annotations: readonly T[],
): T[] {
  return annotations.filter(
    (a) => isVisibleAnnotation(a) && isRootAnnotation(a),
  );
}

export function findAnnotationById<T extends CommentAnnotationFields>(
  annotations: readonly T[],
  id: string,
): T | undefined {
  return annotations.find((a) => a.id === id && isVisibleAnnotation(a));
}

/** Resolve selection to the root comment when a reply id is passed. */
export function resolveThreadRootId<T extends CommentAnnotationFields>(
  annotations: readonly T[],
  id: string,
): string {
  const annotation = findAnnotationById(annotations, id);
  if (!annotation) return id;
  return getThreadRootId(annotation);
}
