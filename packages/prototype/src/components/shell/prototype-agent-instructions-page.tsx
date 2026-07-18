"use client";

import { PrototypeBriefTextarea } from "@prototype/components/prototypes/prototype-brief-field";
import {
  PrototypeGalleryHeader,
  PrototypeGalleryPageLayout,
} from "@prototype/components/shell/prototype-gallery-shell";
import { Button } from "@prototype/components/ui/button";
import { buildAgentContextCopyText } from "@prototype/lib/prototypes/agent-context-prompt";
import {
  CUSTOM_AGENT_CONTEXT_PATH,
  fetchAgentContext,
  readLocalAgentContextDraft,
  resolveInitialAgentContextContent,
  writeLocalAgentContextDraft,
} from "@prototype/lib/prototypes/agent-context-storage";
import { useTrackEvent } from "@prototype/lib/prototypes/telemetry/prototype-telemetry-context";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { cn } from "@prototype/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function PrototypeAgentInstructionsPage() {
  const track = useTrackEvent();
  const [content, setContent] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { copy, icon, isCopied } = useCopyToClipboard();

  useEffect(() => {
    let cancelled = false;

    async function loadAgentContext() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const remote = await fetchAgentContext();
        if (cancelled) return;

        const localDraft = readLocalAgentContextDraft();
        const initialContent = resolveInitialAgentContextContent(
          remote,
          localDraft,
        );

        setContent(initialContent);
        setFileContent(remote.content);
      } catch {
        if (cancelled) return;
        setLoadError("Could not load agent instructions.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadAgentContext();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasChanges = content !== fileContent;
  const canCopy = hasChanges && content.trim().length > 0 && !isCopying && !isLoading;

  const handleCopyPrompt = useCallback(async () => {
    if (!canCopy) return;

    setIsCopying(true);

    try {
      writeLocalAgentContextDraft(content);
      setFileContent(content);

      await copy(buildAgentContextCopyText({ content }));
      track("modal.prompt_copied", { modal: "agent-instructions" });
    } catch {
      toast.error("Copy error", {
        description: "Failed to copy agent instructions prompt",
      });
    } finally {
      setIsCopying(false);
    }
  }, [canCopy, content, copy, track]);

  return (
    <PrototypeGalleryPageLayout
      header={
        <PrototypeGalleryHeader
          title="Agent instructions"
          description="Custom instructions for AI agents working in this workspace. Save to update the file in your repo."
          className="mb-0"
        />
      }
    >
      <div className="flex w-full max-w-3xl flex-col gap-3">
        <p className="text-xs text-[var(--tool-chrome-text-muted)]">
          File:{" "}
          <code className="font-mono text-[var(--tool-chrome-text-heading)]">
            {CUSTOM_AGENT_CONTEXT_PATH}
          </code>
        </p>

        {loadError ? (
          <p className="text-sm text-destructive">{loadError}</p>
        ) : null}

        <PrototypeBriefTextarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Paste AGENTS.md, Cursor rules, skills notes…"
          aria-label="Agent instructions"
          disabled={isLoading}
          minHeightClass="min-h-[min(60vh,28rem)]"
          className={cn(isLoading && "opacity-60")}
        />

        {hasChanges ? (
          <Button
            type="button"
            variant="chrome"
            size="sm"
            className="h-8 w-fit gap-1.5 px-3"
            disabled={!canCopy}
            onClick={() => {
              void handleCopyPrompt();
            }}
            aria-label="Save agent instructions"
          >
            {isCopied
              ? "Prompt copied"
              : isCopying
                ? "Saving…"
                : "Save instructions"}
            {icon}
          </Button>
        ) : null}
      </div>
    </PrototypeGalleryPageLayout>
  );
}
