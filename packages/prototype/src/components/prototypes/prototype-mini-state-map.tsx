"use client";

import { PrototypeStateCanvasView } from "@prototype/components/prototypes/prototype-state-canvas-overlay";
import { usePrototypeReview } from "@prototype/lib/prototypes/prototype-review-context";
import { getPrototypePreviewStage } from "@prototype/lib/tool-portal";
import { Maximize2, Minus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

import styles from "./prototype-mini-state-map.module.scss";

type PrototypeMiniStateMapProps = {
  stateMapHref: string;
  onMinimize: () => void;
};

function useOnStateMapPage(stateMapPagePath: string | null): boolean {
  const pathname = usePathname();

  if (stateMapPagePath != null) {
    return pathname.startsWith(stateMapPagePath);
  }

  return /\/prototypes\/[^/]+\/states\/?$/.test(pathname);
}

export function PrototypeMiniStateMap({
  stateMapHref,
  onMinimize,
}: PrototypeMiniStateMapProps) {
  const review = usePrototypeReview();
  const onStateMapPage = useOnStateMapPage(review.stateCanvasPagePath);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !review.hasStateCanvas || onStateMapPage) {
    return null;
  }

  const config = review.stateCanvasConfigRef.current;
  if (!config) return null;

  const portalTarget = getPrototypePreviewStage();
  if (!portalTarget) return null;

  return createPortal(
    <div className={styles.root} data-prototype-mini-state-map>
      <PrototypeStateCanvasView
        config={config}
        layout="mini"
        activeStateId={review.activePreviewStateId}
      />
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.actionButton}
          aria-label="Minimize state map"
          onClick={onMinimize}
        >
          <Minus size={11} strokeWidth={2} aria-hidden />
        </button>
        <Link
          href={stateMapHref}
          className={styles.actionButton}
          aria-label="Expand state map"
        >
          <Maximize2 size={11} strokeWidth={2} aria-hidden />
        </Link>
      </div>
    </div>,
    portalTarget,
  );
}
