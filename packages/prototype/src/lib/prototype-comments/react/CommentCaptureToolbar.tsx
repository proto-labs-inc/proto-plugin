"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { CommentCaptureTargetHighlights } from "./CommentCaptureTargetHighlights";

import { PrototypeComponentAnchorLayer } from "@prototype/components/prototypes/prototype-component-anchor-layer";
import {
  getPrototypeTargetElement,
  getPrototypeTargetIdFromElement,
} from "@prototype/components/prototypes/prototype-target";
import { usePrototypeCommentRegistry } from "@prototype/lib/prototypes/prototype-comment-registry";
import { usePrototypeReviewOptional } from "@prototype/lib/prototypes/prototype-review-context";
import { usePrototypeToolTheme } from "@prototype/lib/prototypes/use-prototype-tool-theme";
import { getPrototypeSlugFromPathname } from "@prototype/lib/prototypes/share-command";
import {
  clearPendingCommentRestore,
  resolveShareCommentId,
  stashPendingCommentRestore,
  syncShareCommentParam,
} from "@prototype/lib/prototypes/prototype-share-link";

import {
  computeElementCenterMarkerPosition,
  computeElementRelativeMarkerPosition,
  deepElementFromPoint,
  getElementRelativeMarkerStyle,
  getMarkerViewportPosition,
  getPrototypeCaptureViewport,
  getPrototypeScrollContainer,
  resolveAnnotationTargetById,
  type AnnotationTargetOptions,
} from "../core/annotation-target";
import type { AnnotationBoundingBox, CaptureViewport } from "../core/types";
import {
  getAdjacentDisplayCommentId,
  sortAnnotationsForDisplay,
} from "../core/annotation-status";
import {
  filterAnnotationsByChannel,
  getCommentRootAnnotations,
  isChangelogAnnotation,
} from "../core/annotation-channel";
import { getRootAnnotations, resolveThreadRootId } from "../core/comment-threads";
import {
  buildCommentCaptureCursorStyles,
  isCommentCaptureBlockedTarget,
  isCommentModeChromeInteraction,
} from "../core/comment-capture-blocked";
import { closestCrossingShadow } from "../core/element-identification";
import { injectCaptureColorTokens } from "../core/capture-theme";
import { originalSetTimeout } from "../core/freeze-animations";
import {
  detectSourceFile,
  getAccessibilityInfo,
  getDetailedComputedStyles,
  getElementClasses,
  getForensicComputedStyles,
  getFullElementPath,
  getNearbyElements,
  getNearbyText,
  identifyElementWithReact,
  isElementFixed,
} from "../core/identify-element";
import { captureViewportScreenshot } from "../core/screenshot";
import { useCommentStore } from "../react/CommentProvider";
import {
  AnnotationPopupCSS,
  type AnnotationPopupCSSHandle,
} from "../ui/annotation-popup";
import { PendingMarker } from "../ui/annotation-marker";
import { CommentAnnotationOverlay } from "../ui/CommentAnnotationOverlay";
import { CommentsSidebar } from "../ui/CommentsSidebar";
import { IconChatEllipsis, IconPlus, IconXmarkLarge } from "../ui/icons";
import styles from "../ui/capture-styles.module.scss";

type PendingAnnotation = {
  x: number;
  y: number;
  clientY: number;
  element: string;
  elementPath: string;
  selectedText?: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
  nearbyText?: string;
  cssClasses?: string;
  isMultiSelect?: boolean;
  isFixed?: boolean;
  fullPath?: string;
  accessibility?: string;
  computedStyles?: string;
  computedStylesObj?: Record<string, string>;
  nearbyElements?: string;
  reactComponents?: string;
  sourceFile?: string;
  elementBoundingBoxes?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  multiSelectElements?: HTMLElement[];
  targetElement?: HTMLElement;
  targetId?: string;
  positionAnchor?: "viewport" | "element";
  captureViewport?: CaptureViewport;
  viewportBoundingBox?: AnnotationBoundingBox;
};

function resolveCaptureAnchor(elementUnder: HTMLElement): HTMLElement {
  return getPrototypeTargetElement(elementUnder) ?? elementUnder;
}

function toViewportBoundingBox(
  rect: Pick<DOMRect, "left" | "top" | "width" | "height">,
): AnnotationBoundingBox {
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

type HoverInfo = {
  element: string;
  rect: DOMRect | null;
};

type MultiSelectItem = {
  element: HTMLElement;
  rect: DOMRect;
  name: string;
  path: string;
  reactComponents?: string;
};

export type CommentCaptureToolbarProps<TState = unknown> = {
  sidebarBasePath?: string;
  resolveTargetOptions?:
    | AnnotationTargetOptions
    | (() => AnnotationTargetOptions);
  devOnly?: boolean;
  className?: string;
  children?: ReactNode;
};

export type CommentCaptureBridgeValue = {
  onSelect: (id: string) => void;
  selectedId: string | null;
  isCommentModeActive: boolean;
  isChangelogModeActive: boolean;
  onEnterCommentMode: () => void;
  onEnterChangelogMode: () => void;
  onOpenCommentsPanel: () => void;
  onToggleCommentMode: () => void;
  onClose: () => void;
};

const CommentCaptureBridgeContext =
  createContext<CommentCaptureBridgeValue | null>(null);

export function useCommentCaptureBridge(): CommentCaptureBridgeValue {
  const context = useContext(CommentCaptureBridgeContext);
  if (!context) {
    throw new Error(
      "useCommentCaptureBridge must be used within CommentCaptureToolbar"
    );
  }
  return context;
}

export function useCommentCaptureBridgeOptional(): CommentCaptureBridgeValue | null {
  return useContext(CommentCaptureBridgeContext);
}

export function CommentCaptureToolbar<TState = unknown>({
  sidebarBasePath = "/canvas",
  resolveTargetOptions,
  devOnly = false,
  className,
  children,
}: CommentCaptureToolbarProps<TState>) {
  const store = useCommentStore<TState>();
  const { readHandlers, subscribeLiveStateChange } =
    usePrototypeCommentRegistry();
  const review = usePrototypeReviewOptional();
  const integratedReview = review != null;
  const { useLightTheme, commentTheme } = usePrototypeToolTheme();
  const router = useRouter();
  const currentPathname = usePathname() ?? "/";
  const prototypeSlug = getPrototypeSlugFromPathname(currentPathname);
  const popupRef = useRef<AnnotationPopupCSSHandle>(null);
  const modifiersHeldRef = useRef({ cmd: false, shift: false });

  const [mounted, setMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isGiveAMomentMode, setIsGiveAMomentMode] = useState(false);
  const [showCommentsSidebar, setShowCommentsSidebar] = useState(false);
  const [activeRestoreId, setActiveRestoreId] = useState<string | null>(null);
  const [pendingRestoreId, setPendingRestoreId] = useState<string | null>(null);
  // Mirrors of selection state used by the (persistent) live-state subscriber so
  // it reads fresh values without re-subscribing. `liveStateArmedRef` flips true
  // after the restore-driven live-state change so subsequent (user-driven)
  // changes deselect the active comment.
  const activeRestoreIdRef = useRef<string | null>(null);
  const liveStateArmedRef = useRef(false);
  const [pendingAnnotation, setPendingAnnotation] =
    useState<PendingAnnotation | null>(null);
  const [pendingExiting, setPendingExiting] = useState(false);
  const [pendingMultiSelectElements, setPendingMultiSelectElements] = useState<
    MultiSelectItem[]
  >([]);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [scrollY, setScrollY] = useState(0);

  const isFeedbackActive = isGiveAMomentMode;
  const isChangelogModeActive =
    isGiveAMomentMode &&
    integratedReview &&
    review?.captureChannel === "changelog";
  const isCommentModeActive =
    isGiveAMomentMode &&
    (!integratedReview || review?.captureChannel === "comment");
  const annotationTargetOptions = useMemo(() => {
    if (typeof resolveTargetOptions === "function") {
      return resolveTargetOptions();
    }
    return resolveTargetOptions;
  }, [resolveTargetOptions]);

  useEffect(() => {
    setMounted(true);
    injectCaptureColorTokens();
  }, []);

  useLayoutEffect(() => {
    if (!prototypeSlug) return;
    resolveShareCommentId(
      new URLSearchParams(window.location.search),
      prototypeSlug,
    );
  }, [prototypeSlug]);

  useEffect(() => {
    const syncScroll = () => setScrollY(window.scrollY);
    syncScroll();
    window.addEventListener("scroll", syncScroll, { passive: true });

    const scrollContainer = getPrototypeScrollContainer();
    scrollContainer?.addEventListener("scroll", syncScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", syncScroll);
      scrollContainer?.removeEventListener("scroll", syncScroll);
    };
  }, []);

  const activateToolbar = useCallback(() => {
    setIsActive(true);
    if (integratedReview) {
      review.openSidebar("comments");
      return;
    }
    setShowCommentsSidebar(true);
  }, [integratedReview, review]);

  const clearActiveComment = useCallback(() => {
    activeRestoreIdRef.current = null;
    liveStateArmedRef.current = false;
    setActiveRestoreId(null);
    syncShareCommentParam(null);
    if (prototypeSlug) clearPendingCommentRestore(prototypeSlug);
  }, [prototypeSlug]);

  // Restore a comment's frozen state and begin tracking live-state changes. The
  // refs are set synchronously so the live-state change that the restore itself
  // triggers is recognized (and "arms" tracking) rather than treated as a user edit.
  const selectAndRestore = useCallback(
    (id: string) => {
      liveStateArmedRef.current = false;
      activeRestoreIdRef.current = id;
      store.restoreComment(id);
      setActiveRestoreId(id);
      syncShareCommentParam(id);
      if (prototypeSlug) stashPendingCommentRestore(prototypeSlug, id);
      // Fallback: if the restore produced no live-state change (the comment's
      // captured state already matched), arm tracking after the restore settles
      // so the next user edit still deselects.
      window.setTimeout(() => {
        if (activeRestoreIdRef.current === id) {
          liveStateArmedRef.current = true;
        }
      }, 80);
    },
    [store, prototypeSlug],
  );

  const deactivate = useCallback(() => {
    clearActiveComment();
    setIsGiveAMomentMode(false);
    if (integratedReview) {
      review.closeSidebar();
    } else {
      setShowCommentsSidebar(false);
    }
    setIsActive(false);
    setPendingAnnotation(null);
    setPendingMultiSelectElements([]);
    setHoverInfo(null);
  }, [integratedReview, review, clearActiveComment]);

  const enterCommentMode = useCallback(() => {
    if (integratedReview) {
      review.setCaptureChannel("comment");
    }
    setActiveRestoreId(null);
    setIsGiveAMomentMode((active) => {
      const next = !active;
      if (next) {
        setIsActive(true);
        if (integratedReview) {
          review.openSidebar("comments");
        }
      } else if (integratedReview ? !review.open : true) {
        setIsActive(false);
      }
      return next;
    });
  }, [integratedReview, review]);

  const openCommentsPanel = useCallback(() => {
    if (integratedReview) {
      review.setCaptureChannel("comment");
      review.openSidebar("comments");
      return;
    }
    setIsActive(true);
    setShowCommentsSidebar(true);
  }, [integratedReview, review]);

  const enterChangelogMode = useCallback(() => {
    if (!integratedReview) return;
    review.setCaptureChannel("changelog");
    setActiveRestoreId(null);
    setIsGiveAMomentMode((active) => {
      const next = !active;
      if (next) {
        setIsActive(true);
        review.openSidebar("change-log");
      } else if (!review.open) {
        setIsActive(false);
      }
      return next;
    });
  }, [integratedReview, review]);

  const toggleCommentMode = useCallback(() => {
    if (integratedReview) {
      review.setCaptureChannel("comment");
    }
    setActiveRestoreId(null);
    setIsGiveAMomentMode((active) => !active);
  }, [integratedReview, review]);

  const exitCommentMode = useCallback(() => {
    setPendingMultiSelectElements([]);
    setPendingAnnotation(null);
    setPendingExiting(false);
    setHoverInfo(null);
    setIsGiveAMomentMode(false);
    modifiersHeldRef.current = { cmd: false, shift: false };
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  const cancelAnnotation = useCallback(() => {
    setPendingExiting(true);
    originalSetTimeout(() => {
      setPendingAnnotation(null);
      setPendingExiting(false);
    }, 150);
  }, []);

  const createMultiSelectPendingAnnotation = useCallback(() => {
    if (pendingMultiSelectElements.length === 0) return;

    const firstItem = pendingMultiSelectElements[0];
    const firstEl = firstItem.element;
    const isMulti = pendingMultiSelectElements.length > 1;
    const freshRects = pendingMultiSelectElements.map((item) =>
      item.element.getBoundingClientRect()
    );

    if (!isMulti) {
      const anchor = resolveCaptureAnchor(firstEl);
      const rect = anchor.getBoundingClientRect();
      const isFixed = isElementFixed(anchor);

      setPendingAnnotation({
        ...computeElementCenterMarkerPosition(),
        positionAnchor: "element",
        clientY: rect.top,
        element: firstItem.name,
        elementPath: firstItem.path,
        targetId: getPrototypeTargetIdFromElement(firstEl) ?? undefined,
        boundingBox: {
          x: rect.left,
          y: isFixed ? rect.top : rect.top + window.scrollY,
          width: rect.width,
          height: rect.height,
        },
        captureViewport: getPrototypeCaptureViewport(anchor),
        viewportBoundingBox: toViewportBoundingBox(rect),
        isFixed,
        fullPath: getFullElementPath(anchor),
        accessibility: getAccessibilityInfo(anchor),
        computedStyles: getForensicComputedStyles(anchor),
        computedStylesObj: getDetailedComputedStyles(anchor),
        nearbyElements: getNearbyElements(anchor),
        cssClasses: getElementClasses(anchor),
        nearbyText: getNearbyText(anchor),
        reactComponents: firstItem.reactComponents,
        sourceFile: detectSourceFile(anchor),
        targetElement: anchor,
      });
    } else {
      const bounds = {
        left: Math.min(...freshRects.map((r) => r.left)),
        top: Math.min(...freshRects.map((r) => r.top)),
        right: Math.max(...freshRects.map((r) => r.right)),
        bottom: Math.max(...freshRects.map((r) => r.bottom)),
      };

      const names = pendingMultiSelectElements
        .slice(0, 5)
        .map((item) => item.name)
        .join(", ");
      const suffix =
        pendingMultiSelectElements.length > 5
          ? ` +${pendingMultiSelectElements.length - 5} more`
          : "";

      const lastItem =
        pendingMultiSelectElements[pendingMultiSelectElements.length - 1];
      const lastEl = lastItem.element;
      const lastRect = freshRects[freshRects.length - 1];
      const lastCenterY = lastRect.top + lastRect.height / 2;

      setPendingAnnotation({
        ...computeElementCenterMarkerPosition(),
        positionAnchor: "element",
        clientY: lastCenterY,
        element: `${pendingMultiSelectElements.length} elements: ${names}${suffix}`,
        elementPath: "multi-select",
        boundingBox: {
          x: bounds.left,
          y: bounds.top + window.scrollY,
          width: bounds.right - bounds.left,
          height: bounds.bottom - bounds.top,
        },
        captureViewport: getPrototypeCaptureViewport(lastEl),
        viewportBoundingBox: toViewportBoundingBox({
          left: bounds.left,
          top: bounds.top,
          width: bounds.right - bounds.left,
          height: bounds.bottom - bounds.top,
        }),
        isMultiSelect: true,
        isFixed: isElementFixed(lastEl),
        elementBoundingBoxes: freshRects.map((rect) => ({
          x: rect.left,
          y: rect.top + window.scrollY,
          width: rect.width,
          height: rect.height,
        })),
        multiSelectElements: pendingMultiSelectElements.map(
          (item) => item.element
        ),
        targetElement: lastEl,
        fullPath: getFullElementPath(firstEl),
        accessibility: getAccessibilityInfo(firstEl),
        computedStyles: getForensicComputedStyles(firstEl),
        computedStylesObj: getDetailedComputedStyles(firstEl),
        nearbyElements: getNearbyElements(firstEl),
        cssClasses: getElementClasses(firstEl),
        nearbyText: getNearbyText(firstEl),
        sourceFile: detectSourceFile(firstEl),
      });
    }

    setPendingMultiSelectElements([]);
    setHoverInfo(null);
  }, [pendingMultiSelectElements]);

  const addAnnotation = useCallback(
    async (comment: string) => {
      if (!pendingAnnotation) return;
      if (!store.storageReady || store.storageError) return;

      const screenshotResult = await captureViewportScreenshot();
      const id = Date.now().toString();
      const clickViewport =
        pendingAnnotation.captureViewport ??
        getPrototypeCaptureViewport(pendingAnnotation.targetElement ?? null);
      const screenshotViewport = screenshotResult?.captureViewport;
      const captureViewport: CaptureViewport = {
        width: screenshotViewport?.width ?? clickViewport.width,
        height: screenshotViewport?.height ?? clickViewport.height,
        scrollY: clickViewport.scrollY,
        scrollTop: clickViewport.scrollTop,
        scrollContainerTargetId: clickViewport.scrollContainerTargetId,
      };

      store.addAnnotation({
        id,
        x: pendingAnnotation.x,
        y: pendingAnnotation.y,
        positionAnchor: pendingAnnotation.positionAnchor ?? "element",
        targetId: pendingAnnotation.targetId,
        comment,
        element: pendingAnnotation.element,
        elementPath: pendingAnnotation.elementPath,
        timestamp: Date.now(),
        selectedText: pendingAnnotation.selectedText,
        boundingBox: pendingAnnotation.boundingBox,
        viewportBoundingBox: pendingAnnotation.viewportBoundingBox,
        nearbyText: pendingAnnotation.nearbyText,
        cssClasses: pendingAnnotation.cssClasses,
        isMultiSelect: pendingAnnotation.isMultiSelect,
        isFixed: pendingAnnotation.isFixed,
        fullPath: pendingAnnotation.fullPath,
        accessibility: pendingAnnotation.accessibility,
        computedStyles: pendingAnnotation.computedStyles,
        nearbyElements: pendingAnnotation.nearbyElements,
        reactComponents: pendingAnnotation.reactComponents,
        sourceFile: pendingAnnotation.sourceFile,
        screenshot: screenshotResult?.dataUrl ?? undefined,
        captureViewport,
        channel: integratedReview ? review.captureChannel : "comment",
      });

      setPendingExiting(true);
      originalSetTimeout(() => {
        setPendingAnnotation(null);
        setPendingExiting(false);
      }, 150);

      window.getSelection()?.removeAllRanges();
    },
    [pendingAnnotation, store, integratedReview, review]
  );

  const openAnnotationPanel = useCallback(
    (channel: "comment" | "changelog" = integratedReview
      ? review.captureChannel
      : "comment") => {
      setIsActive(true);
      if (integratedReview) {
        review.openSidebar(channel === "changelog" ? "change-log" : "comments");
        return;
      }
      setShowCommentsSidebar(true);
    },
    [integratedReview, review],
  );

  const handleCommentSelect = useCallback(
    (id: string) => {
      const rootId = resolveThreadRootId(store.annotations, id);
      const annotation = store.annotations.find((item) => item.id === rootId);
      if (!annotation) return;

      setPendingAnnotation(null);
      openAnnotationPanel(
        isChangelogAnnotation(annotation) ? "changelog" : "comment",
      );

      if (annotation.interactionState.route !== currentPathname) {
        setPendingRestoreId(rootId);
        router.push(annotation.interactionState.route);
        return;
      }

      selectAndRestore(rootId);
    },
    [store, currentPathname, router, openAnnotationPanel, selectAndRestore]
  );

  useEffect(() => {
    if (!activeRestoreId || pendingAnnotation) return;
    const currentRestoreId = activeRestoreId;

    function isTypingTarget(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      if (isTypingTarget(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const rootId = resolveThreadRootId(store.annotations, currentRestoreId);
      const currentRoot = store.annotations.find((item) => item.id === rootId);
      const channelFilter = currentRoot
        ? isChangelogAnnotation(currentRoot)
          ? "changelog"
          : "comment"
        : null;
      const sorted = sortAnnotationsForDisplay(
        channelFilter
          ? filterAnnotationsByChannel(store.annotations, channelFilter)
          : store.annotations,
        channelFilter === "changelog" ? "oldest" : "newest",
      );
      if (sorted.length < 2) return;

      const direction = event.key === "ArrowUp" ? "prev" : "next";
      const nextId = getAdjacentDisplayCommentId(
        sorted,
        currentRestoreId,
        direction,
      );
      if (!nextId || nextId === currentRestoreId) return;

      event.preventDefault();
      handleCommentSelect(nextId);
    }

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [
    activeRestoreId,
    pendingAnnotation,
    store.annotations,
    handleCommentSelect,
  ]);

  useEffect(() => {
    if (!activeRestoreId || pendingAnnotation) return;
    const currentRestoreId = activeRestoreId;

    function isTypingTarget(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "z" && event.key !== "Z") return;
      if (!(event.metaKey || event.ctrlKey) || event.shiftKey || event.altKey)
        return;
      if (isTypingTarget(event.target)) return;

      const rootId = resolveThreadRootId(store.annotations, currentRestoreId);
      const annotation = store.annotations.find((item) => item.id === rootId);
      if (!annotation || isChangelogAnnotation(annotation)) return;

      event.preventDefault();
      store.resolveAnnotation(rootId);
    }

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [activeRestoreId, pendingAnnotation, store]);

  useEffect(() => {
    if (!pendingRestoreId) return;

    const annotation = store.annotations.find(
      (item) => item.id === pendingRestoreId
    );
    if (!annotation) {
      setPendingRestoreId(null);
      return;
    }

    if (annotation.interactionState.route !== currentPathname) return;

    selectAndRestore(pendingRestoreId);
    setPendingRestoreId(null);
  }, [pendingRestoreId, store, currentPathname, selectAndRestore]);

  useLayoutEffect(() => {
    if (!mounted || !store.storageReady) return;

    const commentId = resolveShareCommentId(
      new URLSearchParams(window.location.search),
      prototypeSlug,
    );
    if (!commentId) return;

    if (activeRestoreId === commentId) {
      if (prototypeSlug) clearPendingCommentRestore(prototypeSlug);
      return;
    }

    const annotation = store.annotations.find((item) => item.id === commentId);
    if (!annotation) return;

    handleCommentSelect(commentId);
  }, [
    mounted,
    store.storageReady,
    store.annotations,
    activeRestoreId,
    handleCommentSelect,
    prototypeSlug,
  ]);

  useEffect(() => {
    if (!mounted) return;
    syncShareCommentParam(activeRestoreId);
  }, [activeRestoreId, mounted]);

  useEffect(() => {
    if (!mounted || !store.storageReady || !activeRestoreId) return;

    const commentId = resolveShareCommentId(
      new URLSearchParams(window.location.search),
      prototypeSlug,
    );
    if (commentId !== activeRestoreId) return;
    if (!readHandlers()?.onRestore) return;

    liveStateArmedRef.current = false;
    store.restoreComment(activeRestoreId);
    if (prototypeSlug) clearPendingCommentRestore(prototypeSlug);
  }, [
    mounted,
    store.storageReady,
    activeRestoreId,
    readHandlers,
    store,
    prototypeSlug,
  ]);

  // Deselect the active comment when the user navigates the review chrome away
  // from the comment it belongs to: switching sidebar panels (spec/variants),
  // or opening a design exploration. A selected comment is only meaningful while
  // its own comments/change-log panel is showing.
  const reviewOpen = integratedReview ? review.open : false;
  const reviewSidebarPanel = integratedReview ? review.sidebarPanel : null;
  const reviewActiveVariantSetId = integratedReview
    ? review.activeVariantSetId
    : null;
  useEffect(() => {
    if (!integratedReview || !activeRestoreId || !reviewOpen) return;

    const annotation = store.annotations.find(
      (item) => item.id === activeRestoreId,
    );
    if (!annotation) return;

    const expectedPanel = isChangelogAnnotation(annotation)
      ? "change-log"
      : "comments";

    if (reviewSidebarPanel !== expectedPanel || reviewActiveVariantSetId != null) {
      clearActiveComment();
    }
  }, [
    integratedReview,
    activeRestoreId,
    reviewOpen,
    reviewSidebarPanel,
    reviewActiveVariantSetId,
    store.annotations,
    clearActiveComment,
  ]);

  useEffect(() => {
    activeRestoreIdRef.current = activeRestoreId;
  }, [activeRestoreId]);

  // Deselect the active comment whenever the prototype's live state changes.
  // The first live-state change after a selection is the restore itself, which
  // arms tracking; every subsequent change is user-driven and clears the comment.
  useEffect(() => {
    return subscribeLiveStateChange(() => {
      if (!activeRestoreIdRef.current) return;
      if (!liveStateArmedRef.current) {
        liveStateArmedRef.current = true;
        return;
      }
      clearActiveComment();
    });
  }, [subscribeLiveStateChange, clearActiveComment]);

  // Deselect the active comment when the element it is anchored to is no longer
  // present/visible in the DOM (e.g. removed by a state or exploration change
  // that did not register as a tracked live-state edit).
  useEffect(() => {
    if (!activeRestoreId) return;

    const annotation = store.annotations.find(
      (item) => item.id === activeRestoreId,
    );
    if (!annotation?.targetId) return;
    const { targetId } = annotation;

    const check = () => {
      if (!resolveAnnotationTargetById(targetId)) {
        clearActiveComment();
      }
    };

    const interval = window.setInterval(check, 400);
    return () => window.clearInterval(interval);
  }, [activeRestoreId, store.annotations, clearActiveComment]);

  useEffect(() => {
    if (!isFeedbackActive) {
      setPendingAnnotation(null);
      setPendingMultiSelectElements([]);
      setHoverInfo(null);
      modifiersHeldRef.current = { cmd: false, shift: false };
    }
  }, [isFeedbackActive]);

  useEffect(() => {
    if (!isFeedbackActive) return;

    const style = document.createElement("style");
    style.id = "feedback-cursor-styles";
    style.textContent = buildCommentCaptureCursorStyles();
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, [isFeedbackActive]);

  useEffect(() => {
    if (!isFeedbackActive || pendingAnnotation) return;

    const handleMouseMove = (e: MouseEvent) => {
      const target = (e.composedPath()[0] || e.target) as HTMLElement;
      if (isCommentCaptureBlockedTarget(target)) {
        setHoverInfo(null);
        return;
      }

      const elementUnder = deepElementFromPoint(e.clientX, e.clientY);
      if (!elementUnder || isCommentCaptureBlockedTarget(elementUnder)) {
        setHoverInfo(null);
        return;
      }

      const { name } = identifyElementWithReact(elementUnder, "filtered");
      setHoverInfo({
        element: name,
        rect: elementUnder.getBoundingClientRect(),
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isFeedbackActive, pendingAnnotation]);

  useEffect(() => {
    if (!isFeedbackActive) return;

    const handleClick = (e: MouseEvent) => {
      const target = (e.composedPath()[0] || e.target) as HTMLElement;

      if (isCommentCaptureBlockedTarget(target)) return;

      if (e.metaKey && e.shiftKey && !pendingAnnotation) {
        e.preventDefault();
        e.stopPropagation();

        const elementUnder = deepElementFromPoint(e.clientX, e.clientY);
        if (!elementUnder || isCommentCaptureBlockedTarget(elementUnder)) return;

        const anchor = resolveCaptureAnchor(elementUnder);
        const rect = anchor.getBoundingClientRect();
        const { name, path, reactComponents } = identifyElementWithReact(
          anchor,
          "filtered"
        );
        const existingIndex = pendingMultiSelectElements.findIndex(
          (item) => item.element === anchor
        );

        if (existingIndex >= 0) {
          setPendingMultiSelectElements((prev) =>
            prev.filter((_, i) => i !== existingIndex)
          );
        } else {
          setPendingMultiSelectElements((prev) => [
            ...prev,
            {
              element: anchor,
              rect,
              name,
              path,
              reactComponents: reactComponents ?? undefined,
            },
          ]);
        }
        return;
      }

      const isInteractive = closestCrossingShadow(
        target,
        "button, a, input, select, textarea, [role='button'], [onclick]"
      );

      if (isInteractive) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (pendingAnnotation) {
        e.preventDefault();
        popupRef.current?.shake();
        return;
      }

      e.preventDefault();

      const elementUnder = deepElementFromPoint(e.clientX, e.clientY);
      if (!elementUnder || isCommentCaptureBlockedTarget(elementUnder)) return;

      const anchor = resolveCaptureAnchor(elementUnder);
      const { name, path, reactComponents } = identifyElementWithReact(
        anchor,
        "filtered"
      );
      const rect = anchor.getBoundingClientRect();
      const { x, y } = computeElementRelativeMarkerPosition(
        e.clientX,
        e.clientY,
        rect
      );
      const isFixed = isElementFixed(anchor);

      const selection = window.getSelection();
      let selectedText: string | undefined;
      if (selection && selection.toString().trim().length > 0) {
        selectedText = selection.toString().trim().slice(0, 500);
      }

      setPendingAnnotation({
        x,
        y,
        positionAnchor: "element",
        clientY: e.clientY,
        element: name,
        elementPath: path,
        targetId: getPrototypeTargetIdFromElement(elementUnder) ?? undefined,
        selectedText,
        boundingBox: {
          x: rect.left,
          y: isFixed ? rect.top : rect.top + window.scrollY,
          width: rect.width,
          height: rect.height,
        },
        captureViewport: getPrototypeCaptureViewport(anchor),
        viewportBoundingBox: toViewportBoundingBox(rect),
        nearbyText: getNearbyText(anchor),
        cssClasses: getElementClasses(anchor),
        isFixed,
        fullPath: getFullElementPath(anchor),
        accessibility: getAccessibilityInfo(anchor),
        computedStyles: getForensicComputedStyles(anchor),
        computedStylesObj: getDetailedComputedStyles(anchor),
        nearbyElements: getNearbyElements(anchor),
        reactComponents: reactComponents ?? undefined,
        sourceFile: detectSourceFile(anchor),
        targetElement: anchor,
      });
      setActiveRestoreId(null);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isFeedbackActive, pendingAnnotation, pendingMultiSelectElements]);

  useEffect(() => {
    if (!isFeedbackActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Meta") modifiersHeldRef.current.cmd = true;
      if (e.key === "Shift") modifiersHeldRef.current.shift = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const wasHoldingBoth =
        modifiersHeldRef.current.cmd && modifiersHeldRef.current.shift;

      if (e.key === "Meta") modifiersHeldRef.current.cmd = false;
      if (e.key === "Shift") modifiersHeldRef.current.shift = false;

      const nowHoldingBoth =
        modifiersHeldRef.current.cmd && modifiersHeldRef.current.shift;

      if (
        wasHoldingBoth &&
        !nowHoldingBoth &&
        pendingMultiSelectElements.length > 0
      ) {
        createMultiSelectPendingAnnotation();
      }
    };

    const handleBlur = () => {
      modifiersHeldRef.current = { cmd: false, shift: false };
      setPendingMultiSelectElements([]);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [
    isFeedbackActive,
    pendingMultiSelectElements,
    createMultiSelectPendingAnnotation,
  ]);

  useEffect(() => {
    if (!isCommentModeActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      exitCommentMode();
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = (event.composedPath()[0] || event.target) as HTMLElement;
      if (!isCommentModeChromeInteraction(target)) return;
      exitCommentMode();
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [exitCommentMode, isCommentModeActive]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isTyping =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable);

      if (e.key === "Escape") {
        if (pendingMultiSelectElements.length > 0) {
          setPendingMultiSelectElements([]);
          e.preventDefault();
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          return;
        }
        if (pendingAnnotation) return;
        if (isChangelogModeActive) {
          setIsGiveAMomentMode(false);
          e.preventDefault();
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        }
      }

      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        (e.key === "f" || e.key === "F")
      ) {
        e.preventDefault();
        if (!isActive) {
          activateToolbar();
        } else {
          setIsGiveAMomentMode((prev) => !prev);
        }
      }

      if (isTyping || e.metaKey || e.ctrlKey) return;
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isChangelogModeActive,
    pendingAnnotation,
    pendingMultiSelectElements.length,
    activateToolbar,
  ]);

  useEffect(() => {
    if (isActive) return;

    setIsGiveAMomentMode(false);
    if (!integratedReview) {
      setShowCommentsSidebar(false);
    }

    const shareCommentId = resolveShareCommentId(
      new URLSearchParams(window.location.search),
      prototypeSlug,
    );
    if (!shareCommentId) {
      setActiveRestoreId(null);
      syncShareCommentParam(null);
    }
  }, [isActive, integratedReview, prototypeSlug]);

  const bridgeValue = useMemo<CommentCaptureBridgeValue>(
    () => ({
      onSelect: handleCommentSelect,
      selectedId: activeRestoreId,
      isCommentModeActive,
      isChangelogModeActive,
      onEnterCommentMode: enterCommentMode,
      onEnterChangelogMode: enterChangelogMode,
      onOpenCommentsPanel: openCommentsPanel,
      onToggleCommentMode: toggleCommentMode,
      onClose: deactivate,
    }),
    [
      handleCommentSelect,
      activeRestoreId,
      isCommentModeActive,
      isChangelogModeActive,
      enterCommentMode,
      enterChangelogMode,
      openCommentsPanel,
      toggleCommentMode,
      deactivate,
    ]
  );

  if (devOnly && process.env.NODE_ENV !== "development") {
    return null;
  }

  if (!mounted) {
    return (
      <CommentCaptureBridgeContext.Provider value={bridgeValue}>
        {children}
      </CommentCaptureBridgeContext.Provider>
    );
  }

  const commentCount = getCommentRootAnnotations(store.annotations).length;
  const activeAnnotation = activeRestoreId
    ? store.annotations.find((item) => item.id === activeRestoreId)
    : null;

  const sidebarPortalTarget =
    typeof document !== "undefined"
      ? document.getElementById("prototype-comments-sidebar-root")
      : null;

  const sidebar = integratedReview ? null : (
    <CommentsSidebar
      open={showCommentsSidebar}
      onClose={deactivate}
      onSelect={handleCommentSelect}
      selectedId={activeRestoreId}
      isCommentModeActive={isGiveAMomentMode}
      onToggleCommentMode={toggleCommentMode}
    />
  );

  const showLegacyToolbar = !integratedReview && !showCommentsSidebar;

  return (
    <CommentCaptureBridgeContext.Provider value={bridgeValue}>
      {children}
      {!integratedReview && sidebarPortalTarget
        ? createPortal(sidebar, sidebarPortalTarget)
        : sidebar}
      {createPortal(
        (
          <div
            className={styles.captureScope}
            data-prototype-comment-theme={commentTheme}
            data-prototype-comment-accent="blue"
            data-prototype-comment-root=""
          >
            {showLegacyToolbar && (
              <div
                className={`${styles.toolbar}${
                  className ? ` ${className}` : ""
                }`}
                data-feedback-toolbar
                data-comment-capture-toolbar
              >
                <div
                  className={`${styles.toolbarContainer} ${
                    isActive ? styles.expanded : styles.collapsed
                  } ${styles.fitContent}`}
                  onClick={!isActive ? activateToolbar : undefined}
                  role={!isActive ? "button" : undefined}
                  tabIndex={!isActive ? 0 : -1}
                  title={!isActive ? "Open comments" : undefined}
                >
                  <div
                    className={`${styles.toggleContent} ${
                      !isActive ? styles.visible : styles.hidden
                    }`}
                  >
                    <IconChatEllipsis size={24} />
                    {commentCount > 0 && (
                      <span className={styles.badge}>{commentCount}</span>
                    )}
                  </div>

                  <div
                    className={`${styles.controlsContent} ${
                      isActive ? styles.visible : styles.hidden
                    }`}
                  >
                    <div className={styles.buttonWrapper}>
                      <button
                        type="button"
                        className={styles.controlButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsGiveAMomentMode((active) => !active);
                        }}
                        data-prototype-comment-mode-toggle
                        data-active={isGiveAMomentMode}
                        aria-label={
                          isGiveAMomentMode
                            ? "Exit comment mode"
                            : "Add comments"
                        }
                      >
                        <IconPlus size={24} />
                      </button>
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.buttonWrapper}>
                      <button
                        type="button"
                        className={styles.controlButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          deactivate();
                        }}
                      >
                        <IconXmarkLarge size={24} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeAnnotation && (
              <CommentAnnotationOverlay
                key={activeAnnotation.id}
                annotation={activeAnnotation}
                basePath={sidebarBasePath}
                readOnly
                onDismiss={clearActiveComment}
                resolveTargetOptions={annotationTargetOptions}
              />
            )}

            {isFeedbackActive ? (
              <CommentCaptureTargetHighlights
                hoverInfo={hoverInfo}
                pendingAnnotation={pendingAnnotation}
                pendingExiting={pendingExiting}
                pendingMultiSelectElements={pendingMultiSelectElements}
                scrollY={scrollY}
              />
            ) : null}

            {isFeedbackActive && pendingAnnotation ? (
              <>
                <PrototypeComponentAnchorLayer
                  targetId={pendingAnnotation.targetId}
                  targetElement={pendingAnnotation.targetElement ?? null}
                  marker="capture"
                >
                  <div className={styles.markersLayerInViewport}>
                    <PendingMarker
                      x={pendingAnnotation.x}
                      y={pendingAnnotation.y}
                      positionStyle={getElementRelativeMarkerStyle({
                        x: pendingAnnotation.x,
                        y: pendingAnnotation.y,
                      })}
                      isMultiSelect={pendingAnnotation.isMultiSelect}
                      isExiting={pendingExiting}
                    />
                  </div>
                </PrototypeComponentAnchorLayer>

                <div className={styles.overlay} data-comment-capture-overlay>
                  {(() => {
                    const markerViewport = getMarkerViewportPosition(
                      {
                        x: pendingAnnotation.x,
                        y: pendingAnnotation.y,
                        boundingBox: pendingAnnotation.boundingBox,
                        isFixed: pendingAnnotation.isFixed,
                        positionAnchor: pendingAnnotation.positionAnchor,
                      },
                      pendingAnnotation.targetElement ?? null,
                    );

                    return (
                      <AnnotationPopupCSS
                        ref={popupRef as RefObject<AnnotationPopupCSSHandle>}
                        element={pendingAnnotation.element}
                        selectedText={pendingAnnotation.selectedText}
                        computedStyles={pendingAnnotation.computedStylesObj}
                        onSubmit={addAnnotation}
                        onCancel={cancelAnnotation}
                        isExiting={pendingExiting}
                        lightMode={useLightTheme}
                        showElementPath={false}
                        accentColor="var(--prototype-comment-color-accent)"
                        style={{
                          left: Math.max(
                            160,
                            Math.min(
                              window.innerWidth - 160,
                              markerViewport.x,
                            ),
                          ),
                          ...(markerViewport.y > window.innerHeight - 290
                            ? {
                                bottom:
                                  window.innerHeight -
                                  markerViewport.y +
                                  20,
                              }
                            : { top: markerViewport.y + 20 }),
                        }}
                      />
                    );
                  })()}
                </div>
              </>
            ) : null}
          </div>
        ) as ReactNode,
        document.body
      )}
    </CommentCaptureBridgeContext.Provider>
  );
}
