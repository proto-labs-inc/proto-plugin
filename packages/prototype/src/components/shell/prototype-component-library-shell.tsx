"use client";

import {
  ComponentLibraryProductThemeProvider,
  resolveComponentLibraryDefaultTheme,
  useComponentLibraryProductTheme,
  type ComponentLibraryProductTheme,
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
  isEmpty?: boolean;
  productThemes?: readonly ComponentLibraryProductTheme[];
};

function PrototypeComponentLibraryShellContent({
  title,
  description,
  children,
  isEmpty = false,
  productThemes,
}: PrototypeComponentLibraryShellProps) {
  const showEmptyState = isEmpty;
  const themes = productThemes ?? (["light", "dark"] as const);
  const libraryTheme = resolveComponentLibraryDefaultTheme(themes);
  const forcedTheme = showEmptyState ? "dark" : libraryTheme;

  return (
    <ComponentLibraryProductThemeProvider
      key={forcedTheme}
      forcedTheme={forcedTheme}
      themes={themes}
      defaultTheme={libraryTheme}
    >
      <PrototypeComponentLibraryShellLayout
        title={title}
        description={description}
        surfaceTheme={forcedTheme}
      >
        {children}
      </PrototypeComponentLibraryShellLayout>
    </ComponentLibraryProductThemeProvider>
  );
}

function PrototypeComponentLibraryShellLayout({
  title,
  description,
  children,
  surfaceTheme,
}: {
  title: string;
  description: string;
  children: ReactNode;
  surfaceTheme: ComponentLibraryProductTheme;
}) {
  const { surfaceRef } = useComponentLibraryProductTheme();

  useSyncComponentLibraryPortalTheme(surfaceTheme, true, surfaceRef);

  return (
    <PrototypeGalleryPageLayout
      header={
        <PrototypeGalleryHeader
          title={title}
          description={description}
          className="mb-0"
        />
      }
      scrollClassName={surfaceTheme}
      scrollContainerRef={surfaceRef}
      scrollContainerProps={{
        "data-theme": surfaceTheme,
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

/** Component library content area — dark before import, then source product tokens. */
export function PrototypeComponentLibraryShell({
  title,
  description,
  children,
  isEmpty,
  productThemes,
}: PrototypeComponentLibraryShellProps) {
  return (
    <PrototypeComponentLibraryShellContent
      title={title}
      description={description}
      isEmpty={isEmpty}
      productThemes={productThemes}
    >
      {children}
    </PrototypeComponentLibraryShellContent>
  );
}
