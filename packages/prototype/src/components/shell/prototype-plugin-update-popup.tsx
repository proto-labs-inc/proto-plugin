"use client";

import { Button } from "@prototype/components/ui/button";
import { buildUpgradeProtoPluginCopyText } from "@prototype/lib/prototypes/upgrade-proto-plugin-prompt";
import { useProtoPluginVersionCheck } from "@prototype/lib/prototypes/use-proto-plugin-version-check";
import { useActivePrototypeToolTheme } from "@prototype/lib/prototypes/use-prototype-tool-theme";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { cn } from "@prototype/lib/utils";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

export function PrototypePluginUpdatePopup() {
  const { status, shouldShowPopup, dismiss } = useProtoPluginVersionCheck();
  const { copy, icon, isCopied } = useCopyToClipboard();
  const theme = useActivePrototypeToolTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!shouldShowPopup || !status?.installed || !status.latest || !mounted) {
    return null;
  }

  const installed = status.installed;
  const latest = status.latest;

  const handleCopyPrompt = async () => {
    try {
      await copy(
        buildUpgradeProtoPluginCopyText({
          installed,
          latest,
        }),
      );
    } catch {
      toast.error("Copy error", {
        description: "Failed to copy update prompt",
      });
    }
  };

  return createPortal(
    <div
      data-prototype-root
      data-prototype-comment-theme={theme}
      className="pointer-events-none fixed bottom-4 right-4 z-[1050] !bg-transparent"
    >
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-auto relative flex w-[15rem] flex-col gap-3 rounded-lg bg-[var(--tool-chrome-surface)] p-4 shadow-md ring-[0.5px] ring-[var(--tool-chrome-border)]",
        )}
      >
        <button
          type="button"
          aria-label="Dismiss update notification"
          className="absolute right-2 top-2 rounded p-1 text-[var(--tool-chrome-text-muted)] transition-colors duration-200 ease hover:text-[var(--tool-chrome-text-heading)]"
          onClick={dismiss}
        >
          <X size={12} />
        </button>

        <p className="pr-4 text-xs leading-relaxed text-[var(--tool-chrome-text-muted)]">
          A new version of Proto is available, copy the prompt below into your agent to update
        </p>

        <Button
          type="button"
          variant="chrome"
          size="sm"
          className="h-7 w-fit cursor-pointer gap-1 px-2 text-[11px]"
          onClick={() => {
            void handleCopyPrompt();
          }}
          aria-label="Copy update prompt"
        >
          {isCopied ? "Copied update prompt" : "Copy update prompt"}
          {icon}
        </Button>
      </div>
    </div>,
    document.body,
  );
}
