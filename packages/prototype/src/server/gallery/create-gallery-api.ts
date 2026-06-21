import { NextRequest } from "next/server";

import {
  DELETE as deleteGallery,
  GET as getGallery,
  POST as postGallery,
} from "./gallery-route";
import { createFoldersRouteHandlers } from "./folders-route";
import { GET as getGalleryImage } from "./image-route";
import {
  DELETE as deleteGalleryItem,
  PATCH as patchGalleryItem,
} from "./item-route";
import type { GalleryConfig } from "./gallery-types";

export function createGalleryApi(_config?: GalleryConfig) {
  const foldersRoute = createFoldersRouteHandlers();

  async function dispatch(request: NextRequest, path: string[]): Promise<Response | null> {
    const method = request.method;

    if (path[0] === "gallery") {
      if (path.length === 1) {
        if (method === "GET") return getGallery();
        if (method === "POST") return postGallery(request);
        if (method === "DELETE") return deleteGallery();
      }

      if (path.length === 2 && path[1] === "folders") {
        if (method === "GET") return foldersRoute.GET();
        if (method === "POST") return foldersRoute.POST(request);
        if (method === "PUT") return foldersRoute.PUT(request);
        if (method === "PATCH") return foldersRoute.PATCH(request);
      }

      if (path.length === 2) {
        const id = path[1]!;
        if (method === "PATCH") {
          return patchGalleryItem(request, { params: Promise.resolve({ id }) });
        }
        if (method === "DELETE") {
          return deleteGalleryItem(request, { params: Promise.resolve({ id }) });
        }
      }

      if (path.length === 3 && path[2] === "image" && method === "GET") {
        const id = path[1]!;
        return getGalleryImage(request, { params: Promise.resolve({ id }) });
      }
    }

    return null;
  }

  return { dispatch };
}
