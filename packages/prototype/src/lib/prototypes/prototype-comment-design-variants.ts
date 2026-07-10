export const COMMENT_DESIGN_VARIANTS_KEY = "designVariants";

export type PrototypeCommentDesignVariantCapture = {
  getVariant: () => string;
  setVariant: (value: string) => void;
};

export function augmentLiveStateWithDesignVariants(
  live: unknown,
  designVariants: Record<string, string>,
): Record<string, unknown> {
  return {
    ...(typeof live === "object" && live !== null
      ? (live as Record<string, unknown>)
      : {}),
    [COMMENT_DESIGN_VARIANTS_KEY]: designVariants,
  };
}

export function splitDesignVariants(live: unknown): {
  designVariants: Record<string, string> | undefined;
  prototypeLive: unknown;
} {
  if (typeof live !== "object" || live === null) {
    return { designVariants: undefined, prototypeLive: live };
  }

  const state = live as Record<string, unknown>;
  const raw = state[COMMENT_DESIGN_VARIANTS_KEY];
  const designVariants =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? Object.fromEntries(
          Object.entries(raw as Record<string, unknown>).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
          ),
        )
      : undefined;

  const { [COMMENT_DESIGN_VARIANTS_KEY]: _removed, ...prototypeLive } = state;

  return { designVariants, prototypeLive };
}

export function restoreDesignVariants(
  designVariants: Record<string, string> | undefined,
  captures: ReadonlyMap<string, PrototypeCommentDesignVariantCapture>,
): void {
  if (!designVariants) return;

  for (const [variantSetId, value] of Object.entries(designVariants)) {
    captures.get(variantSetId)?.setVariant(value);
  }
}

export function collectDesignVariants(
  captures: ReadonlyMap<string, PrototypeCommentDesignVariantCapture>,
): Record<string, string> {
  const designVariants: Record<string, string> = {};

  captures.forEach((capture, variantSetId) => {
    designVariants[variantSetId] = capture.getVariant();
  });

  return designVariants;
}
