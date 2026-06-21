"use client";

import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";

type PrototypeSiteLayoutClientProps = {
  children: ReactNode;
  galleryShell: ComponentType<{ children: ReactNode }>;
  toaster: ReactNode;
};

export function PrototypeSiteLayoutClient({
  children,
  galleryShell: GalleryShell,
  toaster,
}: PrototypeSiteLayoutClientProps) {
  const pathname = usePathname();
  const isGalleryHome = pathname === "/";

  if (isGalleryHome) {
    return (
      <>
        <GalleryShell>{children}</GalleryShell>
        {toaster}
      </>
    );
  }

  return (
    <div className="bg-[var(--bg-ground)] flex h-svh overflow-hidden">
      {children}
      {toaster}
    </div>
  );
}
