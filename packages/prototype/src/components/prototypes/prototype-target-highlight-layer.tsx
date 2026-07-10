"use client";

import styles from "@prototype/lib/prototype-comments/ui/capture-styles.module.scss";
import {
  getPortalRelativeClientRect,
  getPrototypeHighlightPortalContainer,
  type PortalRelativeRect,
} from "@prototype/lib/tool-portal";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type PrototypeTargetHighlightLayerProps = {
  children: ReactNode;
  marker?: "capture" | "target" | "share";
};

export function PrototypeTargetHighlightLayer({
  children,
  marker,
}: PrototypeTargetHighlightLayerProps) {
  const [portal, setPortal] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortal(getPrototypeHighlightPortalContainer() ?? null);
  }, []);

  if (!portal) return null;

  return createPortal(
    <div
      className={styles.targetHighlightLayer}
      {...(marker === "capture"
        ? { "data-comment-capture-highlights": true }
        : marker === "target"
          ? { "data-comment-target-highlight": true }
          : marker === "share"
            ? { "data-prototype-share-overlay": true }
            : {})}
    >
      {children}
    </div>,
    portal,
  );
}

export function useHighlightPortalContainer(): HTMLElement | null {
  const [portal, setPortal] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortal(getPrototypeHighlightPortalContainer() ?? null);
  }, []);

  return portal;
}

export function toHighlightPortalStyle(
  rect: Pick<DOMRect, "left" | "top" | "width" | "height">,
  portal: HTMLElement | null,
): PortalRelativeRect {
  if (!portal) {
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }

  return getPortalRelativeClientRect(rect, portal);
}
