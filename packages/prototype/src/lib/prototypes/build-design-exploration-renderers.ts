import type { ReactNode } from "react";

import type {
  DesignExplorationBaselineOption,
  DesignExplorationVariantOption,
} from "./design-exploration-types";
import { getDesignExplorationDisplayOptions } from "./design-exploration-types";

/**
 * Builds a renderer entry for every design exploration option. Prefer this over
 * hand-rolled `Object.fromEntries` maps so each variant gets a preview and new
 * options cannot silently return `null`.
 */
export function buildDesignExplorationRenderers<TVariant extends string>(
  options: readonly DesignExplorationVariantOption<TVariant>[],
  renderVariant: (variant: TVariant) => ReactNode,
  baseline?: DesignExplorationBaselineOption<TVariant>,
): Record<TVariant, () => ReactNode> {
  const displayOptions = baseline
    ? getDesignExplorationDisplayOptions([...options], baseline)
    : options;
  const renderers = {} as Record<TVariant, () => ReactNode>;

  for (const option of displayOptions) {
    const variant = option.value as TVariant;
    renderers[variant] = () => {
      const node = renderVariant(variant);

      if (process.env.NODE_ENV !== "production" && isEmptyRendererOutput(node)) {
        console.warn(
          `[prototype] Design exploration renderer for "${variant}" returned no preview content.`,
        );
      }

      return node;
    };
  }

  return renderers;
}

function isEmptyRendererOutput(node: ReactNode): boolean {
  return node == null || node === false;
}
