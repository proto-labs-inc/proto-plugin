import { resolveAnnotationTargetById } from "@prototype/lib/prototype-comments/core/annotation-target";

export const SHARE_TARGET_PARAM = "shareTarget";
export const SHARE_STATE_PARAM = "shareState";
export const SHARE_COMMENT_PARAM = "shareComment";

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + "=".repeat(padLength));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeShareState(state: unknown): string {
  return toBase64Url(JSON.stringify(state));
}

export function decodeShareState<T = unknown>(encoded: string): T {
  return JSON.parse(fromBase64Url(encoded)) as T;
}

export type ShareLinkParams = {
  targetId: string;
  state: unknown | null;
};

export function readShareLinkParams(
  searchParams: URLSearchParams,
): ShareLinkParams | null {
  const targetId = searchParams.get(SHARE_TARGET_PARAM);
  if (!targetId) return null;

  const stateParam = searchParams.get(SHARE_STATE_PARAM);
  if (!stateParam) {
    return { targetId, state: null };
  }

  try {
    return { targetId, state: decodeShareState(stateParam) };
  } catch {
    return { targetId, state: null };
  }
}

export function readShareCommentParam(
  searchParams: URLSearchParams,
): string | null {
  const commentId = searchParams.get(SHARE_COMMENT_PARAM);
  return commentId?.trim() ? commentId : null;
}

export function pendingCommentRestoreKey(slug: string): string {
  return `prototype-share-comment:${slug}`;
}

export function stashPendingCommentRestore(slug: string, commentId: string): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(pendingCommentRestoreKey(slug), commentId);
  } catch {
    // Ignore sessionStorage write failures in prototype preview.
  }
}

export function readPendingCommentRestore(slug: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    const value = sessionStorage.getItem(pendingCommentRestoreKey(slug));
    return value?.trim() ? value : null;
  } catch {
    return null;
  }
}

export function clearPendingCommentRestore(slug: string): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(pendingCommentRestoreKey(slug));
  } catch {
    // Ignore sessionStorage write failures in prototype preview.
  }
}

export function hasPendingCommentRestore(slug: string): boolean {
  return readPendingCommentRestore(slug) != null;
}

/** URL param first; falls back to session stash so restore survives URL rewrites. */
export function resolveShareCommentId(
  searchParams: URLSearchParams,
  slug: string | null,
): string | null {
  const fromUrl = readShareCommentParam(searchParams);
  if (fromUrl) {
    if (slug) stashPendingCommentRestore(slug, fromUrl);
    return fromUrl;
  }

  return slug ? readPendingCommentRestore(slug) : null;
}

export function buildComponentShareLink(
  targetId: string,
  liveState: unknown,
  options?: { commentId?: string | null },
): string {
  const url = new URL(window.location.href);
  url.searchParams.set(SHARE_TARGET_PARAM, targetId);
  url.searchParams.set(SHARE_STATE_PARAM, encodeShareState(liveState));
  if (options?.commentId) {
    url.searchParams.set(SHARE_COMMENT_PARAM, options.commentId);
  }
  return url.toString();
}

export function buildCommentShareLink(commentId: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set(SHARE_COMMENT_PARAM, commentId);
  return url.toString();
}

export function syncShareCommentParam(commentId: string | null): void {
  const url = new URL(window.location.href);
  if (commentId) {
    if (url.searchParams.get(SHARE_COMMENT_PARAM) === commentId) return;
    url.searchParams.set(SHARE_COMMENT_PARAM, commentId);
  } else if (!url.searchParams.has(SHARE_COMMENT_PARAM)) {
    return;
  } else {
    url.searchParams.delete(SHARE_COMMENT_PARAM);
  }
  window.history.replaceState(null, "", url);
}

export function clearShareCommentParam(url: URL): void {
  url.searchParams.delete(SHARE_COMMENT_PARAM);
}

/** Removes component share params only; keeps `shareComment` for comment deep-link restore. */
export function clearShareComponentParams(url: URL): void {
  url.searchParams.delete(SHARE_TARGET_PARAM);
  url.searchParams.delete(SHARE_STATE_PARAM);
}

export function clearShareLinkParams(url: URL): void {
  clearShareComponentParams(url);
  clearShareCommentParam(url);
}

export function scrollPrototypeTargetIntoView(targetId: string): void {
  const element = resolveAnnotationTargetById(targetId);
  if (!element) return;

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
}
