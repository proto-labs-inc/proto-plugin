"use client";

import { PrototypeComponentLibraryThemeToggle } from "@prototype/components/shell/prototype-component-library-theme-toggle";
import {
  ComponentLibraryProductThemeProvider,
  useComponentLibraryProductTheme,
} from "@prototype/lib/use-component-library-product-theme";
import { useSyncComponentLibraryPortalTheme } from "@prototype/lib/use-sync-component-library-portal-theme";
import {
  PROTOTYPE_PRODUCT_THEME_MANAGED_ATTR,
  PROTOTYPE_SOURCE_SURFACE_ATTR,
} from "@prototype/lib/tool-portal";
import type { ReactNode } from "react";

import {
  PrototypeGalleryHeader,
  PrototypeGalleryPageLayout,
} from "./prototype-gallery-shell";

type PrototypeComponentLibraryShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

function PrototypeComponentLibraryShellContent({
  title,
  description,
  children,
}: PrototypeComponentLibraryShellProps) {
  const { theme, toggleTheme, surfaceRef } = useComponentLibraryProductTheme();

  useSyncComponentLibraryPortalTheme(theme, true, surfaceRef);

  return (
    <PrototypeGalleryPageLayout
      header={
        <PrototypeGalleryHeader
          title={title}
          description={description}
          className="mb-0"
        />
      }
      scrollClassName={theme}
      scrollOverlay={
        <PrototypeComponentLibraryThemeToggle
          theme={theme}
          onToggle={toggleTheme}
        />
      }
      scrollContainerRef={surfaceRef}
      scrollContainerProps={{
        "data-theme": theme,
        [PROTOTYPE_SOURCE_SURFACE_ATTR]: "",
        [PROTOTYPE_PRODUCT_THEME_MANAGED_ATTR]: "",
        style: {
          backgroundColor: "var(--color-background)",
          color: "var(--color-foreground)",
        },
      }}
    >
      {children}
    </PrototypeGalleryPageLayout>
  );
}

/** Component library content area — Supabase Light/Dark product tokens via header toggle. */
export function PrototypeComponentLibraryShell({
  title,
  description,
  children,
}: PrototypeComponentLibraryShellProps) {
  return (
    <ComponentLibraryProductThemeProvider>
      <PrototypeComponentLibraryShellContent
        title={title}
        description={description}
      >
        {children}
      </PrototypeComponentLibraryShellContent>
    </ComponentLibraryProductThemeProvider>
  );
}
