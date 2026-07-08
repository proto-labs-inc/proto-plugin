"use client";

import {
  buildPrototypeTargetId,
  encodeShareState,
  getDefaultPrototypeStateMapPath,
  parseStateMapReturnTo,
  PrototypeStateCanvasRegistrar,
  PrototypeStateCanvasView,
  SHARE_STATE_PARAM,
  SHARE_TARGET_PARAM,
} from "proto-plugin";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { buildEventTypesStateCanvasConfig } from "./_components/event-types-state-canvas-config";
import {
  createLiveStateForPreview,
  type EventTypesPreviewStateId,
} from "./_components/event-types-preview-states";

const EVENT_TYPES_SLUG = "event-types";

export default function EventTypesStateMapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pagePath = getDefaultPrototypeStateMapPath(EVENT_TYPES_SLUG);
  const prototypePath = `/prototypes/${EVENT_TYPES_SLUG}`;
  const backHref = useMemo(() => {
    const returnTo = parseStateMapReturnTo(searchParams);
    if (returnTo) return returnTo;
    return prototypePath;
  }, [prototypePath, searchParams]);

  const handleStateSelect = useCallback(
    (stateId: EventTypesPreviewStateId) => {
      const url = new URL(backHref, window.location.origin);
      url.searchParams.set(
        SHARE_TARGET_PARAM,
        buildPrototypeTargetId(EVENT_TYPES_SLUG, "page"),
      );
      url.searchParams.set(
        SHARE_STATE_PARAM,
        encodeShareState(createLiveStateForPreview(stateId)),
      );
      router.push(`${url.pathname}${url.search}`);
    },
    [backHref, router],
  );

  const config = useMemo(
    () => buildEventTypesStateCanvasConfig(handleStateSelect),
    [handleStateSelect],
  );

  return (
    <>
      <PrototypeStateCanvasRegistrar pagePath={pagePath} />
      <PrototypeStateCanvasView
        config={config}
        layout="page"
        backHref={backHref}
      />
    </>
  );
}
