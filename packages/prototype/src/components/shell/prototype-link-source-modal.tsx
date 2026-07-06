"use client";

import { PrototypeToolDialog } from "@prototype/components/platform-ui/prototype-tool-dialog";
import { Button } from "@prototype/components/ui/button";
import { Input } from "@prototype/components/ui/input";
import { Label } from "@prototype/components/ui/label";
import { PROTOTYPE_BRIEF_FIELD_BORDER_CLASS } from "@prototype/components/prototypes/prototype-brief-field";
import { buildLinkSourceCopyText } from "@prototype/lib/prototypes/link-source-prompt";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

export type PrototypeLinkSourceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSourcePath?: string;
};

export function PrototypeLinkSourceModal({
  open,
  onOpenChange,
  currentSourcePath,
}: PrototypeLinkSourceModalProps) {
  const pathFieldId = useId();
  const [sourcePath, setSourcePath] = useState("");
  const [isCopying, setIsCopying] = useState(false);
  const { copy, icon, isCopied } = useCopyToClipboard();
  const canCopy = sourcePath.trim().length > 0;
  const isUpdate = Boolean(currentSourcePath?.trim());

  useEffect(() => {
    if (!open) {
      setSourcePath("");
      return;
    }

    setSourcePath(currentSourcePath?.trim() ?? "");
  }, [open, currentSourcePath]);

  const handleCopy = async () => {
    if (!canCopy || isCopying) return;

    setIsCopying(true);

    try {
      await copy(
        buildLinkSourceCopyText({
          sourcePath,
          currentSourcePath,
        }),
      );
    } catch {
      toast.error("Copy error", {
        description: "Failed to copy link source prompt",
      });
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <PrototypeToolDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isUpdate ? "Change source app" : "Link source app"}
      description="Set the codebase for which you're making prototypes."
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
          aria-label="Copy link source prompt"
        >
          {isCopied ? "Copied prompt" : isCopying ? "Copying…" : "Copy prompt"}
          {icon}
        </Button>
      }
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={pathFieldId} className="text-foreground">
          Source path, description of folder, or folder name
        </Label>
        <Input
          id={pathFieldId}
          value={sourcePath}
          onChange={(event) => setSourcePath(event.target.value)}
          placeholder="ex. ../cal.diy, cal.diy, or sibling folder to this host app"
          className={PROTOTYPE_BRIEF_FIELD_BORDER_CLASS}
        />
      </div>
    </PrototypeToolDialog>
  );
}
