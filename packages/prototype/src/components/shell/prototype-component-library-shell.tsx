"use client";

import { PROTOTYPE_SOURCE_SURFACE_ATTR } from "@prototype/lib/tool-portal";
import { Moon, Sun } from "lucide-react";
import { useState, type ReactNode } from "react";

import {
  PrototypeGalleryHeader,
  PrototypeGalleryPageLayout,
} from "./prototype-gallery-shell";

type ProductPreviewTheme = "light" | "dark";

type PrototypeComponentLibraryShellProps = {
  title: string;
  description: string;
  /** Enables the light/dark toggle. Off for the empty state (pins light). */
  enableThemeToggle?: boolean;
  children: ReactNode;
};

/**
 * Themes the whole component-library content area (background + text) via a
 * single header toggle. The content is a product source surface, so previews
 * and copy follow the selected Supabase light/dark theme while the tool chrome
 * (sidebar, header) stays on the app theme.
 */
export function PrototypeComponentLibraryShell({
  title,
  description,
  enableThemeToggle = true,
  children,
}: PrototypeComponentLibraryShellProps) {
  const [theme, setTheme] = useState<ProductPreviewTheme>("light");
  const isDark = theme === "dark";

  const themeToggle = enableThemeToggle ? (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={
        isDark ? "Switch preview to light mode" : "Switch preview to dark mode"
      }
      className="-mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-md text-[var(--tool-chrome-text-muted)] transition-colors hover:bg-[var(--tool-chrome-gray-highlight)] hover:text-[var(--tool-chrome-text-heading)]"
    >
      {isDark ? (
        <Sun className="size-4" aria-hidden />
      ) : (
        <Moon className="size-4" aria-hidden />
      )}
    </button>
  ) : null;

  return (
    <PrototypeGalleryPageLayout
      header={
        <PrototypeGalleryHeader
          title={title}
          description={description}
          className="mb-0"
          actions={themeToggle}
        />
      }
      scrollClassName={theme}
      scrollContainerProps={{
        "data-theme": theme,
        [PROTOTYPE_SOURCE_SURFACE_ATTR]: "",
        // The product-surface reset pins `background-color: inherit`, so drive the
        // themed canvas from the bridged tokens directly (inline beats the reset).
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
