"use client";

import { PrototypeProvider } from "@prototype/components/prototype-provider";
import { PrototypeGalleryNav } from "@prototype/components/shell/prototype-gallery-nav";
import { cn } from "@prototype/lib/utils";
import type { ReactNode } from "react";

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
};

/** Gallery pages: header stays fixed; only body scrolls. */
export function PrototypeGalleryPageLayout({
  header,
  children,
  scrollClassName,
}: PrototypeGalleryPageLayoutProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {header}
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-y-contain",
          scrollClassName ?? "bg-[var(--bg-ground)]",
        )}
      >
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
};

export function PrototypeGalleryHeader({
  eyebrow,
  title = "Prototypes",
  description = "UI experiments and concept explorations. Select a prototype to open it.",
  className,
}: PrototypeGalleryHeaderProps) {
  return (
    <div
      className={cn(
        "border-[var(--tool-chrome-border)] bg-[var(--bg-main)] shrink-0 border-b",
        PROTOTYPE_GALLERY_HEADER_INSET_CLASS,
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-xs text-[var(--tool-chrome-text-muted)]">{eyebrow}</p>
      ) : null}
      <h1 className="mt-0 text-xl font-medium tracking-tight text-[var(--tool-chrome-text-heading)]">
        {title}
      </h1>
      <p className="mt-1 max-w-2xl text-sm leading-normal text-[var(--tool-chrome-text-muted)]">
        {description}
      </p>
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
