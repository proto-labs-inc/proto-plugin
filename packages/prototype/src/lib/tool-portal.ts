export const PROTOTYPE_ROOT_ID = "prototype-root";

export const PROTOTYPE_PREVIEW_STAGE_ID = "prototype-preview-stage";

export const PROTOTYPE_CHROME_ROOT_ID = "prototype-chrome-root";

export const PROTOTYPE_VIEWPORT_ID = "prototype-viewport";

export const PROTOTYPE_SCREENSHOT_ATTR = "data-prototype-screenshot";

/** Synced source-app previews (component library, etc.) — fixed product tokens, not tool theme. */
export const PROTOTYPE_SOURCE_SURFACE_ATTR = "data-prototype-source-surface";

/** Source surfaces that manage their own Supabase Light/Dark preview theme (component library). */
export const PROTOTYPE_PRODUCT_THEME_MANAGED_ATTR =
  "data-prototype-product-theme-managed";

export const PROTOTYPE_COMMENTS_SIDEBAR_ROOT_ID =
  "prototype-comments-sidebar-root";

/** Floating tool overlays (mini state map) — above preview, below portaled menus. */
export const PROTOTYPE_TOOL_OVERLAY_ROOT_ID = "prototype-tool-overlay-root";

export function getPrototypePortalContainer(): HTMLElement | undefined {
  if (typeof document === "undefined") return undefined;
  return document.getElementById(PROTOTYPE_ROOT_ID) ?? undefined;
}

/** Dialogs/overlays inside prototype content — scoped to the preview viewport, not the review sidebar. */
export function getPrototypeDialogPortalContainer(): HTMLElement | undefined {
  if (typeof document === "undefined") return undefined;
  return (
    document.getElementById(PROTOTYPE_VIEWPORT_ID) ??
    document.getElementById(PROTOTYPE_PREVIEW_STAGE_ID) ??
    document.getElementById(PROTOTYPE_ROOT_ID) ??
    undefined
  );
}

/** Tool chrome modals (prompt copy, link source, etc.) — outside the screenshot surface so dark/light tool theme applies. */
export function getPrototypeToolDialogPortalContainer(): HTMLElement | undefined {
  if (typeof document === "undefined") return undefined;
  return (
    document.getElementById(PROTOTYPE_ROOT_ID) ??
    document.getElementById(PROTOTYPE_PREVIEW_STAGE_ID) ??
    undefined
  );
}

export function getPrototypePreviewStage(): HTMLElement | undefined {
  if (typeof document === "undefined") return undefined;
  return document.getElementById(PROTOTYPE_PREVIEW_STAGE_ID) ?? undefined;
}

export function getPrototypeChromeRoot(): HTMLElement | undefined {
  if (typeof document === "undefined") return undefined;
  return document.getElementById(PROTOTYPE_CHROME_ROOT_ID) ?? undefined;
}

export function getPrototypeToolOverlayRoot(): HTMLElement | undefined {
  if (typeof document === "undefined") return undefined;
  return document.getElementById(PROTOTYPE_TOOL_OVERLAY_ROOT_ID) ?? undefined;
}

/** Comment/PR target highlights — scoped to preview content, below tool overlays. */
export function getPrototypeHighlightPortalContainer(): HTMLElement | undefined {
  return getPrototypeDialogPortalContainer();
}

export type PortalRelativeRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export function getPortalRelativeClientRect(
  rect: Pick<DOMRect, "left" | "top" | "width" | "height">,
  portal: HTMLElement,
): PortalRelativeRect {
  const portalRect = portal.getBoundingClientRect();
  return {
    left: rect.left - portalRect.left,
    top: rect.top - portalRect.top,
    width: rect.width,
    height: rect.height,
  };
}

export function getPrototypeScreenshotRoot(): HTMLElement | undefined {
  if (typeof document === "undefined") return undefined;
  const root = document.querySelector(`[${PROTOTYPE_SCREENSHOT_ATTR}]`);
  return root instanceof HTMLElement ? root : undefined;
}
