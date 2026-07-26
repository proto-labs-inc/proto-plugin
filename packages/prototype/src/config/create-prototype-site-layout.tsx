import "server-only";

import type { ComponentType, ReactNode } from "react";

import { PrototypeGalleryShell } from "@prototype/components/shell/prototype-gallery-shell";

import { formatSourceDirectoryName } from "@prototype/lib/format-source-directory-name";
import {
  WORKSPACE_PROFILE_ENV_KEYS,
  type WorkspaceProfile,
} from "@prototype/lib/prototypes/workspace-profile";

import { evaluateHostBootstrapStatus } from "../server/evaluate-prototype-bootstrap-status";
import { readHostEnvValue, resolveHostRoot } from "../server/host-env";
import { PrototypeSiteLayoutClient } from "./prototype-site-layout-client";

type PrototypeSiteLayoutOptions = {
  toaster?: ReactNode;
  sourceDirectoryName?: string;
};

function readWorkspaceProfileFromHostEnv(hostRoot: string): WorkspaceProfile {
  return {
    userName:
      readHostEnvValue(hostRoot, WORKSPACE_PROFILE_ENV_KEYS.userName) ?? "",
    companyName:
      readHostEnvValue(hostRoot, WORKSPACE_PROFILE_ENV_KEYS.companyName) ?? "",
  };
}

export function createPrototypeSiteLayout(
  options: PrototypeSiteLayoutOptions = {},
) {
  const hostRoot = resolveHostRoot();
  const sourcePath = readHostEnvValue(hostRoot, "SOURCE_PATH");
  const sourceDirectoryName =
    options.sourceDirectoryName ?? formatSourceDirectoryName(sourcePath);
  const workspaceProfile = readWorkspaceProfileFromHostEnv(hostRoot);
  const debug = readHostEnvValue(hostRoot, "DEBUG") === "true";
  const workspaceOnboarded = evaluateHostBootstrapStatus({ hostRoot }).complete;

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
