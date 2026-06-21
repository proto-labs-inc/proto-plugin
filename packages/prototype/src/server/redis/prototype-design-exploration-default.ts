import {
  normalizeDesignExplorationDefaultPayload,
  parseDesignExplorationDefault,
  prototypeDesignExplorationDefaultRedisKey,
  type DesignExplorationDefaultRecord,
} from "@prototype/lib/prototypes/design-exploration-default";

import { getRedis } from "./client";

export async function getPrototypeDesignExplorationDefault(
  storageKeyPrefix: string,
): Promise<DesignExplorationDefaultRecord | null> {
  const redis = getRedis();
  const key = prototypeDesignExplorationDefaultRedisKey(storageKeyPrefix);
  const stored = await redis.get<unknown>(key);
  return parseDesignExplorationDefault(stored);
}

export async function setPrototypeDesignExplorationDefault(
  storageKeyPrefix: string,
  record: unknown,
  validValues?: readonly string[],
): Promise<void> {
  const normalized = normalizeDesignExplorationDefaultPayload(record, validValues);
  if (!normalized) {
    throw new Error("Invalid design exploration default record.");
  }

  const redis = getRedis();
  const key = prototypeDesignExplorationDefaultRedisKey(storageKeyPrefix);
  await redis.set(key, normalized);
}
