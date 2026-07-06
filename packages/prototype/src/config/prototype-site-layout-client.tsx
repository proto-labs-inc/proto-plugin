"use client";

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
    pathname === "/" || pathname.startsWith("/component-library");

  if (isGalleryRoute) {
    return (
      <div className="bg-[var(--bg-main)] flex h-svh min-h-svh w-full flex-col overflow-hidden">
        <GalleryShell
          sourceDirectoryName={sourceDirectoryName}
          sourcePath={sourcePath}
        >
          {children}
        </GalleryShell>
        {toaster}
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-ground)] flex h-svh overflow-hidden">
      {children}
      {toaster}
    </div>
  );
}
