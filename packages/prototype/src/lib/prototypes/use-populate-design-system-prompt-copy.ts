"use client";

import { buildPopulateDesignSystemCopyText } from "@prototype/lib/prototypes/populate-design-system-prompt";
import { useGalleryHostConfig } from "@prototype/lib/prototypes/use-gallery-host-config";
import { useTrackEvent } from "@prototype/lib/prototypes/telemetry/prototype-telemetry-context";
import { useWorkspaceProfile } from "@prototype/lib/prototypes/use-workspace-profile";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function usePopulateDesignSystemPromptCopy(options?: {
  telemetryModal?: string;
}) {
  const { copy, icon, isCopied } = useCopyToClipboard();
  const workspaceProfile = useWorkspaceProfile();
  const track = useTrackEvent();
  const { currentSourcePath, syncConfigPath, designSystemPagePath } =
    useGalleryHostConfig();
  const [isCopying, setIsCopying] = useState(false);

  const copyDesignSystemPrompt = useCallback(async () => {
    if (isCopying) return false;

    setIsCopying(true);

    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : undefined;

      await copy(
        buildPopulateDesignSystemCopyText({
          sourcePath: currentSourcePath,
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
        description: "Failed to copy the design system prompt",
      });
      return false;
    } finally {
      setIsCopying(false);
    }
  }, [
    copy,
    currentSourcePath,
    designSystemPagePath,
    isCopying,
    options?.telemetryModal,
    syncConfigPath,
    track,
    workspaceProfile,
  ]);

  return {
    copyDesignSystemPrompt,
    icon,
    isCopied,
    isCopying,
  };
}
