"use client";

import { PrototypeProvider } from "@prototype/components/prototype-provider";
import { PrototypeGalleryNav } from "@prototype/components/shell/prototype-gallery-nav";
import { cn } from "@prototype/lib/utils";
import type { HTMLAttributes, ReactNode, RefObject } from "react";

/** Uniform gallery gutter — tile gaps match content inset on every side. */
export const PROTOTYPE_GALLERY_GRID_GAP_CLASS = "gap-6";
export const PROTOTYPE_GALLERY_CONTENT_INSET_CLASS = "p-6";
export const PROTOTYPE_GALLERY_HEADER_INSET_CLASS = "px-6 py-4";
export const PROTOTYPE_GALLERY_FOOTER_INSET_CLASS = "px-6 py-3";

type PrototypeGalleryShellProps = {
  children: ReactNode;
  footer?: ReactNode;
  sourceDirectoryName?: string;
  sourcePath?: string;
};

export function PrototypeGalleryShell({
  children,
  footer,
  sourceDirectoryName,
  sourcePath,
}: PrototypeGalleryShellProps) {
  return (
    <PrototypeProvider className="bg-[var(--bg-main)] flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      {footer ? (
        <div
          className={cn(
            "border-[var(--tool-chrome-border)] bg-[var(--bg-main)] flex shrink-0 items-center justify-end border-b",
            PROTOTYPE_GALLERY_FOOTER_INSET_CLASS,
          )}
        >
          {footer}
        </div>
      ) : null}

      <div className="flex h-full min-h-0 flex-1 overflow-hidden">
        <PrototypeGalleryNav
          sourceDirectoryName={sourceDirectoryName}
          sourcePath={sourcePath}
        />
        <main className="bg-[var(--bg-ground)] flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </PrototypeProvider>
  );
}

type PrototypeGalleryPageLayoutProps = {
  header: ReactNode;
  children: ReactNode;
  scrollClassName?: string;
  scrollContainerProps?: HTMLAttributes<HTMLDivElement> &
    Record<`data-${string}`, string>;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
  scrollOverlay?: ReactNode;
};

/** Gallery pages: header stays fixed; only body scrolls. */
export function PrototypeGalleryPageLayout({
  header,
  children,
  scrollClassName,
  scrollContainerProps,
  scrollContainerRef,
  scrollOverlay,
}: PrototypeGalleryPageLayoutProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {header}
      <div
        ref={scrollContainerRef}
        className={cn(
          "relative min-h-0 flex-1 overflow-y-auto overscroll-y-contain",
          scrollClassName ?? "bg-[var(--bg-ground)]",
        )}
        {...scrollContainerProps}
      >
        {scrollOverlay ? (
          <div className="pointer-events-none absolute right-6 top-6 z-10">
            <div className="pointer-events-auto">{scrollOverlay}</div>
          </div>
        ) : null}
        <div className={cn("h-fit w-full", PROTOTYPE_GALLERY_CONTENT_INSET_CLASS)}>
          {children}
        </div>
      </div>
    </div>
  );
}

type PrototypeGalleryHeaderProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
  actions?: ReactNode;
};

export function PrototypeGalleryHeader({
  eyebrow,
  title = "Prototypes",
  description = "UI experiments and concept explorations. Select a prototype to open it.",
  className,
  actions,
}: PrototypeGalleryHeaderProps) {
  return (
    <div
      className={cn(
        "border-[var(--tool-chrome-border)] bg-[var(--bg-main)] shrink-0 border-b",
        PROTOTYPE_GALLERY_HEADER_INSET_CLASS,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs text-[var(--tool-chrome-text-muted)]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-0 text-xl font-medium tracking-tight text-[var(--tool-chrome-text-heading)]">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-normal text-[var(--tool-chrome-text-muted)]">
            {description}
          </p>
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center pt-0.5">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}

export function PrototypeGalleryPage({
  children,
  footer,
  header,
}: PrototypeGalleryShellProps & {
  header?: ReactNode;
}) {
  return (
    <PrototypeGalleryShell footer={footer}>
      <PrototypeGalleryPageLayout
        header={header ?? <PrototypeGalleryHeader className="mb-0" />}
      >
        {children}
      </PrototypeGalleryPageLayout>
    </PrototypeGalleryShell>
  );
}
