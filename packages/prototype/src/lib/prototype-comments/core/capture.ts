import type { CommentInteractionState } from "./types";

export function captureInteractionState<TState>(
  live: TState,
): CommentInteractionState<TState> {
  return structuredClone({
    ...live,
    capturedAt: new Date().toISOString(),
    route: typeof window !== "undefined" ? window.location.pathname : "/",
  });
}
