"use client";

import { useEffect, useMemo, useState } from "react";

import type { VercelPreviewFromPr } from "../vercel-preview/parse-vercel-github-comment";

const DEFAULT_PREVIEW_API_PATH = "/api/pr-vercel-preview";

export function usePrVercelPreviews(
  prUrls: string[],
  previewApiPath = DEFAULT_PREVIEW_API_PATH,
) {
  const [previewCache, setPreviewCache] = useState(
    () => new Map<string, VercelPreviewFromPr>(),
  );
  const [previewLoading, setPreviewLoading] = useState(false);

  const prUrlsKey = useMemo(() => prUrls.join(","), [prUrls]);

  useEffect(() => {
    if (prUrls.length === 0) return;

    let cancelled = false;
    setPreviewLoading(true);

    const params = new URLSearchParams({
      prUrls: prUrls.join(","),
    });

    fetch(`${previewApiPath}?${params.toString()}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch Vercel previews.");
        }
        return response.json() as Promise<{
          previews: Array<{
            prUrl: string;
            preview: VercelPreviewFromPr | null;
          }>;
        }>;
      })
      .then((data) => {
        if (cancelled) return;
        const next = new Map<string, VercelPreviewFromPr>();
        for (const item of data.previews) {
          if (item.preview) {
            next.set(item.prUrl, item.preview);
          }
        }
        setPreviewCache(next);
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewCache(new Map());
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [prUrlsKey, previewApiPath, prUrls.length]);

  return { previewCache, previewLoading };
}
