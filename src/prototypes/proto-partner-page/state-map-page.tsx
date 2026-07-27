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

import { buildProtoPartnerPageStateCanvasConfig } from "./_components/proto-partner-page-state-canvas-config";
import {
  pageIdForPreviewState,
  type ProtoPartnerPagePreviewStateId,
} from "./_components/proto-partner-page-preview-states";
import {
  getPartnerPagePath,
  PARTNER_PAGE_PROTOTYPE_SLUG,
} from "./partner-page-routes";

export default function ProtoPartnerPageStateMapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pagePath = getDefaultPrototypeStateMapPath(PARTNER_PAGE_PROTOTYPE_SLUG);
  const prototypePath = `/prototypes/${PARTNER_PAGE_PROTOTYPE_SLUG}`;
  const backHref = useMemo(() => {
    const returnTo = parseStateMapReturnTo(searchParams);
    if (returnTo) return returnTo;
    return prototypePath;
  }, [prototypePath, searchParams]);

  const handleStateSelect = useCallback(
    (previewStateId: ProtoPartnerPagePreviewStateId) => {
      const path = getPartnerPagePath(pageIdForPreviewState(previewStateId));
      const url = new URL(path, window.location.origin);
      url.searchParams.set(PREVIEW_STATE_PARAM, previewStateId);
      router.push(`${url.pathname}${url.search}`);
    },
    [router],
  );

  const config = useMemo(
    () => buildProtoPartnerPageStateCanvasConfig(handleStateSelect),
    [handleStateSelect],
  );

  return (
    <PrototypeComponent id="page">
      <PrototypeStateCanvasRegistrar pagePath={pagePath} />
      <PrototypeStateCanvasView
        config={config}
        layout="page"
        backHref={backHref}
      />
    </PrototypeComponent>
  );
}
