"use client";

import { Button } from "@prototype/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@prototype/components/ui/dialog";
import { Switch } from "@prototype/components/ui/switch";
import { buildCreateDesignExplorationCopyText } from "@prototype/lib/prototypes/design-exploration-types";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

const MODAL_CHROME_BUTTON_CLASS =
  "text-muted-foreground hover:text-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-sm border-0 bg-transparent p-0 opacity-70 transition-opacity duration-200 ease hover:opacity-100 outline-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-40 disabled:hover:opacity-40 disabled:hover:text-muted-foreground motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

const BRIEF_TEXTAREA_CLASS =
  "field-sizing-content min-h-[min(50vh,20rem)] w-full resize-y border-0 bg-transparent px-0 py-0 text-sm leading-relaxed text-foreground shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0";

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
    copy(
      buildCreateDesignExplorationCopyText({
        slug,
        existingExplorations,
        origin,
        briefText: brief,
        includeMobbin,
      }),
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="tool-dialog-surface flex max-h-[min(92svh,calc(100%-2rem))] w-[min(42rem,calc(100vw-2rem))] max-w-[min(42rem,calc(100vw-2rem))] flex-col gap-0 overflow-hidden border-0 p-0 sm:max-w-[min(42rem,calc(100vw-2rem))]"
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4">
          <div className="flex min-w-0 flex-col gap-1">
            <DialogTitle className="text-base font-medium text-foreground">
              New exploration
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Describe what you&apos;re trying to build, and we&apos;ll give you
              a few different versions.
            </p>
          </div>
          <DialogClose className={MODAL_CHROME_BUTTON_CLASS}>
            <X />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <div
          className="h-px w-full shrink-0 bg-border"
          role="separator"
          aria-hidden
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4">
          <textarea
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            placeholder="e.g. Give me a settings page with a profile picture, name, plan, and bio"
            aria-label="Exploration brief"
            className={BRIEF_TEXTAREA_CLASS}
          />
        </div>

        <div
          className="h-px w-full shrink-0 bg-border"
          role="separator"
          aria-hidden
        />

        <div className="flex items-center justify-between gap-4 px-5 py-3">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
