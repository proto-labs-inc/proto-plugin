"use client";

import { usePrototypeReviewOptional } from "proto-plugin";
import { useLayoutEffect } from "react";

export const GRID_ERROR_STATE_LAYOUT_VARIANT_SET = {
  id: "grid-error-state-layout",
  label: "Error state layout",
} as const;

export const GRID_EMPTY_STATE_LAYOUT_VARIANT_SET = {
  id: "grid-empty-state-layout",
  label: "Empty state layout",
} as const;

export const INSERT_COLUMN_LAYOUT_VARIANT_SET = {
  id: "insert-column-layout",
  label: "Add column layout",
} as const;

export const TABLE_EDITOR_FILTERS_VARIANT_SETS = [
  GRID_ERROR_STATE_LAYOUT_VARIANT_SET,
  INSERT_COLUMN_LAYOUT_VARIANT_SET,
  GRID_EMPTY_STATE_LAYOUT_VARIANT_SET,
] as const;

export type TableEditorFiltersVariantSetId =
  (typeof TABLE_EDITOR_FILTERS_VARIANT_SETS)[number]["id"];

type UseRegisterTableEditorFiltersVariantSetsOptions = {
  onErrorStateLayoutActivate?: () => void;
  onEmptyStateLayoutActivate?: () => void;
  onInsertColumnLayoutActivate?: () => void;
};

export function useRegisterTableEditorFiltersVariantSets(
  options: UseRegisterTableEditorFiltersVariantSetsOptions = {},
) {
  const review = usePrototypeReviewOptional();
  const registerVariantSet = review?.registerVariantSet;
  const unregisterVariantSet = review?.unregisterVariantSet;
  const { onErrorStateLayoutActivate, onEmptyStateLayoutActivate, onInsertColumnLayoutActivate } =
    options;

  useLayoutEffect(() => {
    if (!registerVariantSet || !unregisterVariantSet) return;

    registerVariantSet({
      ...GRID_ERROR_STATE_LAYOUT_VARIANT_SET,
      onActivate: onErrorStateLayoutActivate,
    });

    registerVariantSet({
      ...INSERT_COLUMN_LAYOUT_VARIANT_SET,
      onActivate: onInsertColumnLayoutActivate,
    });

    registerVariantSet({
      ...GRID_EMPTY_STATE_LAYOUT_VARIANT_SET,
      onActivate: onEmptyStateLayoutActivate,
    });

    return () => {
      unregisterVariantSet(GRID_ERROR_STATE_LAYOUT_VARIANT_SET.id);
      unregisterVariantSet(INSERT_COLUMN_LAYOUT_VARIANT_SET.id);
      unregisterVariantSet(GRID_EMPTY_STATE_LAYOUT_VARIANT_SET.id);
    };
  }, [
    onErrorStateLayoutActivate,
    onEmptyStateLayoutActivate,
    onInsertColumnLayoutActivate,
    registerVariantSet,
    unregisterVariantSet,
  ]);
}
