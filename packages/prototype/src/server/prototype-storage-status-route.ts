import { NextResponse } from "next/server";

import {
  getGalleryKvStatus,
  getGalleryStorageStatus,
  normalizeGalleryEnv,
} from "./gallery/gallery-env";
import { getRedisStatus, normalizeRedisEnv } from "./redis/client";

export function GET() {
  normalizeRedisEnv();
  normalizeGalleryEnv();

  const comments = getRedisStatus();
  const galleryKv = getGalleryKvStatus();
  const gallery = getGalleryStorageStatus();

  return NextResponse.json({
    comments: {
      configured: comments.ok,
      missing: comments.missing,
    },
    gallery: {
      kvConfigured: galleryKv.ok,
      storageConfigured: gallery.ok,
      missing: gallery.missing,
    },
  });
}
