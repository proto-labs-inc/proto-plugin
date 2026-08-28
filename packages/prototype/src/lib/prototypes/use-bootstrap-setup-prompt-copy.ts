"use client";

import { buildBootstrapSetupCopyText } from "@prototype/lib/prototypes/bootstrap-setup-prompt";
import { resolveOnboardingSourceForSetup } from "@prototype/lib/prototypes/resolve-onboarding-source-for-setup";
import { useGalleryHostConfig } from "@prototype/lib/prototypes/use-gallery-host-config";
import { usePersistedLocalString } from "@prototype/lib/prototypes/use-persisted-local-state";
import { useTrackEvent } from "@prototype/lib/prototypes/telemetry/prototype-telemetry-context";
import { useWorkspaceProfile } from "@prototype/lib/prototypes/use-workspace-profile";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const PROFILE_STORAGE_KEYS = {
  agentContext: "prototype-profile:agent-context",
  agentContextPath: "prototype-profile:agent-context-path",
} as const;

export function useBootstrapSetupPromptCopy(options?: {
  telemetryModal?: string;
}) {
  const { copy, icon, isCopied } = useCopyToClipboard();
  const workspaceProfile = useWorkspaceProfile();
  const track = useTrackEvent();
  const { currentSourcePath, syncConfigPath, designSystemPagePath } =
    useGalleryHostConfig();
  const { value: agentContext } = usePersistedLocalString(
    PROFILE_STORAGE_KEYS.agentContext,
    "",
  );
  const { value: agentContextPath } = usePersistedLocalString(
    PROFILE_STORAGE_KEYS.agentContextPath,
    "",
  );
  const [isCopying, setIsCopying] = useState(false);

  const copySetupPrompt = useCallback(async () => {
    if (isCopying) return false;

    setIsCopying(true);

    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : undefined;
      const onboardingSource = resolveOnboardingSourceForSetup({
        selectedDirectory: null,
      });

      await copy(
        buildBootstrapSetupCopyText({
          sourcePath: onboardingSource.absolutePath,
          sourceFolderName: onboardingSource.folderName,
          currentSourcePath,
          userName: workspaceProfile.userName,
          agentContext,
          agentContextPath: agentContextPath.trim() || undefined,
          syncConfigPath,
          designSystemPagePath,
          origin,
          workspaceProfile,
        }),
      );

      if (options?.telemetryModal) {
        track("modal.prompt_copied", { modal: options.telemetryModal });
      }

      return true;
    } catch {
      toast.error("Copy error", {
        description: "Failed to copy the setup prompt",
      });
      return false;
    } finally {
      setIsCopying(false);
    }
  }, [
    agentContext,
    agentContextPath,
    designSystemPagePath,
    copy,
    currentSourcePath,
    isCopying,
    options?.telemetryModal,
    syncConfigPath,
    track,
    workspaceProfile,
  ]);

  return {
    copySetupPrompt,
    icon,
    isCopied,
    isCopying,
  };
}
