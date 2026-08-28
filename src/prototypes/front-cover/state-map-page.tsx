"use client";

import {
  PREVIEW_STATE_PARAM,
  PrototypeComponent,
  PrototypeStateCanvasRegistrar,
  PrototypeStateCanvasView,
  getDefaultPrototypeStateMapPath,
  parseStateMapReturnTo,
} from "proto-plugin";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { buildFrontCoverStateCanvasConfig } from "./_components/front-cover-state-canvas-config";
import type { FrontCoverPreviewStateId } from "./_components/front-cover-types";

const FRONT_COVER_SLUG = "front-cover";

export default function FrontCoverStateMapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pagePath = getDefaultPrototypeStateMapPath(FRONT_COVER_SLUG);
  const prototypePath = `/prototypes/${FRONT_COVER_SLUG}`;
  const backHref = useMemo(() => {
    const returnTo = parseStateMapReturnTo(searchParams);
    if (returnTo) return returnTo;
    return prototypePath;
  }, [prototypePath, searchParams]);

  const handleStateSelect = useCallback(
    (previewStateId: FrontCoverPreviewStateId) => {
      const url = new URL(backHref, window.location.origin);
      url.searchParams.set(PREVIEW_STATE_PARAM, previewStateId);
      router.push(`${url.pathname}${url.search}`);
    },
    [backHref, router],
  );

  const config = useMemo(
    () => buildFrontCoverStateCanvasConfig(handleStateSelect),
    [handleStateSelect],
  );

  return (
    <PrototypeComponent id="page">
      <PrototypeStateCanvasRegistrar pagePath={pagePath} />
      <PrototypeStateCanvasView config={config} layout="page" backHref={backHref} />
    </PrototypeComponent>
  );
}
