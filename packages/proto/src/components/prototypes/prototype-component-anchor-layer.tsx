"use client";

import { resolveAnnotationTargetById } from "@prototype/lib/prototype-comments/core/annotation-target";
import { useTargetPortalRect } from "@prototype/lib/prototype-comments/hooks/useTargetPortalRect";
import styles from "@prototype/lib/prototype-comments/ui/capture-styles.module.scss";
import { cn } from "@prototype/lib/utils";
import { useEffect, useState, type ReactNode } from "react";

import {
  PrototypeTargetHighlightLayer,
  useHighlightPortalContainer,
} from "./prototype-target-highlight-layer";
import type { PortalRelativeRect } from "@prototype/lib/tool-portal";

type PrototypeComponentAnchorLayerProps = {
  targetId?: string;
  targetElement?: HTMLElement | null;
  marker?: "capture" | "target" | "share";
  className?: string;
  outlineClassName?: string;
  isMultiSelect?: boolean;
  showOutline?: boolean;
  children?: ReactNode;
};

function resolveAnchorElement(
  targetId: string | undefined,
  targetElement: HTMLElement | null | undefined,
): HTMLElement | null {
  if (targetElement && document.contains(targetElement)) {
    return targetElement;
  }

  if (targetId) {
    return resolveAnnotationTargetById(targetId);
  }

  return null;
}

export function useResolvedAnchorElement(
  targetId: string | undefined,
  targetElement: HTMLElement | null | undefined,
): HTMLElement | null {
  const [element, setElement] = useState<HTMLElement | null>(() =>
    resolveAnchorElement(targetId, targetElement),
  );

  useEffect(() => {
    const update = () => {
      setElement(resolveAnchorElement(targetId, targetElement));
    };

    update();

    const retryTimer = window.setInterval(update, 50);
    const stopRetryTimer = window.setTimeout(
      () => window.clearInterval(retryTimer),
      400,
    );

    return () => {
      window.clearInterval(retryTimer);
      window.clearTimeout(stopRetryTimer);
    };
  }, [targetElement, targetId]);

  return element;
}

export function useComponentAnchorPortalRect(
  targetId: string | undefined,
  targetElement: HTMLElement | null | undefined,
): {
  element: HTMLElement | null;
  rect: PortalRelativeRect | null;
} {
  const portal = useHighlightPortalContainer();
  const element = useResolvedAnchorElement(targetId, targetElement);
  const rect = useTargetPortalRect(element, portal);

  return { element, rect };
}

export function PrototypeComponentAnchorLayer({
  targetId,
  targetElement,
  marker = "target",
  className,
  outlineClassName,
  isMultiSelect = false,
  showOutline = false,
  children,
}: PrototypeComponentAnchorLayerProps) {
  const { rect } = useComponentAnchorPortalRect(targetId, targetElement);

  if (!rect) return null;

  return (
    <PrototypeTargetHighlightLayer marker={marker}>
      <div
        className={cn(styles.componentAnchorBox, className)}
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }}
      >
        {showOutline ? (
          <div
            aria-hidden
            className={cn(
              isMultiSelect
                ? styles.multiSelectOutline
                : styles.componentAnchorOutline,
              styles.enter,
              outlineClassName,
            )}
            style={{ inset: 0, position: "absolute" }}
          />
        ) : null}
        {children}
      </div>
    </PrototypeTargetHighlightLayer>
  );
}
