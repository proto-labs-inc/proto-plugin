import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

import { getGalleryKvStatus } from "./gallery-env";

const FOLDERS_KEY = "gallery:folders";
const GALLERY_KEY = "gallery:items";

export function createFoldersRouteHandlers() {
  async function getFolders(): Promise<string[]> {
    const stored = await kv.get<string[]>(FOLDERS_KEY);
    return stored ?? [];
  }

  async function GET() {
    const status = getGalleryKvStatus();
    if (!status.ok) {
      return NextResponse.json({ error: "Gallery not configured" }, { status: 503 });
    }

    try {
      const folders = await getFolders();
      return NextResponse.json(folders);
    } catch (error) {
      console.error("Folders GET error:", error);
      return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
    }
  }

  async function POST(request: NextRequest) {
    const status = getGalleryKvStatus();
    if (!status.ok) {
      return NextResponse.json({ error: "Gallery not configured" }, { status: 503 });
    }

    try {
      const body = await request.json();
      const name = typeof body.name === "string" ? body.name.trim() : "";

      if (!name) {
        return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
      }
      if (name.length > 50) {
        return NextResponse.json(
          { error: "Folder name must be 50 characters or fewer" },
          { status: 400 },
        );
      }

      const folders = await getFolders();
      if (folders.some((f) => f.toLowerCase() === name.toLowerCase())) {
        return NextResponse.json(
          { error: "A folder with that name already exists" },
          { status: 409 },
        );
      }

      const updated = [...folders, name];
      await kv.set(FOLDERS_KEY, updated);

      return NextResponse.json(updated);
    } catch (error) {
      console.error("Folders POST error:", error);
      const message = error instanceof Error ? error.message : "Failed to create folder";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  async function PUT(request: NextRequest) {
    const status = getGalleryKvStatus();
    if (!status.ok) {
      return NextResponse.json({ error: "Gallery not configured" }, { status: 503 });
    }

    try {
      const body = await request.json();
      const folders = body.folders;
      if (
        !Array.isArray(folders) ||
        folders.some((f: unknown) => typeof f !== "string" || !(f as string).trim())
      ) {
        return NextResponse.json(
          { error: "folders must be an array of non-empty strings" },
          { status: 400 },
        );
      }
      await kv.set(FOLDERS_KEY, folders);
      return NextResponse.json(folders);
    } catch (error) {
      console.error("Folders PUT error:", error);
      const message = error instanceof Error ? error.message : "Failed to reorder folders";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  async function PATCH(request: NextRequest) {
    const status = getGalleryKvStatus();
    if (!status.ok) {
      return NextResponse.json({ error: "Gallery not configured" }, { status: 503 });
    }

    try {
      const body = await request.json();
      const oldName = typeof body.oldName === "string" ? body.oldName.trim() : "";
      const newName = typeof body.newName === "string" ? body.newName.trim() : "";

      if (!oldName || !newName) {
        return NextResponse.json({ error: "oldName and newName are required" }, { status: 400 });
      }
      if (newName.length > 50) {
        return NextResponse.json(
          { error: "Folder name must be 50 characters or fewer" },
          { status: 400 },
        );
      }

      const folders = await getFolders();
      const idx = folders.findIndex((f) => f === oldName);
      if (idx === -1) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }
      if (oldName !== newName && folders.some((f) => f.toLowerCase() === newName.toLowerCase())) {
        return NextResponse.json(
          { error: "A folder with that name already exists" },
          { status: 409 },
        );
      }

      folders[idx] = newName;
      await kv.set(FOLDERS_KEY, folders);

      const items = (await kv.get<Record<string, unknown>[]>(GALLERY_KEY)) ?? [];
      let changed = false;
      for (const item of items) {
        if (Array.isArray(item.tags)) {
          const tagIdx = (item.tags as string[]).indexOf(oldName);
          if (tagIdx !== -1) {
            (item.tags as string[])[tagIdx] = newName;
            changed = true;
          }
        }
      }
      if (changed) {
        await kv.set(GALLERY_KEY, items);
      }

      return NextResponse.json(folders);
    } catch (error) {
      console.error("Folders PATCH error:", error);
      const message = error instanceof Error ? error.message : "Failed to rename folder";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  return { GET, POST, PUT, PATCH };
}
