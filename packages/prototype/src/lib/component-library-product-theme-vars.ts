/** Semantic + compat tokens mirrored onto body-portaled component-library overlays. */
export const COMPONENT_LIBRARY_PRODUCT_THEME_VARS = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--destructive-foreground",
  "--border",
  "--input",
  "--ring",
  "--foreground-light",
  "--foreground-lighter",
  "--foreground-muted",
  "--background-default",
  "--background-200",
  "--background-surface-75",
  "--background-surface-100",
  "--background-surface-200",
  "--background-dash-sidebar",
  "--background-dash-canvas",
  "--border-default",
  "--border-muted",
  "--border-strong",
  "--color-background",
  "--color-foreground",
  "--color-card",
  "--color-card-foreground",
  "--color-popover",
  "--color-popover-foreground",
  "--color-primary",
  "--color-primary-foreground",
  "--color-secondary",
  "--color-secondary-foreground",
  "--color-muted",
  "--color-muted-foreground",
  "--color-accent",
  "--color-accent-foreground",
  "--color-destructive",
  "--color-destructive-foreground",
  "--color-border",
  "--color-input",
  "--color-ring",
] as const;

export function mirrorComponentLibraryProductThemeTokens(
  source: HTMLElement,
  target: HTMLElement,
) {
  const styles = getComputedStyle(source);

  for (const variable of COMPONENT_LIBRARY_PRODUCT_THEME_VARS) {
    target.style.setProperty(variable, styles.getPropertyValue(variable));
  }

  target.style.backgroundColor = styles.backgroundColor;
  target.style.color = styles.color;
}
