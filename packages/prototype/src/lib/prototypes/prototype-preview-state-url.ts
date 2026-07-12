export const PREVIEW_STATE_PARAM = "state";

export function readPreviewStateParam(searchParams: URLSearchParams): string | null {
  const value = searchParams.get(PREVIEW_STATE_PARAM)?.trim();
  return value || null;
}

export function isPreviewStateParamValid(
  stateId: string,
  validStateIds?: readonly string[],
): boolean {
  if (!validStateIds) return true;
  return validStateIds.includes(stateId);
}

/** Writes the preview state id to `?state=` (no-op when unchanged). */
export function syncPreviewStateParam(stateId: string): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  if (url.searchParams.get(PREVIEW_STATE_PARAM) === stateId) return;

  url.searchParams.set(PREVIEW_STATE_PARAM, stateId);
  window.history.replaceState(null, "", url);
}
