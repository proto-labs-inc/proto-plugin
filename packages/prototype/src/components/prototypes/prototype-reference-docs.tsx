"use client";

import { ToolbarIconButton } from "@prototype/components/platform-ui/toolbar-icon-button";
import { Button } from "@prototype/components/ui/button";
import { Input } from "@prototype/components/ui/input";
import { Label } from "@prototype/components/ui/label";
import {
  buildAddReferenceDocCopyText,
  defaultReferenceDocsConfigPath,
  isValidReferenceDocInput,
  type PrototypeReferenceDoc,
} from "@prototype/lib/prototypes/reference-docs";
import { usePrototypeReviewOptional } from "@prototype/lib/prototypes/prototype-review-context";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { cn } from "@prototype/lib/utils";
import { ChevronDown, ExternalLink, Plus } from "lucide-react";
import { useId, useState } from "react";

const REFERENCE_DOC_CONTENT_FIELD_CLASS =
  "field-sizing-content min-h-[5rem] w-full resize-y rounded-md border border-[var(--tool-chrome-border)] bg-[var(--tool-chrome-surface-muted)] px-2.5 py-2 text-sm text-[var(--tool-chrome-text)] leading-relaxed shadow-none outline-none placeholder:text-[var(--tool-chrome-text-muted)] focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-0";

function ReferenceDocItem({ doc }: { doc: PrototypeReferenceDoc }) {
  const [expanded, setExpanded] = useState(false);
  const hasContent = doc.content.trim().length > 0;

  return (
    <li className="overflow-hidden rounded-md border border-[var(--tool-chrome-border)] bg-[var(--tool-chrome-surface-muted)]">
      <div className="flex items-stretch">
        <a
          href={doc.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 flex-1 items-center gap-1.5 px-2.5 py-2 text-sm text-[var(--tool-chrome-text)] transition-colors duration-200 ease hover:bg-[var(--tool-chrome-gray-highlight)] hover:text-[var(--tool-chrome-text-heading)]"
        >
          <ExternalLink className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{doc.name}</span>
        </a>
        {hasContent ? (
          <button
            type="button"
            className="inline-flex size-9 shrink-0 items-center justify-center border-l border-[var(--tool-chrome-border)] text-[var(--tool-chrome-text-muted)] transition-colors duration-200 ease hover:bg-[var(--tool-chrome-gray-highlight)] hover:text-[var(--tool-chrome-text)]"
            aria-expanded={expanded}
            aria-label={expanded ? "Hide content" : "Show content"}
            onClick={() => setExpanded((current) => !current)}
          >
            <ChevronDown
              className={cn(
                "tool-panel-section-chevron size-3.5",
                expanded && "is-expanded",
              )}
              aria-hidden
            />
          </button>
        ) : null}
      </div>
      {hasContent ? (
        <div
          className={cn(
            "tool-panel-section-content border-t border-[var(--tool-chrome-border)]",
            expanded && "is-expanded",
          )}
        >
          <div className="overflow-hidden">
            <p className="px-2.5 py-2 text-xs leading-relaxed whitespace-pre-wrap text-[var(--tool-chrome-text-muted)]">
              {doc.content}
            </p>
          </div>
        </div>
      ) : null}
    </li>
  );
}

type PrototypeReferenceDocsProps = {
  slug?: string;
  docs?: PrototypeReferenceDoc[];
  configFilePath?: string;
  className?: string;
};

export function PrototypeReferenceDocs({
  slug: slugProp,
  docs: docsProp,
  configFilePath: configFilePathProp,
  className,
}: PrototypeReferenceDocsProps) {
  const review = usePrototypeReviewOptional();
  const slug = slugProp ?? review?.slug;
  const docs = docsProp ?? review?.referenceDocs ?? [];
  const configFilePath =
    configFilePathProp ??
    review?.referenceDocsConfigFilePath ??
    (slug ? defaultReferenceDocsConfigPath(slug) : undefined);
  const nameFieldId = useId();
  const linkFieldId = useId();
  const contentFieldId = useId();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [content, setContent] = useState("");
  const { copy, icon, isCopied } = useCopyToClipboard();

  const canCopy = Boolean(slug) && isValidReferenceDocInput(name, link, content);

  const handleCopyPrompt = () => {
    if (!slug || !canCopy) return;

    const origin =
      typeof window !== "undefined" ? window.location.origin : undefined;

    copy(
      buildAddReferenceDocCopyText({
        slug,
        name,
        link,
        content,
        existingDocs: docs,
        configFilePath,
        origin,
      }),
    );
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="tool-section-label">Reference docs</span>
        <ToolbarIconButton
          onClick={() => setShowForm((current) => !current)}
          aria-label={showForm ? "Cancel adding doc" : "Add doc"}
          aria-expanded={showForm}
        >
          <Plus size={16} strokeWidth={2} aria-hidden />
        </ToolbarIconButton>
      </div>

      {showForm ? (
        <div className="flex flex-col gap-3 rounded-md border border-[var(--tool-chrome-border)] bg-[var(--tool-chrome-surface-muted)] p-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={nameFieldId} className="text-foreground">
              Doc name
            </Label>
            <Input
              id={nameFieldId}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Design spec"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={linkFieldId} className="text-foreground">
              Doc link
            </Label>
            <Input
              id={linkFieldId}
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://docs.google.com/..."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={contentFieldId} className="text-foreground">
              Content
            </Label>
            <textarea
              id={contentFieldId}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Summarize what this doc covers and why it matters…"
              aria-label="Doc content"
              rows={4}
              className={REFERENCE_DOC_CONTENT_FIELD_CLASS}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="default"
              disabled={!canCopy}
              onClick={handleCopyPrompt}
              aria-label="Copy reference doc prompt"
            >
              {isCopied ? "Copied" : "Copy prompt"}
              {icon}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="default"
              onClick={() => {
                setShowForm(false);
                setName("");
                setLink("");
                setContent("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {docs.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No reference docs yet. Add one in{" "}
          {configFilePath ? (
            <code className="text-[11px]">{configFilePath}</code>
          ) : (
            "the prototype codebase"
          )}
          .
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {docs.map((doc) => (
            <ReferenceDocItem key={`${doc.name}:${doc.link}`} doc={doc} />
          ))}
        </ul>
      )}
    </div>
  );
}
