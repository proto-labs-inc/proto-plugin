"use client";

import { PrototypeProvider } from "@prototype/components/prototype-provider";
import { PrototypeTelemetryProvider } from "@prototype/lib/prototypes/telemetry/prototype-telemetry-context";
import { PrototypeWorkspaceProfileProvider } from "@prototype/lib/prototypes/use-workspace-profile";
import type { WorkspaceProfile } from "@prototype/lib/prototypes/workspace-profile";
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
  workspaceProfile: WorkspaceProfile;
  toaster?: ReactNode;
};

export function PrototypeSiteLayoutClient({
  children,
  galleryShell: GalleryShell,
  sourceDirectoryName,
  sourcePath,
  workspaceProfile,
  toaster,
}: PrototypeSiteLayoutClientProps) {
  const pathname = usePathname();
  const isGalleryRoute =
    pathname === "/" ||
    pathname.startsWith("/component-library") ||
    pathname.startsWith("/agent-instructions") ||
    pathname.startsWith("/settings");

  if (isGalleryRoute) {
    return (
      <PrototypeWorkspaceProfileProvider profile={workspaceProfile}>
        <PrototypeTelemetryProvider>
          <PrototypeProvider className="bg-[var(--bg-main)] flex h-svh min-h-svh w-full flex-col overflow-hidden">
            <GalleryShell
              sourceDirectoryName={sourceDirectoryName}
              sourcePath={sourcePath}
            >
              {children}
            </GalleryShell>
            {toaster}
          </PrototypeProvider>
        </PrototypeTelemetryProvider>
      </PrototypeWorkspaceProfileProvider>
    );
  }

  return (
    <PrototypeWorkspaceProfileProvider profile={workspaceProfile}>
      <PrototypeTelemetryProvider>
        <PrototypeProvider className="bg-[var(--bg-ground)] flex h-svh overflow-hidden">
          {children}
          {toaster}
        </PrototypeProvider>
      </PrototypeTelemetryProvider>
    </PrototypeWorkspaceProfileProvider>
  );
}
