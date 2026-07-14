import { NextRequest, NextResponse } from "next/server";

import type { PrototypeConfig } from "@prototype/lib/prototypes/prototype-config-types";

import {
  createPrototypeChangelogMetaRoute,
  createPrototypeCommentIdRoute,
  createPrototypeCommentsRoute,
  createPrototypeScreenshotRoute,
} from "./create-prototype-api-routes";
import { createGalleryApi } from "./gallery/create-gallery-api";
import { GET as getPrototypeStorageStatus } from "./prototype-storage-status-route";
import { GET as getProtoPluginVersion } from "./proto-plugin-version-route";
import { GET as getPrVercelPreview } from "./pr-vercel-preview-route";

type ApiRouteContext = {
  params: Promise<{ path: string[] }>;
};

export function createPrototypeApiRoute(_config: PrototypeConfig) {
  const commentsRoute = createPrototypeCommentsRoute(_config);
  const commentIdRoute = createPrototypeCommentIdRoute(_config);
  const changelogMetaRoute = createPrototypeChangelogMetaRoute(_config);
  const screenshotRoute = createPrototypeScreenshotRoute(_config);
  const galleryApi =
    _config.gallery === false ? null : createGalleryApi(_config.gallery);

  async function dispatch(
    request: NextRequest,
    context: ApiRouteContext,
  ): Promise<Response> {
    const { path } = await context.params;
    const method = request.method;

    if (path[0] === "pr-vercel-preview" && path.length === 1 && method === "GET") {
      return getPrVercelPreview(request);
    }

    if (galleryApi) {
      const galleryResponse = await galleryApi.dispatch(request, path);
      if (galleryResponse) {
        return galleryResponse;
      }
    }

    if (path[0] === "proto-plugin" && path.length === 2 && path[1] === "version") {
      if (method === "GET") {
        return getProtoPluginVersion();
      }
    }

    if (path[0] === "prototypes" && path.length === 2 && path[1] === "storage-status") {
      if (method === "GET") {
        return getPrototypeStorageStatus();
      }
    }

    if (path[0] === "prototypes" && path.length >= 2) {
      const slug = path[1]!;

      if (path.length === 3 && path[2] === "comments") {
        if (method === "GET") {
          return commentsRoute.GET(request, { params: Promise.resolve({ slug }) });
        }
        if (method === "PUT") {
          return commentsRoute.PUT(request, { params: Promise.resolve({ slug }) });
        }
      }

      if (path.length === 4 && path[2] === "comments" && method === "PUT") {
        const id = path[3]!;
        return commentIdRoute.PUT(request, {
          params: Promise.resolve({ slug, id }),
        });
      }

      if (path.length === 3 && path[2] === "changelog-meta") {
        if (method === "GET") {
          return changelogMetaRoute.GET(request, { params: Promise.resolve({ slug }) });
        }
        if (method === "PUT") {
          return changelogMetaRoute.PUT(request, { params: Promise.resolve({ slug }) });
        }
      }

      if (path.length === 3 && path[2] === "screenshot" && method === "POST") {
        return screenshotRoute.POST(request, { params: Promise.resolve({ slug }) });
      }
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return { dispatch };
}

/** @deprecated Use createPrototypeApiRoute */
export const createHostApiRoute = createPrototypeApiRoute;
