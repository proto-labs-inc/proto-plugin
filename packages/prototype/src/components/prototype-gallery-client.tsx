"use client";

import { PrototypeCreatePrototypeModal } from "@prototype/components/prototypes/prototype-create-prototype-modal";
import { PROTOTYPE_GALLERY_GRID_GAP_CLASS } from "@prototype/components/shell/prototype-gallery-shell";
import type { PrototypeMetadata } from "@prototype/lib/prototypes/prototype-config-types";
import { screenshotSrc } from "@prototype/lib/prototypes/screenshot-src";
import { cn } from "@prototype/lib/utils";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type PrototypeGalleryClientProps = {
  prototypes: PrototypeMetadata[];
  screenshotVersions: Record<string, number>;
  sourcePath?: string;
};

const prototypeGalleryTitleClassName =
  "mt-2 text-sm text-[var(--tool-chrome-text-muted)] transition-colors duration-300 ease-out group-hover:text-[var(--tool-chrome-text-heading)]";

function PrototypeGalleryAddCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="New prototype"
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
      <p className={cn(prototypeGalleryTitleClassName, "invisible")} aria-hidden>
        &nbsp;
      </p>
    </button>
  );
}

export function PrototypeGalleryClient({
  prototypes,
  screenshotVersions,
  sourcePath,
}: PrototypeGalleryClientProps) {
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
        <PrototypeGalleryAddCard onClick={() => setCreateModalOpen(true)} />
        {prototypes.map((prototype) => (
          <Link
            key={prototype.slug}
            href={`/prototypes/${prototype.slug}`}
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
                    prototype.screenshot,
                    screenshotVersions[prototype.slug],
                  )}
                  alt={prototype.title}
                  width={1600}
                  height={900}
                  quality={90}
                  sizes="(min-width: 80rem) calc((100vw - 14rem) / 3), (min-width: 55rem) calc((100vw - 14rem) / 2), 100vw"
                  className="h-full w-full object-cover object-top"
                />
              </div>
            </div>
            <p className={prototypeGalleryTitleClassName}>{prototype.title}</p>
          </Link>
        ))}
        </div>
      </div>

      <PrototypeCreatePrototypeModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        sourcePath={sourcePath}
      />
    </>
  );
}
