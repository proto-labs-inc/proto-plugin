"use client";

import {
  PROTOTYPE_PRODUCT_THEME_MANAGED_ATTR,
  PROTOTYPE_VIEWPORT_ID,
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
 * Skips component-library surfaces that manage their own product theme.
 */
export function SupabaseProductTheme() {
  const productTheme = PRODUCT_THEME;

  useEffect(() => {
    const applyToProductSurfaces = () => {
      const viewport = document.getElementById(PROTOTYPE_VIEWPORT_ID);
      if (viewport?.hasAttribute("data-prototype-screenshot")) {
        applyProductTheme(viewport, productTheme);
      }

      document
        .querySelectorAll("[data-prototype-source-surface]")
        .forEach((element) => {
          if (element.hasAttribute(PROTOTYPE_PRODUCT_THEME_MANAGED_ATTR)) {
            return;
          }
          applyProductTheme(element, productTheme);
        });
    };

    applyToProductSurfaces();

    const observer = new MutationObserver(applyToProductSurfaces);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "data-prototype-screenshot",
        "data-prototype-source-surface",
        "id",
      ],
    });

    return () => observer.disconnect();
  }, [productTheme]);

  return null;
}
