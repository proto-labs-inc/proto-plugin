import type { ReactNode } from "react";

import type { DesignExplorationVariantOption } from "./design-exploration-types";

/**
 * Builds a renderer entry for every design exploration option. Prefer this over
 * hand-rolled `Object.fromEntries` maps so each variant gets a preview and new
 * options cannot silently return `null`.
 */
export function buildDesignExplorationRenderers<
  TVariant extends string,
  const TOptions extends readonly DesignExplorationVariantOption<TVariant>[],
>(
  options: TOptions,
  renderVariant: (variant: TOptions[number]["value"]) => ReactNode,
): Record<TOptions[number]["value"], () => ReactNode> {
  const renderers = {} as Record<TOptions[number]["value"], () => ReactNode>;

  for (const option of options) {
    const variant = option.value;
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
