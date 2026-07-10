"use client";

import { EmptyState } from "@prototype/components/platform-ui/empty-state";
import { PrototypeStateCanvasRegistrar } from "@prototype/components/prototypes/prototype-state-canvas";
import {
  getDefaultPrototypeStateMapPath,
  parseStateMapReturnTo,
} from "@prototype/lib/prototypes/prototype-state-canvas-types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Minimize2 } from "lucide-react";

import { PrototypeStateMapAddStateButton } from "@prototype/components/prototypes/prototype-state-map-add-state-button";
import styles from "./prototype-state-canvas-overlay.module.scss";

type PrototypeDefaultStateMapPageProps = {
  slug: string;
};

export function PrototypeDefaultStateMapPage({
  slug,
}: PrototypeDefaultStateMapPageProps) {
  const searchParams = useSearchParams();
  const pagePath = getDefaultPrototypeStateMapPath(slug);
  const prototypePath = `/prototypes/${slug}`;

  const backHref = useMemo(() => {
    const returnTo = parseStateMapReturnTo(searchParams);
    if (returnTo) return returnTo;
    return prototypePath;
  }, [prototypePath, searchParams]);

  return (
    <div
      className={styles.page}
      data-prototype-state-canvas
      data-prototype-default-state-map
    >
      <PrototypeStateCanvasRegistrar pagePath={pagePath} />

      <div className={styles.header}>
        <div>
          <p className={styles.headerTitle}>State map</p>
          <p className={styles.headerHint}>
            Preview states appear here once this prototype defines a state map.
          </p>
        </div>
        <div className={styles.headerActions}>
          <PrototypeStateMapAddStateButton />
          <Link
            href={backHref}
            className={styles.closeButton}
            aria-label="Back to prototype"
          >
            <Minimize2 size={16} strokeWidth={2} />
          </Link>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6">
        <EmptyState className="max-w-md text-center">
          No preview states yet. When this prototype adds a `*-preview-states.ts`
          registry, wire a state map page per AGENTS.md — until then this map stays
          empty.
        </EmptyState>
      </div>
    </div>
  );
}
