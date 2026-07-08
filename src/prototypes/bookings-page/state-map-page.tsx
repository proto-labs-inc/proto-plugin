"use client";

import {
  PrototypeStateCanvasRegistrar,
  PrototypeStateCanvasView,
} from "proto-plugin";
import { buildPrototypeTargetId } from "proto-plugin";
import {
  encodeShareState,
  SHARE_STATE_PARAM,
  SHARE_TARGET_PARAM,
} from "proto-plugin";
import {
  getDefaultPrototypeStateMapPath,
  parseStateMapReturnTo,
} from "proto-plugin";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { buildBookingsPageStateCanvasConfig } from "./_components/bookings-page-state-canvas-config";
import {
  createLiveStateForPreview,
  type BookingsPagePreviewStateId,
} from "./_components/bookings-page-preview-states";

const BOOKINGS_PAGE_SLUG = "bookings-page";

export default function BookingsPageStateMapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pagePath = getDefaultPrototypeStateMapPath(BOOKINGS_PAGE_SLUG);
  const prototypePath = `/prototypes/${BOOKINGS_PAGE_SLUG}`;
  const backHref = useMemo(() => {
    const returnTo = parseStateMapReturnTo(searchParams);
    if (returnTo) return returnTo;
    return prototypePath;
  }, [prototypePath, searchParams]);

  const handleStateSelect = useCallback(
    (stateId: BookingsPagePreviewStateId) => {
      const url = new URL(backHref, window.location.origin);
      url.searchParams.set(
        SHARE_TARGET_PARAM,
        buildPrototypeTargetId(BOOKINGS_PAGE_SLUG, "page"),
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
    () => buildBookingsPageStateCanvasConfig(handleStateSelect),
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
