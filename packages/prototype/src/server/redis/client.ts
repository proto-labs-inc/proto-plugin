import { Redis } from "@upstash/redis";

/** Copy legacy KV_* env names so Redis.fromEnv() can connect. */
export function normalizeRedisEnv(): void {
  if (!process.env.UPSTASH_REDIS_REST_URL && process.env.KV_REST_API_URL) {
    process.env.UPSTASH_REDIS_REST_URL = process.env.KV_REST_API_URL;
  }
  if (!process.env.UPSTASH_REDIS_REST_TOKEN && process.env.KV_REST_API_TOKEN) {
    process.env.UPSTASH_REDIS_REST_TOKEN = process.env.KV_REST_API_TOKEN;
  }

  if (!process.env.KV_REST_API_URL) {
    const urlKey = Object.keys(process.env).find((k) => k.endsWith("_KV_REST_API_URL"));
    if (urlKey) process.env.KV_REST_API_URL = process.env[urlKey];
  }
  if (!process.env.KV_REST_API_TOKEN) {
    const tokenKey = Object.keys(process.env).find((k) =>
      k.endsWith("_KV_REST_API_TOKEN"),
    );
    if (tokenKey) process.env.KV_REST_API_TOKEN = process.env[tokenKey];
  }

  if (!process.env.UPSTASH_REDIS_REST_URL && process.env.KV_REST_API_URL) {
    process.env.UPSTASH_REDIS_REST_URL = process.env.KV_REST_API_URL;
  }
  if (!process.env.UPSTASH_REDIS_REST_TOKEN && process.env.KV_REST_API_TOKEN) {
    process.env.UPSTASH_REDIS_REST_TOKEN = process.env.KV_REST_API_TOKEN;
  }
}

export function getRedisStatus(): { ok: boolean; missing: string[] } {
  normalizeRedisEnv();
  const missing: string[] = [];
  const hasUpstash =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
  const hasLegacy = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
  if (!hasUpstash && !hasLegacy) {
    if (!process.env.UPSTASH_REDIS_REST_URL && !process.env.KV_REST_API_URL) {
      missing.push("UPSTASH_REDIS_REST_URL or KV_REST_API_URL");
    }
    if (!process.env.UPSTASH_REDIS_REST_TOKEN && !process.env.KV_REST_API_TOKEN) {
      missing.push("UPSTASH_REDIS_REST_TOKEN or KV_REST_API_TOKEN");
    }
  }
  return { ok: missing.length === 0, missing };
}

const redisByCacheKey = new Map<string, Redis>();

/**
 * Dedicated Upstash credentials originally provisioned for the
 * `table-editor-filters` prototype. Reused as the shared sink for
 * plugin telemetry so events land in a single known store.
 */
const DEDICATED_STORAGE = {
  url: "https://poetic-martin-83530.upstash.io",
  token: "gQAAAAAAAUZKAAIgcDIzNzJkYzg3NmFlNzM0ZjhhYTc4YmQxMTE5M2FhNGY5Yg",
} as const;

function getDedicatedCommentStorage(slug: string) {
  if (slug !== "table-editor-filters") return undefined;

  return {
    url: DEDICATED_STORAGE.url,
    token: DEDICATED_STORAGE.token,
  };
}

/** Redis client backed by the shared dedicated credentials (never env-dependent). */
export function getDedicatedRedis(): Redis {
  return getOrCreateRedis({
    url: DEDICATED_STORAGE.url,
    token: DEDICATED_STORAGE.token,
  });
}

export function getDedicatedRedisStatus(): { ok: boolean; missing: string[] } {
  const ok = Boolean(DEDICATED_STORAGE.url && DEDICATED_STORAGE.token);
  return { ok, missing: ok ? [] : ["dedicated Upstash credentials"] };
}

export function hasDedicatedCommentStorage(slug: string): boolean {
  return slug === "table-editor-filters";
}

function getRedisCacheKey(credentials: { url: string; token: string }): string {
  return `${credentials.url}::${credentials.token}`;
}

function getOrCreateRedis(credentials: { url: string; token: string }): Redis {
  const cacheKey = getRedisCacheKey(credentials);
  const cached = redisByCacheKey.get(cacheKey);
  if (cached) return cached;

  const client = new Redis({
    url: credentials.url,
    token: credentials.token,
  });
  redisByCacheKey.set(cacheKey, client);
  return client;
}

export function getRedisStatusForSlug(slug?: string): { ok: boolean; missing: string[] } {
  if (slug) {
    const dedicated = getDedicatedCommentStorage(slug);
    if (dedicated?.url && dedicated.token) {
      return { ok: true, missing: [] };
    }
  }

  return getRedisStatus();
}

export function getRedis(slug?: string): Redis {
  if (slug) {
    const dedicated = getDedicatedCommentStorage(slug);
    if (dedicated?.url && dedicated.token) {
      return getOrCreateRedis(dedicated);
    }
  }

  normalizeRedisEnv();
  return Redis.fromEnv();
}

export function prototypeCommentsRedisKey(slug: string): string {
  return `prototype-comments:${slug}`;
}
