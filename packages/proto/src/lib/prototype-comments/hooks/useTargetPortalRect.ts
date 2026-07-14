"use client";

import { getPrototypeScrollContainer } from "../core/annotation-target";
import {
  toHighlightPortalStyle,
} from "@prototype/components/prototypes/prototype-target-highlight-layer";
import type { PortalRelativeRect } from "@prototype/lib/tool-portal";
import { useEffect, useState } from "react";

export function useTargetPortalRect(
  targetElement: HTMLElement | null,
  portal: HTMLElement | null,
): PortalRelativeRect | null {
  const [rect, setRect] = useState<PortalRelativeRect | null>(null);

  useEffect(() => {
    if (!targetElement || !document.contains(targetElement)) {
      setRect(null);
      return;
    }

    const update = () => {
      if (!document.contains(targetElement)) {
        setRect(null);
        return;
      }

      setRect(
        toHighlightPortalStyle(targetElement.getBoundingClientRect(), portal),
      );
    };

    update();

    const retryTimer = window.setInterval(update, 50);
    const stopRetryTimer = window.setTimeout(
      () => window.clearInterval(retryTimer),
      400,
    );

    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);

    const scrollContainer = getPrototypeScrollContainer();
    scrollContainer?.addEventListener("scroll", update, { passive: true });

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(targetElement);

    return () => {
      window.clearInterval(retryTimer);
      window.clearTimeout(stopRetryTimer);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      scrollContainer?.removeEventListener("scroll", update);
      resizeObserver.disconnect();
    };
  }, [portal, targetElement]);

  return rect;
}
