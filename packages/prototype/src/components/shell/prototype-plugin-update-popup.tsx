"use client";

import { Button } from "@prototype/components/ui/button";
import { buildUpgradeProtoPluginCopyText } from "@prototype/lib/prototypes/upgrade-proto-plugin-prompt";
import { useProtoPluginVersionCheck } from "@prototype/lib/prototypes/use-proto-plugin-version-check";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { cn } from "@prototype/lib/utils";
import { X } from "lucide-react";
import { toast } from "sonner";

export function PrototypePluginUpdatePopup() {
  const { status, shouldShowPopup, dismiss } = useProtoPluginVersionCheck();
  const { copy, icon, isCopied } = useCopyToClipboard();

  if (!shouldShowPopup || !status?.installed || !status.latest) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await copy(
        buildUpgradeProtoPluginCopyText({
          installed: status.installed!,
          latest: status.latest!,
        }),
      );
    } catch {
      toast.error("Copy error", {
        description: "Failed to copy upgrade prompt",
      });
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "border-border bg-card ring-border pointer-events-auto fixed bottom-4 left-4 z-[1050] flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-3 rounded-xl border p-4 shadow-lg ring-[0.5px]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Update proto-plugin</p>
          <p className="mt-1 text-sm text-muted-foreground">
            v{status.latest} is available. You&apos;re on v{status.installed}.
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss update notification"
          className="text-muted-foreground hover:text-foreground shrink-0 rounded p-1 transition-colors duration-200 ease"
          onClick={dismiss}
        >
          <X size={14} />
        </button>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 w-fit cursor-pointer gap-1.5"
        onClick={() => {
          void handleCopy();
        }}
        aria-label="Copy upgrade prompt"
      >
        {isCopied ? "Copied prompt" : "Copy prompt"}
        {icon}
      </Button>
    </div>
  );
}
