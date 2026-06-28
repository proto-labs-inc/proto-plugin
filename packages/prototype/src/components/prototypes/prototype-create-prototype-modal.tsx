"use client";

import { Button } from "@prototype/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@prototype/components/ui/dialog";
import { Input } from "@prototype/components/ui/input";
import { Label } from "@prototype/components/ui/label";
import { buildCreatePrototypeCopyText } from "@prototype/lib/prototypes/create-prototype-prompt";
import type { PrototypeMetadata } from "@prototype/lib/prototypes/prototype-config-types";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { X } from "lucide-react";
import { useEffect, useId, useState } from "react";

const MODAL_CHROME_BUTTON_CLASS =
  "text-muted-foreground hover:text-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-sm border-0 bg-transparent p-0 opacity-70 transition-opacity duration-200 ease hover:opacity-100 outline-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-40 disabled:hover:opacity-40 disabled:hover:text-muted-foreground motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

const MODAL_FIELD_BORDER_CLASS =
  "border border-border shadow-none outline-none transition-colors focus-visible:border-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-muted-foreground/20 focus-visible:ring-offset-0";

const DESCRIPTION_TEXTAREA_CLASS =
  `field-sizing-content min-h-[min(40vh,14rem)] w-full resize-y rounded-md bg-transparent px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground ${MODAL_FIELD_BORDER_CLASS}`;

export type PrototypeCreatePrototypeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingPrototypes: PrototypeMetadata[];
};

export function PrototypeCreatePrototypeModal({
  open,
  onOpenChange,
  existingPrototypes,
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
        existingPrototypes,
        origin,
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
              New prototype
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Name the prototype and describe what you want to build. Copy the
              prompt into your agent to scaffold it.
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

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={titleFieldId} className="text-foreground">
              Title
            </Label>
            <Input
              id={titleFieldId}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="ex. Team Settings"
              className={MODAL_FIELD_BORDER_CLASS}
            />
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-1.5">
            <Label htmlFor={descriptionFieldId} className="text-foreground">
              Description
            </Label>
            <textarea
              id={descriptionFieldId}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="ex. Replicate the team settings page from the source app — members list, invite flow, and role badges."
              aria-label="Prototype description"
              className={DESCRIPTION_TEXTAREA_CLASS}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4">
          <Button
            type="button"
            disabled={!canCopy}
            onClick={handleCopy}
            aria-label="Copy prototype brief and prompt"
          >
            {isCopied ? "Copied" : "Copy prompt"}
            {icon}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
