import { isAnnotationDeleted } from "@prototype/lib/prototype-comments/core/annotation-status";
import type { CommentAnnotationFields } from "@prototype/lib/prototype-comments/core/types";
import { isValidAnnotation } from "@prototype/lib/prototype-comments/core/validation";

import { getRedis, prototypeCommentsRedisKey } from "./client";

function asStoredComment(value: unknown): CommentAnnotationFields | null {
  if (!isValidAnnotation(value)) return null;
  return value as CommentAnnotationFields;
}

export function filterStoredAnnotations(
  annotations: unknown[],
): CommentAnnotationFields[] {
  return annotations.flatMap((value) => {
    const comment = asStoredComment(value);
    if (!comment || isAnnotationDeleted(comment)) return [];
    return [comment];
  });
}

export async function listPrototypeComments(
  slug: string,
): Promise<CommentAnnotationFields[]> {
  const redis = getRedis();
  const stored = (await redis.get<unknown[]>(prototypeCommentsRedisKey(slug))) ?? [];
  if (!Array.isArray(stored)) return [];
  return filterStoredAnnotations(stored);
}

export async function upsertPrototypeComment(
  slug: string,
  comment: unknown,
): Promise<void> {
  if (!isValidAnnotation(comment)) {
    throw new Error("Invalid comment annotation.");
  }

  const incoming = comment as CommentAnnotationFields;
  const redis = getRedis();
  const key = prototypeCommentsRedisKey(slug);
  const stored = (await redis.get<unknown[]>(key)) ?? [];
  const annotations = Array.isArray(stored)
    ? stored.flatMap((value) => {
        const item = asStoredComment(value);
        return item ? [item] : [];
      })
    : [];

  const index = annotations.findIndex((item) => item.id === incoming.id);

  if (index >= 0) {
    annotations[index] = { ...annotations[index], ...incoming };
  } else {
    annotations.push(incoming);
  }

  await redis.set(key, annotations);
}

/** Merge incoming comments by id without removing stored comments missing from the payload. */
export async function mergePrototypeComments(
  slug: string,
  incoming: unknown[],
): Promise<number> {
  if (!Array.isArray(incoming)) {
    throw new Error("Body must be an array.");
  }

  const redis = getRedis();
  const key = prototypeCommentsRedisKey(slug);
  const stored = (await redis.get<unknown[]>(key)) ?? [];
  const annotations = Array.isArray(stored)
    ? stored.flatMap((value) => {
        const item = asStoredComment(value);
        return item ? [item] : [];
      })
    : [];

  const byId = new Map(annotations.map((item) => [item.id, item]));

  for (const value of incoming) {
    if (!isValidAnnotation(value)) continue;
    const comment = value as CommentAnnotationFields;
    const existing = byId.get(comment.id);
    byId.set(comment.id, existing ? { ...existing, ...comment } : comment);
  }

  const merged = [...byId.values()];
  await redis.set(key, merged);
  return merged.filter((item) => !isAnnotationDeleted(item)).length;
}
