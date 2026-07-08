"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "proto-plugin/ui/dialog";
import { PrototypeComponent } from "proto-plugin";
import { cn } from "@/lib/cn";
import { motion, useReducedMotion } from "motion/react";

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
  dragAttributionLabel?: string;
};

export function SubmitShapeModal({
  open,
  onOpenChange,
  selection,
  variant = "plain-header",
  onKeepEditing,
  onSeeOnHomepage,
  dragAttributionLabel,
}: SubmitShapeModalProps) {
  const reduceMotion = useReducedMotion();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/80 sm:bg-black/65"
        // The shared dialog scales its content in (scale 0.97 -> 1). On real
        // iOS Safari, text inside a scaling layer is rasterized at the sub-1
        // scale and only re-rasterizes crisply once it settles, so the title
        // appears to "flash in" a beat after the modal. Disable that animation
        // and drive a scale-free, compositor (WAAPI) entrance below instead.
        style={{ animation: "none" }}
        className={cn(
          "pointer-events-none w-[min(24rem,calc(100vw-2rem))] max-w-[min(24rem,calc(100vw-2rem))] gap-0 border-0 bg-transparent p-0 shadow-none sm:max-w-[min(24rem,calc(100vw-2rem))]",
          "font-[family-name:var(--font-dm-sans)]!",
        )}
      >
        <PrototypeComponent id="submit-shape-modal">
          <DialogTitle className="sr-only">{SUBMIT_MODAL_TITLE}</DialogTitle>
          <motion.div
            // Keep an opacity-only crossfade even under reduced motion (a fade
            // is not "motion"). Phones often force prefers-reduced-motion via
            // Low Power Mode, which would otherwise make the modal pop in with
            // no entrance at all.
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, transform: "translateY(8px)" }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, transform: "translateY(0px)" }
            }
            transition={{
              duration: reduceMotion ? 0.24 : 0.28,
              ease: [0.215, 0.61, 0.355, 1],
            }}
          >
            <SubmitShapeModalBlock
              variant={variant}
              selection={selection}
              onKeepEditing={onKeepEditing}
              onSeeOnHomepage={onSeeOnHomepage}
              dragAttributionLabel={dragAttributionLabel}
            />
          </motion.div>
        </PrototypeComponent>
      </DialogContent>
    </Dialog>
  );
}
