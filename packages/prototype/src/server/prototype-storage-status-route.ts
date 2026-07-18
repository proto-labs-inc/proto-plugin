import { NextRequest, NextResponse } from "next/server";

import { hasDedicatedCommentStorage } from "./redis/client";

import {
  getGalleryKvStatus,
  getGalleryStorageStatus,
  normalizeGalleryEnv,
} from "./gallery/gallery-env";
import { getRedisStatus, getRedisStatusForSlug, normalizeRedisEnv } from "./redis/client";

export function GET(request?: NextRequest) {
  normalizeRedisEnv();
  normalizeGalleryEnv();

  const slug = request?.nextUrl.searchParams.get("slug") ?? undefined;
  const dedicatedCommentStorage = slug ? hasDedicatedCommentStorage(slug) : false;
  const comments = slug ? getRedisStatusForSlug(slug) : getRedisStatus();
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
    dedicatedCommentStorage,
  });
}
