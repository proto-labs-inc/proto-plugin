"use client";

import { PrototypeToolDialog } from "@prototype/components/platform-ui/prototype-tool-dialog";
import { PrototypeBriefTextarea } from "@prototype/components/prototypes/prototype-brief-field";
import { Button } from "@prototype/components/ui/button";
import { buildCreatePreviewStateCopyText } from "@prototype/lib/prototypes/prototype-preview-state-types";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { useEffect, useState } from "react";

export type PrototypeCreateStateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  existingStates: Array<{ id: string; label: string }>;
};

export function PrototypeCreateStateModal({
  open,
  onOpenChange,
  slug,
  existingStates,
}: PrototypeCreateStateModalProps) {
  const [brief, setBrief] = useState("");
  const { copy, icon, isCopied } = useCopyToClipboard();
  const canCopy = brief.trim().length > 0;

  useEffect(() => {
    if (!open) {
      setBrief("");
    }
  }, [open]);

  const handleCopy = () => {
    if (!canCopy) return;

    const origin =
      typeof window !== "undefined" ? window.location.origin : undefined;
    copy(
      buildCreatePreviewStateCopyText({
        slug,
        existingStates,
        origin,
        briefText: brief,
      }),
    );
  };

  return (
    <PrototypeToolDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New state"
      description="Describe a page state to add — loading, empty, error, or any other preview mode."
      footerClassName="justify-end"
      footer={
        <Button
          type="button"
          variant="chrome"
          size="sm"
          className="h-8 gap-1.5"
          disabled={!canCopy}
          onClick={handleCopy}
          aria-label="Copy state brief and prompt"
        >
          {isCopied ? "Copied prompt" : "Copy prompt"}
          {icon}
        </Button>
      }
    >
      <PrototypeBriefTextarea
        value={brief}
        onChange={(event) => setBrief(event.target.value)}
        placeholder="e.g. Add an empty state when the user has no API keys yet"
        aria-label="State brief"
      />
    </PrototypeToolDialog>
  );
}
