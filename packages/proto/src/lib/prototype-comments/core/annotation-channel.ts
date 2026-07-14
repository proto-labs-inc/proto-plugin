import type { CommentAnnotationFields } from "./types";
import { getRootAnnotations } from "./comment-threads";

export type AnnotationChannel = "comment" | "changelog";

export function normalizeAnnotationChannel(
  channel: CommentAnnotationFields["channel"] | undefined,
): AnnotationChannel {
  return channel === "changelog" ? "changelog" : "comment";
}

export function isChangelogAnnotation(
  annotation: Pick<CommentAnnotationFields, "channel">,
): boolean {
  return normalizeAnnotationChannel(annotation.channel) === "changelog";
}

export function isCommentChannelAnnotation(
  annotation: Pick<CommentAnnotationFields, "channel">,
): boolean {
  return !isChangelogAnnotation(annotation);
}

export function filterAnnotationsByChannel<T extends CommentAnnotationFields>(
  annotations: readonly T[],
  channel: AnnotationChannel,
): T[] {
  return annotations.filter((a) => normalizeAnnotationChannel(a.channel) === channel);
}

export function getChangelogRootAnnotations<T extends CommentAnnotationFields>(
  annotations: readonly T[],
): T[] {
  return getRootAnnotations(filterAnnotationsByChannel(annotations, "changelog"));
}

export function getCommentRootAnnotations<T extends CommentAnnotationFields>(
  annotations: readonly T[],
): T[] {
  return getRootAnnotations(filterAnnotationsByChannel(annotations, "comment"));
}
