"use client";

import { Dialog, DialogContent } from "@prototype/components/ui/dialog";
import { usePrototypeReview } from "@prototype/lib/prototypes/prototype-review-context";

import { PrototypeStateCanvasView } from "./prototype-state-canvas-overlay";
import styles from "./prototype-state-map-modal.module.scss";

type PrototypeStateMapModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PrototypeStateMapModal({
  open,
  onOpenChange,
}: PrototypeStateMapModalProps) {
  const review = usePrototypeReview();
  const config = review.stateCanvasConfigRef.current;

  if (!config) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        portalScope="tool"
        showCloseButton={false}
        overlayClassName={styles.overlay}
        className={styles.content}
      >
        <PrototypeStateCanvasView
          config={config}
          layout="page"
          activeStateId={review.activePreviewStateId}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
