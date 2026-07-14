"use client";

import {
  PR_TARGET_HIGHLIGHT_BORDER,
  PR_TARGET_HIGHLIGHT_FILL,
} from "@prototype/lib/pr-split/pr-split-highlight";
import type { StateMapHighlightRect } from "@prototype/lib/prototypes/prototype-state-canvas-types";
import { cn } from "@prototype/lib/utils";
import {
  createContext,
  useContext,
  type CSSProperties,
  type ReactNode,
} from "react";

import styles from "./state-map-wireframe-highlight.module.scss";

const StateMapHighlightContext = createContext<string | null>(null);

export function StateMapHighlightProvider({
  highlightId,
  children,
}: {
  highlightId: string | null;
  children: ReactNode;
}) {
  return (
    <StateMapHighlightContext.Provider value={highlightId}>
      {children}
    </StateMapHighlightContext.Provider>
  );
}

export function useStateMapHighlight(): string | null {
  return useContext(StateMapHighlightContext);
}

export function StateMapHighlightRegion({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const activeHighlightId = useStateMapHighlight();
  const isActive = activeHighlightId === id;

  return (
    <div
      data-state-map-highlight={id}
      className={cn(styles.region, isActive && styles.regionActive, className)}
    >
      {children}
    </div>
  );
}

export function StateMapPreviewHighlightOverlay({
  rect,
}: {
  rect: StateMapHighlightRect;
}) {
  const style: CSSProperties = {
    top: `${rect.top}%`,
    left: `${rect.left}%`,
    width: `${rect.width}%`,
    height: `${rect.height}%`,
    borderColor: PR_TARGET_HIGHLIGHT_BORDER,
    backgroundColor: PR_TARGET_HIGHLIGHT_FILL,
  };

  return (
    <div
      aria-hidden
      className={styles.previewOverlay}
      style={style}
      data-state-map-highlight-overlay
    />
  );
}
