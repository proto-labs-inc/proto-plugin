"use client";

import {
  PROTOTYPE_PRODUCT_THEME_MANAGED_ATTR,
  PROTOTYPE_VIEWPORT_ID,
} from "proto-plugin";
import { useEffect, useState } from "react";

import {
  resolveSupabaseProductTheme,
  type SupabaseProductTheme,
} from "./supabase-product-theme.constants";

export {
  SUPABASE_PRODUCT_THEME,
  SUPABASE_PRODUCT_THEMES,
} from "./supabase-product-theme.constants";

function readToolTheme(): SupabaseProductTheme {
  const roots = document.querySelectorAll<HTMLElement>("[data-prototype-root]");
  const activeRoot = roots[roots.length - 1] ?? roots[0];
  return activeRoot?.getAttribute("data-prototype-comment-theme") === "light"
    ? "light"
    : "dark";
}

function applyProductTheme(element: Element, theme: SupabaseProductTheme) {
  element.classList.remove("light", "dark");
  element.classList.add(theme);
  element.setAttribute("data-theme", theme);
}

function useToolThemeForProductSync(): SupabaseProductTheme {
  const [toolTheme, setToolTheme] = useState<SupabaseProductTheme>("dark");

  useEffect(() => {
    const syncToolTheme = () => {
      setToolTheme(readToolTheme());
    };

    syncToolTheme();

    const observer = new MutationObserver(syncToolTheme);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-prototype-comment-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return toolTheme;
}

/**
 * Applies Supabase product theme on prototype preview surfaces.
 * When both light and dark tokens are configured, inverts the tool chrome theme
 * so prototypes stay visually distinct from the review shell.
 * Skips component-library surfaces that manage their own toggle.
 */
export function SupabaseProductTheme() {
  const toolTheme = useToolThemeForProductSync();
  const productTheme = resolveSupabaseProductTheme(toolTheme);

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
