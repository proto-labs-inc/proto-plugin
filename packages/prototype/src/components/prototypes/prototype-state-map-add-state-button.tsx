"use client";

import { usePrototypeReviewOptional } from "@prototype/lib/prototypes/prototype-review-context";
import { cn } from "@prototype/lib/utils";
import { Plus } from "lucide-react";

import styles from "./prototype-state-canvas-overlay.module.scss";

type PrototypeStateMapAddStateButtonProps = {
  variant?: "default" | "icon";
  className?: string;
};

export function PrototypeStateMapAddStateButton({
  variant = "default",
  className,
}: PrototypeStateMapAddStateButtonProps = {}) {
  const review = usePrototypeReviewOptional();
  const openCreateStateModal = review?.openCreateStateModal;

  if (!openCreateStateModal) return null;

  if (variant === "icon") {
    return (
      <button
        type="button"
        className={className}
        aria-label="Add state"
        onClick={openCreateStateModal}
      >
        <Plus size={11} strokeWidth={2} aria-hidden />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cn(styles.addStateButton, className)}
      aria-label="Add state"
      onClick={openCreateStateModal}
    >
      <Plus size={14} strokeWidth={2} aria-hidden />
      <span>Add state</span>
    </button>
  );
}
