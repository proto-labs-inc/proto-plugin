"use client";

import { getPrototypeDialogPortalContainer } from "@prototype/lib/tool-portal";
import { useLayoutEffect, useState } from "react";

/**
 * Returns `#prototype-viewport` for portaling product shelves, sheets, and dialogs.
 * Keeps overlays inside the preview frame — below review sidebar and footer chrome.
 */
export function usePrototypeProductOverlayPortal(): HTMLElement | undefined {
  const [container, setContainer] = useState<HTMLElement | undefined>(undefined);

  useLayoutEffect(() => {
    setContainer(getPrototypeDialogPortalContainer());
  }, []);

  return container;
}
