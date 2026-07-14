"use client";

import { usePrototypeReviewOptional } from "@prototype/lib/prototypes/prototype-review-context";
import { Plus } from "lucide-react";

import styles from "./prototype-state-canvas-overlay.module.scss";

export function PrototypeStateMapAddStateButton() {
  const review = usePrototypeReviewOptional();
  const openCreateStateModal = review?.openCreateStateModal;

  if (!openCreateStateModal) return null;

  return (
    <button
      type="button"
      className={styles.addStateButton}
      aria-label="Add state"
      onClick={openCreateStateModal}
    >
      <Plus size={14} strokeWidth={2} aria-hidden />
      <span>Add state</span>
    </button>
  );
}
