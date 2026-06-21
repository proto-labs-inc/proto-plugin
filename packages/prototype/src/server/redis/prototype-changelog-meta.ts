import {
  normalizeChangelogMetaPayload,
  parseChangelogMeta,
  prototypeChangelogMetaRedisKey,
  type PrototypeChangelogMeta,
} from "@prototype/lib/prototypes/changelog-meta";

import { getRedis } from "./client";

export async function getPrototypeChangelogMeta(
  slug: string,
): Promise<PrototypeChangelogMeta> {
  const redis = getRedis();
  const key = prototypeChangelogMetaRedisKey(slug);
  const stored = await redis.get<unknown>(key);
  return parseChangelogMeta(stored);
}

export async function setPrototypeChangelogMeta(
  slug: string,
  meta: unknown,
): Promise<void> {
  const normalized = normalizeChangelogMetaPayload(meta);
  if (!normalized) {
    throw new Error("Invalid change log meta.");
  }

  const redis = getRedis();
  const key = prototypeChangelogMetaRedisKey(slug);
  await redis.set(key, normalized);
}
