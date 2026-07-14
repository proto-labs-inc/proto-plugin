"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

import type { AnnotationTargetOptions } from "@prototype/lib/prototype-comments/core/annotation-target";

import {
  usePrototypeCommentRegistry,
  type PrototypeCommentHandlers,
} from "./prototype-comment-registry";

type UsePrototypeCommentsOptions = {
  resolveTargetOptions?: () => AnnotationTargetOptions;
};

/**
 * Register live state snapshot/restore handlers for the prototype comment system.
 * Call from each prototype that wants controls/filter state frozen in annotations.
 */
export function usePrototypeComments<TLive extends Record<string, unknown>>(
  live: TLive,
  onRestore: (live: TLive) => void,
  options?: UsePrototypeCommentsOptions,
) {
  const { register, unregister, notifyLiveStateChange } =
    usePrototypeCommentRegistry();
  const liveRef = useRef(live);
  const onRestoreRef = useRef(onRestore);
  const resolveTargetOptionsRef = useRef(options?.resolveTargetOptions);

  liveRef.current = live;
  onRestoreRef.current = onRestore;
  resolveTargetOptionsRef.current = options?.resolveTargetOptions;

  const lastSerializedRef = useRef<string | null>(null);
  useEffect(() => {
    const serialized = JSON.stringify(live);
    if (
      lastSerializedRef.current !== null &&
      lastSerializedRef.current !== serialized
    ) {
      notifyLiveStateChange();
    }
    lastSerializedRef.current = serialized;
  }, [live, notifyLiveStateChange]);

  useLayoutEffect(() => {
    const handlers: PrototypeCommentHandlers = {
      getLiveState: () => liveRef.current,
      onRestore: (restored) => {
        onRestoreRef.current(restored as TLive);
      },
      ...(resolveTargetOptionsRef.current
        ? {
            resolveTargetOptions: () =>
              resolveTargetOptionsRef.current?.() ?? {},
          }
        : {}),
    };
    register(handlers);
    return () => unregister(handlers);
  }, [register, unregister]);
}
