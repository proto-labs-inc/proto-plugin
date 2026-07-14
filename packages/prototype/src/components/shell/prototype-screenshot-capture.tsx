"use client";

import { capturePrototypeViewportPng } from "@prototype/lib/prototypes/capture-prototype-viewport";
import { useEffect } from "react";

type PrototypeScreenshotCaptureProps = {
  slug: string;
};

export function PrototypeScreenshotCapture({
  slug,
}: PrototypeScreenshotCaptureProps) {
  useEffect(() => {
    let cancelled = false;

    const capture = async () => {
      const dataUrl = await capturePrototypeViewportPng();
      if (cancelled || !dataUrl) return;

      try {
        const response = await fetch(`/api/prototypes/${slug}/screenshot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: dataUrl }),
        });

        if (!response.ok) {
          throw new Error("Failed to save screenshot");
        }
      } catch (error) {
        console.warn("[prototype-screenshot]", error);
      }
    };

    void capture();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return null;
}
