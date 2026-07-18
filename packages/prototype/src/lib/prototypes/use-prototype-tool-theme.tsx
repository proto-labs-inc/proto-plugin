"use client";

import { TooltipProvider } from "@prototype/components/ui/tooltip";
import { PROTOTYPE_ROOT_ID } from "@prototype/lib/tool-portal";
import { cn } from "@prototype/lib/utils";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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

const PrototypeToolThemeContext =
  createContext<PrototypeToolThemeContextValue | null>(null);

const DEFAULT_THEME: PrototypeToolTheme = "dark";

function normalizeTheme(value: string): PrototypeToolTheme {
  return value === "light" ? "light" : "dark";
}

type PrototypeToolThemeProviderProps = {
  children: ReactNode;
  className?: string;
};

export function PrototypeToolThemeProvider({
  children,
  className,
}: PrototypeToolThemeProviderProps) {
  const theme = DEFAULT_THEME;
  const useLightTheme = false;

  const setTheme = useCallback((_next: PrototypeToolTheme) => {}, []);

  const toggleTheme = useCallback(() => {}, []);

  const contextValue = useMemo<PrototypeToolThemeContextValue>(
    () => ({
      theme,
      useLightTheme,
      commentTheme: theme,
      isThemeLocked: true,
      setTheme,
      toggleTheme,
    }),
    [setTheme, toggleTheme],
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
      useLightTheme: DEFAULT_THEME === "light",
      commentTheme: DEFAULT_THEME,
      isThemeLocked: true,
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
