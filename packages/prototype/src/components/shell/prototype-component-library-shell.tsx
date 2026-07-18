"use client";

import {
  ComponentLibraryProductThemeProvider,
  resolveComponentLibraryDefaultTheme,
  useComponentLibraryProductTheme,
  type ComponentLibraryProductTheme,
} from "@prototype/lib/use-component-library-product-theme";
import { useSyncComponentLibraryPortalTheme } from "@prototype/lib/use-sync-component-library-portal-theme";
import { useComponentLibraryThemeGuard } from "@prototype/lib/use-component-library-theme-guard";
import { useComponentLibraryThemeRescope } from "@prototype/lib/use-component-library-theme-rescope";
import {
  PROTOTYPE_PRODUCT_THEME_MANAGED_ATTR,
  PROTOTYPE_SOURCE_SURFACE_ATTR,
} from "@prototype/lib/tool-portal";
import { useBootstrapPreview } from "@prototype/lib/prototypes/use-bootstrap-preview";
import { cn } from "@prototype/lib/utils";
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
  const { isComponentLibraryLoadingPanelVisible } = useBootstrapPreview();
  const showPreSyncSurface = isEmpty || isComponentLibraryLoadingPanelVisible;
  const themes = productThemes ?? (["light", "dark"] as const);
  const libraryTheme = resolveComponentLibraryDefaultTheme(themes);

  return (
    <ComponentLibraryProductThemeProvider
      key={showPreSyncSurface ? "empty" : "populated"}
      forcedTheme={showPreSyncSurface ? "dark" : undefined}
      themes={themes}
      defaultTheme={libraryTheme}
    >
      <PrototypeComponentLibraryShellLayout
        title={title}
        description={description}
        themes={themes}
        guardTheme={!showPreSyncSurface}
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
  themes,
  guardTheme,
}: {
  title: string;
  description: string;
  children: ReactNode;
  themes: readonly ComponentLibraryProductTheme[];
  guardTheme: boolean;
}) {
  const { surfaceRef, theme } = useComponentLibraryProductTheme();

  useComponentLibraryThemeRescope(themes, theme);
  useSyncComponentLibraryPortalTheme(theme, guardTheme, surfaceRef);
  useComponentLibraryThemeGuard(surfaceRef, theme, { enabled: guardTheme });

  return (
    <PrototypeGalleryPageLayout
      header={
        <PrototypeGalleryHeader
          title={title}
          description={description}
          className="mb-0"
        />
      }
      scrollClassName={
        guardTheme
          ? cn(theme, "bg-[var(--bg-main)]")
          : "bg-[var(--bg-ground)]"
      }
      scrollContainerRef={guardTheme ? surfaceRef : undefined}
      scrollContainerProps={
        guardTheme
          ? {
              "data-theme": theme,
              [PROTOTYPE_SOURCE_SURFACE_ATTR]: "",
              [PROTOTYPE_PRODUCT_THEME_MANAGED_ATTR]: "",
            }
          : undefined
      }
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
