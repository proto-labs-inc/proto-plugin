"use client";

import { useCallback, useEffect, useState } from "react";

import {
  PROTOTYPE_STATE_SCREENSHOT_CAPTURED_EVENT,
  type PrototypeStateScreenshotCapturedDetail,
  stateScreenshotManifestKey,
  stateScreenshotSrc,
} from "./prototype-state-screenshot";

const MANIFEST_PATH = "/prototypes/screenshots/manifest.json";

type ScreenshotManifest = Record<string, number>;

async function readClientScreenshotManifest(): Promise<ScreenshotManifest> {
  try {
    const response = await fetch(MANIFEST_PATH, { cache: "no-store" });
    if (!response.ok) return {};
    return (await response.json()) as ScreenshotManifest;
  } catch {
    return {};
  }
}

export function usePrototypeStateScreenshotSrc(
  slug: string,
  stateId: string,
): string {
  const manifestKey = stateScreenshotManifestKey(slug, stateId);
  const [version, setVersion] = useState<number | undefined>(undefined);

  const syncVersion = useCallback(
    (manifest: ScreenshotManifest) => {
      const nextVersion = manifest[manifestKey];
      setVersion(nextVersion);
    },
    [manifestKey],
  );

  useEffect(() => {
    let cancelled = false;

    void readClientScreenshotManifest().then((manifest) => {
      if (!cancelled) syncVersion(manifest);
    });

    const handleCaptured = (event: Event) => {
      const detail = (event as CustomEvent<PrototypeStateScreenshotCapturedDetail>)
        .detail;
      if (detail.slug !== slug || detail.stateId !== stateId) return;
      setVersion(detail.version);
    };

    window.addEventListener(
      PROTOTYPE_STATE_SCREENSHOT_CAPTURED_EVENT,
      handleCaptured,
    );

    return () => {
      cancelled = true;
      window.removeEventListener(
        PROTOTYPE_STATE_SCREENSHOT_CAPTURED_EVENT,
        handleCaptured,
      );
    };
  }, [slug, stateId, syncVersion]);

  return stateScreenshotSrc(slug, stateId, version);
}
