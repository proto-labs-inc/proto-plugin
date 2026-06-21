import { del, put } from "@vercel/blob";
import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { getGalleryStorageStatus } from "./gallery-env";
import type { GalleryItem } from "./gallery-types";

export const maxDuration = 60;

const GALLERY_KEY = "gallery:items";

export async function GET() {
  const status = getGalleryStorageStatus();
  if (!status.ok) {
    return NextResponse.json(
      {
        error: "Gallery storage is not configured.",
        missing: status.missing,
      },
      { status: 503 },
    );
  }

  try {
    const items = (await kv.get<GalleryItem[]>(GALLERY_KEY)) ?? [];
    return NextResponse.json(items);
  } catch (error) {
    console.error("Gallery GET error:", error);
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const status = getGalleryStorageStatus();
  if (!status.ok) {
    return NextResponse.json(
      {
        error: "Gallery storage is not configured.",
        missing: status.missing,
      },
      { status: 503 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const originalFile = formData.get("originalFile") as File | null;
    const title = (formData.get("title") as string) || "Untitled";
    const tagsRaw = formData.get("tags") as string | null;
    const width = parseInt(formData.get("width") as string, 10) || 0;
    const height = parseInt(formData.get("height") as string, 10) || 0;
    const sourceFrameId = (formData.get("sourceFrameId") as string) || undefined;

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const tags: string[] = tagsRaw
      ? (JSON.parse(tagsRaw) as string[]).filter(
          (t) => typeof t === "string" && t.trim().length > 0,
        )
      : [];

    const id = randomUUID();

    const contentType = file.type === "image/jpeg" ? "image/jpeg" : "image/png";
    const ext = contentType === "image/jpeg" ? "jpg" : "png";
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const resultBlob = await put(`gallery/${id}.${ext}`, fileBuffer, {
      access: "public",
      contentType,
    });

    const blobUrl = typeof resultBlob?.url === "string" ? resultBlob.url : "";
    if (!blobUrl) {
      console.error("Gallery POST: put() did not return a url", resultBlob);
      return NextResponse.json(
        { error: "Failed to get image URL from storage" },
        { status: 500 },
      );
    }

    let originalBlobUrl: string | undefined;
    if (originalFile && originalFile instanceof Blob) {
      const origBuffer = Buffer.from(await originalFile.arrayBuffer());
      const origBlob = await put(`gallery/${id}-original.png`, origBuffer, {
        access: "public",
        contentType: "image/png",
      });
      if (typeof origBlob?.url === "string") originalBlobUrl = origBlob.url;
    }

    const item: GalleryItem = {
      id,
      blobUrl,
      originalBlobUrl,
      title,
      tags,
      width,
      height,
      sourceFrameId,
      uploadedBy: "anonymous",
      createdAt: new Date().toISOString(),
    };

    const items = (await kv.get<GalleryItem[]>(GALLERY_KEY)) ?? [];
    items.push(item);
    await kv.set(GALLERY_KEY, items);

    return NextResponse.json(item);
  } catch (error) {
    console.error("Gallery POST error:", error);
    const message = error instanceof Error ? error.message : "Failed to upload image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** DELETE: clear all gallery items (KV + Blob). No auth. */
export async function DELETE() {
  const status = getGalleryStorageStatus();
  if (!status.ok) {
    return NextResponse.json(
      {
        error: "Gallery storage is not configured.",
        missing: status.missing,
      },
      { status: 503 },
    );
  }

  try {
    const items = (await kv.get<GalleryItem[]>(GALLERY_KEY)) ?? [];
    const urlsToDelete: string[] = [];
    for (const item of items) {
      if (item.blobUrl) urlsToDelete.push(item.blobUrl);
      if (item.originalBlobUrl) urlsToDelete.push(item.originalBlobUrl);
    }
    if (urlsToDelete.length > 0) {
      await del(urlsToDelete);
    }
    await kv.set(GALLERY_KEY, []);
    return NextResponse.json({ ok: true, deleted: items.length });
  } catch (error) {
    console.error("Gallery DELETE error:", error);
    const message = error instanceof Error ? error.message : "Failed to clear gallery";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
