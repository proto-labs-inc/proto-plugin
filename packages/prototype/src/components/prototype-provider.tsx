"use client";

import { PrototypeToolThemeProvider } from "@prototype/lib/prototypes/use-prototype-tool-theme";
import type { ReactNode } from "react";

type PrototypeProviderProps = {
  children: ReactNode;
  className?: string;
};

export function PrototypeProvider({
  children,
  className,
}: PrototypeProviderProps) {
  return (
    <PrototypeToolThemeProvider className={className}>
      {children}
    </PrototypeToolThemeProvider>
  );
}
