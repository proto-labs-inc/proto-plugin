"use client";

import { PROTOTYPE_VIEWPORT_ID } from "@prototype/lib/tool-portal";
import { useEffect, useState } from "react";

function readPrototypeViewportFrame(): boolean {
  if (typeof document === "undefined") return false;
  return document.getElementById(PROTOTYPE_VIEWPORT_ID) != null;
}

/** True when UI is rendered inside the prototype preview viewport (desktop or mobile frame). */
export function usePrototypeViewportFrame(): boolean {
  // Initialize to `false` (the SSR value) so the first client render matches
  // the server and avoids a hydration mismatch; the effect syncs the real value.
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const update = () => setIsActive(readPrototypeViewportFrame());
    update();

    const viewport = document.getElementById(PROTOTYPE_VIEWPORT_ID);
    if (!viewport) return;

    const observer = new MutationObserver(update);
    observer.observe(viewport, {
      attributes: true,
      attributeFilter: ["data-prototype-viewport-layout", "class", "id"],
    });

    return () => observer.disconnect();
  }, []);

  return isActive;
}
