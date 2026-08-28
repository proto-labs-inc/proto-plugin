"use client";

import { createContext, useContext, type ReactNode } from "react";

export type PrototypeProductPreviewTheme = "light" | "dark";

const PrototypeProductPreviewThemeContext =
  createContext<PrototypeProductPreviewTheme | null>(null);

export function PrototypeProductPreviewThemeProvider({
  theme,
  children,
}: {
  theme: PrototypeProductPreviewTheme;
  children: ReactNode;
}) {
  return (
    <PrototypeProductPreviewThemeContext.Provider value={theme}>
      {children}
    </PrototypeProductPreviewThemeContext.Provider>
  );
}

export function usePrototypeProductPreviewTheme(): PrototypeProductPreviewTheme | null {
  return useContext(PrototypeProductPreviewThemeContext);
}
