"use client";

import { Button } from "@prototype/components/ui/button";
import { buildPopulateDesignSystemCopyText } from "@prototype/lib/prototypes/populate-design-system-prompt";
import { useWorkspaceProfile } from "@prototype/lib/prototypes/use-workspace-profile";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";

type PrototypeDesignSystemEmptyStateProps = {
  sourcePath?: string;
  syncConfigPath?: string;
  designSystemPagePath?: string;
};

export function PrototypeDesignSystemEmptyState({
  sourcePath,
  syncConfigPath,
  designSystemPagePath,
}: PrototypeDesignSystemEmptyStateProps) {
  const { copy, icon, isCopied } = useCopyToClipboard();
  const workspaceProfile = useWorkspaceProfile();

  const handleCopy = () => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : undefined;

    copy(
      buildPopulateDesignSystemCopyText({
        sourcePath,
        syncConfigPath,
        designSystemPagePath,
        origin,
        workspaceProfile,
      }),
    );
  };

  return (
    <div className="max-w-2xl rounded-xl border border-dashed border-[var(--tool-chrome-border)] bg-[var(--tool-chrome-surface)] px-6 py-8 text-[var(--tool-chrome-text-heading)]">
      <p className="text-sm font-medium">No components yet</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--tool-chrome-text-muted)]">
        Copy the prompt below into your agent. It will inspect the linked source
        app and port over base styles, UI primitives, and shared building
        blocks — err on the side of syncing more rather than less.
      </p>
      <div className="mt-5 flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-2 border-[var(--tool-chrome-border)] text-[var(--tool-chrome-text-heading)] hover:text-[var(--tool-chrome-text-heading)]"
          onClick={handleCopy}
          aria-label="Copy design system population prompt"
        >
          {isCopied ? "Copied prompt" : "Copy prompt"}
          {icon}
        </Button>
      </div>
    </div>
  );
}
