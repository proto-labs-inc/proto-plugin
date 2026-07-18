export type SupabaseProductTheme = "light" | "dark";

/** Default product theme when only one mode is configured. */
export const SUPABASE_PRODUCT_THEME: SupabaseProductTheme = "light";

/** Product themes available from the synced source design system. */
export const SUPABASE_PRODUCT_THEMES: readonly SupabaseProductTheme[] = [
  "light",
  "dark",
];

/** Fixed product preview theme: light when available, otherwise dark. */
export function resolveSupabaseProductTheme(): SupabaseProductTheme {
  if (SUPABASE_PRODUCT_THEMES.includes("light")) {
    return "light";
  }

  if (SUPABASE_PRODUCT_THEMES.includes("dark")) {
    return "dark";
  }

  return SUPABASE_PRODUCT_THEME;
}
