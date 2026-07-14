"use client";

import { cn } from "@prototype/lib/utils";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import { IconButton } from "./icon-button";

export const DEFAULT_SIDEBAR_WIDTH = 400;
export const MIN_SIDEBAR_WIDTH = 280;
export const MAX_SIDEBAR_WIDTH = 720;

export function clampSidebarWidth(width: number) {
  return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, width));
}

/** e.g. `data-comments-sidebar` + `"open"` → `data-comments-sidebar-open` */
export function getSidebarStateAttribute(
  dataAttribute: string,
  suffix: "open" | "inline" | "resizing",
): string {
  const base = dataAttribute.startsWith("data-")
    ? dataAttribute.slice(5)
    : dataAttribute;
  return `data-${base}-${suffix}`;
}

const SIDEBAR_TITLE_CLASS =
  "font-display truncate text-sm font-semibold text-[var(--tool-chrome-text-heading)]";

export const SIDEBAR_ICON_BUTTON_CLASS =
  "cursor-pointer text-[var(--tool-chrome-icon)] hover:bg-[var(--tool-chrome-gray-highlight)] hover:text-[var(--tool-chrome-icon-hover)] focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0";

type SidebarProps = {
  open: boolean;
  text: string;
  onClose: () => void;
  children: ReactNode;
  titleAddon?: ReactNode;
  headerActions?: ReactNode;
  ariaLabel?: string;
  dataAttribute?: string;
  widthCssVar?: string;
  className?: string;
  /**
   * When true, the panel floats over page content instead of reserving inline
   * layout width. It is taken out of flow (clipped, transform slide-in) so
   * opening/closing it never reflows or squishes the parent. Use this for
   * selector-style panels that should overlay, not push, the page.
   */
  overlay?: boolean;
};

export function Sidebar({
  open,
  text,
  onClose,
  children,
  titleAddon,
  headerActions,
  ariaLabel = "Sidebar",
  dataAttribute = "data-platform-sidebar",
  widthCssVar = "--platform-sidebar-width",
  className,
  overlay = false,
}: SidebarProps) {
  const openAttr = getSidebarStateAttribute(dataAttribute, "open");
  const inlineAttr = getSidebarStateAttribute(dataAttribute, "inline");
  const resizingAttr = getSidebarStateAttribute(dataAttribute, "resizing");
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{ startX: number; startWidth: number } | null>(
    null,
  );

  const applySidebarWidth = useCallback(
    (width: number) => {
      const clampedWidth = clampSidebarWidth(width);
      setSidebarWidth((current) =>
        current === clampedWidth ? current : clampedWidth,
      );
      document.documentElement.style.setProperty(
        widthCssVar,
        `${clampedWidth}px`,
      );
    },
    [widthCssVar],
  );

  useEffect(() => {
    if (!overlay) {
      document.documentElement.setAttribute(inlineAttr, "");
    }
    document.documentElement.style.setProperty(
      widthCssVar,
      `${DEFAULT_SIDEBAR_WIDTH}px`,
    );

    return () => {
      document.documentElement.style.removeProperty(widthCssVar);
      document.documentElement.removeAttribute(openAttr);
      document.documentElement.removeAttribute(resizingAttr);
      document.documentElement.removeAttribute(inlineAttr);
    };
  }, [inlineAttr, openAttr, overlay, resizingAttr, widthCssVar]);

  useEffect(() => {
    document.documentElement.toggleAttribute(openAttr, open);
  }, [open, openAttr]);

  useEffect(() => {
    document.documentElement.toggleAttribute(resizingAttr, isResizing);
  }, [isResizing, resizingAttr]);

  const handleResizeStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!open) return;
      event.preventDefault();
      resizeStartRef.current = {
        startX: event.clientX,
        startWidth: sidebarWidth,
      };
      setIsResizing(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [open, sidebarWidth],
  );

  const handleResizeMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!resizeStartRef.current) return;
      const { startX, startWidth } = resizeStartRef.current;
      applySidebarWidth(startWidth + (startX - event.clientX));
    },
    [applySidebarWidth],
  );

  const handleResizeEnd = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!resizeStartRef.current) return;
      resizeStartRef.current = null;
      setIsResizing(false);
      event.currentTarget.releasePointerCapture(event.pointerId);
    },
    [],
  );

  const aside = (
    <aside
      {...{ [dataAttribute]: "" }}
      aria-hidden={!open}
      aria-label={ariaLabel}
      style={
        overlay
          ? {
              width: sidebarWidth,
              transform: open ? "translateX(0)" : "translateX(100%)",
            }
          : { width: open ? sidebarWidth : 0 }
      }
      className={cn(
        "flex h-full shrink-0 flex-col overflow-hidden bg-[var(--tool-chrome-ground)] text-[var(--tool-chrome-text)]",
        isResizing && "select-none transition-none",
        overlay
          ? "absolute inset-y-0 right-0 shadow-2xl transition-transform duration-200 ease-out"
          : "relative transition-[width] duration-200 ease-out",
        overlay && (open ? "pointer-events-auto" : "pointer-events-none"),
        className,
      )}
    >
      {open ? (
        <SidebarResizeHandle
          open={open}
          sidebarWidth={sidebarWidth}
          isResizing={isResizing}
          onResizeStart={handleResizeStart}
          onResizeMove={handleResizeMove}
          onResizeEnd={handleResizeEnd}
        />
      ) : null}
      {open ? (
        <SidebarHeader
          text={text}
          titleAddon={titleAddon}
          actions={
            <>
              {headerActions}
              <IconButton
                type="button"
                onClick={onClose}
                aria-label="Close sidebar"
                className={SIDEBAR_ICON_BUTTON_CLASS}
              >
                <CloseIcon />
              </IconButton>
            </>
          }
        />
      ) : null}
      {open ? (
        <SidebarContent>
          <div className="px-4 pt-4">{children}</div>
        </SidebarContent>
      ) : null}
    </aside>
  );

  if (!overlay) return aside;

  // Clip layer: full-viewport, click-through, hides the panel off the right
  // edge while it is closed so it never produces horizontal overflow. Sits
  // below the floating review pill (z-index 1050) so its variant switcher
  // stays usable while the panel is open.
  return (
    <div
      aria-hidden={!open}
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      {aside}
    </div>
  );
}

type SidebarResizeHandleProps = {
  open: boolean;
  sidebarWidth: number;
  isResizing: boolean;
  onResizeStart: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onResizeMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onResizeEnd: (event: ReactPointerEvent<HTMLDivElement>) => void;
};

export function SidebarResizeHandle({
  open,
  sidebarWidth,
  isResizing,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
}: SidebarResizeHandleProps) {
  return (
    <div
      data-resizing={isResizing ? "" : undefined}
      className={cn(
        "absolute top-0 left-[-4px] z-[1] h-full w-2 cursor-col-resize touch-none before:absolute before:top-0 before:left-[3px] before:h-full before:w-0.5 before:bg-transparent before:transition-colors hover:before:bg-border data-resizing:before:bg-border",
        isResizing && "select-none",
      )}
      onPointerDown={onResizeStart}
      onPointerMove={onResizeMove}
      onPointerUp={onResizeEnd}
      onPointerCancel={onResizeEnd}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      aria-valuemin={MIN_SIDEBAR_WIDTH}
      aria-valuemax={MAX_SIDEBAR_WIDTH}
      aria-valuenow={open ? sidebarWidth : MIN_SIDEBAR_WIDTH}
    />
  );
}

export function SidebarHeader({
  text,
  titleAddon,
  actions,
}: {
  text: string;
  titleAddon?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex h-[3.25rem] max-h-[3.25rem] min-h-[3.25rem] shrink-0 items-center justify-between gap-3 border-b border-[var(--tool-chrome-border)] px-4">
      <div className="flex min-w-0 flex-1 items-baseline gap-0">
        <span className={cn(SIDEBAR_TITLE_CLASS, "truncate")}>{text}</span>
        {titleAddon}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-1">{actions}</div>
      ) : null}
    </div>
  );
}

export function SidebarContent({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto pb-4">{children}</div>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
