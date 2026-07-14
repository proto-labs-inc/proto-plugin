"use client";

import {
  PREVIEW_STATE_PARAM,
  PrototypeComponent,
  PrototypeStateCanvasRegistrar,
  PrototypeStateCanvasView,
  getDefaultPrototypeStateMapPath,
  parseStateMapReturnTo,
} from "proto";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { buildAutomatWorkflowsPageStateCanvasConfig } from "./_components/automat-workflows-page-state-canvas-config";
import type { AutomatWorkflowsPagePreviewStateId } from "./_components/automat-workflows-page-preview-states";

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
      url.searchParams.set(PREVIEW_STATE_PARAM, stateId);
      router.push(`${url.pathname}${url.search}`);
    },
    [backHref, router],
  );

  const config = useMemo(
    () => buildAutomatWorkflowsPageStateCanvasConfig(handleStateSelect),
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
