export const COMMENT_SHOW_PROD_REFERENCE_KEY = "showProdReference";

export type PrototypeCommentReviewStateBridge = {
  prodReferenceAvailable: boolean;
  getShowProdReference: () => boolean;
  setShowProdReference: (show: boolean) => void;
};

export function augmentLiveStateWithReviewState(
  live: unknown,
  showProdReference: boolean,
): Record<string, unknown> {
  return {
    ...(typeof live === "object" && live !== null
      ? (live as Record<string, unknown>)
      : {}),
    [COMMENT_SHOW_PROD_REFERENCE_KEY]: showProdReference,
  };
}

function splitPrototypeLiveState(live: unknown): {
  showProdReference: boolean;
  prototypeLive: unknown;
} {
  if (typeof live !== "object" || live === null) {
    return { showProdReference: false, prototypeLive: live };
  }

  const state = live as Record<string, unknown>;
  const showProdReference = state[COMMENT_SHOW_PROD_REFERENCE_KEY] === true;
  const { [COMMENT_SHOW_PROD_REFERENCE_KEY]: _removed, ...prototypeLive } =
    state;

  return { showProdReference, prototypeLive };
}

export function restoreLiveStateWithReviewState(
  live: unknown,
  onRestorePrototypeLive: (live: unknown) => void,
  bridge: PrototypeCommentReviewStateBridge | null,
): void {
  const { showProdReference, prototypeLive } = splitPrototypeLiveState(live);

  if (!bridge?.prodReferenceAvailable) {
    onRestorePrototypeLive(prototypeLive);
    return;
  }

  if (showProdReference) {
    onRestorePrototypeLive(prototypeLive);
    bridge.setShowProdReference(true);
    return;
  }

  bridge.setShowProdReference(false);
  onRestorePrototypeLive(prototypeLive);
}
