"use client";

import { PROTOTYPE_VIEWPORT_ID } from "proto-plugin";
import { useEffect } from "react";

import { SUPABASE_PRODUCT_THEME } from "./supabase-product-theme.constants";

export { SUPABASE_PRODUCT_THEME } from "./supabase-product-theme.constants";

function applyLightTheme(element: Element) {
  element.classList.add(SUPABASE_PRODUCT_THEME);
  element.setAttribute("data-theme", SUPABASE_PRODUCT_THEME);
}

/**
 * Pins Supabase Light on product preview surfaces regardless of tool chrome theme.
 * Covers #prototype-viewport (screenshot root) and component-library source surfaces.
 */
export function SupabaseProductTheme() {
  useEffect(() => {
    const applyToProductSurfaces = () => {
      const viewport = document.getElementById(PROTOTYPE_VIEWPORT_ID);
      if (viewport?.hasAttribute("data-prototype-screenshot")) {
        applyLightTheme(viewport);
      }

      document
        .querySelectorAll("[data-prototype-source-surface]")
        .forEach(applyLightTheme);
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
  }, []);

  return null;
}
