"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@prototype/components/ui/dialog";
import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { cn } from "@prototype/lib/utils";

import { SubmitShapeModalBlock } from "./submit-shape-modal-block";
import { SUBMIT_MODAL_TITLE, type SubmitModalVariant } from "./submit-modal-content";
import type { ProtoShapeSelection } from "./proto-shape-customizer-block";

type SubmitShapeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selection: ProtoShapeSelection;
  variant?: SubmitModalVariant;
  onKeepEditing: () => void;
  onSeeOnHomepage: () => void;
};

export function SubmitShapeModal({
  open,
  onOpenChange,
  selection,
  variant = "plain-header",
  onKeepEditing,
  onSeeOnHomepage,
}: SubmitShapeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/65"
        className={cn(
          "w-[min(24rem,calc(100vw-2rem))] max-w-[min(24rem,calc(100vw-2rem))] gap-0 border-0 bg-transparent p-0 shadow-none sm:max-w-[min(24rem,calc(100vw-2rem))]",
          "font-[family-name:var(--font-dm-sans)]!",
        )}
      >
        <PrototypeComponent id="submit-shape-modal">
          <DialogTitle className="sr-only">{SUBMIT_MODAL_TITLE}</DialogTitle>
          <SubmitShapeModalBlock
            variant={variant}
            selection={selection}
            onKeepEditing={onKeepEditing}
            onSeeOnHomepage={onSeeOnHomepage}
          />
        </PrototypeComponent>
      </DialogContent>
    </Dialog>
  );
}
