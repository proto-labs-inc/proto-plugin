"use client";

import { PrototypeProvider } from "@prototype/components/prototype-provider";
import { PrototypeGalleryNav } from "@prototype/components/shell/prototype-gallery-nav";
import { cn } from "@prototype/lib/utils";
import type { ReactNode } from "react";

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
        <div className="border-[var(--tool-chrome-border)] bg-[var(--bg-main)] flex shrink-0 items-center justify-end border-b px-10 py-3 lg:px-16">
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
};

/** Gallery pages: header stays fixed; only body scrolls. */
export function PrototypeGalleryPageLayout({
  header,
  children,
}: PrototypeGalleryPageLayoutProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {header}
      <div className="bg-[var(--bg-ground)] min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <div className="h-fit w-full">{children}</div>
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
        "border-[var(--tool-chrome-border)] bg-[var(--bg-main)] shrink-0 border-b px-10 py-6 lg:px-16",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-xs text-[var(--tool-chrome-text-muted)]">{eyebrow}</p>
      ) : null}
      <h1 className="mt-0 text-2xl font-medium tracking-tight text-[var(--tool-chrome-text-heading)]">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--tool-chrome-text-muted)]">
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
        <div className="px-10 pt-8 pb-16 lg:px-16">{children}</div>
      </PrototypeGalleryPageLayout>
    </PrototypeGalleryShell>
  );
}
