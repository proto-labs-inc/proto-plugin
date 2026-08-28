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

import { buildSupabaseHomePageStateCanvasConfig } from "./_components/supabase-home-page-state-canvas-config";
import type { SupabaseHomePagePreviewStateId } from "./_components/supabase-home-page-types";

const SUPABASE_HOME_PAGE_SLUG = "supabase-home-page";

export default function SupabaseHomePageStateMapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pagePath = getDefaultPrototypeStateMapPath(SUPABASE_HOME_PAGE_SLUG);
  const prototypePath = `/prototypes/${SUPABASE_HOME_PAGE_SLUG}`;
  const backHref = useMemo(() => {
    const returnTo = parseStateMapReturnTo(searchParams);
    if (returnTo) return returnTo;
    return prototypePath;
  }, [prototypePath, searchParams]);

  const handleStateSelect = useCallback(
    (previewStateId: SupabaseHomePagePreviewStateId) => {
      const url = new URL(backHref, window.location.origin);
      url.searchParams.set(PREVIEW_STATE_PARAM, previewStateId);
      router.push(`${url.pathname}${url.search}`);
    },
    [backHref, router],
  );

  const config = useMemo(
    () => buildSupabaseHomePageStateCanvasConfig(handleStateSelect),
    [handleStateSelect],
  );

  return (
    <PrototypeComponent id="page">
      <PrototypeStateCanvasRegistrar pagePath={pagePath} />
      <PrototypeStateCanvasView config={config} layout="page" backHref={backHref} />
    </PrototypeComponent>
  );
}
