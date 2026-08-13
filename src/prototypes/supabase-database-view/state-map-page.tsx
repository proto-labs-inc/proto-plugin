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

import { buildSupabaseDatabaseViewStateCanvasConfig } from "./_components/supabase-database-view-state-canvas-config";
import type { SupabaseDatabaseViewPreviewStateId } from "./_components/supabase-database-view-types";

const SUPABASE_DATABASE_VIEW_SLUG = "supabase-database-view";

export default function SupabaseDatabaseViewStateMapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pagePath = getDefaultPrototypeStateMapPath(SUPABASE_DATABASE_VIEW_SLUG);
  const prototypePath = `/prototypes/${SUPABASE_DATABASE_VIEW_SLUG}`;
  const backHref = useMemo(() => {
    const returnTo = parseStateMapReturnTo(searchParams);
    if (returnTo) return returnTo;
    return prototypePath;
  }, [prototypePath, searchParams]);

  const handleStateSelect = useCallback(
    (previewStateId: SupabaseDatabaseViewPreviewStateId) => {
      const url = new URL(backHref, window.location.origin);
      url.searchParams.set(PREVIEW_STATE_PARAM, previewStateId);
      router.push(`${url.pathname}${url.search}`);
    },
    [backHref, router],
  );

  const config = useMemo(
    () => buildSupabaseDatabaseViewStateCanvasConfig(handleStateSelect),
    [handleStateSelect],
  );

  return (
    <PrototypeComponent id="page">
      <PrototypeStateCanvasRegistrar pagePath={pagePath} />
      <PrototypeStateCanvasView config={config} layout="page" backHref={backHref} />
    </PrototypeComponent>
  );
}
