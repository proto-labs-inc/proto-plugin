"use client";

import { getStateScreenshotThumbSize } from "@prototype/lib/prototypes/prototype-state-canvas-constants";
import { usePrototypeStateScreenshotSrc } from "@prototype/lib/prototypes/use-prototype-state-screenshot-src";
import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@prototype/lib/utils";

const THUMB_SIZE = getStateScreenshotThumbSize();

type PrototypeStateScreenshotPreviewProps = {
  slug: string;
  stateId: string;
  fallback: ReactNode;
  className?: string;
};

export function PrototypeStateScreenshotPreview({
  slug,
  stateId,
  fallback,
  className,
}: PrototypeStateScreenshotPreviewProps) {
  const src = usePrototypeStateScreenshotSrc(slug, stateId);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden
      width={THUMB_SIZE.width}
      height={THUMB_SIZE.height}
      decoding="sync"
      className={cn("block h-full w-full object-cover object-top", className)}
      onError={() => setFailed(true)}
    />
  );
}
