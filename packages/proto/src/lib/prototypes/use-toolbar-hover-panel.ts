"use client";

import { useCallback, useEffect, useRef } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

export const TOOLBAR_PANEL_HOVER_OPEN_DELAY_MS = 100;
export const TOOLBAR_PANEL_HOVER_CLOSE_DELAY_MS = 150;
export const TOOLBAR_HOVER_CAPABLE_MEDIA_QUERY =
  "(hover: hover) and (pointer: fine)";

export function supportsToolbarHover() {
  if (typeof window === "undefined") return true;
  return window.matchMedia(TOOLBAR_HOVER_CAPABLE_MEDIA_QUERY).matches;
}

export function preventToolbarHoverButtonActivation(
  event:
    | ReactMouseEvent<HTMLButtonElement>
    | ReactPointerEvent<HTMLButtonElement>,
) {
  if (!supportsToolbarHover()) return;

  event.preventDefault();
  event.stopPropagation();
}

export const TOOLBAR_HOVER_ONLY_BUTTON_PROPS = {
  onClick: preventToolbarHoverButtonActivation,
  onPointerDown: preventToolbarHoverButtonActivation,
} as const;

type UseToolbarHoverPanelOptions = {
  onOpen: () => void;
  onClose: () => void;
  openDelayMs?: number;
  closeDelayMs?: number;
};

export function useToolbarHoverPanel({
  onOpen,
  onClose,
  openDelayMs = TOOLBAR_PANEL_HOVER_OPEN_DELAY_MS,
  closeDelayMs = TOOLBAR_PANEL_HOVER_CLOSE_DELAY_MS,
}: UseToolbarHoverPanelOptions) {
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const cancelClose = useCallback(() => {
    clearCloseTimer();
  }, [clearCloseTimer]);

  const scheduleOpen = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!supportsToolbarHover() || event.pointerType === "touch") return;

      clearCloseTimer();
      clearOpenTimer();
      openTimerRef.current = setTimeout(() => {
        onOpen();
      }, openDelayMs);
    },
    [clearCloseTimer, clearOpenTimer, onOpen, openDelayMs],
  );

  const scheduleClose = useCallback(() => {
    if (!supportsToolbarHover()) return;

    clearOpenTimer();
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      onClose();
    }, closeDelayMs);
  }, [clearCloseTimer, clearOpenTimer, closeDelayMs, onClose]);

  useEffect(() => {
    return () => {
      clearOpenTimer();
      clearCloseTimer();
    };
  }, [clearCloseTimer, clearOpenTimer]);

  return {
    triggerProps: {
      onPointerEnter: scheduleOpen,
      onPointerLeave: scheduleClose,
    },
    panelProps: {
      onPointerEnter: cancelClose,
      onPointerLeave: scheduleClose,
    },
  };
}
