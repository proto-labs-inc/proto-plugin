"use client";

import { useEffect } from "react";

import { capturePrototypeViewportPng } from "@prototype/lib/prototypes/capture-prototype-viewport";
import { createStateScreenshotThumbnail } from "@prototype/lib/prototypes/create-state-screenshot-thumbnail";
import { getStateScreenshotThumbSize } from "@prototype/lib/prototypes/prototype-state-canvas-constants";
import { dispatchPrototypeStateScreenshotCaptured } from "@prototype/lib/prototypes/prototype-state-screenshot";

const CAPTURE_DELAY_MS = 700;

type PrototypeStateScreenshotCaptureProps = {
  slug: string;
  stateId: string | null;
  enabled?: boolean;
};

export function PrototypeStateScreenshotCapture({
  slug,
  stateId,
  enabled = true,
}: PrototypeStateScreenshotCaptureProps) {
  useEffect(() => {
    if (!enabled || !stateId) return;

    let cancelled = false;

    const capture = async () => {
      const dataUrl = await capturePrototypeViewportPng(CAPTURE_DELAY_MS);
      if (cancelled || !dataUrl) return;

      const { width, height } = getStateScreenshotThumbSize();
      const thumbnail =
        (await createStateScreenshotThumbnail(dataUrl, width, height)) ?? dataUrl;

      try {
        const response = await fetch(`/api/prototypes/${slug}/screenshot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: thumbnail, stateId }),
        });

        if (!response.ok) {
          throw new Error("Failed to save state screenshot");
        }

        const payload = (await response.json()) as { version?: number };
        if (cancelled || payload.version == null) return;

        dispatchPrototypeStateScreenshotCaptured({
          slug,
          stateId,
          version: payload.version,
        });
      } catch (error) {
        console.warn("[prototype-state-screenshot]", error);
      }
    };

    void capture();

    return () => {
      cancelled = true;
    };
  }, [enabled, slug, stateId]);

  return null;
}
