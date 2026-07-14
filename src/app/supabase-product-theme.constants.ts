export type SupabaseProductTheme = "light" | "dark";

/** Default product theme when only one mode is configured. */
export const SUPABASE_PRODUCT_THEME: SupabaseProductTheme = "light";

/**
 * Product themes available from the synced source design system.
 * When both are listed, prototype previews invert the tool chrome theme
 * (tool dark → product light, tool light → product dark).
 */
export const SUPABASE_PRODUCT_THEMES: readonly SupabaseProductTheme[] = [
  "light",
  "dark",
];

export function resolveSupabaseProductTheme(
  toolTheme: SupabaseProductTheme,
): SupabaseProductTheme {
  const hasLight = SUPABASE_PRODUCT_THEMES.includes("light");
  const hasDark = SUPABASE_PRODUCT_THEMES.includes("dark");

  if (hasLight && hasDark) {
    return toolTheme === "dark" ? "light" : "dark";
  }

  if (hasDark) {
    return "dark";
  }

  return SUPABASE_PRODUCT_THEME;
}
