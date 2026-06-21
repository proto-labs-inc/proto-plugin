import type { ComponentType, ReactNode } from "react";

import { PrototypeGalleryShell } from "@prototype/components/shell/prototype-gallery-shell";

import { PrototypeSiteLayoutClient } from "./prototype-site-layout-client";

type PrototypeSiteLayoutOptions = {
  toaster?: ReactNode;
};

export function createPrototypeSiteLayout(
  options: PrototypeSiteLayoutOptions = {},
) {
  return function PrototypeSiteLayout({
    children,
  }: Readonly<{
    children: ReactNode;
  }>) {
    return (
      <PrototypeSiteLayoutClient
        galleryShell={PrototypeGalleryShell as ComponentType<{ children: ReactNode }>}
        toaster={options.toaster}
      >
        {children}
      </PrototypeSiteLayoutClient>
    );
  };
}
