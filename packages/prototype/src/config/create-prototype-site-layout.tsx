import "server-only";

import type { ComponentType, ReactNode } from "react";

import { PrototypeGalleryShell } from "@prototype/components/shell/prototype-gallery-shell";

import { formatSourceDirectoryName } from "@prototype/lib/format-source-directory-name";
import { readWorkspaceProfileFromEnv } from "@prototype/lib/prototypes/workspace-profile";

import { evaluateHostBootstrapStatus } from "../server/evaluate-prototype-bootstrap-status";
import { PrototypeSiteLayoutClient } from "./prototype-site-layout-client";

type PrototypeSiteLayoutOptions = {
  toaster?: ReactNode;
  sourceDirectoryName?: string;
};

export function createPrototypeSiteLayout(
  options: PrototypeSiteLayoutOptions = {},
) {
  const sourcePath = process.env.SOURCE_PATH;
  const sourceDirectoryName =
    options.sourceDirectoryName ?? formatSourceDirectoryName(sourcePath);
  const workspaceProfile = readWorkspaceProfileFromEnv();
  const debug = process.env.DEBUG === "true";
  const workspaceOnboarded = evaluateHostBootstrapStatus().complete;

  return function PrototypeSiteLayout({
    children,
  }: Readonly<{
    children: ReactNode;
  }>) {
    return (
      <PrototypeSiteLayoutClient
        galleryShell={PrototypeGalleryShell as ComponentType<{
          children: ReactNode;
          sourceDirectoryName?: string;
          sourcePath?: string;
          debug?: boolean;
          workspaceOnboarded?: boolean;
        }>}
        sourceDirectoryName={sourceDirectoryName}
        sourcePath={sourcePath}
        debug={debug}
        workspaceOnboarded={workspaceOnboarded}
        workspaceProfile={workspaceProfile}
        toaster={options.toaster}
      >
        {children}
      </PrototypeSiteLayoutClient>
    );
  };
}
