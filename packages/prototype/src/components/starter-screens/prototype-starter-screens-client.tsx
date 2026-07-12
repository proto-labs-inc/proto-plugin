"use client";

import { PrototypeCreateStarterScreenModal } from "@prototype/components/starter-screens/prototype-create-starter-screen-modal";
import { PROTOTYPE_GALLERY_GRID_GAP_CLASS } from "@prototype/components/shell/prototype-gallery-shell";
import type { StarterScreenMetadata } from "@prototype/lib/prototypes/starter-screen-config-types";
import { screenshotSrc } from "@prototype/lib/prototypes/screenshot-src";
import { cn } from "@prototype/lib/utils";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type PrototypeStarterScreensClientProps = {
  starterScreens: StarterScreenMetadata[];
  screenshotVersions?: Record<string, number>;
  starterScreensPagePath?: string;
  sourcePath?: string;
};

const starterScreenTitleClassName =
  "mt-2 text-sm text-[var(--tool-chrome-text-muted)] transition-colors duration-300 ease-out group-hover:text-[var(--tool-chrome-text-heading)]";

function PrototypeStarterScreensAddCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="New starter screen"
      className="group block w-full cursor-pointer text-left"
    >
      <div
        className={cn(
          "rounded-[var(--tool-review-card-radius)]",
          "shadow-[var(--tool-review-card-shadow)]",
          "translate-y-0 transition-[translate,box-shadow] duration-300 ease-out will-change-[translate]",
          "group-hover:-translate-y-1 group-hover:shadow-[var(--tool-review-card-shadow-hover)]",
        )}
      >
        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-[var(--tool-review-card-radius)] border border-dashed border-[var(--tool-chrome-border)] bg-[var(--tool-chrome-surface)] text-[var(--tool-chrome-text-muted)] transition-colors duration-300 ease-out group-hover:text-[var(--tool-chrome-text-heading)]">
          <Plus size={20} strokeWidth={2} aria-hidden />
        </div>
      </div>
      <p
        className="mt-2 text-sm text-[var(--tool-chrome-text-muted)] transition-colors duration-300 ease-out group-hover:text-[var(--tool-chrome-text-heading)] invisible"
        aria-hidden
      >
        &nbsp;
      </p>
    </button>
  );
}

export function PrototypeStarterScreensClient({
  starterScreens,
  screenshotVersions = {},
  starterScreensPagePath,
  sourcePath,
}: PrototypeStarterScreensClientProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <>
      <div className="@container/gallery w-full">
        <div
          className={cn(
            "grid grid-cols-1 @xl/gallery:grid-cols-2 @4xl/gallery:grid-cols-3",
            PROTOTYPE_GALLERY_GRID_GAP_CLASS,
          )}
        >
          <PrototypeStarterScreensAddCard onClick={() => setCreateModalOpen(true)} />
          {starterScreens.map((screen) => (
            <Link
              key={screen.slug}
              href={`/starter-screens/${screen.slug}`}
              className="group"
            >
              <div
                className={cn(
                  "rounded-[var(--tool-review-card-radius)]",
                  "shadow-[var(--tool-review-card-shadow)]",
                  "translate-y-0 transition-[translate,box-shadow] duration-300 ease-out will-change-[translate]",
                  "group-hover:-translate-y-1 group-hover:shadow-[var(--tool-review-card-shadow-hover)]",
                )}
              >
                <div className="relative aspect-video overflow-hidden rounded-[var(--tool-review-card-radius)] border border-[var(--tool-chrome-border)] bg-[var(--tool-chrome-surface)]">
                  <Image
                    src={screenshotSrc(
                      screen.screenshot,
                      screenshotVersions[screen.slug],
                    )}
                    alt={screen.title}
                    width={1600}
                    height={900}
                    quality={90}
                    sizes="(min-width: 80rem) calc((100vw - 14rem) / 3), (min-width: 55rem) calc((100vw - 14rem) / 2), 100vw"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              </div>
              <p className={starterScreenTitleClassName}>{screen.title}</p>
            </Link>
          ))}
        </div>
      </div>

      <PrototypeCreateStarterScreenModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        starterScreensPagePath={starterScreensPagePath}
        sourcePath={sourcePath}
      />
    </>
  );
}
