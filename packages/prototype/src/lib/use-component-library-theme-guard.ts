"use client";

import { useEffect, type RefObject } from "react";

import { getPrototypePortalContainer } from "@prototype/lib/tool-portal";

/**
 * Dev-only guard against the #1 component-library setup bug: the product theme
 * class is applied to a **nested** preview surface, but many source design
 * systems derive their semantic tokens on `:root`. If the host ships a stub
 * token bridge, the preview surface silently "wears" proto tool chrome (dark
 * grey / blue-pink accents) instead of the source product tokens — the app
 * still compiles and returns HTTP 200, so the failure is easy to miss.
 *
 * This measures resolved colors on the managed surface and compares them to the
 * tool-chrome palette. It is deliberately **dark-safe**: it never asserts "the
 * preview is light" (a dark preview is correct for a dark-only source). It only
 * fires when the surface resolves to the *exact* tool-chrome background or the
 * *exact* tool-chrome accent — i.e. the source tokens never applied.
 */
function resolveColor(
  host: HTMLElement,
  value: string,
): string | undefined {
  const probe = document.createElement("span");
  probe.style.position = "absolute";
  probe.style.pointerEvents = "none";
  probe.style.opacity = "0";
  probe.style.color = value;
  host.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved || undefined;
}

export function useComponentLibraryThemeGuard<T extends HTMLElement>(
  surfaceRef: RefObject<T | null>,
  surfaceTheme: string,
  { enabled }: { enabled: boolean },
): void {
  useEffect(() => {
    if (!enabled) return;
    if (process.env.NODE_ENV === "production") return;
    if (typeof window === "undefined") return;

    const timer = window.setTimeout(() => {
      const surface = surfaceRef.current;
      const root = getPrototypePortalContainer();
      if (!surface || !root) return;

      // Chromatic accent on the source surface vs proto tool-chrome accents.
      const surfacePrimary =
        resolveColor(surface, "var(--color-brand, var(--primary, var(--color-primary)))") ??
        "";
      const toolBlue = resolveColor(root, "var(--tool-chrome-blue)") ?? "";
      const toolPink = resolveColor(root, "var(--tool-chrome-pink)") ?? "";

      // Background on the source surface vs proto tool-chrome surfaces.
      const surfaceBg =
        resolveColor(surface, "var(--color-background, var(--background))") ?? "";
      const toolBg = resolveColor(root, "var(--tool-chrome-bg)") ?? "";
      const toolGround = resolveColor(root, "var(--tool-chrome-ground)") ?? "";

      const accentIsToolChrome =
        surfacePrimary !== "" &&
        (surfacePrimary === toolBlue || surfacePrimary === toolPink);
      const backgroundIsToolChrome =
        surfaceBg !== "" && (surfaceBg === toolBg || surfaceBg === toolGround);

      if (!accentIsToolChrome && !backgroundIsToolChrome) return;

      // eslint-disable-next-line no-console
      console.error(
        [
          `[proto-plugin] Component library previews are rendering with proto tool-chrome tokens, not the source product theme (mode: "${surfaceTheme}").`,
          "The product theme class is applied to a nested preview surface, but the source tokens did not resolve there.",
          "This is almost always a STUB token bridge: the host must re-scope the source's full token system (inputs AND derivations) onto",
          "[data-prototype-source-surface][data-prototype-product-theme-managed] for each configured productThemes mode.",
          "See AGENTS.md → Component Library → 'Product theme on preview surfaces'.",
          accentIsToolChrome
            ? `  • accent resolved to tool chrome: ${surfacePrimary}`
            : "",
          backgroundIsToolChrome
            ? `  • background resolved to tool chrome: ${surfaceBg}`
            : "",
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }, 250);

    return () => window.clearTimeout(timer);
  }, [enabled, surfaceRef, surfaceTheme]);
}
