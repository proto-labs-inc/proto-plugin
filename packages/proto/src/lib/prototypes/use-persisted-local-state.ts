"use client";

import {
  hasPendingCommentRestore,
  readShareCommentParam,
  readShareLinkParams,
} from "@prototype/lib/prototypes/prototype-share-link";
import { useCallback, useEffect, useRef, useState } from "react";

export function prototypeLiveStateStorageKey(slug: string): string {
  return `prototype-live-state:${slug}`;
}

export function prototypeReviewPreferenceKey(
  slug: string,
  preference: string,
): string {
  return `prototype-review:${slug}:${preference}`;
}

export function readPersistedPrototypeLiveState<T>(
  slug: string,
  revive?: (parsed: unknown) => T | null,
): T | null {
  if (typeof window === "undefined") return null;

  try {
    const searchParams = new URLSearchParams(window.location.search);
    if (
      readShareLinkParams(searchParams) ||
      readShareCommentParam(searchParams) ||
      hasPendingCommentRestore(slug)
    ) {
      return null;
    }

    const raw = localStorage.getItem(prototypeLiveStateStorageKey(slug));
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    return revive ? revive(parsed) : (parsed as T);
  } catch {
    return null;
  }
}

export function writePersistedPrototypeLiveState(
  slug: string,
  state: unknown,
): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      prototypeLiveStateStorageKey(slug),
      JSON.stringify(state),
    );
  } catch {
    // Ignore localStorage write failures in prototype preview.
  }
}

/** Persists prototype live state to localStorage on change (skips share-link loads). */
export function usePersistPrototypeLiveState<T extends Record<string, unknown>>(
  slug: string,
  state: T,
  enabled = true,
): void {
  const hasHydratedRef = useRef(false);
  const serializedState = JSON.stringify(state);

  useEffect(() => {
    if (!enabled) return;

    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return;
    }

    writePersistedPrototypeLiveState(slug, JSON.parse(serializedState) as T);
  }, [enabled, serializedState, slug]);
}

export function usePersistedLocalString(storageKey: string, defaultValue: string) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored != null) {
        setValue(stored);
      }
    } catch {
      // Ignore localStorage read failures in prototype preview.
    }
  }, [storageKey]);

  const updateValue = useCallback(
    (nextValue: string) => {
      setValue(nextValue);
      try {
        localStorage.setItem(storageKey, nextValue);
      } catch {
        // Ignore localStorage write failures in prototype preview.
      }
    },
    [storageKey],
  );

  return { value, updateValue };
}

export function usePersistedLocalBoolean(storageKey: string, defaultValue: boolean) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored != null) {
        setValue(stored === "true");
      }
    } catch {
      // Ignore localStorage read failures in prototype preview.
    }
  }, [storageKey]);

  const updateValue = useCallback(
    (nextValue: boolean) => {
      setValue(nextValue);
      try {
        localStorage.setItem(storageKey, String(nextValue));
      } catch {
        // Ignore localStorage write failures in prototype preview.
      }
    },
    [storageKey],
  );

  return { value, updateValue };
}
