"use client";

import { filterAnnotationsByChannel } from "@prototype/lib/prototype-comments/core/annotation-channel";
import { countUnresolvedAnnotations } from "@prototype/lib/prototype-comments/core/annotation-status";
import { injectCaptureColorTokens } from "@prototype/lib/prototype-comments/core/capture-theme";
import { useCommentStore } from "@prototype/lib/prototype-comments/react/CommentProvider";
import toolbarStyles from "@prototype/lib/prototype-comments/ui/capture-styles.module.scss";
import { usePrototypeReview } from "@prototype/lib/prototypes/prototype-review-context";
import type { PrototypeViewportLayout } from "@prototype/lib/prototypes/prototype-review-context";
import { usePrototypeToolTheme } from "@prototype/lib/prototypes/use-prototype-tool-theme";
import { getPrototypeChromeRoot } from "@prototype/lib/tool-portal";
import {
  getDefaultPrototypeStateMapPath,
} from "@prototype/lib/prototypes/prototype-state-canvas-types";
import {
  getPrototypeShareCommand,
  getPrototypeSlugFromPathname,
} from "@prototype/lib/prototypes/share-command";
import {
  TOOLBAR_HOVER_ONLY_BUTTON_PROPS,
  useToolbarHoverPanel,
} from "@prototype/lib/prototypes/use-toolbar-hover-panel";
import { cn } from "@prototype/lib/utils";
import { ProtoLogoMark } from "@prototype/components/brand/proto-logo-mark";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@prototype/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@prototype/components/ui/tooltip";
import {
  MessageSquare,
  MessageSquarePlus,
  Monitor,
  Plus,
  Rocket,
  ScrollText,
  Share2,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import {
  cloneElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";

import { VariantSetLucideIcon } from "@prototype/lib/prototypes/variant-set-lucide-icon";
import { miniPillTextFromLabel } from "./mini-pill-label";
import { PrototypeCreateExplorationModal } from "./prototype-create-exploration-modal";
import { PrototypeCreateStateModal } from "./prototype-create-state-modal";
import { PrototypeMiniStateMap, type PrototypeMiniStateMapHandle } from "./prototype-mini-state-map";
import { PrototypeStateMapModal } from "./prototype-state-map-modal";
import { PrototypeShareCommandButton } from "./prototype-controls";
import { PrototypeTweakHighlight } from "./prototype-tweak-highlight";
import { PrototypeReviewSidebar } from "./prototype-review-sidebar";
import pillStyles from "./prototype-floating-pill.module.scss";
import styles from "./prototype-review-chrome.module.scss";

type PrototypeReviewChromeProps = {
  onSelect: (id: string) => void;
  selectedId?: string | null;
  onOpenCommentsPanel?: () => void;
  isCommentModeActive?: boolean;
  onToggleCommentMode?: () => void;
  onClose: () => void;
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable
  );
}

const TOOLBAR_MENU_CONTENT_CLASS = cn(
  pillStyles.dropdownContent,
  "z-[1051] border-0 bg-transparent p-0 text-foreground shadow-none ring-0",
  "data-[state=open]:animate-none data-[state=closed]:animate-none",
);

const FOOTER_MENU_CONTENT_CLASS = cn(
  TOOLBAR_MENU_CONTENT_CLASS,
  pillStyles.dropdownContentFooterMenu,
);

const FOOTER_MENU_PANEL_CLASS = pillStyles.controlsPanelFooterMenu;

const TOOLBAR_MENU_CONTENT_PROPS = {
  side: "top" as const,
  align: "center" as const,
  sideOffset: 8,
  className: TOOLBAR_MENU_CONTENT_CLASS,
  onCloseAutoFocus: (event: Event) => event.preventDefault(),
};

const TOOLBAR_TOOLTIP_PROPS = {
  side: "top" as const,
  sideOffset: 8,
  className: styles.toolbarTooltipContent,
} as const;

/** Match TooltipProvider delayDuration in prototype-provider.tsx */
const TOOLBAR_TOOLTIP_HOVER_DELAY_MS = 300;

const TOOLBAR_TOOLTIP_DISMISS_EVENT = "prototype-review-toolbar-dismiss-tooltips";

function dismissReviewToolbarTooltips() {
  document.dispatchEvent(new Event(TOOLBAR_TOOLTIP_DISMISS_EVENT));
}

function chainPointerHandlers(
  existing: ((event: ReactPointerEvent<HTMLElement>) => void) | undefined,
  next: (event: ReactPointerEvent<HTMLElement>) => void,
) {
  return (event: ReactPointerEvent<HTMLElement>) => {
    existing?.(event);
    if (!event.defaultPrevented) {
      next(event);
    }
  };
}

type ToolbarTooltipAnchorProps = {
  onPointerEnter?: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerLeave?: (event: ReactPointerEvent<HTMLElement>) => void;
};

function ReviewToolbarTooltip({
  label,
  disabled = false,
  children,
}: {
  label: string;
  disabled?: boolean;
  children: ReactElement<ToolbarTooltipAnchorProps>;
}) {
  const [open, setOpen] = useState(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoveringRef = useRef(false);

  const clearShowTimer = useCallback(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  }, []);

  const close = useCallback(() => {
    isHoveringRef.current = false;
    clearShowTimer();
    setOpen(false);
  }, [clearShowTimer]);

  const openFromHover = useCallback(() => {
    if (disabled || !isHoveringRef.current) return;
    setOpen(true);
  }, [disabled]);

  const handlePointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (disabled || event.pointerType === "touch") return;

      isHoveringRef.current = true;
      clearShowTimer();
      showTimerRef.current = setTimeout(
        openFromHover,
        TOOLBAR_TOOLTIP_HOVER_DELAY_MS,
      );
    },
    [clearShowTimer, disabled, openFromHover],
  );

  const handlePointerLeave = useCallback(() => {
    close();
  }, [close]);

  useEffect(() => {
    if (disabled) close();
  }, [close, disabled]);

  useEffect(() => {
    return () => clearShowTimer();
  }, [clearShowTimer]);

  useEffect(() => {
    document.addEventListener(TOOLBAR_TOOLTIP_DISMISS_EVENT, close);
    return () =>
      document.removeEventListener(TOOLBAR_TOOLTIP_DISMISS_EVENT, close);
  }, [close]);

  const trigger = cloneElement<ToolbarTooltipAnchorProps>(children, {
    onPointerEnter: chainPointerHandlers(
      children.props.onPointerEnter,
      handlePointerEnter,
    ),
    onPointerLeave: chainPointerHandlers(
      children.props.onPointerLeave,
      handlePointerLeave,
    ),
  });

  return (
    <Tooltip
      open={open}
      delayDuration={0}
      disableHoverableContent
      onOpenChange={(next) => {
        if (!next) setOpen(false);
      }}
    >
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent {...TOOLBAR_TOOLTIP_PROPS}>{label}</TooltipContent>
    </Tooltip>
  );
}

function ReviewToolbarTextTabTrigger({
  label,
  active,
  open,
  hoverTriggerProps,
  badgeCount,
}: {
  label: string;
  active: boolean;
  open: boolean;
  hoverTriggerProps?: ToolbarTooltipAnchorProps;
  badgeCount?: number;
}) {
  const showBadge = badgeCount != null && badgeCount > 0;
  const badgeLabel =
    showBadge && badgeCount != null
      ? badgeCount > 99
        ? "99+"
        : String(badgeCount)
      : null;

  return (
    <div
      {...hoverTriggerProps}
      className={styles.footerTabHoverArea}
    >
      {badgeLabel ? (
        <span className={styles.footerTabBadge} aria-hidden>
          {badgeLabel}
        </span>
      ) : null}
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            styles.footerTab,
            active && styles.footerTabActive,
            styles.toolbarMenuTrigger,
          )}
          data-menu-open={open ? "true" : undefined}
          aria-label={
            showBadge ? `${label}, ${badgeCount} unresolved` : label
          }
          aria-expanded={open}
          {...TOOLBAR_HOVER_ONLY_BUTTON_PROPS}
        >
          {label}
        </button>
      </DropdownMenuTrigger>
    </div>
  );
}

function CreateExplorationPanelTrigger({
  onOpen,
}: {
  onOpen: () => void;
}) {
  return (
    <CreatePanelTrigger onOpen={onOpen} label="New exploration…" />
  );
}

function CreatePanelTrigger({
  onOpen,
  label,
}: {
  onOpen: () => void;
  label: string;
}) {
  return (
    <div
      className={pillStyles.explorationBriefPanel}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className={pillStyles.explorationBriefTrigger}
        onClick={onOpen}
        aria-label={label}
      >
        <span className={pillStyles.explorationBriefTriggerLabel}>
          {label}
        </span>
        <Plus
          size={14}
          strokeWidth={2}
          className={pillStyles.dropdownItemIcon}
          aria-hidden
        />
      </button>
    </div>
  );
}

type ReviewToolbarIconPickerOption<T extends string> = {
  value: T;
  label: string;
  icon: ReactNode;
};

function ReviewToolbarIconPickerMenu<T extends string>({
  label,
  tooltip,
  value,
  onValueChange,
  options,
  open,
  onOpenChange,
  hoverPanel,
  triggerIcon,
  panelId,
}: {
  label: string;
  tooltip?: string;
  value: T;
  onValueChange: (value: T) => void;
  options: ReviewToolbarIconPickerOption<T>[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hoverPanel: ReturnType<typeof useToolbarHoverPanel>;
  triggerIcon: ReactNode;
  panelId: string;
}) {
  const { commentTheme } = usePrototypeToolTheme();

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={onOpenChange}>
      <ReviewToolbarTooltip label={tooltip ?? label} disabled={open}>
        <div
          className={cn(
            styles.footerBarControls,
            toolbarStyles.buttonWrapper,
          )}
          {...hoverPanel.triggerProps}
        >
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                toolbarStyles.controlButton,
                styles.toolbarMenuTrigger,
                open && styles.toolbarButtonHovered,
              )}
              data-menu-open={open ? "true" : undefined}
              aria-label={label}
              aria-expanded={open}
              aria-pressed={open}
              {...TOOLBAR_HOVER_ONLY_BUTTON_PROPS}
            >
              {triggerIcon}
            </button>
          </DropdownMenuTrigger>
        </div>
      </ReviewToolbarTooltip>

      <DropdownMenuContent
        {...TOOLBAR_MENU_CONTENT_PROPS}
        {...hoverPanel.panelProps}
        className={cn(
          TOOLBAR_MENU_CONTENT_CLASS,
          pillStyles.dropdownContentIconPicker,
        )}
        data-prototype-comment-theme={commentTheme}
        data-prototype-review-panel={panelId}
      >
        <div
          className={pillStyles.toolbarIconPicker}
          role="group"
          aria-label={label}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={pillStyles.toolbarIconPickerOption}
              data-selected={value === option.value ? "true" : undefined}
              aria-label={option.label}
              aria-pressed={value === option.value}
              onClick={() => {
                onValueChange(option.value);
                onOpenChange(false);
              }}
            >
              {option.icon}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const VIEWPORT_LAYOUT_OPTIONS: ReviewToolbarIconPickerOption<PrototypeViewportLayout>[] =
  [
    {
      value: "desktop",
      label: "Desktop layout",
      icon: <Monitor size={16} strokeWidth={2} />,
    },
    {
      value: "mobile",
      label: "Mobile layout",
      icon: <Smartphone size={16} strokeWidth={2} />,
    },
  ];

export function PrototypeReviewChrome({
  onSelect,
  selectedId,
  onOpenCommentsPanel,
  isCommentModeActive,
  onToggleCommentMode,
  onClose,
}: PrototypeReviewChromeProps) {
  const review = usePrototypeReview();
  const { commentTheme } = usePrototypeToolTheme();
  const chromeRef = useRef<HTMLDivElement>(null);
  const stateMapTabRef = useRef<HTMLButtonElement>(null);
  const stateMapHoverSuppressedRef = useRef(false);
  const miniStateMapRef = useRef<PrototypeMiniStateMapHandle>(null);
  const [explorationsMenuOpen, setExplorationsMenuOpen] = useState(false);
  const [commentsMenuOpen, setCommentsMenuOpen] = useState(false);
  const [handoffMenuOpen, setHandoffMenuOpen] = useState(false);
  const [createExplorationModalOpen, setCreateExplorationModalOpen] =
    useState(false);
  const [createStateModalOpen, setCreateStateModalOpen] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [viewportMenuOpen, setViewportMenuOpen] = useState(false);
  const [miniStateMapMinimized, setMiniStateMapMinimized] = useState(true);
  const [miniStateMapRestoring, setMiniStateMapRestoring] = useState(false);
  const [stateMapModalOpen, setStateMapModalOpen] = useState(false);
  const pathname = usePathname();
  const { annotations } = useCommentStore();
  const [mounted, setMounted] = useState(false);

  const slug = getPrototypeSlugFromPathname(pathname);
  const shareCommand = slug ? getPrototypeShareCommand(slug) : null;

  useEffect(() => {
    injectCaptureColorTokens();
    setMounted(true);
  }, []);

  const handleMiniMapMinimize = useCallback(() => {
    stateMapHoverSuppressedRef.current = true;
    setMiniStateMapMinimized(true);
    setMiniStateMapRestoring(false);
  }, []);

  const handleMiniMapRestoreComplete = useCallback(() => {
    setMiniStateMapRestoring(false);
    setMiniStateMapMinimized(false);
  }, []);

  const openStateMapHover = useCallback(() => {
    if (stateMapHoverSuppressedRef.current || stateMapModalOpen) {
      return;
    }
    setMiniStateMapMinimized(false);
    setMiniStateMapRestoring(false);
  }, [stateMapModalOpen]);

  const closeStateMapHover = useCallback(() => {
    stateMapHoverSuppressedRef.current = false;
    setMiniStateMapMinimized(true);
    setMiniStateMapRestoring(false);
  }, []);

  const handleStateMapTabClick = useCallback(() => {
    setStateMapModalOpen(true);
  }, []);

  const closeToolbarMenus = useCallback(() => {
    setExplorationsMenuOpen(false);
    setCommentsMenuOpen(false);
    setHandoffMenuOpen(false);
    setShareMenuOpen(false);
    setViewportMenuOpen(false);
    dismissReviewToolbarTooltips();
  }, []);

  const blurToolbarFocus = useCallback(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement && chromeRef.current?.contains(active)) {
      active.blur();
    }
  }, []);

  const openExplorationsMenu = useCallback(() => {
    dismissReviewToolbarTooltips();
    review.closeSettings();
    setCommentsMenuOpen(false);
    setHandoffMenuOpen(false);
    setShareMenuOpen(false);
    setViewportMenuOpen(false);
    setExplorationsMenuOpen(true);
  }, [review.closeSettings]);

  const closeExplorationsMenu = useCallback(() => {
    setExplorationsMenuOpen(false);
    blurToolbarFocus();
  }, [blurToolbarFocus]);

  const openCommentsMenu = useCallback(() => {
    dismissReviewToolbarTooltips();
    review.closeSettings();
    setExplorationsMenuOpen(false);
    setHandoffMenuOpen(false);
    setShareMenuOpen(false);
    setViewportMenuOpen(false);
    setCommentsMenuOpen(true);
  }, [review.closeSettings]);

  const closeCommentsMenu = useCallback(() => {
    setCommentsMenuOpen(false);
    blurToolbarFocus();
  }, [blurToolbarFocus]);

  const openHandoffMenu = useCallback(() => {
    dismissReviewToolbarTooltips();
    review.closeSettings();
    setExplorationsMenuOpen(false);
    setCommentsMenuOpen(false);
    setShareMenuOpen(false);
    setViewportMenuOpen(false);
    setHandoffMenuOpen(true);
  }, [review.closeSettings]);

  const closeHandoffMenu = useCallback(() => {
    setHandoffMenuOpen(false);
    blurToolbarFocus();
  }, [blurToolbarFocus]);

  const openCreateExplorationModal = useCallback(() => {
    setExplorationsMenuOpen(false);
    blurToolbarFocus();
    setCreateExplorationModalOpen(true);
  }, [blurToolbarFocus]);

  const openCreateStateModal = useCallback(() => {
    blurToolbarFocus();
    setCreateStateModalOpen(true);
  }, [blurToolbarFocus]);

  const registerOpenCreateStateModal = review.registerOpenCreateStateModal;
  useEffect(() => {
    registerOpenCreateStateModal(openCreateStateModal);
    return () => registerOpenCreateStateModal(null);
  }, [openCreateStateModal, registerOpenCreateStateModal]);

  const openShareMenu = useCallback(() => {
    dismissReviewToolbarTooltips();
    closeToolbarMenus();
    review.closeSettings();
    setShareMenuOpen(true);
  }, [closeToolbarMenus, review.closeSettings]);

  const closeShareMenu = useCallback(() => {
    setShareMenuOpen(false);
    blurToolbarFocus();
  }, [blurToolbarFocus]);

  const openViewportMenu = useCallback(() => {
    dismissReviewToolbarTooltips();
    review.closeSettings();
    setExplorationsMenuOpen(false);
    setCommentsMenuOpen(false);
    setHandoffMenuOpen(false);
    setShareMenuOpen(false);
    setViewportMenuOpen(true);
  }, [review.closeSettings]);

  const closeViewportMenu = useCallback(() => {
    setViewportMenuOpen(false);
    blurToolbarFocus();
  }, [blurToolbarFocus]);

  const explorationsHover = useToolbarHoverPanel({
    onOpen: openExplorationsMenu,
    onClose: closeExplorationsMenu,
  });

  const commentsHover = useToolbarHoverPanel({
    onOpen: openCommentsMenu,
    onClose: closeCommentsMenu,
  });

  const handoffHover = useToolbarHoverPanel({
    onOpen: openHandoffMenu,
    onClose: closeHandoffMenu,
  });

  const shareHover = useToolbarHoverPanel({
    onOpen: openShareMenu,
    onClose: closeShareMenu,
  });

  const viewportHover = useToolbarHoverPanel({
    onOpen: openViewportMenu,
    onClose: closeViewportMenu,
  });

  const stateMapHover = useToolbarHoverPanel({
    onOpen: openStateMapHover,
    onClose: closeStateMapHover,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isTypingTarget(event.target)) return;
      if (document.querySelector("[data-mobbin-lightbox-open]")) return;
      if (document.querySelector('[role="dialog"][data-state="open"]')) return;

      dismissReviewToolbarTooltips();

      if (
        explorationsMenuOpen ||
        commentsMenuOpen ||
        handoffMenuOpen ||
        shareMenuOpen ||
        viewportMenuOpen
      ) {
        closeToolbarMenus();
        event.preventDefault();
        event.stopPropagation();
        blurToolbarFocus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [
    blurToolbarFocus,
    closeToolbarMenus,
    commentsMenuOpen,
    explorationsMenuOpen,
    handoffMenuOpen,
    shareMenuOpen,
    viewportMenuOpen,
  ]);

  if (!mounted) return null;

  const chromePortalTarget = getPrototypeChromeRoot() ?? null;

  const sidebarPortalTarget = document.getElementById(
    "prototype-comments-sidebar-root",
  );

  const commentAnnotations = filterAnnotationsByChannel(annotations, "comment");
  const commentCount = countUnresolvedAnnotations(commentAnnotations);

  const showShareMenu = Boolean(shareCommand);
  const stateMapPagePath =
    review.stateCanvasPagePath ?? getDefaultPrototypeStateMapPath(review.slug);
  const onStateMapPage =
    stateMapPagePath != null
      ? pathname.startsWith(stateMapPagePath)
      : /\/prototypes\/[^/]+\/states\/?$/.test(pathname);
  const showStateMapTab = review.hasStateCanvas && !onStateMapPage;
  const stateMapTabActive =
    showStateMapTab && (!miniStateMapMinimized || stateMapModalOpen);

  const commentsTabActive =
    commentsMenuOpen ||
    isCommentModeActive ||
    (review.open && review.sidebarPanel === "comments");
  const explorationsTabActive =
    explorationsMenuOpen ||
    (review.open && review.sidebarPanel === "variants");
  const handoffTabActive =
    handoffMenuOpen ||
    (review.open &&
      (review.sidebarPanel === "change-log" || review.sidebarPanel === "spec"));

  const chrome = (
    <div
      ref={chromeRef}
      data-prototype-root
      data-prototype-comment-theme={commentTheme}
      data-prototype-comment-accent="blue"
      data-prototype-comment-root=""
      className={styles.footerRoot}
      data-prototype-review-trigger
    >
      <div className={styles.footerBar}>
        <Link href="/" className={styles.footerBrand} aria-label="Back to gallery">
          <ProtoLogoMark className={styles.footerBrandLogo} />
          <span className={styles.footerBrandName}>Proto</span>
        </Link>

        <div className={styles.footerLeft}>
          {showStateMapTab ? (
            <button
              ref={stateMapTabRef}
              type="button"
              className={cn(
                styles.footerTab,
                stateMapTabActive && styles.footerTabActive,
                styles.toolbarMenuTrigger,
              )}
              aria-label="State Map"
              aria-pressed={stateMapTabActive}
              onClick={handleStateMapTabClick}
              {...stateMapHover.triggerProps}
            >
              State Map
            </button>
          ) : null}
        </div>

        <div className={styles.footerRight}>
        <div className={styles.footerTabs}>
          <DropdownMenu
            modal={false}
            open={explorationsMenuOpen}
            onOpenChange={(open) => {
              if (open) {
                openExplorationsMenu();
                return;
              }
              closeExplorationsMenu();
            }}
          >
            <ReviewToolbarTextTabTrigger
              label="Design Explorations"
              active={explorationsTabActive}
              open={explorationsMenuOpen}
              hoverTriggerProps={explorationsHover.triggerProps}
            />
            <DropdownMenuContent
              {...TOOLBAR_MENU_CONTENT_PROPS}
              {...explorationsHover.panelProps}
              className={FOOTER_MENU_CONTENT_CLASS}
              data-prototype-comment-theme={commentTheme}
              data-prototype-review-panel="explorations"
            >
              <div className={FOOTER_MENU_PANEL_CLASS}>
                <CreateExplorationPanelTrigger onOpen={openCreateExplorationModal} />
                {review.variantSets.length > 0 ? (
                  <div
                    className={pillStyles.explorationBriefSeparator}
                    role="separator"
                    aria-hidden
                  />
                ) : null}
                {review.variantSets.map((variantSet) => {
                  const selected =
                    review.variantsOpen &&
                    review.activeVariantSetId === variantSet.id;

                  return (
                    <DropdownMenuItem
                      key={variantSet.id}
                      className={cn(
                        pillStyles.dropdownMenuItem,
                        pillStyles.dropdownItemExploration,
                        selected && pillStyles.dropdownMenuItemSelected,
                      )}
                      onSelect={() => {
                        setExplorationsMenuOpen(false);
                        blurToolbarFocus();
                        review.openVariantSet(variantSet.id);
                      }}
                    >
                      <span>{miniPillTextFromLabel(variantSet.label)}</span>
                      <VariantSetLucideIcon
                        variantSetId={variantSet.id}
                        variantSetLabel={variantSet.label}
                        size={12}
                        strokeWidth={2}
                        className={pillStyles.dropdownItemIcon}
                        aria-hidden
                      />
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu
            modal={false}
            open={commentsMenuOpen}
            onOpenChange={(open) => {
              if (open) {
                openCommentsMenu();
                return;
              }
              closeCommentsMenu();
            }}
          >
            <ReviewToolbarTextTabTrigger
              label="Comments"
              active={commentsTabActive}
              open={commentsMenuOpen}
              hoverTriggerProps={commentsHover.triggerProps}
              badgeCount={commentCount}
            />
            <DropdownMenuContent
              {...TOOLBAR_MENU_CONTENT_PROPS}
              {...commentsHover.panelProps}
              className={FOOTER_MENU_CONTENT_CLASS}
              data-prototype-comment-theme={commentTheme}
              data-prototype-review-panel="comments"
            >
              <div className={FOOTER_MENU_PANEL_CLASS}>
                {onToggleCommentMode ? (
                  <DropdownMenuItem
                    className={pillStyles.dropdownMenuItem}
                    onSelect={() => {
                      setCommentsMenuOpen(false);
                      blurToolbarFocus();
                      onToggleCommentMode();
                    }}
                  >
                    <span>Add comment</span>
                    <MessageSquarePlus
                      size={14}
                      strokeWidth={2}
                      className={pillStyles.dropdownItemIcon}
                      aria-hidden
                    />
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  className={pillStyles.dropdownMenuItem}
                  onSelect={() => {
                    setCommentsMenuOpen(false);
                    blurToolbarFocus();
                    closeShareMenu();
                    if (review.open && review.sidebarPanel === "comments") {
                      onClose();
                    } else {
                      onOpenCommentsPanel?.();
                    }
                  }}
                >
                  <span>View comments</span>
                  <span className={pillStyles.dropdownItemTrailingGroup}>
                    {commentCount > 0 ? (
                      <span className={pillStyles.dropdownItemCount}>
                        {commentCount > 99 ? "99+" : commentCount}
                      </span>
                    ) : null}
                    <MessageSquare
                      size={14}
                      strokeWidth={2}
                      className={pillStyles.dropdownItemIcon}
                      aria-hidden
                    />
                  </span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu
            modal={false}
            open={handoffMenuOpen}
            onOpenChange={(open) => {
              if (open) {
                openHandoffMenu();
                return;
              }
              closeHandoffMenu();
            }}
          >
            <ReviewToolbarTextTabTrigger
              label="Handoff"
              active={handoffTabActive}
              open={handoffMenuOpen}
              hoverTriggerProps={handoffHover.triggerProps}
            />
            <DropdownMenuContent
              {...TOOLBAR_MENU_CONTENT_PROPS}
              {...handoffHover.panelProps}
              className={FOOTER_MENU_CONTENT_CLASS}
              data-prototype-comment-theme={commentTheme}
              data-prototype-review-panel="handoff"
            >
              <div className={FOOTER_MENU_PANEL_CLASS}>
                <DropdownMenuItem
                  className={pillStyles.dropdownMenuItem}
                  onSelect={() => {
                    setHandoffMenuOpen(false);
                    blurToolbarFocus();
                    if (review.open && review.sidebarPanel === "change-log") {
                      review.closeSidebar();
                    } else {
                      review.closeSettings();
                      closeToolbarMenus();
                      closeShareMenu();
                      review.openSidebar("change-log");
                    }
                  }}
                >
                  <span>Overview Writeup</span>
                  <ScrollText
                    size={14}
                    strokeWidth={2}
                    className={pillStyles.dropdownItemIcon}
                    aria-hidden
                  />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={pillStyles.dropdownMenuItem}
                  onSelect={() => {
                    setHandoffMenuOpen(false);
                    blurToolbarFocus();
                    if (review.open && review.sidebarPanel === "spec") {
                      review.closeSidebar();
                    } else {
                      review.closeSettings();
                      closeToolbarMenus();
                      closeShareMenu();
                      review.openSidebar("spec");
                    }
                  }}
                >
                  <span>PR Plan</span>
                  <Rocket
                    size={14}
                    strokeWidth={2}
                    className={pillStyles.dropdownItemIcon}
                    aria-hidden
                  />
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className={styles.footerUtilities}>
          {showShareMenu ? (
            <DropdownMenu
              modal={false}
              open={shareMenuOpen}
              onOpenChange={(open) => {
                if (open) {
                  openShareMenu();
                  return;
                }
                closeShareMenu();
              }}
            >
              <ReviewToolbarTooltip label="Share" disabled={shareMenuOpen}>
                <div
                  className={cn(
                    styles.footerBarControls,
                    toolbarStyles.buttonWrapper,
                  )}
                  {...shareHover.triggerProps}
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        toolbarStyles.controlButton,
                        styles.toolbarMenuTrigger,
                        shareMenuOpen && styles.toolbarButtonHovered,
                      )}
                      data-menu-open={shareMenuOpen ? "true" : undefined}
                      aria-label="Share"
                      aria-expanded={shareMenuOpen}
                      aria-pressed={shareMenuOpen}
                      {...TOOLBAR_HOVER_ONLY_BUTTON_PROPS}
                    >
                      <Share2 size={16} strokeWidth={2} />
                    </button>
                  </DropdownMenuTrigger>
                </div>
              </ReviewToolbarTooltip>

              <DropdownMenuContent
                {...TOOLBAR_MENU_CONTENT_PROPS}
                {...shareHover.panelProps}
                className={FOOTER_MENU_CONTENT_CLASS}
                data-prototype-comment-theme={commentTheme}
                data-prototype-review-panel="share"
              >
                <div className={FOOTER_MENU_PANEL_CLASS}>
                  <PrototypeShareCommandButton command={shareCommand!} />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <ReviewToolbarIconPickerMenu
            label="Layout"
            tooltip="Layout"
            value={review.viewportLayout}
            onValueChange={review.setViewportLayout}
            options={VIEWPORT_LAYOUT_OPTIONS}
            open={viewportMenuOpen}
            onOpenChange={(open) => {
              if (open) {
                openViewportMenu();
                return;
              }
              closeViewportMenu();
            }}
            hoverPanel={viewportHover}
            panelId="viewport"
            triggerIcon={
              review.viewportLayout === "mobile" ? (
                <Smartphone size={16} strokeWidth={2} />
              ) : (
                <Monitor size={16} strokeWidth={2} />
              )
            }
          />
        </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {sidebarPortalTarget
        ? createPortal(
            <PrototypeReviewSidebar
              onSelect={onSelect}
              selectedId={selectedId}
              onClose={onClose}
            />,
            sidebarPortalTarget,
          )
        : null}

      {chromePortalTarget ? createPortal(chrome, chromePortalTarget) : null}

      {review.hasStateCanvas && !onStateMapPage && !stateMapModalOpen ? (
        <PrototypeMiniStateMap
          ref={miniStateMapRef}
          minimized={miniStateMapMinimized}
          restoring={miniStateMapRestoring}
          onExpand={() => setStateMapModalOpen(true)}
          onMinimize={handleMiniMapMinimize}
          onRestoreComplete={handleMiniMapRestoreComplete}
          minimizeTargetRef={stateMapTabRef}
          hoverPanelProps={stateMapHover.panelProps}
        />
      ) : null}

      <PrototypeStateMapModal
        open={stateMapModalOpen}
        onOpenChange={setStateMapModalOpen}
      />

      {review.highlightTargetId ? (
        <PrototypeTweakHighlight
          targetId={review.highlightTargetId}
          onComplete={review.clearHighlight}
        />
      ) : null}

      <PrototypeCreateExplorationModal
        open={createExplorationModalOpen}
        onOpenChange={setCreateExplorationModalOpen}
        slug={review.slug}
        existingExplorations={review.variantSets.map((variantSet) => ({
          id: variantSet.id,
          label: variantSet.label,
        }))}
      />

      <PrototypeCreateStateModal
        open={createStateModalOpen}
        onOpenChange={setCreateStateModalOpen}
        slug={review.slug}
        existingStates={review.previewStatesRef.current}
      />
    </>
  );
}
