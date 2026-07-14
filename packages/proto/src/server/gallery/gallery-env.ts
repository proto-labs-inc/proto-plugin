export function normalizeGalleryEnv(): void {
  if (!process.env.KV_REST_API_URL) {
    const urlKey = Object.keys(process.env).find((k) => k.endsWith("_KV_REST_API_URL"));
    if (urlKey) process.env.KV_REST_API_URL = process.env[urlKey];
  }
  if (!process.env.KV_REST_API_TOKEN) {
    const tokenKey = Object.keys(process.env).find((k) => k.endsWith("_KV_REST_API_TOKEN"));
    if (tokenKey) process.env.KV_REST_API_TOKEN = process.env[tokenKey];
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    const blobKey = Object.keys(process.env).find(
      (k) => k.includes("BLOB_READ_WRITE_TOKEN") || k.includes("BLOB_READ_WRITE"),
    );
    if (blobKey) process.env.BLOB_READ_WRITE_TOKEN = process.env[blobKey];
  }
}

export function getGalleryStorageStatus(): {
  ok: boolean;
  missing: string[];
} {
  normalizeGalleryEnv();
  const missing: string[] = [];
  if (!process.env.KV_REST_API_URL) missing.push("KV_REST_API_URL");
  if (!process.env.KV_REST_API_TOKEN) missing.push("KV_REST_API_TOKEN");
  if (!process.env.BLOB_READ_WRITE_TOKEN) missing.push("BLOB_READ_WRITE_TOKEN");
  return { ok: missing.length === 0, missing };
}

export function getGalleryKvStatus(): {
  ok: boolean;
  missing: string[];
} {
  normalizeGalleryEnv();
  const missing: string[] = [];
  if (!process.env.KV_REST_API_URL) missing.push("KV_REST_API_URL");
  if (!process.env.KV_REST_API_TOKEN) missing.push("KV_REST_API_TOKEN");
  return { ok: missing.length === 0, missing };
}
