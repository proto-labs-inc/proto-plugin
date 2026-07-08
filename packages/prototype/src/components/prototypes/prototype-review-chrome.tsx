"use client";

import { filterAnnotationsByChannel } from "@prototype/lib/prototype-comments/core/annotation-channel";
import { countUnresolvedAnnotations } from "@prototype/lib/prototype-comments/core/annotation-status";
import { injectCaptureColorTokens } from "@prototype/lib/prototype-comments/core/capture-theme";
import { useCommentStore } from "@prototype/lib/prototype-comments/react/CommentProvider";
import toolbarStyles from "@prototype/lib/prototype-comments/ui/capture-styles.module.scss";
import {
  getPrototypeTweaksRegistration,
  subscribePrototypeTweaks,
} from "@prototype/lib/prototypes/prototype-tweak-registry";
import { groupPrototypeTweaksByCategory } from "@prototype/lib/prototypes/prototype-tweak-types";
import { usePrototypeReview } from "@prototype/lib/prototypes/prototype-review-context";
import type { PrototypeViewportLayout } from "@prototype/lib/prototypes/prototype-review-context";
import {
  usePrototypeToolTheme,
  type PrototypeToolTheme,
} from "@prototype/lib/prototypes/use-prototype-tool-theme";
import { getPrototypeChromeRoot } from "@prototype/lib/tool-portal";
import {
  buildStateMapHref,
  getDefaultPrototypeStateMapPath,
} from "@prototype/lib/prototypes/prototype-state-canvas-types";
import {
  getPrototypeShareCommand,
  getPrototypeSlugFromPathname,
} from "@prototype/lib/prototypes/share-command";
import {
  preventToolbarHoverButtonActivation,
  TOOLBAR_HOVER_ONLY_BUTTON_PROPS,
  useToolbarHoverPanel,
} from "@prototype/lib/prototypes/use-toolbar-hover-panel";
import { cn } from "@prototype/lib/utils";
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
  ArrowLeft,
  Layers,
  LayoutGrid,
  MapPin,
  MessageSquare,
  MessageSquarePlus,
  Monitor,
  Moon,
  Network,
  Plus,
  Rocket,
  ScrollText,
  Share2,
  SlidersHorizontal,
  Smartphone,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import {
  cloneElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";

import { VariantSetLucideIcon } from "@prototype/lib/prototypes/variant-set-lucide-icon";
import { miniPillTextFromLabel } from "./mini-pill-label";
import { PrototypeCreateExplorationModal } from "./prototype-create-exploration-modal";
import { PrototypeCreateStateModal } from "./prototype-create-state-modal";
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

function clearPillTextSelection() {
  window.getSelection()?.removeAllRanges();
}

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

function ReviewToolbarButton({
  label,
  tooltip,
  pressed = false,
  highlightActive = false,
  badge,
  onClick,
  hoverOnly = false,
  hoverTriggerProps,
  commentModeToggle = false,
  children,
}: {
  label: string;
  tooltip?: string;
  pressed?: boolean;
  highlightActive?: boolean;
  badge?: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  hoverOnly?: boolean;
  hoverTriggerProps?: ToolbarTooltipAnchorProps;
  commentModeToggle?: boolean;
  children: ReactNode;
}) {
  return (
    <ReviewToolbarTooltip label={tooltip ?? label} disabled={pressed}>
      <div className={toolbarStyles.buttonWrapper} {...hoverTriggerProps}>
        <button
          type="button"
          className={cn(
            toolbarStyles.controlButton,
            pressed && !highlightActive && styles.toolbarButtonHovered,
          )}
          data-active={highlightActive && pressed ? "true" : undefined}
          data-prototype-comment-mode-toggle={
            commentModeToggle ? true : undefined
          }
          aria-label={label}
          aria-pressed={pressed}
          onClick={(event) => {
            if (hoverOnly) {
              preventToolbarHoverButtonActivation(event);
              return;
            }
            event.stopPropagation();
            onClick?.(event);
          }}
          onPointerDown={
            hoverOnly ? preventToolbarHoverButtonActivation : undefined
          }
        >
          {children}
          {badge}
        </button>
      </div>
    </ReviewToolbarTooltip>
  );
}

function ReviewToolbarLink({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <ReviewToolbarTooltip label={label}>
      <div className={toolbarStyles.buttonWrapper}>
        <Link
          href={href}
          className={toolbarStyles.controlButton}
          style={{ textDecoration: "none" }}
          aria-label={label}
          onClick={(event) => event.stopPropagation()}
        >
          {children}
        </Link>
      </div>
    </ReviewToolbarTooltip>
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

function CreateStatePanelTrigger({
  onOpen,
}: {
  onOpen: () => void;
}) {
  return (
    <CreatePanelTrigger onOpen={onOpen} label="New state…" />
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
          size={12}
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

const THEME_OPTIONS: ReviewToolbarIconPickerOption<PrototypeToolTheme>[] = [
  {
    value: "light",
    label: "Light mode",
    icon: <Sun size={16} strokeWidth={2} />,
  },
  {
    value: "dark",
    label: "Dark mode",
    icon: <Moon size={16} strokeWidth={2} />,
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
  const { commentTheme, theme, setTheme } = usePrototypeToolTheme();
  const chromeRef = useRef<HTMLDivElement>(null);
  const [statesOpen, setStatesOpen] = useState(false);
  const [explorationsMenuOpen, setExplorationsMenuOpen] = useState(false);
  const [createExplorationModalOpen, setCreateExplorationModalOpen] =
    useState(false);
  const [createStateModalOpen, setCreateStateModalOpen] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [viewportMenuOpen, setViewportMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [tweakVersion, setTweakVersion] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { annotations } = useCommentStore();
  const [mounted, setMounted] = useState(false);

  const slug = getPrototypeSlugFromPathname(pathname);
  const shareCommand = slug ? getPrototypeShareCommand(slug) : null;

  useEffect(() => {
    injectCaptureColorTokens();
    setMounted(true);
    setTweakVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribePrototypeTweaks(() => {
      setTweakVersion((v) => v + 1);
    });
    setTweakVersion((v) => v + 1);
    return unsubscribe;
  }, []);

  const closeToolbarMenus = useCallback(() => {
    setStatesOpen(false);
    setExplorationsMenuOpen(false);
    setShareMenuOpen(false);
    setViewportMenuOpen(false);
    setThemeMenuOpen(false);
    review.closeTweaks();
    dismissReviewToolbarTooltips();
  }, [review.closeTweaks]);

  const blurToolbarFocus = useCallback(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement && chromeRef.current?.contains(active)) {
      active.blur();
    }
  }, []);

  const openStatesMenu = useCallback(() => {
    dismissReviewToolbarTooltips();
    review.closeSettings();
    setExplorationsMenuOpen(false);
    setShareMenuOpen(false);
    setViewportMenuOpen(false);
    setThemeMenuOpen(false);
    review.closeTweaks();
    setStatesOpen(true);
  }, [review.closeSettings, review.closeTweaks]);

  const closeStatesMenu = useCallback(() => {
    setStatesOpen(false);
    blurToolbarFocus();
  }, [blurToolbarFocus]);

  const openExplorationsMenu = useCallback(() => {
    dismissReviewToolbarTooltips();
    review.closeSettings();
    setStatesOpen(false);
    setShareMenuOpen(false);
    setViewportMenuOpen(false);
    setThemeMenuOpen(false);
    review.closeTweaks();
    setExplorationsMenuOpen(true);
  }, [review.closeSettings, review.closeTweaks]);

  const closeExplorationsMenu = useCallback(() => {
    setExplorationsMenuOpen(false);
    blurToolbarFocus();
  }, [blurToolbarFocus]);

  const openCreateExplorationModal = useCallback(() => {
    setExplorationsMenuOpen(false);
    blurToolbarFocus();
    setCreateExplorationModalOpen(true);
  }, [blurToolbarFocus]);

  const openCreateStateModal = useCallback(() => {
    setStatesOpen(false);
    blurToolbarFocus();
    setCreateStateModalOpen(true);
  }, [blurToolbarFocus]);

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
    setStatesOpen(false);
    setExplorationsMenuOpen(false);
    setShareMenuOpen(false);
    setThemeMenuOpen(false);
    review.closeTweaks();
    setViewportMenuOpen(true);
  }, [review.closeSettings, review.closeTweaks]);

  const closeViewportMenu = useCallback(() => {
    setViewportMenuOpen(false);
    blurToolbarFocus();
  }, [blurToolbarFocus]);

  const openThemeMenu = useCallback(() => {
    dismissReviewToolbarTooltips();
    review.closeSettings();
    setStatesOpen(false);
    setExplorationsMenuOpen(false);
    setShareMenuOpen(false);
    setViewportMenuOpen(false);
    review.closeTweaks();
    setThemeMenuOpen(true);
  }, [review.closeSettings, review.closeTweaks]);

  const closeThemeMenu = useCallback(() => {
    setThemeMenuOpen(false);
    blurToolbarFocus();
  }, [blurToolbarFocus]);

  const statesHover = useToolbarHoverPanel({
    onOpen: openStatesMenu,
    onClose: closeStatesMenu,
  });

  const explorationsHover = useToolbarHoverPanel({
    onOpen: openExplorationsMenu,
    onClose: closeExplorationsMenu,
  });

  const shareHover = useToolbarHoverPanel({
    onOpen: openShareMenu,
    onClose: closeShareMenu,
  });

  const viewportHover = useToolbarHoverPanel({
    onOpen: openViewportMenu,
    onClose: closeViewportMenu,
  });

  const themeHover = useToolbarHoverPanel({
    onOpen: openThemeMenu,
    onClose: closeThemeMenu,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isTypingTarget(event.target)) return;
      if (document.querySelector("[data-mobbin-lightbox-open]")) return;
      if (document.querySelector('[role="dialog"][data-state="open"]')) return;

      dismissReviewToolbarTooltips();

      let dismissed = false;

      if (statesOpen || explorationsMenuOpen || review.tweaksOpen || shareMenuOpen || viewportMenuOpen || themeMenuOpen) {
        closeToolbarMenus();
        dismissed = true;
      } else if (review.variantsOpen) {
        review.closeVariants();
        setExplorationsMenuOpen(false);
        dismissed = true;
      }

      if (dismissed) {
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
    explorationsMenuOpen,
    review.closeVariants,
    review.tweaksOpen,
    review.variantsOpen,
    shareMenuOpen,
    statesOpen,
    themeMenuOpen,
    viewportMenuOpen,
  ]);

  if (!mounted) return null;

  const chromePortalTarget = getPrototypeChromeRoot() ?? null;

  const sidebarPortalTarget = document.getElementById(
    "prototype-comments-sidebar-root",
  );

  const commentAnnotations = filterAnnotationsByChannel(annotations, "comment");
  const commentCount = countUnresolvedAnnotations(commentAnnotations);
  void tweakVersion;
  const tweaksRegistration = getPrototypeTweaksRegistration();
  const tweakItems = tweaksRegistration?.items ?? [];
  const tweakGroups = groupPrototypeTweaksByCategory(tweakItems);
  const hasTweakItems = tweakItems.length > 0;
  const showTweaksMenu = hasTweakItems;

  const tweaksContent = review.tweaksContentRef.current;
  const showShareMenu = Boolean(shareCommand);
  const stateMapPagePath =
    review.stateCanvasPagePath ?? getDefaultPrototypeStateMapPath(review.slug);
  const stateMapQuery = searchParams.toString();
  const prototypeReturnTo = `${pathname}${stateMapQuery ? `?${stateMapQuery}` : ""}`;
  const stateMapHref = buildStateMapHref(
    stateMapPagePath,
    prototypeReturnTo,
    searchParams,
  );
  const onStateMapPage = pathname.startsWith(stateMapPagePath);
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
        <div className={styles.footerGroup}>
          <ReviewToolbarLink label="Back to gallery" href="/">
            <ArrowLeft size={16} strokeWidth={2} />
          </ReviewToolbarLink>

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

          <ReviewToolbarIconPickerMenu
            label="Brightness"
            tooltip="Brightness"
            value={theme}
            onValueChange={setTheme}
            options={THEME_OPTIONS}
            open={themeMenuOpen}
            onOpenChange={(open) => {
              if (open) {
                openThemeMenu();
                return;
              }
              closeThemeMenu();
            }}
            hoverPanel={themeHover}
            panelId="theme"
            triggerIcon={
              theme === "light" ? (
                <Sun size={16} strokeWidth={2} />
              ) : (
                <Moon size={16} strokeWidth={2} />
              )
            }
          />

          <DropdownMenu
            modal={false}
            open={statesOpen}
            onOpenChange={(open) => {
              if (open) {
                openStatesMenu();
                return;
              }
              closeStatesMenu();
            }}
          >
            <ReviewToolbarTooltip label="States" disabled={statesOpen}>
              <div
                className={cn(
                  styles.footerBarControls,
                  toolbarStyles.buttonWrapper,
                )}
                {...statesHover.triggerProps}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      toolbarStyles.controlButton,
                      styles.toolbarMenuTrigger,
                      statesOpen && styles.toolbarButtonHovered,
                    )}
                    data-menu-open={statesOpen ? "true" : undefined}
                    aria-label="States"
                    aria-expanded={statesOpen}
                    aria-pressed={statesOpen}
                    {...TOOLBAR_HOVER_ONLY_BUTTON_PROPS}
                  >
                    <Layers size={16} strokeWidth={2} />
                  </button>
                </DropdownMenuTrigger>
              </div>
            </ReviewToolbarTooltip>

            <DropdownMenuContent
              {...TOOLBAR_MENU_CONTENT_PROPS}
              {...statesHover.panelProps}
              data-prototype-comment-theme={commentTheme}
              data-prototype-review-panel="states"
            >
              <div
                className={cn(
                  pillStyles.controlsPanel,
                  pillStyles.controlsPanelStates,
                )}
              >
                <CreateStatePanelTrigger onOpen={openCreateStateModal} />
                {tweaksContent ? (
                  <div
                    className={pillStyles.explorationBriefSeparator}
                    role="separator"
                    aria-hidden
                  />
                ) : null}
                {tweaksContent}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <ReviewToolbarLink label="State map" href={stateMapHref}>
            <span
              className={cn(onStateMapPage && styles.toolbarButtonHovered)}
            >
              <Network size={16} strokeWidth={2} />
            </span>
          </ReviewToolbarLink>

          {showTweaksMenu ? (
            <DropdownMenu
              modal={false}
              open={review.tweaksOpen}
              onOpenChange={(open) => {
                if (!open) {
                  review.closeTweaks();
                  blurToolbarFocus();
                  return;
                }
                review.closeSettings();
                setStatesOpen(false);
                setExplorationsMenuOpen(false);
                setShareMenuOpen(false);
                setViewportMenuOpen(false);
                setThemeMenuOpen(false);
                review.openTweaks();
              }}
            >
              <ReviewToolbarTooltip label="Tweaks" disabled={review.tweaksOpen}>
                <div
                  className={cn(
                    styles.footerBarControls,
                    toolbarStyles.buttonWrapper,
                  )}
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        toolbarStyles.controlButton,
                        styles.toolbarMenuTrigger,
                        review.tweaksOpen && styles.toolbarButtonHovered,
                      )}
                      data-menu-open={review.tweaksOpen ? "true" : undefined}
                      aria-label="Prototype tweaks"
                      aria-expanded={review.tweaksOpen}
                      aria-pressed={review.tweaksOpen}
                      onClick={(event) => {
                        event.stopPropagation();
                        clearPillTextSelection();
                      }}
                      onMouseDown={(event) => event.preventDefault()}
                      onPointerDown={(event) => event.stopPropagation()}
                    >
                      <SlidersHorizontal size={16} strokeWidth={2} />
                    </button>
                  </DropdownMenuTrigger>
                </div>
              </ReviewToolbarTooltip>

              <DropdownMenuContent
                {...TOOLBAR_MENU_CONTENT_PROPS}
                data-prototype-comment-theme={commentTheme}
                data-prototype-review-panel="tweaks"
              >
                <div className={pillStyles.controlsPanel}>
                  {tweakGroups.map((group) => (
                    <div
                      key={group.category}
                      className={pillStyles.controlsPanelSection}
                    >
                      <div className={pillStyles.dropdownLabel}>
                        {group.label}
                      </div>
                      {group.items.map((tweak) => (
                        <DropdownMenuItem
                          key={tweak.id}
                          className={pillStyles.dropdownItem}
                          onSelect={() => {
                            review.closeTweaks();
                            blurToolbarFocus();
                            review.focusTweak(tweak.id);
                          }}
                        >
                          {tweak.label}
                          <MapPin
                            size={10}
                            className={pillStyles.dropdownItemIcon}
                          />
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

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
                data-prototype-comment-theme={commentTheme}
                data-prototype-review-panel="share"
              >
                <div className={pillStyles.controlsPanel}>
                  <PrototypeShareCommandButton command={shareCommand!} />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>

        <div className={styles.footerGroup}>
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
            <ReviewToolbarTooltip
              label="Explorations"
              disabled={explorationsMenuOpen}
            >
              <div
                className={cn(
                  styles.footerBarControls,
                  toolbarStyles.buttonWrapper,
                )}
                {...explorationsHover.triggerProps}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      toolbarStyles.controlButton,
                      styles.toolbarMenuTrigger,
                      explorationsMenuOpen && styles.toolbarButtonHovered,
                    )}
                    data-menu-open={
                      explorationsMenuOpen ? "true" : undefined
                    }
                    aria-label="Explorations"
                    aria-expanded={explorationsMenuOpen}
                    aria-pressed={explorationsMenuOpen}
                    {...TOOLBAR_HOVER_ONLY_BUTTON_PROPS}
                  >
                    <LayoutGrid size={16} strokeWidth={2} />
                  </button>
                </DropdownMenuTrigger>
              </div>
            </ReviewToolbarTooltip>

            <DropdownMenuContent
              {...TOOLBAR_MENU_CONTENT_PROPS}
              {...explorationsHover.panelProps}
              data-prototype-comment-theme={commentTheme}
              data-prototype-review-panel="explorations"
            >
              <div
                className={cn(
                  pillStyles.controlsPanel,
                  pillStyles.controlsPanelExplorations,
                )}
              >
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

          {onToggleCommentMode ? (
            <ReviewToolbarButton
              label={
                isCommentModeActive ? "Exit comment mode" : "Add comment"
              }
              tooltip="Add comment"
              pressed={isCommentModeActive ?? false}
              highlightActive={isCommentModeActive ?? false}
              commentModeToggle
              onClick={() => onToggleCommentMode()}
            >
              <MessageSquarePlus size={16} strokeWidth={2} />
            </ReviewToolbarButton>
          ) : null}

          <ReviewToolbarButton
            label={
              review.open && review.sidebarPanel === "comments"
                ? "Close comments panel"
                : "Open comments panel"
            }
            tooltip="Comments"
            pressed={review.open && review.sidebarPanel === "comments"}
            onClick={() => {
              if (review.open && review.sidebarPanel === "comments") {
                onClose();
              } else {
                closeShareMenu();
                onOpenCommentsPanel?.();
              }
            }}
            badge={
              commentCount > 0 ? (
                <span className={toolbarStyles.buttonBadge}>
                  {commentCount > 99 ? "99+" : commentCount}
                </span>
              ) : undefined
            }
          >
            <MessageSquare size={16} strokeWidth={2} />
          </ReviewToolbarButton>

          <ReviewToolbarButton
            label={
              review.open && review.sidebarPanel === "change-log"
                ? "Close overview"
                : "Open overview"
            }
            tooltip="Overview"
            pressed={review.open && review.sidebarPanel === "change-log"}
            onClick={() => {
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
            <ScrollText size={16} strokeWidth={2} />
          </ReviewToolbarButton>

          <ReviewToolbarButton
            label={
              review.open && review.sidebarPanel === "spec"
                ? "Close PRs"
                : "Open PRs"
            }
            tooltip="PRs"
            pressed={review.open && review.sidebarPanel === "spec"}
            onClick={() => {
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
            <Rocket size={16} strokeWidth={2} />
          </ReviewToolbarButton>
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
