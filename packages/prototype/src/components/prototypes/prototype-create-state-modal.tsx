"use client";

import { Button } from "@prototype/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@prototype/components/ui/dialog";
import { buildCreatePreviewStateCopyText } from "@prototype/lib/prototypes/prototype-preview-state-types";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

const MODAL_CHROME_BUTTON_CLASS =
  "text-muted-foreground hover:text-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-sm border-0 bg-transparent p-0 opacity-70 transition-opacity duration-200 ease hover:opacity-100 outline-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-40 disabled:hover:opacity-40 disabled:hover:text-muted-foreground motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

const BRIEF_TEXTAREA_CLASS =
  "field-sizing-content min-h-[min(50vh,20rem)] w-full resize-y border-0 bg-transparent px-0 py-0 text-sm leading-relaxed text-foreground shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="tool-dialog-surface flex max-h-[min(92svh,calc(100%-2rem))] w-[min(42rem,calc(100vw-2rem))] max-w-[min(42rem,calc(100vw-2rem))] flex-col gap-0 overflow-hidden border-0 p-0 sm:max-w-[min(42rem,calc(100vw-2rem))]"
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4">
          <div className="flex min-w-0 flex-col gap-1">
            <DialogTitle className="text-base font-medium text-foreground">
              New state
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Describe a page state to add — loading, empty, error, or any other
              preview mode.
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
            placeholder="e.g. Add an empty state when the user has no API keys yet"
            aria-label="State brief"
            className={BRIEF_TEXTAREA_CLASS}
          />
        </div>

        <div
          className="h-px w-full shrink-0 bg-border"
          role="separator"
          aria-hidden
        />

        <div className="flex items-center justify-end gap-2 px-5 py-4">
          <Button
            type="button"
            disabled={!canCopy}
            onClick={handleCopy}
            aria-label="Copy state brief and prompt"
          >
            {isCopied ? "Copied" : "Copy prompt"}
            {icon}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
