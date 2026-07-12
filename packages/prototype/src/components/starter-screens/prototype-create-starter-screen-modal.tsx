"use client";

import { PrototypeToolDialog } from "@prototype/components/platform-ui/prototype-tool-dialog";
import {
  PROTOTYPE_BRIEF_FIELD_BORDER_CLASS,
  PrototypeBriefTextarea,
} from "@prototype/components/prototypes/prototype-brief-field";
import { Button } from "@prototype/components/ui/button";
import { Input } from "@prototype/components/ui/input";
import { Label } from "@prototype/components/ui/label";
import { buildCreateStarterScreenCopyText } from "@prototype/lib/prototypes/create-starter-screen-prompt";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { cn } from "@prototype/lib/utils";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

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

export type PrototypeCreateStarterScreenModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  starterScreensPagePath?: string;
  sourcePath?: string;
};

export function PrototypeCreateStarterScreenModal({
  open,
  onOpenChange,
  starterScreensPagePath,
  sourcePath,
}: PrototypeCreateStarterScreenModalProps) {
  const titleFieldId = useId();
  const routeFieldId = useId();
  const referenceHtmlFieldId = useId();
  const [title, setTitle] = useState("");
  const [route, setRoute] = useState("");
  const [referenceHtml, setReferenceHtml] = useState("");
  const { copy, icon, isCopied } = useCopyToClipboard();
  const [isCopying, setIsCopying] = useState(false);
  const canCopy =
    title.trim().length > 0 &&
    route.trim().length > 0 &&
    referenceHtml.trim().length > 0;

  useEffect(() => {
    if (!open) {
      setTitle("");
      setRoute("");
      setReferenceHtml("");
    }
  }, [open]);

  const handleCopy = async () => {
    if (isCopying) return;

    const titleValue = readBriefFieldValue(titleFieldId);
    const routeValue = readBriefFieldValue(routeFieldId);
    const referenceHtmlValue = readBriefFieldValue(referenceHtmlFieldId);
    const hasAllFields =
      titleValue.trim().length > 0 &&
      routeValue.trim().length > 0 &&
      referenceHtmlValue.trim().length > 0;

    if (!hasAllFields) {
      toast.error("Missing fields", {
        description: "Fill in title, route, and reference HTML before copying.",
      });
      return;
    }

    setIsCopying(true);

    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : undefined;

      await copy(
        buildCreateStarterScreenCopyText({
          title: titleValue,
          route: routeValue,
          referenceHtml: referenceHtmlValue,
          sourcePath,
          origin,
          starterScreensPagePath,
        }),
      );
    } catch {
      toast.error("Copy error", {
        description: "Failed to copy starter screen prompt",
      });
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <PrototypeToolDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New starter screen"
      description="Name the screen, add the source route, and paste reference HTML. Copy the prompt into your agent to build it from the cached component library."
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
          aria-label="Copy starter screen brief and prompt"
        >
          {isCopied ? "Copied prompt" : isCopying ? "Copying…" : "Copy prompt"}
          {icon}
        </Button>
      }
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={titleFieldId} className="text-foreground">
          Title
        </Label>
        <Input
          id={titleFieldId}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="ex. Team Settings Overview"
          className={PROTOTYPE_BRIEF_FIELD_BORDER_CLASS}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={routeFieldId} className="text-foreground">
          Route
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
      <div className="flex min-h-0 flex-1 flex-col gap-1.5">
        <Label htmlFor={referenceHtmlFieldId} className="text-foreground">
          Reference HTML
        </Label>
        <PrototypeBriefTextarea
          id={referenceHtmlFieldId}
          value={referenceHtml}
          onChange={(event) => setReferenceHtml(event.target.value)}
          placeholder="Paste rendered HTML from the source app (Inspect → Copy outerHTML)…"
          minHeightClass="min-h-[min(40vh,16rem)]"
          aria-label="Reference HTML"
          spellCheck={false}
          className={cn("font-mono text-xs leading-relaxed")}
        />
      </div>
    </PrototypeToolDialog>
  );
}
