import "server-only";

export { createPrototypeGalleryPage } from "./config/create-prototype-gallery-page";
export { createPrototypeStarterScreensPage } from "./config/create-prototype-starter-screens-page";

export {
  readScreenshotManifest,
  syncScreenshotManifestFromDisk,
  touchScreenshotManifest,
  touchScreenshotManifestKey,
} from "./lib/prototypes/screenshot-manifest";

export { GET as getPrVercelPreview } from "./server/pr-vercel-preview-route";

export {
  createPrototypeChangelogMetaRoute,
  createPrototypeCommentIdRoute,
  createPrototypeCommentsRoute,
  createPrototypeScreenshotRoute,
} from "./server/create-prototype-api-routes";

export { createPrototypeApiRoute, createHostApiRoute } from "./server/create-host-api-route";

export { createGalleryApi } from "./server/gallery/create-gallery-api";

export { type GalleryConfig, type GalleryItem } from "./server/gallery/gallery-types";

export { normalizeGalleryEnv } from "./server/gallery/gallery-env";

export {
  getRedis,
  getRedisStatus,
  normalizeRedisEnv,
  prototypeCommentsRedisKey,
} from "./server/redis/client";

export {
  filterStoredAnnotations,
  listPrototypeComments,
  mergePrototypeComments,
  upsertPrototypeComment,
} from "./server/redis/prototype-comments";

export {
  getPrototypeChangelogMeta,
  setPrototypeChangelogMeta,
} from "./server/redis/prototype-changelog-meta";
