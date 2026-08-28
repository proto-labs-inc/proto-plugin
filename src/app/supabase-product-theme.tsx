"use client";

import type { ReactNode } from "react";
import {
  PROTOTYPE_PRODUCT_THEME_MANAGED_ATTR,
  PrototypeProductPreviewThemeProvider,
} from "proto-plugin";
import { useEffect } from "react";

import {
  resolveSupabaseProductTheme,
  type SupabaseProductTheme,
} from "./supabase-product-theme.constants";

export {
  SUPABASE_PRODUCT_THEME,
  SUPABASE_PRODUCT_THEMES,
} from "./supabase-product-theme.constants";

const PRODUCT_THEME = resolveSupabaseProductTheme();

function applyProductTheme(element: Element, theme: SupabaseProductTheme) {
  element.classList.remove("light", "dark");
  element.classList.add(theme);
  element.setAttribute("data-theme", theme);
}

/**
 * Applies the source design system theme on prototype preview surfaces.
 * Viewport theme is declared in React via PrototypeProductPreviewThemeProvider
 * so SSR and hydration stay in sync. This effect only syncs nested source surfaces.
 */
export function SupabaseProductTheme({ children }: { children: ReactNode }) {
  const productTheme = PRODUCT_THEME;

  useEffect(() => {
    const applyToNestedSourceSurfaces = () => {
      document
        .querySelectorAll("[data-prototype-source-surface]")
        .forEach((element) => {
          if (element.hasAttribute(PROTOTYPE_PRODUCT_THEME_MANAGED_ATTR)) {
            return;
          }
          applyProductTheme(element, productTheme);
        });
    };

    applyToNestedSourceSurfaces();

    const observer = new MutationObserver(applyToNestedSourceSurfaces);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-prototype-source-surface"],
    });

    return () => observer.disconnect();
  }, [productTheme]);

  return (
    <PrototypeProductPreviewThemeProvider theme={productTheme}>
      {children}
    </PrototypeProductPreviewThemeProvider>
  );
}
