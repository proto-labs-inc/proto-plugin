import "server-only";

export {
  readScreenshotManifest,
  touchScreenshotManifest,
  touchScreenshotManifestKey,
} from "./lib/prototypes/screenshot-manifest";

export { GET as getPrVercelPreview } from "./server/pr-vercel-preview-route";

export {
  createPrototypeChangelogMetaRoute,
  createPrototypeCommentIdRoute,
  createPrototypeCommentsRoute,
  createPrototypeDesignExplorationDefaultRoute,
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

export {
  getPrototypeDesignExplorationDefault,
  setPrototypeDesignExplorationDefault,
} from "./server/redis/prototype-design-exploration-default";

export { prototypeDesignExplorationDefaultRedisKey } from "./lib/prototypes/design-exploration-default";
