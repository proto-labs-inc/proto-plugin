"use client";

import { PrototypeToolDialog } from "@prototype/components/platform-ui/prototype-tool-dialog";
import { PrototypeBriefTextarea } from "@prototype/components/prototypes/prototype-brief-field";
import { Button } from "@prototype/components/ui/button";
import { Switch } from "@prototype/components/ui/switch";
import { buildCreateDesignExplorationCopyText } from "@prototype/lib/prototypes/design-exploration-types";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { useEffect, useState } from "react";

export type PrototypeCreateExplorationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  existingExplorations: Array<{ id: string; label: string }>;
};

export function PrototypeCreateExplorationModal({
  open,
  onOpenChange,
  slug,
  existingExplorations,
}: PrototypeCreateExplorationModalProps) {
  const [brief, setBrief] = useState("");
  const [includeMobbin, setIncludeMobbin] = useState(true);
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
    const previewUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}${window.location.search}`
        : undefined;
    copy(
      buildCreateDesignExplorationCopyText({
        slug,
        existingExplorations,
        origin,
        previewUrl,
        briefText: brief,
        includeMobbin,
      }),
    );
  };

  return (
    <PrototypeToolDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New exploration"
      description="Describe what you're trying to build, and we'll give you a few different versions."
      footerClassName="justify-between gap-4"
      footer={
        <>
          <label className="flex cursor-pointer items-center gap-2">
            <Switch
              checked={includeMobbin}
              onCheckedChange={setIncludeMobbin}
              aria-label="Gather references from Mobbin"
              className="data-[state=checked]:bg-foreground"
            />
            <span className="text-sm text-muted-foreground">
              Gather references from Mobbin
            </span>
          </label>
          <Button
            type="button"
            variant="chrome"
            size="sm"
            className="h-8 gap-1.5"
            disabled={!canCopy}
            onClick={handleCopy}
            aria-label="Copy exploration brief and prompt"
          >
            {isCopied ? "Copied prompt" : "Copy prompt"}
            {icon}
          </Button>
        </>
      }
    >
      <PrototypeBriefTextarea
        value={brief}
        onChange={(event) => setBrief(event.target.value)}
        placeholder="e.g. Give me a settings page with a profile picture, name, plan, and bio"
        aria-label="Exploration brief"
      />
    </PrototypeToolDialog>
  );
}
