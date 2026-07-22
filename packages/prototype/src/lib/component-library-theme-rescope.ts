import {
  PROTOTYPE_PRODUCT_THEME_MANAGED_ATTR,
  PROTOTYPE_SOURCE_SURFACE_ATTR,
} from "@prototype/lib/tool-portal";

/**
 * Runtime theme re-scoper for component-library preview surfaces.
 *
 * The synced source app declares its design tokens on `:root` (light) and on a
 * `.dark` / `[data-theme="dark"]` selector (dark). Component-library previews
 * render inside a nested surface (`[data-prototype-source-surface]` +
 * `[data-prototype-product-theme-managed]`) so a reviewer can see light and dark
 * side by side. Custom properties declared on `:root` are inherited, but any
 * token that depends on the *cascade* (a `.dark` block, `color-mix()`,
 * `light-dark()`, `@media (prefers-color-scheme)`) does not recompute for a
 * nested surface whose mode differs from the document root — that is what makes
 * previews render dark (or unstyled) regardless of the selected mode.
 *
 * Rather than hand-authoring a token bridge per host, we read the source's own
 * custom-property declarations out of `document.styleSheets` and re-emit them,
 * scoped to the managed surface for each mode. The browser then recomputes every
 * `var()` / `color-mix()` in the surface's own context, so previews theme
 * correctly for any source app with no per-host CSS.
 */

const STYLE_ELEMENT_ID = "prototype-component-library-theme-rescope";

export type ComponentLibraryRescopeMode = "light" | "dark";

type CustomPropertyMap = Map<string, string>;

type ModeBuckets = {
  base: CustomPropertyMap;
  dark: CustomPropertyMap;
};

function classifySelector(
  selectorText: string,
  insideDarkMedia: boolean,
): "base" | "dark" | null {
  const selectors = selectorText.split(",").map((part) => part.trim().toLowerCase());

  let matchesDark = false;
  let matchesBase = false;

  for (const selector of selectors) {
    if (!selector) continue;

    const isDark =
      selector.includes(".dark") ||
      /\[data-theme\s*[~|^$*]?=\s*["']?dark["']?\]/.test(selector) ||
      selector.includes('[data-mode="dark"]');

    const referencesRoot =
      selector === ":root" ||
      selector === "html" ||
      selector === "body" ||
      selector.includes(":root") ||
      selector.startsWith("html") ||
      selector.startsWith("body");

    const isLight =
      selector.includes(".light") ||
      /\[data-theme\s*[~|^$*]?=\s*["']?light["']?\]/.test(selector);

    if (isDark) {
      matchesDark = true;
    } else if (isLight || referencesRoot) {
      matchesBase = true;
    }
  }

  if (matchesDark) return "dark";
  if (matchesBase) return insideDarkMedia ? "dark" : "base";
  return null;
}

function collectCustomProperties(style: CSSStyleDeclaration): CustomPropertyMap {
  const map: CustomPropertyMap = new Map();
  for (let i = 0; i < style.length; i += 1) {
    const property = style.item(i);
    if (!property.startsWith("--")) continue;
    // Re-insert so the last declaration wins, matching the cascade.
    map.delete(property);
    map.set(property, style.getPropertyValue(property).trim());
  }
  return map;
}

function mergeInto(target: CustomPropertyMap, source: CustomPropertyMap) {
  for (const [key, value] of source) {
    target.delete(key);
    target.set(key, value);
  }
}

function isDarkColorSchemeMedia(conditionText: string): boolean {
  return /prefers-color-scheme\s*:\s*dark/.test(conditionText);
}

function walkRules(
  rules: CSSRuleList,
  buckets: ModeBuckets,
  insideDarkMedia: boolean,
) {
  for (let i = 0; i < rules.length; i += 1) {
    const rule = rules[i];

    if (rule instanceof CSSStyleRule) {
      const classification = classifySelector(rule.selectorText, insideDarkMedia);
      if (!classification) continue;
      const declarations = collectCustomProperties(rule.style);
      if (declarations.size === 0) continue;
      mergeInto(buckets[classification === "dark" ? "dark" : "base"], declarations);
      continue;
    }

    // Recurse into grouping rules (@layer, @media, @supports, @container).
    const grouping = rule as CSSGroupingRule & { conditionText?: string };
    if (grouping.cssRules) {
      const conditionText =
        typeof grouping.conditionText === "string" ? grouping.conditionText : "";
      const nextInsideDarkMedia =
        insideDarkMedia || isDarkColorSchemeMedia(conditionText);
      walkRules(grouping.cssRules, buckets, nextInsideDarkMedia);
    }
  }
}

function readSourceTokenBuckets(): ModeBuckets {
  const buckets: ModeBuckets = { base: new Map(), dark: new Map() };

  for (const sheet of Array.from(document.styleSheets)) {
    // Skip our own injected sheet so re-runs stay idempotent.
    if (sheet.ownerNode instanceof Element && sheet.ownerNode.id === STYLE_ELEMENT_ID) {
      continue;
    }

    let rules: CSSRuleList | null = null;
    try {
      rules = sheet.cssRules;
    } catch {
      // Cross-origin stylesheet — declarations are not readable. Skip.
      rules = null;
    }
    if (!rules) continue;

    walkRules(rules, buckets, false);
  }

  return buckets;
}

function buildScopedBlock(
  mode: ComponentLibraryRescopeMode,
  declarations: CustomPropertyMap,
): string {
  if (declarations.size === 0) return "";

  const surface = `[${PROTOTYPE_SOURCE_SURFACE_ATTR}][${PROTOTYPE_PRODUCT_THEME_MANAGED_ATTR}]`;
  const selector = `${surface}[data-theme="${mode}"], ${surface}.${mode}`;

  const body = Array.from(declarations)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join("\n");

  return `${selector} {\n  color-scheme: ${mode};\n${body}\n}`;
}

/**
 * Read the source app's token declarations and inject a `<style>` that re-scopes
 * them onto the managed component-library preview surface for each requested
 * mode. Safe to call repeatedly (idempotent) and after stylesheets change.
 */
export function rescopeComponentLibraryTheme(
  modes: readonly ComponentLibraryRescopeMode[] = ["light", "dark"],
): void {
  if (typeof document === "undefined") return;

  const buckets = readSourceTokenBuckets();
  if (buckets.base.size === 0 && buckets.dark.size === 0) {
    if (process.env.NODE_ENV !== "production") {
      // No readable source token declarations found — previews will render in
      // the :root fallback (usually unstyled/dark). Almost always means the
      // source token CSS was not synced/@imported into globals.css.
      console.warn(
        "[proto-plugin] component-library theme rescoper found no source token declarations to re-scope. " +
          "Confirm the source design tokens are @imported in globals.css (see the Design system section of AGENTS.md).",
      );
    }
    return;
  }

  const blocks: string[] = [];

  for (const mode of modes) {
    if (mode === "light") {
      blocks.push(buildScopedBlock("light", buckets.base));
    } else {
      const darkVars: CustomPropertyMap = new Map(buckets.base);
      mergeInto(darkVars, buckets.dark);
      blocks.push(buildScopedBlock("dark", darkVars));
    }
  }

  const css = blocks.filter(Boolean).join("\n\n");
  if (!css) return;

  let style = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ELEMENT_ID;
    document.head.appendChild(style);
  }

  if (style.textContent !== css) {
    style.textContent = css;
  }
}

export function getComponentLibraryThemeRescopeStyleId(): string {
  return STYLE_ELEMENT_ID;
}
