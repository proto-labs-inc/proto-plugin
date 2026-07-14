"use client";

import {
  isPreviewStateParamValid,
  readPreviewStateParam,
  syncPreviewStateParam,
} from "@prototype/lib/prototypes/prototype-preview-state-url";
import { useLayoutEffect, useRef } from "react";

type UseSyncPrototypePreviewStateToUrlOptions = {
  enabled?: boolean;
  validStateIds?: readonly string[];
};

/**
 * Keeps the current preview state in the URL as `?state=<id>`.
 * Hydrates once on mount; syncs on every previewStateId change.
 */
export function useSyncPrototypePreviewStateToUrl<TStateId extends string = string>(
  previewStateId: TStateId,
  onPreviewStateChange: (stateId: TStateId) => void,
  options?: UseSyncPrototypePreviewStateToUrlOptions,
): void {
  const enabled = options?.enabled ?? true;
  const validStateIds = options?.validStateIds;
  const onPreviewStateChangeRef = useRef(onPreviewStateChange);
  const hasHydratedFromUrlRef = useRef(false);

  onPreviewStateChangeRef.current = onPreviewStateChange;

  useLayoutEffect(() => {
    if (!enabled || hasHydratedFromUrlRef.current) return;
    hasHydratedFromUrlRef.current = true;

    const stateId = readPreviewStateParam(new URLSearchParams(window.location.search));
    if (!stateId || !isPreviewStateParamValid(stateId, validStateIds)) return;

    onPreviewStateChangeRef.current(stateId as TStateId);
  }, [enabled, validStateIds]);

  useLayoutEffect(() => {
    if (!enabled) return;
    syncPreviewStateParam(previewStateId);
  }, [enabled, previewStateId]);
}
