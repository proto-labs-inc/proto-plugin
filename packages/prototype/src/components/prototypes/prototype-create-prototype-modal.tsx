"use client";

import { PrototypeToolDialog } from "@prototype/components/platform-ui/prototype-tool-dialog";
import {
  PROTOTYPE_BRIEF_FIELD_BORDER_CLASS,
  PrototypeBriefTextarea,
} from "@prototype/components/prototypes/prototype-brief-field";
import { Button } from "@prototype/components/ui/button";
import { Input } from "@prototype/components/ui/input";
import { Label } from "@prototype/components/ui/label";
import { Switch } from "@prototype/components/ui/switch";
import {
  buildCreatePrototypeCopyText,
  type CreatePrototypeReferenceDocInput,
} from "@prototype/lib/prototypes/create-prototype-prompt";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { cn } from "@prototype/lib/utils";
import { Minus, Plus } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

type DocField = {
  id: string;
  name: string;
  content: string;
  link: string;
};

const EMPTY_DOC_FIELD = (): DocField => ({
  id: crypto.randomUUID(),
  name: "",
  content: "",
  link: "",
});

function readBriefFieldValue(fieldId: string): string {
  const element = document.getElementById(fieldId);
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  ) {
    return element.value;
  }

  return "";
}

function isDocFieldEmpty(doc: DocField): boolean {
  return (
    doc.name.trim().length === 0 &&
    doc.content.trim().length === 0 &&
    doc.link.trim().length === 0
  );
}

function isDocFieldComplete(doc: DocField): boolean {
  return doc.content.trim().length > 0;
}

function isDocFieldPartial(doc: DocField): boolean {
  return !isDocFieldEmpty(doc) && !isDocFieldComplete(doc);
}

export type PrototypeCreatePrototypeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourcePath?: string;
};

function DocFields({
  docs,
  onChange,
}: {
  docs: DocField[];
  onChange: (docs: DocField[]) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {docs.map((doc, index) => {
        const titleFieldId = `${doc.id}-title`;
        const contentFieldId = `${doc.id}-content`;
        const linkFieldId = `${doc.id}-link`;
        const docLabel = docs.length > 1 ? `Doc ${index + 1}` : "Doc";

        return (
          <div
            key={doc.id}
            className="flex flex-col gap-2 rounded-md border border-border p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {docLabel}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground"
                aria-label={`Remove ${docLabel}`}
                onClick={() => onChange(docs.filter((entry) => entry.id !== doc.id))}
              >
                <Minus size={16} strokeWidth={2} aria-hidden />
              </Button>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={titleFieldId} className="text-foreground">
                Title{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id={titleFieldId}
                value={doc.name}
                onChange={(event) =>
                  onChange(
                    docs.map((entry) =>
                      entry.id === doc.id
                        ? { ...entry, name: event.target.value }
                        : entry,
                    ),
                  )
                }
                placeholder="ex. Table Editor Filters Spec"
                className={PROTOTYPE_BRIEF_FIELD_BORDER_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={contentFieldId} className="text-foreground">
                Content
              </Label>
              <PrototypeBriefTextarea
                id={contentFieldId}
                value={doc.content}
                onChange={(event) =>
                  onChange(
                    docs.map((entry) =>
                      entry.id === doc.id
                        ? { ...entry, content: event.target.value }
                        : entry,
                    ),
                  )
                }
                placeholder="Summarize requirements, scope, and states to match…"
                minHeightClass="min-h-[5rem]"
                aria-label={`${docLabel} content`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={linkFieldId} className="text-foreground">
                URL{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id={linkFieldId}
                value={doc.link}
                onChange={(event) =>
                  onChange(
                    docs.map((entry) =>
                      entry.id === doc.id
                        ? { ...entry, link: event.target.value }
                        : entry,
                    ),
                  )
                }
                placeholder="https://docs.google.com/..."
                className={cn("min-w-0", PROTOTYPE_BRIEF_FIELD_BORDER_CLASS)}
                spellCheck={false}
              />
            </div>
          </div>
        );
      })}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-fit gap-1.5 px-2 text-muted-foreground"
        onClick={() => onChange([...docs, EMPTY_DOC_FIELD()])}
      >
        <Plus size={14} strokeWidth={2} aria-hidden />
        Add doc
      </Button>
    </div>
  );
}

export function PrototypeCreatePrototypeModal({
  open,
  onOpenChange,
  sourcePath,
}: PrototypeCreatePrototypeModalProps) {
  const titleFieldId = useId();
  const routeFieldId = useId();
  const referenceHtmlFieldId = useId();
  const [title, setTitle] = useState("");
  const [route, setRoute] = useState("");
  const [referenceHtml, setReferenceHtml] = useState("");
  const [docs, setDocs] = useState<DocField[]>([]);
  const { copy, icon, isCopied } = useCopyToClipboard();
  const [isCopying, setIsCopying] = useState(false);
  const canCopy =
    title.trim().length > 0 && !docs.some(isDocFieldPartial);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setRoute("");
      setReferenceHtml("");
      setDocs([]);
    }
  }, [open]);

  const handleCopy = async () => {
    if (isCopying) return;

    const titleValue = readBriefFieldValue(titleFieldId);
    const routeValue = readBriefFieldValue(routeFieldId);
    const referenceHtmlValue = readBriefFieldValue(referenceHtmlFieldId);
    const hasRequiredFields = titleValue.trim().length > 0;

    if (!hasRequiredFields) {
      toast.error("Missing fields", {
        description: "Fill in title before copying.",
      });
      return;
    }

    const partialDoc = docs.find(isDocFieldPartial);
    if (partialDoc) {
      toast.error("Incomplete doc", {
        description: "Each doc needs content. Title and URL are optional.",
      });
      return;
    }

    const referenceDocs: CreatePrototypeReferenceDocInput[] = docs
      .filter(isDocFieldComplete)
      .map((doc) => ({
        name: doc.name.trim(),
        content: doc.content.trim(),
        link: doc.link.trim() || undefined,
      }));

    setIsCopying(true);

    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : undefined;

      await copy(
        buildCreatePrototypeCopyText({
          title: titleValue,
          route: routeValue,
          referenceHtml: referenceHtmlValue,
          origin,
          referenceDocs,
          useRealData: false,
          sourcePath,
        }),
      );
    } catch {
      toast.error("Copy error", {
        description: "Failed to copy prototype prompt",
      });
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <PrototypeToolDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New prototype"
      description="Add the source route and reference HTML, then copy the prompt into your agent."
      size="wide"
      bodyClassName="gap-4"
      footerClassName="justify-end"
      footer={
        <Button
          type="button"
          variant="chrome"
          size="sm"
          className="h-8 gap-1.5"
          disabled={!canCopy || isCopying}
          onClick={() => {
            void handleCopy();
          }}
          aria-label="Copy prototype brief and prompt"
        >
          {isCopied ? "Copied prompt" : isCopying ? "Copying…" : "Copy prompt"}
          {icon}
        </Button>
      }
    >
      <div className="flex shrink-0 flex-col gap-1.5">
        <Label htmlFor={titleFieldId} className="text-foreground">
          Title
        </Label>
        <Input
          id={titleFieldId}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="ex. Team Settings"
          className={PROTOTYPE_BRIEF_FIELD_BORDER_CLASS}
        />
      </div>
      <div className="flex shrink-0 flex-col gap-1.5">
        <Label htmlFor={routeFieldId} className="text-foreground">
          Route{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id={routeFieldId}
          value={route}
          onChange={(event) => setRoute(event.target.value)}
          placeholder="ex. /project/default/settings/team"
          className={PROTOTYPE_BRIEF_FIELD_BORDER_CLASS}
          spellCheck={false}
        />
      </div>
      <div className="flex shrink-0 flex-col gap-1.5">
        <Label htmlFor={referenceHtmlFieldId} className="text-foreground">
          Reference HTML{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <PrototypeBriefTextarea
          id={referenceHtmlFieldId}
          value={referenceHtml}
          onChange={(event) => setReferenceHtml(event.target.value)}
          placeholder="Paste rendered HTML from the source app (Inspect → Copy outerHTML)…"
          minHeightClass="min-h-[min(40vh,16rem)] max-h-[min(50vh,20rem)]"
          aria-label="Reference HTML"
          spellCheck={false}
          className={cn("font-mono text-xs leading-relaxed")}
        />
      </div>
      <div className="flex shrink-0 flex-col gap-2">
        <Label className="text-foreground">
          Docs{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <DocFields docs={docs} onChange={setDocs} />
      </div>
      <div className="flex shrink-0 items-center justify-between gap-4 opacity-60">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm text-foreground">
            Hook up real data{" "}
            <span className="text-muted-foreground">(coming soon)</span>
          </span>
          <span className="text-xs text-muted-foreground">
            Use live API/database env from the source app instead of mock
            constants.
          </span>
        </div>
        <Switch
          checked={false}
          disabled
          aria-label="Hook up real data (coming soon)"
          className="data-[state=checked]:bg-foreground"
        />
      </div>
    </PrototypeToolDialog>
  );
}
