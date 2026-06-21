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
import { X } from "lucide-react";

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
            Map prototype preview states once this prototype defines them.
          </p>
        </div>
        <Link
          href={backHref}
          className={styles.closeButton}
          aria-label="Back to prototype"
        >
          <X size={16} strokeWidth={2} />
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-6">
        <EmptyState className="max-w-md text-center">
          No states mapped yet. Add a state canvas config and register this route
          in `prototype.config.ts`, or follow the example-feature reference in
          AGENTS.md.
        </EmptyState>
      </div>
    </div>
  );
}
