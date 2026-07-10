import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

import { createPrototypeRegistry } from "@prototype/lib/prototypes/create-prototype-registry";
import type { PrototypeConfig } from "@prototype/lib/prototypes/prototype-config-types";
import { isValidAnnotation } from "@prototype/lib/prototype-comments/core/validation";
import {
  isValidChangelogMeta,
  normalizeChangelogMetaPayload,
} from "@prototype/lib/prototypes/changelog-meta";
import {
  sanitizeStateIdForFilename,
  stateScreenshotManifestKey,
} from "@prototype/lib/prototypes/prototype-state-screenshot";

import {
  readScreenshotManifest,
  touchScreenshotManifest,
  touchScreenshotManifestKey,
} from "../lib/prototypes/screenshot-manifest";
import { getRedisStatus } from "./redis/client";
import {
  listPrototypeComments,
  mergePrototypeComments,
  upsertPrototypeComment,
} from "./redis/prototype-comments";
import {
  getPrototypeChangelogMeta,
  setPrototypeChangelogMeta,
} from "./redis/prototype-changelog-meta";

type SlugRouteContext = {
  params: Promise<{ slug: string }>;
};

type CommentIdRouteContext = {
  params: Promise<{ slug: string; id: string }>;
};

function commentStorageUnavailableResponse() {
  const status = getRedisStatus();
  return NextResponse.json(
    {
      error: "Comment storage is not configured.",
      missing: status.missing,
    },
    { status: 503 },
  );
}

function changelogStorageUnavailableResponse() {
  const status = getRedisStatus();
  return NextResponse.json(
    {
      error: "Change log storage is not configured.",
      missing: status.missing,
    },
    { status: 503 },
  );
}

export function createPrototypeCommentsRoute(config: PrototypeConfig) {
  const registry = createPrototypeRegistry(config);

  async function GET(_request: NextRequest, { params }: SlugRouteContext) {
    const { slug } = await params;
    const prototype = registry.getPrototype(slug);

    if (!prototype) {
      return NextResponse.json({ error: "Unknown prototype" }, { status: 404 });
    }

    const redisStatus = getRedisStatus();
    if (!redisStatus.ok) {
      return commentStorageUnavailableResponse();
    }

    try {
      const annotations = await listPrototypeComments(slug);
      return NextResponse.json(annotations);
    } catch (error) {
      console.error("Prototype comments GET error:", error);
      return NextResponse.json({ error: "Failed to load comments" }, { status: 500 });
    }
  }

  async function PUT(request: NextRequest, { params }: SlugRouteContext) {
    const { slug } = await params;
    const prototype = registry.getPrototype(slug);

    if (!prototype) {
      return NextResponse.json({ error: "Unknown prototype" }, { status: 404 });
    }

    const redisStatus = getRedisStatus();
    if (!redisStatus.ok) {
      return commentStorageUnavailableResponse();
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Body must be an array" }, { status: 400 });
    }

    const annotations = body.filter(isValidAnnotation);
    if (annotations.length === 0 && body.length > 0) {
      return NextResponse.json({ error: "No valid comments in body" }, { status: 400 });
    }

    try {
      const count = await mergePrototypeComments(slug, annotations);
      return NextResponse.json({ ok: true, count });
    } catch (error) {
      console.error("Prototype comments PUT error:", error);
      return NextResponse.json({ error: "Failed to save comments" }, { status: 500 });
    }
  }

  return { GET, PUT };
}

export function createPrototypeCommentIdRoute(config: PrototypeConfig) {
  const registry = createPrototypeRegistry(config);

  async function PUT(request: NextRequest, { params }: CommentIdRouteContext) {
    const { slug, id } = await params;
    const prototype = registry.getPrototype(slug);

    if (!prototype) {
      return NextResponse.json({ error: "Unknown prototype" }, { status: 404 });
    }

    const redisStatus = getRedisStatus();
    if (!redisStatus.ok) {
      return commentStorageUnavailableResponse();
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!isValidAnnotation(body)) {
      return NextResponse.json({ error: "Invalid comment annotation" }, { status: 400 });
    }

    const annotation = body as Record<string, unknown>;
    if (annotation.id !== id) {
      return NextResponse.json(
        { error: "Comment id must match the URL path." },
        { status: 400 },
      );
    }

    try {
      await upsertPrototypeComment(slug, body);
      return NextResponse.json({ ok: true, id });
    } catch (error) {
      console.error("Prototype comment PUT error:", error);
      return NextResponse.json({ error: "Failed to save comment" }, { status: 500 });
    }
  }

  return { PUT };
}

export function createPrototypeChangelogMetaRoute(config: PrototypeConfig) {
  const registry = createPrototypeRegistry(config);

  async function GET(_request: NextRequest, { params }: SlugRouteContext) {
    const { slug } = await params;
    const prototype = registry.getPrototype(slug);

    if (!prototype) {
      return NextResponse.json({ error: "Unknown prototype" }, { status: 404 });
    }

    const redisStatus = getRedisStatus();
    if (!redisStatus.ok) {
      return changelogStorageUnavailableResponse();
    }

    try {
      const meta = await getPrototypeChangelogMeta(slug);
      return NextResponse.json(meta);
    } catch (error) {
      console.error("Prototype changelog-meta GET error:", error);
      return NextResponse.json(
        { error: "Failed to load change log overview" },
        { status: 500 },
      );
    }
  }

  async function PUT(request: NextRequest, { params }: SlugRouteContext) {
    const { slug } = await params;
    const prototype = registry.getPrototype(slug);

    if (!prototype) {
      return NextResponse.json({ error: "Unknown prototype" }, { status: 404 });
    }

    const redisStatus = getRedisStatus();
    if (!redisStatus.ok) {
      return changelogStorageUnavailableResponse();
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!isValidChangelogMeta(body)) {
      return NextResponse.json(
        { error: "Invalid change log meta body" },
        { status: 400 },
      );
    }

    const meta = normalizeChangelogMetaPayload(body);
    if (!meta) {
      return NextResponse.json(
        { error: "Invalid change log meta body" },
        { status: 400 },
      );
    }

    try {
      await setPrototypeChangelogMeta(slug, meta);
      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error("Prototype changelog-meta PUT error:", error);
      return NextResponse.json(
        { error: "Failed to save change log overview" },
        { status: 500 },
      );
    }
  }

  return { GET, PUT };
}

export function createPrototypeScreenshotRoute(config: PrototypeConfig) {
  const registry = createPrototypeRegistry(config);

  async function POST(request: NextRequest, { params }: SlugRouteContext) {
    const { slug } = await params;
    const prototype = registry.getPrototype(slug);

    if (!prototype) {
      return NextResponse.json({ error: "Unknown prototype" }, { status: 404 });
    }

    const body = (await request.json()) as {
      image?: string;
      stateId?: string;
    };

    if (
      typeof body.image !== "string" ||
      !body.image.startsWith("data:image/png;base64,")
    ) {
      return NextResponse.json({ error: "Invalid image" }, { status: 400 });
    }

    const buffer = Buffer.from(
      body.image.replace(/^data:image\/png;base64,/, ""),
      "base64",
    );

    const screenshotsDir = path.join(
      process.cwd(),
      "public/prototypes/screenshots",
    );

    if (typeof body.stateId === "string" && body.stateId.length > 0) {
      const stateDir = path.join(screenshotsDir, slug, "states");
      await mkdir(stateDir, { recursive: true });
      const filename = `${sanitizeStateIdForFilename(body.stateId)}.png`;
      await writeFile(path.join(stateDir, filename), buffer);

      const version = await touchScreenshotManifestKey(
        stateScreenshotManifestKey(slug, body.stateId),
      );

      return NextResponse.json({ ok: true, version, stateId: body.stateId });
    }

    await mkdir(screenshotsDir, { recursive: true });
    await writeFile(path.join(screenshotsDir, `${slug}.png`), buffer);

    const version = await touchScreenshotManifest(slug);

    return NextResponse.json({ ok: true, version });
  }

  return { POST };
}
