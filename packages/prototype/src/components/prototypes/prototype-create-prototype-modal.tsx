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
import { buildCreatePrototypeCopyText } from "@prototype/lib/prototypes/create-prototype-prompt";
import { readBriefFieldValue } from "@prototype/lib/prototypes/read-brief-field-value";
import { useTrackEvent } from "@prototype/lib/prototypes/telemetry/prototype-telemetry-context";
import { useWorkspaceProfile } from "@prototype/lib/prototypes/use-workspace-profile";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { cn } from "@prototype/lib/utils";
import { Plus } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

/** Shared height/resize behavior for Description + Reference HTML. */
const CREATE_PROTOTYPE_TEXTAREA_MIN_HEIGHT_CLASS = "min-h-[5rem]";
const CREATE_PROTOTYPE_TEXTAREA_CLASS =
  "max-h-[min(28vh,12rem)] overflow-y-auto";

export type PrototypeCreatePrototypeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourcePath?: string;
};

export function PrototypeCreatePrototypeModal({
  open,
  onOpenChange,
  sourcePath,
}: PrototypeCreatePrototypeModalProps) {
  const titleFieldId = useId();
  const descriptionFieldId = useId();
  const routeFieldId = useId();
  const referenceHtmlFieldId = useId();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [route, setRoute] = useState("");
  const [referenceHtml, setReferenceHtml] = useState("");
  const { copy, icon, isCopied } = useCopyToClipboard();
  const workspaceProfile = useWorkspaceProfile();
  const track = useTrackEvent();
  const [isCopying, setIsCopying] = useState(false);
  const canCopy = title.trim().length > 0;

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setRoute("");
      setReferenceHtml("");
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      track("modal.opened", { modal: "create-prototype" });
    }
  }, [open, track]);

  const handleCopy = async () => {
    if (isCopying) return;

    const titleValue = readBriefFieldValue(titleFieldId);
    const descriptionValue = readBriefFieldValue(descriptionFieldId);
    const routeValue = readBriefFieldValue(routeFieldId);
    const referenceHtmlValue = readBriefFieldValue(referenceHtmlFieldId);
    const hasRequiredFields = titleValue.trim().length > 0;

    if (!hasRequiredFields) {
      toast.error("Missing fields", {
        description: "Fill in title before copying.",
      });
      return;
    }

    setIsCopying(true);

    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : undefined;

      await copy(
        buildCreatePrototypeCopyText({
          title: titleValue,
          description: descriptionValue,
          route: routeValue,
          referenceHtml: referenceHtmlValue,
          origin,
          referenceDocs: [],
          useRealData: false,
          sourcePath,
          workspaceProfile,
        }),
      );
      track("modal.prompt_copied", {
        modal: "create-prototype",
        hasDescription: descriptionValue.trim().length > 0,
        hasRoute: routeValue.trim().length > 0,
        hasReferenceHtml: referenceHtmlValue.trim().length > 0,
        referenceDocsCount: 0,
      });
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
      description="Describe the prototype, add starter UI from the source app, then copy the prompt into your agent."
      bodyClassName="gap-4"
      footerClassName="justify-end"
      footer={
        <Button
          type="button"
          variant="chrome"
          size="sm"
          className="h-8 gap-2"
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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={titleFieldId} className="text-foreground">
          Title <span className="tool-dialog-field-hint">(required)</span>
        </Label>
        <Input
          id={titleFieldId}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="ex. Team Settings"
          className={PROTOTYPE_BRIEF_FIELD_BORDER_CLASS}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={descriptionFieldId} className="text-foreground">
          Description
        </Label>
        <PrototypeBriefTextarea
          id={descriptionFieldId}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What should this prototype cover? Scope, key states, and success criteria…"
          minHeightClass={CREATE_PROTOTYPE_TEXTAREA_MIN_HEIGHT_CLASS}
          className={CREATE_PROTOTYPE_TEXTAREA_CLASS}
          aria-label="Description"
        />
      </div>
      <div className="flex flex-col gap-2 opacity-50">
        <Label className="text-muted-foreground">
          Docs <span className="tool-dialog-field-hint">(coming soon)</span>
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled
          className="h-8 w-fit gap-1.5 px-2 text-muted-foreground"
          aria-label="Add doc (coming soon)"
        >
          <Plus size={14} strokeWidth={2} aria-hidden />
          Add doc
        </Button>
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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={referenceHtmlFieldId} className="text-foreground">
          Reference HTML
        </Label>
        <PrototypeBriefTextarea
          id={referenceHtmlFieldId}
          value={referenceHtml}
          onChange={(event) => setReferenceHtml(event.target.value)}
          placeholder="If there's a page that looks like this that you want to use as a starting point, copy its html here"
          minHeightClass={CREATE_PROTOTYPE_TEXTAREA_MIN_HEIGHT_CLASS}
          className={cn(CREATE_PROTOTYPE_TEXTAREA_CLASS, "font-mono")}
          aria-label="Reference HTML"
          spellCheck={false}
        />
      </div>
      <div className="flex shrink-0 items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-0.5 opacity-50">
          <span className="text-sm text-muted-foreground">
            Hook up real data{" "}
            <span className="tool-dialog-field-hint">(coming soon)</span>
          </span>
          <span className="text-xs text-[var(--tool-chrome-text-muted)]">
            Use live API/database env from the source app instead of mock
            constants.
          </span>
        </div>
        <Switch
          checked={false}
          disabled
          aria-label="Hook up real data (coming soon)"
        />
      </div>
    </PrototypeToolDialog>
  );
}
