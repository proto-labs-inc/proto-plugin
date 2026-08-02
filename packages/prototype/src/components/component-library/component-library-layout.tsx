"use client";

import type { ReactNode } from "react";

import {
  PROTOTYPE_PRODUCT_THEME_MANAGED_ATTR,
  PROTOTYPE_SOURCE_SURFACE_ATTR,
} from "@prototype/lib/tool-portal";
import { useComponentLibraryProductTheme } from "@prototype/lib/use-component-library-product-theme";
import { cn } from "@prototype/lib/utils";

/** Flat page wrapper for design-system / component-library content — one scrollable surface. */
export function DesignSystemPage({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-prototype-design-system-page=""
      className={cn("space-y-12 px-6 pb-20", className)}
    >
      {children}
    </div>
  );
}

/** Titled section on the flat design-system page (not collapsible). */
export function DesignSystemSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  if (process.env.NODE_ENV !== "production" && !id) {
    console.error("DesignSystemSection: `id` is required for section anchors.");
  }

  return (
    <section id={id} className="scroll-mt-8 space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <ComponentLibraryPreviewSurface>{children}</ComponentLibraryPreviewSurface>
    </section>
  );
}

/** Product-token surface for synced source previews — isolated from tool chrome. */
export function ComponentLibraryPreviewSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { theme } = useComponentLibraryProductTheme();

  return (
    <div
      className={cn(theme, className)}
      data-theme={theme}
      {...{ [PROTOTYPE_SOURCE_SURFACE_ATTR]: "" }}
      {...{ [PROTOTYPE_PRODUCT_THEME_MANAGED_ATTR]: "" }}
    >
      {children}
    </div>
  );
}

export function PreviewGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-2">{children}</div>
  );
}

export function PreviewBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full self-start">
      <h3 className="mb-4 text-sm font-medium text-[var(--text-primary,var(--foreground))]">
        {title}
      </h3>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export function PreviewStack({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full self-start">
      <h3 className="mb-4 text-sm font-medium text-[var(--text-primary,var(--foreground))]">
        {title}
      </h3>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}
