"use client";

import { Button } from "@prototype/components/ui/button";
import { usePopulateDesignSystemPromptCopy } from "@prototype/lib/prototypes/use-populate-design-system-prompt-copy";
import { cn } from "@prototype/lib/utils";
import { Loader2 } from "lucide-react";

const LOADING_PANEL_CLASS =
  "max-w-2xl rounded-xl border border-dashed border-[var(--tool-chrome-border)] bg-[var(--tool-chrome-surface)] px-6 py-8 text-[var(--tool-chrome-text-heading)]";

type PrototypeDesignSystemLoadingPanelProps = {
  telemetryModal?: string;
  className?: string;
};

export function PrototypeDesignSystemLoadingPanel({
  telemetryModal = "component-library-loading",
  className,
}: PrototypeDesignSystemLoadingPanelProps) {
  const { copyDesignSystemPrompt, icon, isCopied, isCopying } =
    usePopulateDesignSystemPromptCopy({ telemetryModal });

  return (
    <div className={cn(LOADING_PANEL_CLASS, className)}>
      <div className="flex items-center gap-2">
        <Loader2
          className="size-4 animate-spin text-[var(--tool-chrome-text-heading)]"
          aria-hidden
        />
        <p className="text-sm font-medium">Setting up your design system</p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[var(--tool-chrome-text-muted)]">
        Your agent is syncing styles and base components from the linked
        source. You can browse prototypes while this finishes — reload or
        return to this tab when the sync completes.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-[var(--tool-chrome-text-muted)]">
        Taking too long? Copy the design system prompt again and rerun it in
        your agent.
      </p>
      <div className="mt-5 flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-2 border-[var(--tool-chrome-border)] text-[var(--tool-chrome-text-heading)] hover:text-[var(--tool-chrome-text-heading)]"
          disabled={isCopying}
          onClick={() => {
            void copyDesignSystemPrompt();
          }}
          aria-label="Copy design system prompt"
        >
          {isCopied
            ? "Copied prompt"
            : isCopying
              ? "Copying…"
              : "Copy design system prompt"}
          {icon}
        </Button>
      </div>
    </div>
  );
}
