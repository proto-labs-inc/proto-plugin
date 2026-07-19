"use client";

import { PrototypeToolDialog } from "@prototype/components/platform-ui/prototype-tool-dialog";
import {
  PROTOTYPE_BRIEF_FIELD_BORDER_CLASS,
} from "@prototype/components/prototypes/prototype-brief-field";
import { Button } from "@prototype/components/ui/button";
import { Input } from "@prototype/components/ui/input";
import { Label } from "@prototype/components/ui/label";
import { buildWorkspaceProfileCopyText } from "@prototype/lib/prototypes/profile-prompt";
import { useTrackEvent } from "@prototype/lib/prototypes/telemetry/prototype-telemetry-context";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

export type PrototypeSettingsProfileModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  onSave: (values: { userName: string }) => void;
};

export function PrototypeSettingsProfileModal({
  open,
  onOpenChange,
  userName,
  onSave,
}: PrototypeSettingsProfileModalProps) {
  const userNameFieldId = useId();
  const [draftUserName, setDraftUserName] = useState(userName);
  const [isCopying, setIsCopying] = useState(false);
  const { copy, icon, isCopied } = useCopyToClipboard();
  const track = useTrackEvent();

  const canCopy = draftUserName.trim().length > 0;

  useEffect(() => {
    if (!open) return;
    setDraftUserName(userName);
  }, [open, userName]);

  const handleCopy = async () => {
    if (!canCopy || isCopying) return;

    setIsCopying(true);

    try {
      onSave({
        userName: draftUserName,
      });

      await copy(
        buildWorkspaceProfileCopyText({
          userName: draftUserName,
        }),
      );
      track("modal.prompt_copied", { modal: "settings-profile" });
    } catch {
      toast.error("Copy error", {
        description: "Failed to copy profile prompt",
      });
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <PrototypeToolDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit profile"
      description="Your name is included in agent prompts."
      bodyClassName="gap-4"
      footerClassName="justify-end"
      footer={
        <Button
          type="button"
          variant="chrome"
          size="sm"
          className="h-8 gap-2"
          disabled={!canCopy || isCopying}
          onClick={() => {
            void handleCopy();
          }}
          aria-label="Update profile"
        >
          {isCopied ? "Updated" : isCopying ? "Updating…" : "Update profile"}
          {icon}
        </Button>
      }
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={userNameFieldId} className="text-foreground">
          User name
        </Label>
        <Input
          id={userNameFieldId}
          value={draftUserName}
          onChange={(event) => setDraftUserName(event.target.value)}
          placeholder="Hiro Hamada"
          className={PROTOTYPE_BRIEF_FIELD_BORDER_CLASS}
        />
      </div>
    </PrototypeToolDialog>
  );
}
