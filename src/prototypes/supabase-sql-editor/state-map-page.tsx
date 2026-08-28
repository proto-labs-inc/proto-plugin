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

import { buildSupabaseSqlEditorStateCanvasConfig } from "./_components/supabase-sql-editor-state-canvas-config";
import type { SupabaseSqlEditorPreviewStateId } from "./_components/supabase-sql-editor-types";

const SUPABASE_SQL_EDITOR_SLUG = "supabase-sql-editor";

export default function SupabaseSqlEditorStateMapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pagePath = getDefaultPrototypeStateMapPath(SUPABASE_SQL_EDITOR_SLUG);
  const prototypePath = `/prototypes/${SUPABASE_SQL_EDITOR_SLUG}`;
  const backHref = useMemo(() => {
    const returnTo = parseStateMapReturnTo(searchParams);
    if (returnTo) return returnTo;
    return prototypePath;
  }, [prototypePath, searchParams]);

  const handleStateSelect = useCallback(
    (previewStateId: SupabaseSqlEditorPreviewStateId) => {
      const url = new URL(backHref, window.location.origin);
      url.searchParams.set(PREVIEW_STATE_PARAM, previewStateId);
      router.push(`${url.pathname}${url.search}`);
    },
    [backHref, router],
  );

  const config = useMemo(
    () => buildSupabaseSqlEditorStateCanvasConfig(handleStateSelect),
    [handleStateSelect],
  );

  return (
    <PrototypeComponent id="page">
      <PrototypeStateCanvasRegistrar pagePath={pagePath} />
      <PrototypeStateCanvasView config={config} layout="page" backHref={backHref} />
    </PrototypeComponent>
  );
}
