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

export function getRedis(): Redis {
  normalizeRedisEnv();
  return Redis.fromEnv();
}

export function prototypeCommentsRedisKey(slug: string): string {
  return `prototype-comments:${slug}`;
}
