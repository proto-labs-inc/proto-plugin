export type AnnotationBoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CaptureViewport = {
  width: number;
  height: number;
  scrollY: number;
  /** Scroll offset of the prototype content container (not window) */
  scrollTop?: number;
  /** Registered target id of the element that owns scrollTop */
  scrollContainerTargetId?: string;
};

export type CommentAnnotationFields = {
  id: string;
  x: number;
  y: number;
  comment: string;
  element: string;
  elementPath: string;
  timestamp: number;
  selectedText?: string;
  boundingBox?: AnnotationBoundingBox;
  /** Element bounds in viewport coordinates at screenshot capture time */
  viewportBoundingBox?: AnnotationBoundingBox;
  /** Viewport dimensions when the screenshot was taken */
  captureViewport?: CaptureViewport;
  positionAnchor?: "viewport" | "element";
  /** Full id from data-prototype-target, e.g. my-slug.filter-bar.status */
  targetId?: string;
  nearbyText?: string;
  cssClasses?: string;
  isMultiSelect?: boolean;
  isFixed?: boolean;
  fullPath?: string;
  accessibility?: string;
  computedStyles?: string;
  nearbyElements?: string;
  reactComponents?: string;
  sourceFile?: string;
  sessionId?: string;
  url?: string;
  status?: "pending" | "acknowledged" | "resolved" | "dismissed";
  /** When set, this annotation is a reply on the root comment with this id. */
  parentId?: string;
  /** Soft-delete flag — deleted comments stay in storage but are hidden in UI. */
  deleted?: boolean;
  /** Review comments vs change log notes. Defaults to `"comment"`. */
  channel?: "comment" | "changelog";
};

/** The stored interaction state: prototype live state + package-added metadata */
export type CommentInteractionState<TState> = TState & {
  capturedAt: string;
  route: string;
};

export type CommentAnnotation<TState> = CommentAnnotationFields & {
  interactionState: CommentInteractionState<TState>;
  screenshot?: string;
};

export type CommentStore<TState> = {
  slug: string;
  annotations: CommentAnnotation<TState>[];
  storageReady: boolean;
  /** False when server env vars are missing; null while checking. */
  storageConfigured: boolean | null;
  storageError: string | null;
  addAnnotation: (
    fields: Omit<CommentAnnotation<TState>, "interactionState">,
  ) => CommentAnnotation<TState>;
  addReply: (parentId: string, comment: string) => CommentAnnotation<TState>;
  updateAnnotation: (id: string, comment: string) => void;
  resolveAnnotation: (id: string) => void;
  deleteAnnotation: (id: string) => void;
  clearAllAnnotations: () => void;
  restoreComment: (id: string) => CommentAnnotation<TState> | undefined;
};
