"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { Button } from "@prototype/components/ui/button";
import { getPrototypePortalContainer } from "@prototype/lib/tool-portal";
import { cn } from "@prototype/lib/utils";
import type { MobbinReference } from "@prototype/lib/prototypes/design-exploration-types";
import { ChevronLeft, ChevronRight, ExternalLink, X, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** Above prototype preview + design brief dialog (z-50), below review chrome (1050). */
const MOBBIN_LIGHTBOX_Z_INDEX = 1040;

const GALLERY_SECTION_TITLE_CLASS = "tool-chip tool-chip-pink";

const GALLERY_SECTION_DESC_CLASS = "tool-body max-w-2xl";

const GALLERY_CARD_TITLE_CLASS = "text-sm font-medium text-foreground";

const GALLERY_CARD_BODY_CLASS = "tool-body";

type PrototypeMobbinGalleryLayout = "default" | "sidebar";

type PrototypeMobbinGalleryProps = {
  componentIdPrefix: string;
  galleryId: string;
  references: MobbinReference[];
  title?: string;
  description?: string;
  imagePathForReference?: (id: string) => string;
  layout?: PrototypeMobbinGalleryLayout;
};

function resolveReferenceImageUrl(
  reference: MobbinReference,
  imagePathForReference?: (id: string) => string,
) {
  return imagePathForReference?.(reference.id) ?? reference.imageUrl;
}

function MobbinReferenceCard({
  reference,
  imageUrl,
  componentId,
  onOpen,
  compact = false,
}: {
  reference: MobbinReference;
  imageUrl: string;
  componentId: string;
  onOpen: () => void;
  compact?: boolean;
}) {
  const cardTitleClass = compact
    ? "text-sm text-foreground font-medium"
    : GALLERY_CARD_TITLE_CLASS;
  const cardBodyClass = compact
    ? "text-sm text-muted-foreground leading-relaxed"
    : GALLERY_CARD_BODY_CLASS;

  return (
    <PrototypeComponent id={componentId} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-0.5">
        <p className={cardTitleClass}>{reference.appName}</p>
        {reference.variantHint ? (
          <span className="text-sm text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-[13px]">
            {reference.variantHint}
          </span>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "bg-card ring-border group relative block w-full cursor-zoom-in overflow-hidden rounded-xl text-left shadow-lg ring-[0.5px]",
          "focus-visible:ring-border focus-visible:outline-none focus-visible:ring-2",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Mobbin CDN URLs are ephemeral; local assets preferred when available. */}
        <img
          src={imageUrl}
          alt={`${reference.appName} reference on Mobbin`}
          className="aspect-[16/10] w-full object-cover object-top transition-opacity duration-200 ease group-hover:opacity-90"
          loading="lazy"
        />
        <span className="bg-background/90 text-muted-foreground text-sm absolute right-2 top-2 inline-flex items-center gap-1 rounded-md px-2 py-1 opacity-0 backdrop-blur-sm transition-opacity duration-200 ease group-hover:opacity-100">
          <ZoomIn className="size-3" />
          View larger
        </span>
      </button>

      <div className="px-0.5">
        <p className={cardBodyClass}>{reference.relevance}</p>
      </div>
    </PrototypeComponent>
  );
}

function MobbinReferenceLightbox({
  references,
  imageUrls,
  activeIndex,
  onClose,
  onNavigate,
  galleryId,
}: {
  references: MobbinReference[];
  imageUrls: string[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  galleryId: string;
}) {
  const reference = references[activeIndex];
  const imageUrl = imageUrls[activeIndex];
  const total = references.length;
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < total - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(activeIndex - 1);
  }, [activeIndex, hasPrev, onNavigate]);

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(activeIndex + 1);
  }, [activeIndex, hasNext, onNavigate]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft") {
        goPrev();
      } else if (event.key === "ArrowRight") {
        goNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, onClose]);

  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(getPrototypePortalContainer() ?? null);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const lightbox = (
    <PrototypeComponent
      id={`${galleryId}.lightbox`}
      className="fixed inset-0 flex items-center justify-center p-4 sm:p-8"
      style={{ zIndex: MOBBIN_LIGHTBOX_Z_INDEX }}
      role="dialog"
      aria-modal="true"
      aria-label={`${reference.appName} Mobbin reference`}
      data-mobbin-lightbox-open=""
    >
      <button
        type="button"
        aria-label="Close lightbox"
        className="bg-muted/70 absolute inset-0 backdrop-blur-[6px] transition-opacity duration-200 ease-(--ease-out-cubic) motion-reduce:transition-none"
        onClick={onClose}
      />

      <div className="pointer-events-none relative z-10 flex max-h-full w-full max-w-6xl flex-col gap-4">
        <div className="pointer-events-auto flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {activeIndex + 1} of {total}
          </p>
          <PrototypeComponent id={`${galleryId}.lightbox.close`}>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label="Close"
              onClick={onClose}
            >
              <X />
            </Button>
          </PrototypeComponent>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center">
          {hasPrev ? (
            <PrototypeComponent
              id={`${galleryId}.lightbox.prev`}
              className="pointer-events-auto absolute left-0 z-10 -translate-x-1/2 sm:-translate-x-full sm:pr-3"
            >
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Previous reference"
                onClick={goPrev}
              >
                <ChevronLeft />
              </Button>
            </PrototypeComponent>
          ) : null}

          <div className="bg-card ring-border pointer-events-auto max-h-[min(75vh,900px)] w-full overflow-hidden rounded-xl shadow-lg ring-[0.5px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- Mobbin CDN URLs are ephemeral; local assets preferred when available. */}
            <img
              src={imageUrl}
              alt={`${reference.appName} reference on Mobbin`}
              className="max-h-[min(75vh,900px)] w-full object-contain object-top"
            />
          </div>

          {hasNext ? (
            <PrototypeComponent
              id={`${galleryId}.lightbox.next`}
              className="pointer-events-auto absolute right-0 z-10 translate-x-1/2 sm:translate-x-full sm:pl-3"
            >
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Next reference"
                onClick={goNext}
              >
                <ChevronRight />
              </Button>
            </PrototypeComponent>
          ) : null}
        </div>

        <div className="bg-card/95 ring-border pointer-events-auto rounded-xl px-4 py-3 shadow-lg ring-[0.5px] backdrop-blur-sm sm:px-5 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className={GALLERY_CARD_TITLE_CLASS}>{reference.appName}</p>
                {reference.variantHint ? (
                  <span className="text-sm text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                    {reference.variantHint}
                  </span>
                ) : null}
              </div>
              <p className={GALLERY_CARD_BODY_CLASS}>{reference.relevance}</p>
            </div>
            <a
              href={reference.mobbinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                GALLERY_CARD_BODY_CLASS,
                "hover:text-foreground inline-flex shrink-0 items-center gap-1.5 transition-colors duration-200 ease",
              )}
            >
              View on Mobbin
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </PrototypeComponent>
  );

  if (!portalTarget) return null;

  return createPortal(lightbox, portalTarget);
}

export function PrototypeMobbinGallery({
  componentIdPrefix,
  galleryId,
  references,
  title = "Mobbin references",
  description = "Reference screens from B2B and developer dashboards.",
  imagePathForReference,
  layout = "default",
}: PrototypeMobbinGalleryProps) {
  const isSidebar = layout === "sidebar";
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const imageUrls = references.map((reference) =>
    resolveReferenceImageUrl(reference, imagePathForReference),
  );

  const sectionTitleClass = isSidebar
    ? "text-xs font-medium text-muted-foreground uppercase tracking-wide"
    : GALLERY_SECTION_TITLE_CLASS;
  const sectionDescClass = isSidebar
    ? "text-sm text-muted-foreground leading-relaxed"
    : GALLERY_SECTION_DESC_CLASS;

  return (
    <PrototypeComponent id={galleryId}>
      <PrototypeComponent
        id={`${componentIdPrefix}.mobbin-references`}
        className={cn(
          isSidebar
            ? "flex flex-col gap-3"
            : "border-border border-t px-6 py-8",
        )}
      >
        <div className={cn("flex flex-col gap-2", !isSidebar && "mb-6")}>
          <p className={sectionTitleClass}>{title}</p>
          {!isSidebar && <p className={sectionDescClass}>{description}</p>}
        </div>

        <div
          className={cn(
            "grid grid-cols-1",
            isSidebar ? "gap-4" : "gap-10",
            !isSidebar &&
              references.length > 1 &&
              "lg:grid-cols-2 lg:gap-x-8 lg:gap-y-12",
          )}
        >
          {references.map((reference, index) => (
            <MobbinReferenceCard
              key={reference.id}
              reference={reference}
              imageUrl={imageUrls[index]}
              componentId={`${componentIdPrefix}.mobbin-reference.${reference.id}`}
              onOpen={() => setActiveIndex(index)}
              compact={isSidebar}
            />
          ))}
        </div>
      </PrototypeComponent>

      {activeIndex !== null ? (
        <MobbinReferenceLightbox
          references={references}
          imageUrls={imageUrls}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={setActiveIndex}
          galleryId={galleryId}
        />
      ) : null}
    </PrototypeComponent>
  );
}
