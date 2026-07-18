"use client";

import { PrototypeToolDialog } from "@prototype/components/platform-ui/prototype-tool-dialog";
import { PrototypeSourceDirectoryPicker } from "@prototype/components/shell/prototype-source-directory-picker";
import { Button } from "@prototype/components/ui/button";
import { buildLinkSourceCopyText } from "@prototype/lib/prototypes/link-source-prompt";
import type { SourceDirectoryPick } from "@prototype/lib/prototypes/resolve-source-directory-pick";
import { useTrackEvent } from "@prototype/lib/prototypes/telemetry/prototype-telemetry-context";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type PrototypeSettingsSourceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceName: string;
  sourceDescription: string;
  currentSourcePath?: string;
  onSave: (values: { sourceName: string; sourceDescription: string }) => void;
};

function toInitialPick(
  sourceName: string,
  sourceDescription: string,
  currentSourcePath?: string,
): SourceDirectoryPick | null {
  const trimmedName = sourceName.trim();
  const trimmedDescription = sourceDescription.trim();
  const trimmedCurrentPath = currentSourcePath?.trim();

  if (!trimmedName && !trimmedCurrentPath) {
    return null;
  }

  return {
    name: trimmedName || trimmedCurrentPath!.split(/[/\\]/).at(-1) || "source",
    path: trimmedCurrentPath || (trimmedDescription.startsWith("/") ? trimmedDescription : undefined),
  };
}

export function PrototypeSettingsSourceModal({
  open,
  onOpenChange,
  sourceName,
  sourceDescription,
  currentSourcePath,
  onSave,
}: PrototypeSettingsSourceModalProps) {
  const [selectedDirectory, setSelectedDirectory] = useState<SourceDirectoryPick | null>(
    null,
  );
  const [isCopying, setIsCopying] = useState(false);
  const { copy, icon, isCopied } = useCopyToClipboard();
  const track = useTrackEvent();

  const canCopy = Boolean(selectedDirectory?.name.trim());

  useEffect(() => {
    if (!open) return;
    setSelectedDirectory(
      toInitialPick(sourceName, sourceDescription, currentSourcePath),
    );
  }, [open, sourceName, sourceDescription, currentSourcePath]);

  const handleCopy = async () => {
    if (!selectedDirectory || !canCopy || isCopying) return;

    setIsCopying(true);

    const nextSourceName = selectedDirectory.name.trim();
    const nextSourceDescription =
      selectedDirectory.path?.trim() ||
      "Product codebase directory selected from this machine.";

    try {
      onSave({
        sourceName: nextSourceName,
        sourceDescription: nextSourceDescription,
      });

      await copy(
        buildLinkSourceCopyText({
          sourcePath: selectedDirectory.path?.trim() || nextSourceName,
          description: selectedDirectory.path ? undefined : nextSourceDescription,
          currentSourcePath,
        }),
      );
      track("modal.prompt_copied", { modal: "settings-source" });
    } catch {
      toast.error("Copy error", {
        description: "Failed to copy source directory prompt",
      });
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <PrototypeToolDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit source directory"
      bodyClassName="gap-4"
      footerClassName="justify-end"
      footer={
        <Button
          type="button"
          variant="chrome"
          size="sm"
          className="h-8 gap-1.5"
          disabled={!canCopy || isCopying}
          onClick={() => {
            void handleCopy();
          }}
          aria-label="Update source directory"
        >
          {isCopied
            ? "Updated"
            : isCopying
              ? "Updating…"
              : "Update source directory"}
          {icon}
        </Button>
      }
    >
      <PrototypeSourceDirectoryPicker
        value={selectedDirectory}
        onChange={setSelectedDirectory}
      />
    </PrototypeToolDialog>
  );
}
