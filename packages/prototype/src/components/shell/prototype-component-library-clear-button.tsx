"use client";

import { Button } from "@prototype/components/ui/button";
import { buildClearComponentLibraryCopyText } from "@prototype/lib/prototypes/clear-component-library-prompt";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";

type PrototypeComponentLibraryClearButtonProps = {
  componentLibraryPagePath?: string;
  componentLibraryContentPath?: string;
};

export function PrototypeComponentLibraryClearButton({
  componentLibraryPagePath,
  componentLibraryContentPath,
}: PrototypeComponentLibraryClearButtonProps) {
  const { copy, isCopied } = useCopyToClipboard();

  const handleClear = () => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : undefined;

    copy(
      buildClearComponentLibraryCopyText({
        componentLibraryPagePath,
        componentLibraryContentPath,
        origin,
      }),
    );
  };

  return (
    <div className="border-default mt-16 border-t pt-10">
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={handleClear}
        aria-label="Clear component library"
      >
        {isCopied ? "Copied clear prompt" : "Clear library"}
      </Button>
      <p className="text-foreground-light mt-3 max-w-xl text-sm">
        Copies a prompt to reset this page to the empty state.
      </p>
    </div>
  );
}
