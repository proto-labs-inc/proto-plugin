"use client";

import { TooltipProvider } from "@prototype/components/ui/tooltip";
import { PROTOTYPE_ROOT_ID } from "@prototype/lib/tool-portal";
import { cn } from "@prototype/lib/utils";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { usePersistedLocalString } from "./use-persisted-local-state";

export const PROTOTYPE_TOOL_THEME_STORAGE_KEY = "prototype-tool-theme";

export type PrototypeToolTheme = "light" | "dark";

type PrototypeToolThemeContextValue = {
  theme: PrototypeToolTheme;
  useLightTheme: boolean;
  commentTheme: PrototypeToolTheme;
  isThemeLocked: boolean;
  setTheme: (theme: PrototypeToolTheme) => void;
  toggleTheme: () => void;
};

function isComponentLibraryPath(pathname: string | null): boolean {
  return (
    pathname === "/component-library" ||
    pathname?.startsWith("/component-library/") === true
  );
}

function useRouteLockedToolTheme(): PrototypeToolTheme | undefined {
  const pathname = usePathname();
  return isComponentLibraryPath(pathname) ? "light" : undefined;
}

const PrototypeToolThemeContext =
  createContext<PrototypeToolThemeContextValue | null>(null);

const DEFAULT_THEME: PrototypeToolTheme = "light";

function normalizeTheme(value: string): PrototypeToolTheme {
  return value === "light" ? "light" : "dark";
}

function disableThemeTransitions() {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.classList.add("prototype-theme-transition-disable");

  window.setTimeout(() => {
    root.classList.remove("prototype-theme-transition-disable");
  }, 0);
}

type PrototypeToolThemeProviderProps = {
  children: ReactNode;
  className?: string;
};

export function PrototypeToolThemeProvider({
  children,
  className,
}: PrototypeToolThemeProviderProps) {
  const forcedTheme = useRouteLockedToolTheme();
  const { value, updateValue } = usePersistedLocalString(
    PROTOTYPE_TOOL_THEME_STORAGE_KEY,
    DEFAULT_THEME,
  );
  const storedTheme = normalizeTheme(value);
  const theme = forcedTheme ?? storedTheme;
  const useLightTheme = theme === "light";
  const isThemeLocked = forcedTheme != null;

  useEffect(() => {
    if (!forcedTheme) return;
    disableThemeTransitions();
  }, [forcedTheme]);

  const setTheme = useCallback(
    (next: PrototypeToolTheme) => {
      if (forcedTheme) return;
      disableThemeTransitions();
      updateValue(next);
    },
    [forcedTheme, updateValue],
  );

  const toggleTheme = useCallback(() => {
    if (forcedTheme) return;
    setTheme(useLightTheme ? "dark" : "light");
  }, [forcedTheme, setTheme, useLightTheme]);

  const contextValue = useMemo<PrototypeToolThemeContextValue>(
    () => ({
      theme,
      useLightTheme,
      commentTheme: theme,
      isThemeLocked,
      setTheme,
      toggleTheme,
    }),
    [isThemeLocked, setTheme, theme, toggleTheme, useLightTheme],
  );

  return (
    <PrototypeToolThemeContext.Provider value={contextValue}>
      <div
        id={PROTOTYPE_ROOT_ID}
        data-prototype-root
        data-prototype-comment-theme={theme}
        className={cn(className)}
      >
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
      </div>
    </PrototypeToolThemeContext.Provider>
  );
}

export function usePrototypeToolTheme(): PrototypeToolThemeContextValue {
  const context = useContext(PrototypeToolThemeContext);

  if (!context) {
    return {
      theme: DEFAULT_THEME,
      useLightTheme: false,
      commentTheme: DEFAULT_THEME,
      isThemeLocked: false,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }

  return context;
}

function readActivePrototypeToolTheme(): PrototypeToolTheme {
  if (typeof document === "undefined") return DEFAULT_THEME;

  const roots = document.querySelectorAll<HTMLElement>("[data-prototype-root]");
  const activeRoot = roots[roots.length - 1] ?? roots[0];
  return normalizeTheme(activeRoot?.getAttribute("data-prototype-comment-theme") ?? DEFAULT_THEME);
}

/** Syncs with the innermost tool theme root (e.g. portaled UI outside nested providers). */
export function useActivePrototypeToolTheme(): PrototypeToolTheme {
  const { theme: contextTheme } = usePrototypeToolTheme();
  const [theme, setTheme] = useState<PrototypeToolTheme>(contextTheme);

  useEffect(() => {
    const syncTheme = () => {
      setTheme(readActivePrototypeToolTheme());
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    for (const root of document.querySelectorAll("[data-prototype-root]")) {
      observer.observe(root, {
        attributes: true,
        attributeFilter: ["data-prototype-comment-theme"],
      });
    }

    return () => observer.disconnect();
  }, []);

  return theme;
}
