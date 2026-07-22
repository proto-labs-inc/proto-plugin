"use client";

import type { AccordionMultipleProps } from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@prototype/components/ui/accordion";
import {
  PROTOTYPE_PRODUCT_THEME_MANAGED_ATTR,
  PROTOTYPE_SOURCE_SURFACE_ATTR,
} from "@prototype/lib/tool-portal";
import { useComponentLibraryProductTheme } from "@prototype/lib/use-component-library-product-theme";
import { cn } from "@prototype/lib/utils";

type ComponentLibraryAccordionProps = Omit<
  AccordionMultipleProps,
  "type" | "defaultValue"
>;

/** Accordion chrome for the design system page — proto tool styling, not synced source UI. */
export function ComponentLibraryAccordion({
  className,
  children,
  ...props
}: ComponentLibraryAccordionProps) {
  return (
    <Accordion
      type="multiple"
      defaultValue={[]}
      data-prototype-component-library-accordion=""
      className={cn(
        "prototype-component-library-accordion -mx-6 pb-20",
        className,
      )}
      {...props}
    >
      {children}
    </Accordion>
  );
}

export function LibraryAccordionSection({
  id,
  title,
  children,
  isFirst = false,
}: {
  id: string;
  title: string;
  children: ReactNode;
  isFirst?: boolean;
}) {
  if (process.env.NODE_ENV !== "production" && !id) {
    console.error(
      "LibraryAccordionSection: `id` is required — the section will not open without it.",
    );
  }

  return (
    <AccordionItem
      value={id}
      id={id}
      className="prototype-component-library-accordion__item scroll-mt-8 border-b last:border-b-0"
    >
      <AccordionTrigger
        hideIcon
        className={cn(
          "prototype-component-library-accordion__trigger px-6 py-5 text-xl font-semibold tracking-tight hover:no-underline",
          "data-[state=open]:border-b",
          "[&[data-state=open]>svg]:!rotate-0",
          isFirst && "pt-0",
        )}
      >
        {title}
        <ChevronDown
          aria-hidden
          className="prototype-component-library-accordion__chevron size-4 shrink-0 rotate-180 transition-transform duration-200 group-data-[state=open]:!rotate-0 motion-reduce:transition-none"
        />
      </AccordionTrigger>
      <AccordionContent className="pb-10">
        <div className="px-6 pt-6">
          <ComponentLibraryPreviewSurface>{children}</ComponentLibraryPreviewSurface>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

/** Product-token surface for synced source previews — isolated from accordion chrome. */
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
