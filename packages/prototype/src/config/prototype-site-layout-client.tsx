"use client";

import { PrototypeStarterScreenShell } from "@prototype/components/starter-screens/prototype-starter-screen-shell";
import { PrototypeProvider } from "@prototype/components/prototype-provider";
import { PrototypePluginUpdatePopup } from "@prototype/components/shell/prototype-plugin-update-popup";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";

type PrototypeSiteLayoutClientProps = {
  children: ReactNode;
  galleryShell: ComponentType<{
    children: ReactNode;
    sourceDirectoryName?: string;
    sourcePath?: string;
  }>;
  sourceDirectoryName?: string;
  sourcePath?: string;
  toaster: ReactNode;
};

export function PrototypeSiteLayoutClient({
  children,
  galleryShell: GalleryShell,
  sourceDirectoryName,
  sourcePath,
  toaster,
}: PrototypeSiteLayoutClientProps) {
  const pathname = usePathname();
  const isGalleryRoute =
    pathname === "/" ||
    pathname === "/starter-screens" ||
    pathname.startsWith("/component-library");
  const isStarterScreenPreview =
    pathname.startsWith("/starter-screens/") && pathname !== "/starter-screens";

  if (isStarterScreenPreview) {
    return (
      <PrototypeStarterScreenShell>
        {children}
        <PrototypePluginUpdatePopup />
        {toaster}
      </PrototypeStarterScreenShell>
    );
  }

  if (isGalleryRoute) {
    return (
      <PrototypeProvider className="bg-[var(--bg-main)] flex h-svh min-h-svh w-full flex-col overflow-hidden">
        <GalleryShell
          sourceDirectoryName={sourceDirectoryName}
          sourcePath={sourcePath}
        >
          {children}
        </GalleryShell>
        <PrototypePluginUpdatePopup />
        {toaster}
      </PrototypeProvider>
    );
  }

  return (
    <PrototypeProvider className="bg-[var(--bg-ground)] flex h-svh overflow-hidden">
      {children}
      <PrototypePluginUpdatePopup />
      {toaster}
    </PrototypeProvider>
  );
}
