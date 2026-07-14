import { del } from "@vercel/blob";
import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

import { getGalleryKvStatus, getGalleryStorageStatus } from "./gallery-env";

const GALLERY_KEY = "gallery:items";

interface GalleryItemStored {
  id?: string;
  blobUrl?: string;
  originalBlobUrl?: string;
  tags?: string[];
  [key: string]: unknown;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const status = getGalleryKvStatus();
  if (!status.ok) {
    return NextResponse.json({ error: "Gallery not configured" }, { status: 503 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const body = await request.json();
    const newTags: string[] | undefined = body.tags;
    if (!newTags || !Array.isArray(newTags)) {
      return NextResponse.json({ error: "tags array required" }, { status: 400 });
    }
    const validTags = newTags.filter((t) => typeof t === "string" && t.trim().length > 0);
    if (validTags.length === 0) {
      return NextResponse.json({ error: "At least one tag required" }, { status: 400 });
    }

    const items = (await kv.get<GalleryItemStored[]>(GALLERY_KEY)) ?? [];
    const idx = items.findIndex((i) => String(i?.id) === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    items[idx] = { ...items[idx], tags: validTags };
    await kv.set(GALLERY_KEY, items);

    return NextResponse.json({ ok: true, id, tags: validTags });
  } catch (error) {
    console.error("Gallery item PATCH error:", error);
    const message = error instanceof Error ? error.message : "Failed to update item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const status = getGalleryStorageStatus();
  if (!status.ok) {
    return NextResponse.json({ error: "Gallery not configured" }, { status: 503 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const items = (await kv.get<GalleryItemStored[]>(GALLERY_KEY)) ?? [];
    const item = items.find((i) => String(i?.id) === id);
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const urlsToDelete: string[] = [];
    if (item.blobUrl) urlsToDelete.push(item.blobUrl);
    if (item.originalBlobUrl) urlsToDelete.push(item.originalBlobUrl);
    if (urlsToDelete.length > 0) {
      await del(urlsToDelete);
    }

    const remaining = items.filter((i) => String(i?.id) !== id);
    await kv.set(GALLERY_KEY, remaining);

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error("Gallery item DELETE error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
