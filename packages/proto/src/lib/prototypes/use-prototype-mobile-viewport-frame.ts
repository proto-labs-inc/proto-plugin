"use client";

import {
  PROTOTYPE_VIEWPORT_ID,
} from "@prototype/lib/tool-portal";
import { useEffect, useState } from "react";

function readPrototypeMobileViewportFrame(): boolean {
  if (typeof document === "undefined") return false;

  const viewport = document.getElementById(PROTOTYPE_VIEWPORT_ID);
  return (
    viewport?.getAttribute("data-prototype-viewport-layout") === "mobile"
  );
}

/** True when the prototype is rendered inside the platform mobile device frame. */
export function usePrototypeMobileViewportFrame(): boolean {
  // Initialize to `false` (the SSR value) so the first client render matches
  // the server and avoids a hydration mismatch; the effect syncs the real value.
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const viewport = document.getElementById(PROTOTYPE_VIEWPORT_ID);
    if (!viewport) {
      setIsActive(false);
      return;
    }

    const update = () => {
      setIsActive(readPrototypeMobileViewportFrame());
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(viewport, {
      attributes: true,
      attributeFilter: ["data-prototype-viewport-layout", "class"],
    });

    return () => observer.disconnect();
  }, []);

  return isActive;
}
