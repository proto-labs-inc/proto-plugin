"use client";

import { useLayoutEffect, type RefObject } from "react";

import { mirrorComponentLibraryProductThemeTokens } from "./component-library-product-theme-vars";
import type { ComponentLibraryProductTheme } from "./use-component-library-product-theme";

export const COMPONENT_LIBRARY_PORTAL_ATTR = "data-component-library-portal";

const OVERLAY_SELECTOR = [
  "[role='dialog']",
  "[role='alertdialog']",
  "[role='tooltip']",
  "[data-radix-popper-content-wrapper]",
  "[data-radix-select-content]",
  "[data-radix-menu-content]",
  "[data-radix-dropdown-menu-content]",
].join(", ");

/**
 * A themable portal is a *direct child of <body>* that contains a Radix overlay.
 * Restricting to direct body children is deliberate: walking up from arbitrary
 * overlays would match in-app poppers and stamp the product theme onto large
 * page wrappers (e.g. the tool chrome root), breaking the sidebar/background.
 */
function isComponentLibraryOverlayPortal(node: Element): node is HTMLElement {
  if (!(node instanceof HTMLElement)) return false;
  if (node.parentElement !== document.body) return false;
  if (node.id === "prototype-root") return false;
  return (
    node.matches(OVERLAY_SELECTOR) ||
    node.querySelector(OVERLAY_SELECTOR) !== null
  );
}

function applyPortalTheme(
  node: HTMLElement,
  theme: ComponentLibraryProductTheme,
  source: HTMLElement | null,
) {
  node.setAttribute(COMPONENT_LIBRARY_PORTAL_ATTR, "");
  node.setAttribute("data-theme", theme);
  node.classList.remove("light", "dark");
  node.classList.add(theme);

  if (source) {
    mirrorComponentLibraryProductThemeTokens(source, node);
  }
}

function clearPortalTheme(node: HTMLElement) {
  node.removeAttribute(COMPONENT_LIBRARY_PORTAL_ATTR);
  node.removeAttribute("data-theme");
  node.classList.remove("light", "dark");
  node.removeAttribute("style");
}

function themablePortals(): HTMLElement[] {
  return Array.from(document.body.children).filter(
    isComponentLibraryOverlayPortal,
  );
}

/** Mirrors component-library product theme onto Radix portals rendered on document.body. */
export function useSyncComponentLibraryPortalTheme(
  theme: ComponentLibraryProductTheme,
  enabled: boolean,
  sourceRef: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    let frame = 0;

    const syncPortals = () => {
      const source = sourceRef.current;
      for (const node of themablePortals()) {
        applyPortalTheme(node, theme, source);
      }
    };

    syncPortals();
    // Re-run after paint so overlays that mount in the same tick are themed too.
    frame = window.requestAnimationFrame(syncPortals);

    const observer = new MutationObserver(syncPortals);
    observer.observe(document.body, { childList: true });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      for (const node of themablePortals()) {
        if (!node.hasAttribute(COMPONENT_LIBRARY_PORTAL_ATTR)) continue;
        clearPortalTheme(node);
      }
    };
  }, [enabled, sourceRef, theme]);
}
