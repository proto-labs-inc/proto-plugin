"use client";

import { PrototypeProvider } from "@prototype/components/prototype-provider";
import { cn } from "@prototype/lib/utils";
import type { ReactNode } from "react";

type PrototypeGalleryShellProps = {
  children: ReactNode;
  footer?: ReactNode;
};

export function PrototypeGalleryShell({
  children,
  footer,
}: PrototypeGalleryShellProps) {
  return (
    <PrototypeProvider className="bg-[var(--bg-ground)] flex h-svh w-full flex-col overflow-hidden">
      {footer ? (
        <div className="border-border flex shrink-0 items-center justify-end border-b px-10 py-3 lg:px-16">
          {footer}
        </div>
      ) : null}

      <main className="bg-background min-h-0 flex-1 overflow-y-auto">
        {children}
      </main>
    </PrototypeProvider>
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
        "border-border -mx-10 mb-8 border-b px-10 py-6 lg:-mx-16 lg:px-16",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-xs text-muted-foreground">{eyebrow}</p>
      ) : null}
      <h1 className="text-foreground mt-0 text-2xl font-medium tracking-tight">
        {title}
      </h1>
      <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
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
      <div className="px-10 lg:px-16">
        {header ?? <PrototypeGalleryHeader />}
        {children}
      </div>
    </PrototypeGalleryShell>
  );
}
