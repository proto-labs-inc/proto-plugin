"use client";

import { ThemeProvider, useTheme } from "next-themes";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

export type ComponentLibraryProductTheme = "light" | "dark";

export const COMPONENT_LIBRARY_PRODUCT_THEME_STORAGE_KEY =
  "component-library-product-theme";

/**
 * next-themes writes this attribute on <html>. Nothing styles it, so the host's
 * Supabase Light pin (class="light" / data-theme="light") is never disturbed —
 * the product theme is applied locally on the managed surface instead.
 */
const COMPONENT_LIBRARY_THEME_ATTRIBUTE = "data-cl-theme";

type ComponentLibraryProductThemeContextValue = {
  theme: ComponentLibraryProductTheme;
  setTheme: (next: ComponentLibraryProductTheme) => void;
  toggleTheme: () => void;
  surfaceRef: RefObject<HTMLDivElement | null>;
};

const ComponentLibraryProductThemeContext =
  createContext<ComponentLibraryProductThemeContextValue | null>(null);

function normalizeTheme(value: string | undefined): ComponentLibraryProductTheme {
  return value === "dark" ? "dark" : "light";
}

type ComponentLibraryProductThemeProviderProps = {
  children: ReactNode;
};

/**
 * Bridges next-themes (the single source of truth) to the component-library API.
 * Reading/writing through next-themes keeps `useTheme()` consumers (CodeBlock,
 * IconPanel, GlassPanel, …) reactive — they update on toggle without a refresh.
 */
function ComponentLibraryProductThemeBridge({ children }: { children: ReactNode }) {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme, setTheme: setNextTheme } = useTheme();
  const theme = normalizeTheme(resolvedTheme);

  const setTheme = useCallback(
    (next: ComponentLibraryProductTheme) => {
      setNextTheme(next);
    },
    [setNextTheme],
  );

  const toggleTheme = useCallback(() => {
    setNextTheme(theme === "light" ? "dark" : "light");
  }, [setNextTheme, theme]);

  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      surfaceRef,
    }),
    [setTheme, theme, toggleTheme],
  );

  return (
    <ComponentLibraryProductThemeContext.Provider value={contextValue}>
      {children}
    </ComponentLibraryProductThemeContext.Provider>
  );
}

export function ComponentLibraryProductThemeProvider({
  children,
}: ComponentLibraryProductThemeProviderProps) {
  return (
    <ThemeProvider
      themes={["light", "dark"]}
      defaultTheme="light"
      enableSystem={false}
      enableColorScheme={false}
      storageKey={COMPONENT_LIBRARY_PRODUCT_THEME_STORAGE_KEY}
      attribute={COMPONENT_LIBRARY_THEME_ATTRIBUTE}
      disableTransitionOnChange
    >
      <ComponentLibraryProductThemeBridge>
        {children}
      </ComponentLibraryProductThemeBridge>
    </ThemeProvider>
  );
}

export function useComponentLibraryProductTheme() {
  const context = useContext(ComponentLibraryProductThemeContext);

  if (!context) {
    throw new Error(
      "useComponentLibraryProductTheme must be used within ComponentLibraryProductThemeProvider",
    );
  }

  return context;
}
