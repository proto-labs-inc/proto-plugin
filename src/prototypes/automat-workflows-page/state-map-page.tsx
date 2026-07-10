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

import { buildAutomatWorkflowsPageStateCanvasConfig } from "./_components/automat-workflows-page-state-canvas-config";
import {
  createLiveStateForPreview,
  type AutomatWorkflowsPagePreviewStateId,
} from "./_components/automat-workflows-page-preview-states";

const AUTOMAT_WORKFLOWS_PAGE_SLUG = "automat-workflows-page";

export default function AutomatWorkflowsPageStateMapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pagePath = getDefaultPrototypeStateMapPath(AUTOMAT_WORKFLOWS_PAGE_SLUG);
  const prototypePath = `/prototypes/${AUTOMAT_WORKFLOWS_PAGE_SLUG}`;
  const backHref = useMemo(() => {
    const returnTo = parseStateMapReturnTo(searchParams);
    if (returnTo) return returnTo;
    return prototypePath;
  }, [prototypePath, searchParams]);

  const handleStateSelect = useCallback(
    (stateId: AutomatWorkflowsPagePreviewStateId) => {
      const url = new URL(backHref, window.location.origin);
      url.searchParams.set(
        SHARE_TARGET_PARAM,
        buildPrototypeTargetId(AUTOMAT_WORKFLOWS_PAGE_SLUG, "page"),
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
    () => buildAutomatWorkflowsPageStateCanvasConfig(handleStateSelect),
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
