export const PROTOTYPE_ROOT_ID = "prototype-root";

export const PROTOTYPE_PREVIEW_STAGE_ID = "prototype-preview-stage";

export const PROTOTYPE_CHROME_ROOT_ID = "prototype-chrome-root";

export const PROTOTYPE_VIEWPORT_ID = "prototype-viewport";

export const PROTOTYPE_SCREENSHOT_ATTR = "data-prototype-screenshot";

export const PROTOTYPE_COMMENTS_SIDEBAR_ROOT_ID =
  "prototype-comments-sidebar-root";

export function getPrototypePortalContainer(): HTMLElement | undefined {
  if (typeof document === "undefined") return undefined;
  return document.getElementById(PROTOTYPE_ROOT_ID) ?? undefined;
}

export function getPrototypePreviewStage(): HTMLElement | undefined {
  if (typeof document === "undefined") return undefined;
  return document.getElementById(PROTOTYPE_PREVIEW_STAGE_ID) ?? undefined;
}

export function getPrototypeChromeRoot(): HTMLElement | undefined {
  if (typeof document === "undefined") return undefined;
  return document.getElementById(PROTOTYPE_CHROME_ROOT_ID) ?? undefined;
}

export function getPrototypeScreenshotRoot(): HTMLElement | undefined {
  if (typeof document === "undefined") return undefined;
  const root = document.querySelector(`[${PROTOTYPE_SCREENSHOT_ATTR}]`);
  return root instanceof HTMLElement ? root : undefined;
}
