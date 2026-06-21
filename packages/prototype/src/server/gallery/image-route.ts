import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

import { getGalleryKvStatus } from "./gallery-env";

const GALLERY_KEY = "gallery:items";

interface GalleryItemStored {
  id?: string;
  blobUrl?: string;
  blob_url?: string;
  originalBlobUrl?: string;
  original_blob_url?: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const status = getGalleryKvStatus();
  if (!status.ok) {
    return NextResponse.json({ error: "Gallery not configured" }, { status: 503 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const items = (await kv.get<GalleryItemStored[]>(GALLERY_KEY)) ?? [];
    const item = items.find((i) => String(i?.id) === id);
    const blobUrl = item?.blobUrl ?? item?.blob_url;
    if (!blobUrl) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const imageUrl = blobUrl;
    const headers: Record<string, string> = { "User-Agent": "PrototypeGallery/1.0" };
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (blobToken && imageUrl.includes("blob.vercel-storage.com")) {
      headers["Authorization"] = `Bearer ${blobToken}`;
    }
    const res = await fetch(imageUrl, { cache: "no-store", headers });
    if (!res.ok) {
      console.error("Gallery image proxy: fetch failed", res.status, imageUrl.slice(0, 80));
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
    }
    const blob = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/png";
    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300",
        Vary: "Accept",
      },
    });
  } catch (error) {
    console.error("Gallery image proxy error:", error);
    return NextResponse.json({ error: "Failed to load image" }, { status: 500 });
  }
}
