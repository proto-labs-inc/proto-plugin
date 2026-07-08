"use client";

import { Button } from "@prototype/components/ui/button";
import { usePrototypeSlug } from "@prototype/components/prototypes/prototype-target";
import {
  buildPrSplitPlanCopyText,
  type PrSplitPlanPromptOptions,
} from "@prototype/lib/pr-split/build-pr-split-plan-prompt";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";

type PrototypeSpecPanelEmptyStateProps = {
  promptOptions?: Omit<PrSplitPlanPromptOptions, "slug">;
};

export function PrototypeSpecPanelEmptyState({
  promptOptions,
}: PrototypeSpecPanelEmptyStateProps) {
  const slug = usePrototypeSlug();
  const { copy, icon, isCopied } = useCopyToClipboard();

  const canCopy = Boolean(slug);

  return (
    <div className="px-1 py-2">
      <p className="text-sm text-muted-foreground">
        No PRs configured yet. Copy the prompt below to have an agent audit what
        changed on this prototype and create a merge-ordered PR split spec.
      </p>
      <div className="mt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 cursor-pointer gap-1.5"
          disabled={!canCopy}
          onClick={() => {
            if (!slug) return;
            copy(
              buildPrSplitPlanCopyText({
                slug,
                ...promptOptions,
              }),
            );
          }}
          aria-label="Copy PR split planning prompt"
        >
          {isCopied ? "Copied prompt" : "Copy planning prompt"}
          {icon}
        </Button>
      </div>
    </div>
  );
}
