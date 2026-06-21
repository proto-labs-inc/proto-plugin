export const PROTOTYPE_STATE_SCREENSHOT_CAPTURED_EVENT =
  "prototype-state-screenshot-captured";

export type PrototypeStateScreenshotCapturedDetail = {
  slug: string;
  stateId: string;
  version: number;
};

export function sanitizeStateIdForFilename(stateId: string): string {
  return stateId.replace(/:/g, "--");
}

export function stateScreenshotManifestKey(slug: string, stateId: string): string {
  return `${slug}/states/${sanitizeStateIdForFilename(stateId)}`;
}

export function stateScreenshotPublicPath(slug: string, stateId: string): string {
  return `/prototypes/screenshots/${slug}/states/${sanitizeStateIdForFilename(stateId)}.png`;
}

export function stateScreenshotSrc(
  slug: string,
  stateId: string,
  version: number | undefined,
): string {
  const basePath = stateScreenshotPublicPath(slug, stateId);
  if (!version) return basePath;
  return `${basePath}?v=${version}`;
}

export function dispatchPrototypeStateScreenshotCaptured(
  detail: PrototypeStateScreenshotCapturedDetail,
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(PROTOTYPE_STATE_SCREENSHOT_CAPTURED_EVENT, { detail }),
  );
}
