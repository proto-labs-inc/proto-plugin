"use client";

import type { WorkspaceProfile } from "@prototype/lib/prototypes/workspace-profile";
import { createContext, useContext, type ReactNode } from "react";

const EMPTY_WORKSPACE_PROFILE: WorkspaceProfile = {
  userName: "",
  companyName: "",
};

const WorkspaceProfileContext =
  createContext<WorkspaceProfile>(EMPTY_WORKSPACE_PROFILE);

export function PrototypeWorkspaceProfileProvider({
  profile,
  children,
}: {
  profile: WorkspaceProfile;
  children: ReactNode;
}) {
  return (
    <WorkspaceProfileContext.Provider value={profile}>
      {children}
    </WorkspaceProfileContext.Provider>
  );
}

export function useWorkspaceProfile(): WorkspaceProfile {
  return useContext(WorkspaceProfileContext);
}
