"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";

import type { AnnotationChannel } from "@prototype/lib/prototype-comments/core/annotation-channel";
import { scrollPrototypeTargetIntoView } from "@prototype/lib/prototypes/prototype-share-link";
import {
  hasReviewUrlParams,
  parseReviewStateFromSearchParams,
  syncReviewStateToUrl,
  type PrototypeReviewSidebarPanel,
  type PrototypeReviewTab,
} from "@prototype/lib/prototypes/prototype-review-url";
import { focusPrototypeTweak } from "@prototype/lib/prototypes/prototype-tweak-registry";
import type { PrototypeStateCanvasConfig } from "@prototype/lib/prototypes/prototype-state-canvas-types";
import type { PrototypePreviewState } from "@prototype/lib/prototypes/prototype-preview-state-types";
import {
  defaultReferenceDocsConfigPath,
  type PrototypeReferenceDoc,
} from "@prototype/lib/prototypes/reference-docs";
import {
  prototypeReviewPreferenceKey,
  usePersistedLocalString,
} from "@prototype/lib/prototypes/use-persisted-local-state";

export type { PrototypeReviewSidebarPanel, PrototypeReviewTab };

export type PrototypeViewportLayout = "desktop" | "mobile";

/** iPhone 14/15 logical width */
export const PROTOTYPE_MOBILE_VIEWPORT_WIDTH_PX = 390;

/** iPhone 14/15 logical height */
export const PROTOTYPE_MOBILE_VIEWPORT_HEIGHT_PX = 844;

export type PrototypeVariantSet = {
  id: string;
  label: string;
  onActivate?: () => void;
};

function hasPrototypeTweaksContent(content: ReactNode | null | undefined): boolean {
  return content != null && content !== false && content !== true;
}

type PrototypeReviewContextValue = {
  slug: string;
  open: boolean;
  sidebarPanel: PrototypeReviewSidebarPanel | null;
  activeTab: PrototypeReviewTab;
  captureChannel: AnnotationChannel;
  setCaptureChannel: (channel: AnnotationChannel) => void;
  prodReferenceAvailable: boolean;
  showProdReference: boolean;
  setShowProdReference: (show: boolean) => void;
  toggleProdReference: () => void;
  registerProdReference: (available: boolean) => void;
  /** Latest prototype controls panel content — read via ref after `setTweaksContent`. */
  tweaksContentRef: MutableRefObject<ReactNode | null>;
  /** Whether prototype controls content is registered (drives States toolbar button). */
  hasTweaksContent: boolean;
  setTweaksContent: (content: ReactNode | null) => void;
  /** Latest spec panel content — read via ref after `setSpecContent`. */
  specContentRef: MutableRefObject<ReactNode | null>;
  /** Whether spec content is registered (drives Spec toolbar button). */
  hasSpecContent: boolean;
  setSpecContent: (content: ReactNode | null) => void;
  /** Latest state canvas config — read via ref after `setStateCanvasConfig`. */
  stateCanvasConfigRef: MutableRefObject<PrototypeStateCanvasConfig | null>;
  /** Whether a state canvas is registered (drives Canvas toolbar button). */
  hasStateCanvas: boolean;
  setStateCanvasConfig: <T extends string>(
    config: PrototypeStateCanvasConfig<T> | null,
  ) => void;
  stateCanvasPagePath: string | null;
  setStateCanvasPagePath: (path: string | null) => void;
  /** Preview states from the controls panel select (read via ref for New state modal). */
  previewStatesRef: MutableRefObject<PrototypePreviewState[]>;
  registerPreviewStates: (states: PrototypePreviewState[]) => void;
  /** Currently previewed state id (from the States menu select). */
  activePreviewStateId: string | null;
  setActivePreviewStateId: (id: string | null) => void;
  registerOpenCreateStateModal: (handler: (() => void) | null) => void;
  openCreateStateModal: () => void;
  referenceDocs: PrototypeReferenceDoc[];
  referenceDocsConfigFilePath: string | undefined;
  registerReferenceDocs: (
    docs: PrototypeReferenceDoc[],
    configFilePath?: string,
  ) => void;
  variantSets: PrototypeVariantSet[];
  variantSetPopoverTargets: Record<string, HTMLElement | null>;
  /** Bumped when variant sidebar panel content updates (read via getters). */
  variantSidebarRevision: number;
  legacyVariantsAvailable: boolean;
  legacyVariantsPopoverTarget: HTMLElement | null;
  activeVariantSetId: string | null;
  highlightTargetId: string | null;
  tweaksOpen: boolean;
  variantsOpen: boolean;
  settingsOpen: boolean;
  shareModeActive: boolean;
  openSidebar: (panel?: PrototypeReviewSidebarPanel) => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: PrototypeReviewTab) => void;
  registerVariantSet: (set: {
    id: string;
    label: string;
    onActivate?: () => void;
  }) => void;
  registerVariantSetPopover: (id: string, element: HTMLElement | null) => void;
  registerVariantSidebarContent: (id: string, content: ReactNode | null) => void;
  updateVariantSidebarContent: (id: string, content: ReactNode) => void;
  getVariantSidebarContent: (id: string) => ReactNode | null;
  registerLegacyVariantSidebarContent: (content: ReactNode | null) => void;
  updateLegacyVariantSidebarContent: (content: ReactNode) => void;
  getLegacyVariantSidebarContent: () => ReactNode | null;
  unregisterVariantSet: (id: string) => void;
  setLegacyVariantsAvailable: (available: boolean) => void;
  registerLegacyVariantsPopover: (element: HTMLElement | null) => void;
  focusTweak: (tweakId: string) => void;
  clearHighlight: () => void;
  openTweaks: () => void;
  closeTweaks: () => void;
  toggleTweaks: () => void;
  openVariantSet: (id: string) => void;
  closeVariants: () => void;
  toggleVariantSet: (id: string) => void;
  /** @deprecated Use toggleVariantSet instead. */
  openVariants: () => void;
  /** @deprecated Use closeVariants instead. */
  toggleVariants: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;
  enterShareMode: () => void;
  exitShareMode: () => void;
  focusShareTarget: (targetId: string) => void;
  viewportLayout: PrototypeViewportLayout;
  setViewportLayout: (layout: PrototypeViewportLayout) => void;
  toggleViewportLayout: () => void;
};

const PrototypeReviewContext = createContext<PrototypeReviewContextValue | null>(
  null,
);

export function PrototypeReviewProvider({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [sidebarPanel, setSidebarPanel] =
    useState<PrototypeReviewSidebarPanel | null>(null);
  const [activeTab, setActiveTabState] = useState<PrototypeReviewTab>("tweaks");
  const tweaksContentRef = useRef<ReactNode | null>(null);
  const [hasTweaksContent, setHasTweaksContent] = useState(false);
  const specContentRef = useRef<ReactNode | null>(null);
  const [hasSpecContent, setHasSpecContent] = useState(false);
  const stateCanvasConfigRef = useRef<PrototypeStateCanvasConfig | null>(null);
  const [hasStateCanvas, setHasStateCanvas] = useState(false);
  const [stateCanvasPagePath, setStateCanvasPagePathState] = useState<
    string | null
  >(null);
  const [variantSetMap, setVariantSetMap] = useState<
    Record<string, PrototypeVariantSet>
  >({});
  const [variantSetPopoverTargets, setVariantSetPopoverTargets] = useState<
    Record<string, HTMLElement | null>
  >({});
  const [legacyVariantsAvailable, setLegacyVariantsAvailable] = useState(false);
  const [legacyVariantsPopoverTarget, setLegacyVariantsPopoverTarget] =
    useState<HTMLElement | null>(null);
  const variantSidebarContentRef = useRef<Record<string, ReactNode>>({});
  const legacyVariantSidebarContentRef = useRef<ReactNode | null>(null);
  const [registeredVariantSidebarIds, setRegisteredVariantSidebarIds] =
    useState<Record<string, true>>({});
  const [legacyVariantSidebarRegistered, setLegacyVariantSidebarRegistered] =
    useState(false);
  const [variantSidebarRevision, setVariantSidebarRevision] = useState(0);
  const [variantSetOrder, setVariantSetOrder] = useState<string[]>([]);
  const previewStatesRef = useRef<PrototypePreviewState[]>([]);
  const [activePreviewStateId, setActivePreviewStateId] = useState<string | null>(
    null,
  );
  const openCreateStateModalRef = useRef<(() => void) | null>(null);
  const [referenceDocs, setReferenceDocs] = useState<PrototypeReferenceDoc[]>(
    [],
  );
  const [referenceDocsConfigFilePath, setReferenceDocsConfigFilePath] =
    useState<string | undefined>(undefined);
  const [activeVariantSetId, setActiveVariantSetId] = useState<string | null>(
    null,
  );
  const [highlightTargetId, setHighlightTargetId] = useState<string | null>(
    null,
  );
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [variantsOpen, setVariantsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareModeActive, setShareModeActive] = useState(false);
  const [captureChannel, setCaptureChannelState] =
    useState<AnnotationChannel>("comment");
  const [prodReferenceAvailable, setProdReferenceAvailable] = useState(false);
  const [showProdReference, setShowProdReference] = useState(false);
  const { value: viewportLayoutRaw, updateValue: persistViewportLayout } =
    usePersistedLocalString(
      prototypeReviewPreferenceKey(slug, "viewport-layout"),
      "desktop",
    );
  const viewportLayout: PrototypeViewportLayout =
    viewportLayoutRaw === "mobile" ? "mobile" : "desktop";
  const closePanelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUrlVariantSetRef = useRef<string | null>(null);
  const urlHydratingRef = useRef(false);
  const urlSyncReadyRef = useRef(false);

  const setCaptureChannel = useCallback((channel: AnnotationChannel) => {
    setCaptureChannelState(channel);
  }, []);

  const registerProdReference = useCallback((available: boolean) => {
    setProdReferenceAvailable(available);
    if (!available) {
      setShowProdReference(false);
    }
  }, []);

  const setShowProdReferenceState = useCallback((show: boolean) => {
    setShowProdReference(show);
  }, []);

  const toggleProdReference = useCallback(() => {
    setShowProdReference((current) => !current);
  }, []);

  const variantSets = useMemo(
    () => variantSetOrder.map((id) => variantSetMap[id]).filter(Boolean),
    [variantSetMap, variantSetOrder],
  );

  const setTweaksContent = useCallback((content: ReactNode | null) => {
    tweaksContentRef.current = content;
    const nextHasContent = hasPrototypeTweaksContent(content);
    setHasTweaksContent((current) =>
      current === nextHasContent ? current : nextHasContent,
    );
  }, []);

  const registerPreviewStates = useCallback((states: PrototypePreviewState[]) => {
    previewStatesRef.current = states;
  }, []);

  const registerOpenCreateStateModal = useCallback((handler: (() => void) | null) => {
    openCreateStateModalRef.current = handler;
  }, []);

  const openCreateStateModal = useCallback(() => {
    openCreateStateModalRef.current?.();
  }, []);

  const registerReferenceDocs = useCallback(
    (docs: PrototypeReferenceDoc[], configFilePath?: string) => {
      setReferenceDocs(docs);
      setReferenceDocsConfigFilePath(
        configFilePath ?? defaultReferenceDocsConfigPath(slug),
      );
    },
    [slug],
  );

  const setSpecContent = useCallback((content: ReactNode | null) => {
    specContentRef.current = content;
    const nextHasContent = content != null;
    setHasSpecContent((current) =>
      current === nextHasContent ? current : nextHasContent,
    );
  }, []);

  const setStateCanvasConfig = useCallback(
    <T extends string>(config: PrototypeStateCanvasConfig<T> | null) => {
      stateCanvasConfigRef.current = config as PrototypeStateCanvasConfig | null;
      const nextHasCanvas = config != null;
      setHasStateCanvas((current) =>
        current === nextHasCanvas ? current : nextHasCanvas,
      );
    },
    [],
  );

  const setStateCanvasPagePath = useCallback((path: string | null) => {
    setStateCanvasPagePathState(path);
    setHasStateCanvas((current) => {
      const next = path != null || stateCanvasConfigRef.current != null;
      return current === next ? current : next;
    });
  }, []);

  const closeVariants = useCallback(() => {
    setVariantsOpen(false);
    setActiveVariantSetId(null);
    setSidebarPanel((current) => {
      if (current === "variants") {
        setOpen(false);
        // Keep sidebarPanel as "variants" during the 250ms close animation,
        // then clear it so the sidebar doesn't flash comments content.
        if (closePanelTimerRef.current) clearTimeout(closePanelTimerRef.current);
        closePanelTimerRef.current = setTimeout(() => {
          setSidebarPanel((c) => (c === "variants" ? null : c));
          closePanelTimerRef.current = null;
        }, 280);
        return current;
      }
      return current;
    });
  }, []);

  const openSidebar = useCallback(
    (panel?: PrototypeReviewSidebarPanel) => {
      const nextPanel = panel ?? "comments";
      if (nextPanel === "comments" || nextPanel === "change-log") {
        setVariantsOpen(false);
        setActiveVariantSetId(null);
      }
      if (closePanelTimerRef.current) {
        clearTimeout(closePanelTimerRef.current);
        closePanelTimerRef.current = null;
      }
      setSidebarPanel(nextPanel);
      setOpen(true);
      if (nextPanel === "comments") {
        setActiveTabState(tweaksContentRef.current ? "tweaks" : "comments");
      }
    },
    [],
  );

  const closeSidebar = useCallback(() => {
    if (closePanelTimerRef.current) {
      clearTimeout(closePanelTimerRef.current);
      closePanelTimerRef.current = null;
    }
    setOpen(false);
    setSidebarPanel(null);
    setVariantsOpen(false);
    setActiveVariantSetId(null);
  }, []);

  const toggleSidebar = useCallback(() => {
    setOpen((current) => {
      if (current) {
        setSidebarPanel(null);
        setVariantsOpen(false);
        setActiveVariantSetId(null);
        return false;
      }
      setSidebarPanel("comments");
      setActiveTabState(tweaksContentRef.current ? "tweaks" : "comments");
      return true;
    });
  }, []);

  const setActiveTab = useCallback((tab: PrototypeReviewTab) => {
    setActiveTabState(tab);
  }, []);

  const clearHighlight = useCallback(() => {
    setHighlightTargetId(null);
  }, []);

  const focusTweak = useCallback((tweakId: string) => {
    const targetId = focusPrototypeTweak(tweakId);
    if (targetId) {
      setHighlightTargetId(targetId);
    }
  }, []);

  const variantSetActivateHandlersRef = useRef<Record<string, (() => void) | undefined>>(
    {},
  );

  const registerVariantSet = useCallback(
    (set: { id: string; label: string; onActivate?: () => void }) => {
      variantSetActivateHandlersRef.current[set.id] = set.onActivate;

      setVariantSetMap((current) => {
        const existing = current[set.id];
        if (existing?.label === set.label) return current;
        return {
          ...current,
          [set.id]: {
            id: set.id,
            label: set.label,
          },
        };
      });
      setVariantSetOrder((current) =>
        current.includes(set.id) ? current : [...current, set.id],
      );
    },
    [],
  );

  const registerVariantSetPopover = useCallback(
    (id: string, element: HTMLElement | null) => {
      setVariantSetPopoverTargets((current) => {
        if (current[id] === element) return current;
        return { ...current, [id]: element };
      });
    },
    [],
  );

  const registerLegacyVariantsPopover = useCallback(
    (element: HTMLElement | null) => {
      setLegacyVariantsPopoverTarget((current) =>
        current === element ? current : element,
      );
    },
    [],
  );

  const registerVariantSidebarContent = useCallback(
    (id: string, content: ReactNode | null) => {
      if (content == null) {
        if (!(id in variantSidebarContentRef.current)) return;
        delete variantSidebarContentRef.current[id];
        setRegisteredVariantSidebarIds((current) => {
          if (!(id in current)) return current;
          const next = { ...current };
          delete next[id];
          return next;
        });
        setVariantSidebarRevision((revision) => revision + 1);
        return;
      }

      variantSidebarContentRef.current[id] = content;
      setRegisteredVariantSidebarIds((current) => {
        if (id in current) return current;
        return { ...current, [id]: true };
      });
    },
    [],
  );

  const updateVariantSidebarContent = useCallback(
    (id: string, content: ReactNode) => {
      if (!(id in variantSidebarContentRef.current)) return;
      variantSidebarContentRef.current[id] = content;
      setVariantSidebarRevision((revision) => revision + 1);
    },
    [],
  );

  const getVariantSidebarContent = useCallback((id: string) => {
    return variantSidebarContentRef.current[id] ?? null;
  }, []);

  const registerLegacyVariantSidebarContent = useCallback(
    (content: ReactNode | null) => {
      if (content == null) {
        legacyVariantSidebarContentRef.current = null;
        setLegacyVariantSidebarRegistered((current) =>
          current ? false : current,
        );
        setVariantSidebarRevision((revision) => revision + 1);
        return;
      }

      legacyVariantSidebarContentRef.current = content;
      setLegacyVariantSidebarRegistered((current) => (current ? current : true));
    },
    [],
  );

  const updateLegacyVariantSidebarContent = useCallback((content: ReactNode) => {
    if (legacyVariantSidebarContentRef.current == null) return;
    legacyVariantSidebarContentRef.current = content;
    setVariantSidebarRevision((revision) => revision + 1);
  }, []);

  const getLegacyVariantSidebarContent = useCallback(
    () => legacyVariantSidebarContentRef.current,
    [],
  );

  const unregisterVariantSet = useCallback((id: string) => {
    delete variantSetActivateHandlersRef.current[id];

    setVariantSetMap((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
    setVariantSetOrder((current) => current.filter((entry) => entry !== id));
    setActiveVariantSetId((current) => (current === id ? null : current));
    setVariantSetPopoverTargets((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
    delete variantSidebarContentRef.current[id];
    setRegisteredVariantSidebarIds((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }, []);

  const openVariantSet = useCallback((id: string) => {
    variantSetActivateHandlersRef.current[id]?.();
    setSettingsOpen(false);
    setTweaksOpen(false);
    if (closePanelTimerRef.current) {
      clearTimeout(closePanelTimerRef.current);
      closePanelTimerRef.current = null;
    }
    setActiveVariantSetId(id);
    setVariantsOpen(true);
    setSidebarPanel("variants");
    setOpen(true);
  }, []);

  const toggleVariantSet = useCallback(
    (id: string) => {
      if (variantsOpen && activeVariantSetId === id) {
        closeVariants();
        return;
      }
      openVariantSet(id);
    },
    [activeVariantSetId, closeVariants, openVariantSet, variantsOpen],
  );

  const openVariants = useCallback(() => {
    setSettingsOpen(false);
    setTweaksOpen(false);
    if (closePanelTimerRef.current) {
      clearTimeout(closePanelTimerRef.current);
      closePanelTimerRef.current = null;
    }
    setVariantsOpen(true);
    setSidebarPanel("variants");
    setOpen(true);
  }, []);

  const toggleVariants = useCallback(() => {
    openVariants();
  }, [openVariants]);

  const openTweaks = useCallback(() => {
    setSettingsOpen(false);
    setTweaksOpen(true);
  }, []);
  const closeTweaks = useCallback(() => setTweaksOpen(false), []);
  const toggleTweaks = useCallback(() => {
    setTweaksOpen((current) => {
      const next = !current;
      if (next) {
        setSettingsOpen(false);
      }
      return next;
    });
  }, []);

  const openSettings = useCallback(() => {
    setTweaksOpen(false);
    setSettingsOpen(true);
  }, []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const toggleSettings = useCallback(() => {
    setSettingsOpen((current) => {
      const next = !current;
      if (next) {
        setTweaksOpen(false);
      }
      return next;
    });
  }, []);

  const enterShareMode = useCallback(() => {
    setSettingsOpen(false);
    setTweaksOpen(false);
    setShareModeActive(true);
  }, []);

  const exitShareMode = useCallback(() => {
    setShareModeActive(false);
  }, []);

  const focusShareTarget = useCallback((targetId: string) => {
    scrollPrototypeTargetIntoView(targetId);
    setHighlightTargetId(targetId);
  }, []);

  const setViewportLayout = useCallback(
    (layout: PrototypeViewportLayout) => {
      persistViewportLayout(layout);
    },
    [persistViewportLayout],
  );

  const toggleViewportLayout = useCallback(() => {
    persistViewportLayout(viewportLayout === "desktop" ? "mobile" : "desktop");
  }, [persistViewportLayout, viewportLayout]);

  const applyReviewStateFromUrl = useCallback(
    (parsed: ReturnType<typeof parseReviewStateFromSearchParams>) => {
      setShowProdReference(parsed.prodReference);

      if (parsed.settingsOpen) {
        setSettingsOpen(true);
        setTweaksOpen(false);
      } else if (parsed.tweaksOpen) {
        setTweaksOpen(true);
        setSettingsOpen(false);
      } else {
        setTweaksOpen(false);
        setSettingsOpen(false);
      }

      if (!parsed.panel) {
        if (closePanelTimerRef.current) {
          clearTimeout(closePanelTimerRef.current);
          closePanelTimerRef.current = null;
        }
        setOpen(false);
        setSidebarPanel(null);
        setVariantsOpen(false);
        setActiveVariantSetId(null);
        return;
      }

      if (closePanelTimerRef.current) {
        clearTimeout(closePanelTimerRef.current);
        closePanelTimerRef.current = null;
      }

      if (parsed.panel === "variants") {
        setTweaksOpen(false);
        setSettingsOpen(false);
        setVariantsOpen(true);
        setSidebarPanel("variants");
        setOpen(true);

        if (parsed.variantSetId) {
          pendingUrlVariantSetRef.current = parsed.variantSetId;
          setActiveVariantSetId(parsed.variantSetId);
        } else {
          pendingUrlVariantSetRef.current = null;
          setActiveVariantSetId(null);
        }
        return;
      }

      pendingUrlVariantSetRef.current = null;
      setVariantsOpen(false);
      setActiveVariantSetId(null);
      setSidebarPanel(parsed.panel);
      setOpen(true);

      if (parsed.panel === "comments") {
        setActiveTabState(
          parsed.activeTab === "comments" && !tweaksContentRef.current
            ? "comments"
            : parsed.activeTab,
        );
      }
    },
    [],
  );

  const hydrateReviewStateFromUrl = useCallback(() => {
    if (typeof window === "undefined") return;

    const searchParams = new URLSearchParams(window.location.search);
    if (!hasReviewUrlParams(searchParams)) {
      urlSyncReadyRef.current = true;
      return;
    }

    urlHydratingRef.current = true;
    applyReviewStateFromUrl(parseReviewStateFromSearchParams(searchParams));
    urlHydratingRef.current = false;
    urlSyncReadyRef.current = true;
  }, [applyReviewStateFromUrl]);

  useEffect(() => {
    hydrateReviewStateFromUrl();
  }, [hydrateReviewStateFromUrl]);

  useEffect(() => {
    const onPopState = () => {
      hydrateReviewStateFromUrl();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [hydrateReviewStateFromUrl]);

  useLayoutEffect(() => {
    const pendingId = pendingUrlVariantSetRef.current;
    if (!pendingId) return;

    const handler = variantSetActivateHandlersRef.current[pendingId];
    if (!handler) return;

    handler();
    pendingUrlVariantSetRef.current = null;
  }, [variantSetOrder, variantSets]);

  useEffect(() => {
    if (!urlSyncReadyRef.current || urlHydratingRef.current) return;

    syncReviewStateToUrl({
      open,
      sidebarPanel,
      activeVariantSetId,
      activeTab,
      tweaksOpen,
      settingsOpen,
      prodReferenceAvailable,
      showProdReference,
    });
  }, [
    open,
    sidebarPanel,
    activeVariantSetId,
    activeTab,
    tweaksOpen,
    settingsOpen,
    prodReferenceAvailable,
    showProdReference,
  ]);

  const value = useMemo(() => {
    return {
      slug,
      open,
      sidebarPanel,
      activeTab,
      captureChannel,
      setCaptureChannel,
      prodReferenceAvailable,
      showProdReference,
      setShowProdReference: setShowProdReferenceState,
      toggleProdReference,
      registerProdReference,
      tweaksContentRef,
      hasTweaksContent,
      setTweaksContent,
      specContentRef,
      hasSpecContent,
      setSpecContent,
      stateCanvasConfigRef,
      hasStateCanvas,
      setStateCanvasConfig,
      stateCanvasPagePath,
      setStateCanvasPagePath,
      previewStatesRef,
      registerPreviewStates,
      activePreviewStateId,
      setActivePreviewStateId,
      registerOpenCreateStateModal,
      openCreateStateModal,
      referenceDocs,
      referenceDocsConfigFilePath,
      registerReferenceDocs,
      variantSets,
      variantSetPopoverTargets,
      variantSidebarRevision,
      legacyVariantsAvailable,
      legacyVariantsPopoverTarget,
      activeVariantSetId,
      highlightTargetId,
      tweaksOpen,
      variantsOpen,
      settingsOpen,
      shareModeActive,
      openSidebar,
      closeSidebar,
      toggleSidebar,
      setActiveTab,
      registerVariantSet,
      registerVariantSetPopover,
      registerVariantSidebarContent,
      updateVariantSidebarContent,
      getVariantSidebarContent,
      registerLegacyVariantSidebarContent,
      updateLegacyVariantSidebarContent,
      getLegacyVariantSidebarContent,
      unregisterVariantSet,
      setLegacyVariantsAvailable,
      registerLegacyVariantsPopover,
      focusTweak,
      clearHighlight,
      openTweaks,
      closeTweaks,
      toggleTweaks,
      openVariantSet,
      closeVariants,
      toggleVariantSet,
      openVariants,
      toggleVariants,
      openSettings,
      closeSettings,
      toggleSettings,
      enterShareMode,
      exitShareMode,
      focusShareTarget,
      viewportLayout,
      setViewportLayout,
      toggleViewportLayout,
    };
  }, [
      slug,
      open,
      sidebarPanel,
      activeTab,
      captureChannel,
      setCaptureChannel,
      prodReferenceAvailable,
      showProdReference,
      setShowProdReferenceState,
      toggleProdReference,
      registerProdReference,
      tweaksContentRef,
      hasTweaksContent,
      setTweaksContent,
      specContentRef,
      hasSpecContent,
      setSpecContent,
      stateCanvasConfigRef,
      hasStateCanvas,
      setStateCanvasConfig,
      stateCanvasPagePath,
      setStateCanvasPagePath,
      previewStatesRef,
      registerPreviewStates,
      activePreviewStateId,
      setActivePreviewStateId,
      registerOpenCreateStateModal,
      openCreateStateModal,
      referenceDocs,
      referenceDocsConfigFilePath,
      registerReferenceDocs,
      variantSets,
      variantSetPopoverTargets,
      variantSidebarRevision,
      legacyVariantsAvailable,
      legacyVariantsPopoverTarget,
      activeVariantSetId,
      highlightTargetId,
      tweaksOpen,
      variantsOpen,
      settingsOpen,
      shareModeActive,
      openSidebar,
      closeSidebar,
      toggleSidebar,
      setActiveTab,
      focusTweak,
      clearHighlight,
      registerVariantSet,
      registerVariantSetPopover,
      registerVariantSidebarContent,
      updateVariantSidebarContent,
      getVariantSidebarContent,
      registerLegacyVariantSidebarContent,
      updateLegacyVariantSidebarContent,
      getLegacyVariantSidebarContent,
      unregisterVariantSet,
      setLegacyVariantsAvailable,
      registerLegacyVariantsPopover,
      openTweaks,
      closeTweaks,
      toggleTweaks,
      openVariantSet,
      closeVariants,
      toggleVariantSet,
      openVariants,
      toggleVariants,
      openSettings,
      closeSettings,
      toggleSettings,
      enterShareMode,
      exitShareMode,
      focusShareTarget,
      viewportLayout,
      setViewportLayout,
      toggleViewportLayout,
    ],
  );

  return (
    <PrototypeReviewContext.Provider value={value}>
      {children}
    </PrototypeReviewContext.Provider>
  );
}

export function usePrototypeReview(): PrototypeReviewContextValue {
  const context = useContext(PrototypeReviewContext);
  if (!context) {
    throw new Error(
      "usePrototypeReview must be used within PrototypeReviewProvider",
    );
  }
  return context;
}

export function usePrototypeReviewOptional(): PrototypeReviewContextValue | null {
  return useContext(PrototypeReviewContext);
}
