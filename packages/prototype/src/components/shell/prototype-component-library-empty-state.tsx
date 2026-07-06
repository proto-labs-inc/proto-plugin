"use client";

import { Button } from "@prototype/components/ui/button";
import { buildPopulateComponentLibraryCopyText } from "@prototype/lib/prototypes/populate-component-library-prompt";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";

type PrototypeComponentLibraryEmptyStateProps = {
  sourcePath?: string;
  syncConfigPath?: string;
  componentLibraryPagePath?: string;
};

export function PrototypeComponentLibraryEmptyState({
  sourcePath,
  syncConfigPath,
  componentLibraryPagePath,
}: PrototypeComponentLibraryEmptyStateProps) {
  const { copy, icon, isCopied } = useCopyToClipboard();

  const handleCopy = () => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : undefined;

    copy(
      buildPopulateComponentLibraryCopyText({
        sourcePath,
        syncConfigPath,
        componentLibraryPagePath,
        origin,
      }),
    );
  };

  return (
    <div className="max-w-2xl rounded-xl border border-dashed border-[var(--tool-chrome-border)] bg-[var(--tool-chrome-surface-muted)] px-6 py-8 text-[var(--tool-chrome-text-muted)]">
      <p className="text-sm font-medium text-[var(--tool-chrome-text-heading)]">
        No components yet
      </p>
      <p className="mt-2 text-sm leading-relaxed">
        Copy the prompt below into your agent. It will inspect the linked source
        app and port over base styles, UI primitives, and shared building
        blocks — err on the side of syncing more rather than less.
      </p>
      <div className="mt-5 flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 border-[var(--tool-chrome-border-strong)] text-[var(--tool-chrome-text-heading)] hover:text-[var(--tool-chrome-text-heading)]"
          onClick={handleCopy}
          aria-label="Copy component library population prompt"
        >
          {isCopied ? "Copied prompt" : "Copy prompt"}
          {icon}
        </Button>
      </div>
    </div>
  );
}
