export { definePrototypeConfig } from "./config/define-prototype-config";
export { defineStarterScreenConfig } from "./config/define-starter-screen-config";
// NOTE: `createPrototypeGalleryPage` is server-only (reads the screenshot manifest
// from disk) and lives in `proto-plugin/server`. Keeping it out of this barrel is
// what lets client prototype components import from `proto-plugin` safely.
export { createPrototypeComponentLibraryPage } from "./config/create-prototype-component-library-page";
export { createPrototypeStarterScreenPage } from "./config/create-prototype-starter-screen-page";
export { createPrototypePage } from "./config/create-prototype-page";
export { createPrototypeStateMapPage } from "./config/create-prototype-state-map-page";
export { createPrototypeSiteLayout } from "./config/create-prototype-site-layout";
// NOTE: `withPrototype` uses Node path APIs and belongs in `proto-plugin/with-prototype`
// (next.config.ts only). Do not re-export it here — the barrel is imported by client
// prototype components and must stay browser-safe.

export {
  createPrototypeRegistry,
  getAllPrototypes,
  getPrototype,
  getPrototypeComponent,
  getPrototypeComponentRegistryForSlug,
  setPrototypeConfig,
} from "./lib/prototypes/create-prototype-registry";

export type {
  PrototypeConfig,
  PrototypeDefinition,
  PrototypeExtraRoute,
  PrototypeMetadata,
} from "./lib/prototypes/prototype-config-types";

export type {
  StarterScreenConfig,
  StarterScreenDefinition,
  StarterScreenMetadata,
} from "./lib/prototypes/starter-screen-config-types";

export {
  PrototypeComponent,
  PrototypeTarget,
  PrototypeTargetIdProvider,
  usePrototypeSlug,
  buildPrototypeTargetId,
} from "./components/prototypes/prototype-target";

export {
  PrototypeControl,
  PrototypeControlGroup,
} from "./components/prototypes/prototype-control";

export { PrototypeShell } from "./components/shell/prototype-shell";

export { PrototypeProvider } from "./components/prototype-provider";

export { PrototypeVariantExplorer } from "./components/prototypes/prototype-variant-explorer";

export { PrototypeVercelPreviewModal } from "./components/prototypes/prototype-vercel-preview-modal";
export type { PrototypeVercelPreviewModalProps } from "./components/prototypes/prototype-vercel-preview-modal";

export { PrototypeTweaks } from "./components/prototypes/prototype-tweaks";
export type { PrototypeTweakConfig } from "./components/prototypes/prototype-tweaks";

export {
  PROTOTYPE_PAGE_CLASS,
  PROTOTYPE_SCROLL_CONTAINER_CLASS,
  PROTOTYPE_VIEW_SHELL_CLASS,
} from "./lib/prototypes/prototype-layout-classes";

export { usePrototypeComments } from "./lib/prototypes/use-prototype-comments";

export {
  SHARE_TARGET_PARAM,
  SHARE_STATE_PARAM,
  SHARE_COMMENT_PARAM,
  encodeShareState,
  decodeShareState,
  readShareLinkParams,
} from "./lib/prototypes/prototype-share-link";
export type { ShareLinkParams } from "./lib/prototypes/prototype-share-link";

export {
  PREVIEW_STATE_PARAM,
  readPreviewStateParam,
  syncPreviewStateParam,
} from "./lib/prototypes/prototype-preview-state-url";

export {
  usePersistPrototypeLiveState,
  readPersistedPrototypeLiveState,
} from "./lib/prototypes/use-persisted-local-state";

export { useSyncPrototypePreviewStateToUrl } from "./lib/prototypes/use-sync-prototype-preview-state-to-url";

export type {
  DesignExplorationBaselineOption,
  DesignExplorationConfig,
  DesignExplorationRationale,
  MobbinReference,
} from "./lib/prototypes/design-exploration-types";

export {
  buildCreateDesignExplorationCopyText,
  buildCreateDesignExplorationPrompt,
  buildMoreDesignExplorationVariantsCopyText,
  buildMoreDesignExplorationVariantsPrompt,
  buildResetBriefDefaultsPrompt,
  DESIGN_EXPLORATION_BASELINE_LABEL,
  getAdjacentDesignExplorationVariant,
  getDesignExplorationDisplayOptions,
  getDesignExplorationVariantOptions,
  getMobbinReferencesForVariantLabel,
  resolveDesignExplorationBaselineOption,
} from "./lib/prototypes/design-exploration-types";

export { buildDesignExplorationRenderers } from "./lib/prototypes/build-design-exploration-renderers";

export {
  DesignExplorationVariantPreviewShell,
  type DesignExplorationVariantPreviewLayout,
  type DesignExplorationVariantPreviewShellProps,
} from "./components/prototypes/design-exploration-variant-preview-shell";

export {
  buildCreatePreviewStateCopyText,
  buildCreatePreviewStatePrompt,
} from "./lib/prototypes/prototype-preview-state-types";

export {
  buildCreatePrototypeCopyText,
  buildCreatePrototypePrompt,
  normalizeCreatePrototypeReferenceDocs,
  normalizeCreatePrototypeDocLinks,
  suggestPrototypeSlug,
  type CreatePrototypeReferenceDocInput,
} from "./lib/prototypes/create-prototype-prompt";

export {
  buildCreateStarterScreenCopyText,
  buildCreateStarterScreenPrompt,
} from "./lib/prototypes/create-starter-screen-prompt";

export {
  buildPopulateComponentLibraryCopyText,
  buildPopulateComponentLibraryPrompt,
} from "./lib/prototypes/populate-component-library-prompt";
export {
  buildClearComponentLibraryCopyText,
  buildClearComponentLibraryPrompt,
} from "./lib/prototypes/clear-component-library-prompt";
export {
  buildLinkSourceCopyText,
  buildLinkSourcePrompt,
} from "./lib/prototypes/link-source-prompt";
export type { PrototypePreviewState } from "./lib/prototypes/prototype-preview-state-types";

export {
  buildChangelogDescriptionCopyText,
  buildChangelogDescriptionPrompt,
} from "./lib/prototypes/changelog-description-prompt";
export {
  buildAddReferenceDocCopyText,
  buildAddReferenceDocPrompt,
  defaultReferenceDocsConfigPath,
  isValidReferenceDoc,
  isValidReferenceDocInput,
  normalizeReferenceDocLink,
} from "./lib/prototypes/reference-docs";
export type { PrototypeReferenceDoc } from "./lib/prototypes/reference-docs";
export { useRegisterPrototypeReferenceDocs } from "./lib/prototypes/use-register-prototype-reference-docs";
export {
  buildPreviewStateCanvasEdges,
  buildPreviewStateCanvasLayout,
  buildPreviewStateCanvasNodes,
  buildPreviewStatePickerOptions,
  definePreviewStateRegistry,
  flattenPreviewStateLabels,
  getPreviewStateNodeHeight,
  normalizePreviewStateCanvasRowStates,
} from "./lib/prototypes/prototype-preview-state-registry";
export type {
  DefinedPreviewStateRegistry,
  PreviewStateCanvasLayout,
  PreviewStateCanvasRowPlacement,
  PreviewStateCanvasRowStatePlacement,
  PrototypePreviewStateCanvasLayoutSpec,
  PrototypePreviewStateDefinition,
  PrototypePreviewStateEdge,
  PrototypePreviewStateRegistry,
  PrototypePreviewStateVariant,
  ResolvedPrototypePreviewStateDefinition,
} from "./lib/prototypes/prototype-preview-state-registry";
export {
  getStateCanvasNodeHeight,
  PROTOTYPE_STATE_CANVAS_PADDING,
  PROTOTYPE_STATE_NODE_COLUMN_GAP,
  PROTOTYPE_STATE_NODE_ROW_GAP,
  PROTOTYPE_STATE_SECTION_TO_NODES,
  stateCanvasColumnX,
} from "./lib/prototypes/prototype-state-canvas-constants";

export { PrototypeGalleryClient } from "./components/prototype-gallery-client";

export {
  PrototypeGalleryShell,
  PrototypeGalleryHeader,
  PrototypeGalleryPage,
  PrototypeGalleryPageLayout,
  PROTOTYPE_GALLERY_CONTENT_INSET_CLASS,
  PROTOTYPE_GALLERY_GRID_GAP_CLASS,
  PROTOTYPE_GALLERY_HEADER_INSET_CLASS,
} from "./components/shell/prototype-gallery-shell";

export { screenshotSrc } from "./lib/prototypes/screenshot-src";

export {
  definePrototypeComponentRegistry,
  type PrototypeComponentRegistry,
} from "./lib/prototypes/prototype-component-registry";

export { PrototypeControls } from "./components/prototypes/prototype-controls";

export {
  PrototypeStateCanvasRegistrar,
  PrototypeStateCanvasView,
  buildStateMapHref,
  getDefaultPrototypeStateMapPath,
  parseStateMapReturnTo,
  PROTOTYPE_STATE_MAP_RETURN_TO_PARAM,
  type PrototypeStateCanvasConfig,
  type PrototypeStateCanvasEdge,
  type PrototypeStateCanvasNode,
  type PrototypeStateCanvasNodeCallout,
  type PrototypeStateCanvasSection,
  type PrototypeStateMapAnnotationEntry,
  buildStateMapAnnotationEntries,
  stateMapHasAnnotations,
} from "./components/prototypes/prototype-state-canvas";

export { PrototypeStateScreenshotCapture } from "./components/shell/prototype-state-screenshot-capture";

export { PrototypeStateScreenshotPreview } from "./components/prototypes/prototype-state-screenshot-preview";

export {
  sanitizeStateIdForFilename,
  stateScreenshotManifestKey,
  stateScreenshotPublicPath,
  stateScreenshotSrc,
} from "./lib/prototypes/prototype-state-screenshot";

export {
  StateMapHighlightProvider,
  StateMapHighlightRegion,
  StateMapPreviewHighlightOverlay,
  useStateMapHighlight,
} from "./components/prototypes/state-map-wireframe-highlight";

export {
  parseStateMapAnnotation,
  resolveBulletHighlightId,
  stateMapAnnotationHasInteractiveBullets,
} from "./lib/prototypes/state-map-annotation";
export type {
  ParsedStateMapAnnotation,
  ParsedStateMapBullet,
} from "./lib/prototypes/state-map-annotation";

export type { StateMapHighlightRect } from "./lib/prototypes/prototype-state-canvas-types";

export { PrototypeReviewDropdownMenuItem } from "./components/prototypes/prototype-review-dropdown-menu-item";

export { PrototypeReviewDropdownMenuSeparator } from "./components/prototypes/prototype-review-dropdown-menu-separator";

export { PrototypeReviewPanelSelect } from "./components/prototypes/prototype-review-panel-select";

export {
  ControlsPanelOption,
  ControlsPanelOptionGroup,
  ControlsPanelOptionSeparator,
} from "./components/platform-ui/controls-panel-options";

export { ControlsPanelSelect } from "./components/platform-ui/controls-panel-select";
export type {
  ControlsPanelSelectEntry,
  ControlsPanelSelectOption,
  ControlsPanelSelectSeparator,
  ControlsPanelSelectSubmenu,
  ControlsPanelSelectSubmenuOption,
} from "./components/platform-ui/controls-panel-select";

export { PrototypeReviewPanelMenuItem } from "./components/prototypes/prototype-review-panel-menu-item";

export { PrototypeReviewPanelMenuSeparator } from "./components/prototypes/prototype-review-panel-menu-separator";

export {
  usePrototypeReview,
  usePrototypeReviewOptional,
} from "./lib/prototypes/prototype-review-context";
export type {
  PrototypeReviewSidebarPanel,
  PrototypeVariantSet,
  PrototypeViewportLayout,
} from "./lib/prototypes/prototype-review-context";

export {
  PROTOTYPE_MOBILE_VIEWPORT_HEIGHT_PX,
  PROTOTYPE_MOBILE_VIEWPORT_WIDTH_PX,
} from "./lib/prototypes/prototype-review-context";
export {
  VariantSetLucideIcon,
  resolveVariantSetLucideIcon,
} from "./lib/prototypes/variant-set-lucide-icon";
export { usePrototypeViewportFrame } from "./lib/prototypes/use-prototype-viewport-frame";
export { usePrototypeMobileViewportFrame } from "./lib/prototypes/use-prototype-mobile-viewport-frame";
export { usePrototypeProductOverlayPortal } from "./lib/prototypes/use-prototype-product-overlay-portal";

export {
  PROTOTYPE_CHROME_ROOT_ID,
  PROTOTYPE_COMMENTS_SIDEBAR_ROOT_ID,
  PROTOTYPE_PREVIEW_STAGE_ID,
  PROTOTYPE_ROOT_ID,
  PROTOTYPE_SCREENSHOT_ATTR,
  PROTOTYPE_SOURCE_SURFACE_ATTR,
  PROTOTYPE_TOOL_OVERLAY_ROOT_ID,
  PROTOTYPE_VIEWPORT_ID,
  getPrototypeChromeRoot,
  getPrototypeDialogPortalContainer,
  getPrototypeToolDialogPortalContainer,
  getPrototypePreviewStage,
  getPrototypeScreenshotRoot,
  getPrototypeToolOverlayRoot,
} from "./lib/tool-portal";

export {
  prototypeChangelogMetaRedisKey,
  isValidChangelogMeta,
  parseChangelogMeta,
  normalizeChangelogMetaPayload,
  EMPTY_CHANGELOG_META,
} from "./lib/prototypes/changelog-meta";
export type { PrototypeChangelogMeta } from "./lib/prototypes/changelog-meta";
export { createChangelogMetaStorageAdapter } from "./lib/prototypes/changelog-meta-storage";
export {
  ChangelogMetaProvider,
  useChangelogMeta,
  useChangelogMetaOptional,
} from "./lib/prototypes/changelog-meta-context";

export {
  filterAnnotationsByChannel,
  getChangelogRootAnnotations,
  getCommentRootAnnotations,
  isChangelogAnnotation,
} from "./lib/prototype-comments/core/annotation-channel";
export type { AnnotationChannel } from "./lib/prototype-comments/core/annotation-channel";

export { isValidAnnotation } from "./lib/prototype-comments/core/validation";
export {
  isAnnotationDeleted,
  isVisibleAnnotation,
} from "./lib/prototype-comments/core/annotation-status";
export type { CommentAnnotationFields } from "./lib/prototype-comments/core/types";

export { PrototypeSpecPanelContent } from "./components/prototypes/prototype-spec-panel-content";
export type { PrototypeSpecPanelContentProps } from "./components/prototypes/prototype-spec-panel-content";

export {
  PR_TARGET_HIGHLIGHT_BORDER,
  PR_TARGET_HIGHLIGHT_FILL,
  PR_SPLIT_WIREFRAME_FRAME_CLASS,
} from "./lib/pr-split/pr-split-highlight";

export { buildPrSplitPrototypeUrl } from "./lib/pr-split/build-pr-split-prototype-url";
export { buildPrAgentPrompt } from "./lib/pr-split/build-pr-agent-prompt";
export {
  buildPrSplitPlanPrompt,
  buildPrSplitPlanCopyText,
} from "./lib/pr-split/build-pr-split-plan-prompt";
export type { PrSplitPlanPromptOptions } from "./lib/pr-split/build-pr-split-plan-prompt";

export { PrototypeSpecPanelEmptyState } from "./components/prototypes/prototype-spec-panel-empty-state";

export type {
  PrSplitEntry,
  PrSplitEntrySize,
  PrSplitConfig,
  PrSplitAgentPromptConfig,
  PrSplitUrlConfig,
} from "./lib/pr-split/pr-split-types";

export { resolveSourcePreviewUrl } from "./lib/pr-split/resolve-source-preview-url";
export { usePrVercelPreviews } from "./lib/pr-split/use-pr-vercel-previews";

export {
  buildVercelPreviewPageUrl,
  parseGithubPrUrl,
  parseVercelGithubCommentBody,
} from "./lib/vercel-preview/parse-vercel-github-comment";
export type {
  VercelPreviewFromPr,
  VercelPreviewProject,
} from "./lib/vercel-preview/parse-vercel-github-comment";
