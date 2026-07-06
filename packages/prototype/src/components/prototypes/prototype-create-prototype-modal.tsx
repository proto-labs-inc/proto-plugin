"use client";

import { PrototypeToolDialog } from "@prototype/components/platform-ui/prototype-tool-dialog";
import { Button } from "@prototype/components/ui/button";
import { Input } from "@prototype/components/ui/input";
import { Label } from "@prototype/components/ui/label";
import {
  PROTOTYPE_BRIEF_FIELD_BORDER_CLASS,
  PrototypeBriefTextarea,
} from "@prototype/components/prototypes/prototype-brief-field";
import { buildCreatePrototypeCopyText } from "@prototype/lib/prototypes/create-prototype-prompt";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { useEffect, useId, useState } from "react";

export type PrototypeCreatePrototypeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PrototypeCreatePrototypeModal({
  open,
  onOpenChange,
}: PrototypeCreatePrototypeModalProps) {
  const titleFieldId = useId();
  const descriptionFieldId = useId();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { copy, icon, isCopied } = useCopyToClipboard();
  const canCopy = title.trim().length > 0 && description.trim().length > 0;

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
    }
  }, [open]);

  const handleCopy = () => {
    if (!canCopy) return;

    const origin =
      typeof window !== "undefined" ? window.location.origin : undefined;

    copy(
      buildCreatePrototypeCopyText({
        title,
        description,
        origin,
      }),
    );
  };

  return (
    <PrototypeToolDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New prototype"
      description="Name the prototype and describe what you want to build, then copy the prompt into your agent to scaffold it."
      bodyClassName="gap-4"
      footerClassName="justify-end"
      footer={
        <Button
          type="button"
          variant="chrome"
          size="sm"
          className="h-8 gap-1.5"
          disabled={!canCopy}
          onClick={handleCopy}
          aria-label="Copy prototype brief and prompt"
        >
          {isCopied ? "Copied prompt" : "Copy prompt"}
          {icon}
        </Button>
      }
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={titleFieldId} className="text-foreground">
          Title
        </Label>
        <Input
          id={titleFieldId}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="ex. Team Settings"
          className={PROTOTYPE_BRIEF_FIELD_BORDER_CLASS}
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1.5">
        <Label htmlFor={descriptionFieldId} className="text-foreground">
          Description
        </Label>
        <PrototypeBriefTextarea
          id={descriptionFieldId}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="ex. Replicate the team settings page from the source app — members list, invite flow, and role badges."
          aria-label="Prototype description"
        />
      </div>
    </PrototypeToolDialog>
  );
}
