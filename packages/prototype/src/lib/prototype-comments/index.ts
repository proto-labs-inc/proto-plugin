// Core utilities (no React)
export { captureInteractionState } from "./core/capture";
export { commentToLiveState } from "./core/restore";
export { createRemoteStorageAdapter, CommentStorageError } from "./core/storage";
export type { CommentStorageAdapter } from "./core/storage";
export { isValidAnnotation } from "./core/validation";
export {
  getRepliesForParent,
  getRootAnnotations,
  isRootAnnotation,
  resolveThreadRootId,
} from "./core/comment-threads";
export { normalizeAnnotationViewport } from "./core/normalize-viewport";
export { formatAnnotationWithState, formatAllAnnotations } from "./core/export";
export { captureViewportScreenshot } from "./core/screenshot";
export {
  closestCrossingShadow,
  identifyElement,
  parseComputedStylesString,
} from "./core/element-identification";
export {
  resolveAnnotationTargetElement,
  resolveAnnotationTargetById,
  getPrototypeCaptureViewport,
  getPrototypeScrollContainer,
  restoreAnnotationScrollPosition,
  getAnnotationMarkerPosition,
  getAnnotationMarkerPortalPosition,
  getAnnotationOutlineBox,
  getElementRelativeMarkerStyle,
  getMarkerViewportPosition,
  PROTOTYPE_TARGET_ATTR,
  type AnnotationTargetOptions,
} from "./core/annotation-target";

// Types
export type {
  AnnotationBoundingBox,
  CaptureViewport,
  CommentAnnotationFields,
  CommentInteractionState,
  CommentAnnotation,
  CommentStore,
} from "./core/types";

// React
export {
  CommentProvider,
  useCommentStore,
  useCommentStoreOptional,
} from "./react/CommentProvider";
export { CommentCaptureToolbar } from "./react/CommentCaptureToolbar";
export type { CommentCaptureToolbarProps } from "./react/CommentCaptureToolbar";

// UI
export { getViewportBoundingBox, getCaptureAspectRatio } from "./ui/comment-highlight";
export { isCanvasDetailPath, isCanvasPath } from "./ui/is-comment-detail-path";
export { CommentsGrid } from "./ui/CommentsGrid";
export { CommentsListPage } from "./ui/CommentsListPage";
export { CommentDetailPage } from "./ui/CommentDetailPage";
export { CommentsSidebar } from "./ui/CommentsSidebar";
export { CommentAnnotationOverlay } from "./ui/CommentAnnotationOverlay";
