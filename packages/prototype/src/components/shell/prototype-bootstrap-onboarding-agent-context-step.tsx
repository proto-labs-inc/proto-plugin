"use client";

import { PrototypeBriefTextarea } from "@prototype/components/prototypes/prototype-brief-field";
import { resolveAbsoluteFilePath } from "@prototype/lib/prototypes/resolve-file-path";
import { cn } from "@prototype/lib/utils";
import { FileText } from "lucide-react";
import { useCallback, useId, useRef } from "react";
import { toast } from "sonner";

type PrototypeBootstrapOnboardingAgentContextStepProps = {
  agentContext: string;
  onAgentContextChange: (value: string) => void;
  agentContextPath: string;
  onAgentContextPathChange: (value: string) => void;
};

const ACCEPTED_FILE_TYPES = ".md,text/markdown,text/plain";

function pickContextFile(files: FileList | null): File | null {
  if (!files?.length) return null;
  return files[0] ?? null;
}

export function PrototypeBootstrapOnboardingAgentContextStep({
  agentContext,
  onAgentContextChange,
  agentContextPath,
  onAgentContextPathChange,
}: PrototypeBootstrapOnboardingAgentContextStepProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const trimmedPath = agentContextPath.trim();

  const applyFile = useCallback(
    async (file: File | null) => {
      if (!file) return;

      const absolutePath = resolveAbsoluteFilePath(file);
      if (!absolutePath) {
        toast.error("Could not resolve file path", {
          description:
            "Re-select the file from this machine so Proto can include its absolute path in the setup prompt.",
        });
        return;
      }

      try {
        const content = await file.text();
        if (!content.trim()) {
          toast.error("Empty file", {
            description: "Choose a non-empty agent context file.",
          });
          return;
        }

        onAgentContextPathChange(absolutePath);
        onAgentContextChange(content);
      } catch {
        toast.error("Could not read file", {
          description: "Try another file.",
        });
      }
    },
    [onAgentContextChange, onAgentContextPathChange],
  );

  const handleBrowse = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(() => {
    const file = pickContextFile(inputRef.current?.files ?? null);
    void applyFile(file);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [applyFile]);

  const handlePaste = useCallback(() => {
    onAgentContextPathChange("");
  }, [onAgentContextPathChange]);

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        accept={ACCEPTED_FILE_TYPES}
        onChange={handleInputChange}
      />

      <PrototypeBriefTextarea
        value={agentContext}
        onChange={(event) => {
          handlePaste();
          onAgentContextChange(event.target.value);
        }}
        placeholder="Paste AGENTS.md, Cursor rules, skills notes…"
        aria-label="Agent context"
        minHeightClass="min-h-[min(40vh,14rem)]"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleBrowse}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-[var(--tool-chrome-border)] px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors",
            "hover:bg-[var(--tool-chrome-surface-muted)]/45 hover:text-foreground",
          )}
        >
          <FileText className="size-3.5" aria-hidden strokeWidth={1.5} />
          Select file instead
        </button>
        {trimmedPath ? (
          <p className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
            {trimmedPath}
          </p>
        ) : null}
      </div>
    </div>
  );
}
