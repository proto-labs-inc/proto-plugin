"use client";

import { createContext, useContext, type ReactNode } from "react";

export type GalleryHostConfig = {
  /** Full linked SOURCE_PATH from the host — not the sidebar display name. */
  currentSourcePath?: string;
  syncConfigPath?: string;
  designSystemPagePath?: string;
};

const GalleryHostConfigContext = createContext<GalleryHostConfig>({});

export function GalleryHostConfigProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: GalleryHostConfig;
}) {
  return (
    <GalleryHostConfigContext.Provider value={value}>
      {children}
    </GalleryHostConfigContext.Provider>
  );
}

export function useGalleryHostConfig(): GalleryHostConfig {
  return useContext(GalleryHostConfigContext);
}
