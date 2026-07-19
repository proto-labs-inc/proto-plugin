"use client";

import {
  PrototypeToolDialog,
  PrototypeToolDialogXylophone,
  PrototypeToolDialogXylophoneSection,
} from "@prototype/components/platform-ui/prototype-tool-dialog";
import {
  PROTOTYPE_BRIEF_FIELD_BORDER_CLASS,
  PrototypeBriefTextarea,
} from "@prototype/components/prototypes/prototype-brief-field";
import {
  DocFields,
  isDocFieldComplete,
  isDocFieldPartial,
  type DocField,
} from "@prototype/components/prototypes/prototype-create-prototype-doc-fields";
import { Button } from "@prototype/components/ui/button";
import { Input } from "@prototype/components/ui/input";
import { Label } from "@prototype/components/ui/label";
import { Switch } from "@prototype/components/ui/switch";
import {
  buildCreatePrototypeCopyText,
  type CreatePrototypeReferenceDocInput,
} from "@prototype/lib/prototypes/create-prototype-prompt";
import { readBriefFieldValue } from "@prototype/lib/prototypes/read-brief-field-value";
import { useTrackEvent } from "@prototype/lib/prototypes/telemetry/prototype-telemetry-context";
import { useWorkspaceProfile } from "@prototype/lib/prototypes/use-workspace-profile";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { cn } from "@prototype/lib/utils";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

type CreatePrototypeSection = "description" | "starter-ui";

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
  const [docs, setDocs] = useState<DocField[]>([]);
  const [expandedSection, setExpandedSection] =
    useState<CreatePrototypeSection>("description");
  const { copy, icon, isCopied } = useCopyToClipboard();
  const workspaceProfile = useWorkspaceProfile();
  const track = useTrackEvent();
  const [isCopying, setIsCopying] = useState(false);
  const canCopy =
    title.trim().length > 0 && !docs.some(isDocFieldPartial);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setRoute("");
      setReferenceHtml("");
      setDocs([]);
      setExpandedSection("description");
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      track("modal.opened", { modal: "create-prototype" });
    }
  }, [open, track]);

  const handleSectionExpandedChange = (
    section: CreatePrototypeSection,
    expanded: boolean,
  ) => {
    if (expanded) {
      setExpandedSection(section);
    }
  };

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
          description: descriptionValue,
          route: routeValue,
          referenceHtml: referenceHtmlValue,
          origin,
          referenceDocs,
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
        referenceDocsCount: referenceDocs.length,
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
      bodyClassName="flex min-h-0 flex-1 flex-col gap-0 py-3"
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
      <PrototypeToolDialogXylophone>
        <PrototypeToolDialogXylophoneSection
          step="Step 1"
          title="Prototype description"
          description="Name the prototype, summarize scope, and attach reference docs."
          expanded={expandedSection === "description"}
          onExpandedChange={(expanded) => {
            handleSectionExpandedChange("description", expanded);
          }}
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
            <Label htmlFor={descriptionFieldId} className="text-foreground">
              Description{" "}
              <span className="tool-dialog-field-hint">(optional)</span>
            </Label>
            <PrototypeBriefTextarea
              id={descriptionFieldId}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What should this prototype cover? Scope, key states, and success criteria…"
              minHeightClass="min-h-[5rem]"
              aria-label="Description"
            />
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <Label className="text-foreground">
              Docs{" "}
              <span className="tool-dialog-field-hint">(optional)</span>
            </Label>
            <DocFields docs={docs} onChange={setDocs} />
          </div>
        </PrototypeToolDialogXylophoneSection>

        <PrototypeToolDialogXylophoneSection
          step="Step 2"
          title="Starter UI"
          description="Anchor the build to a source route and captured HTML from the live app."
          expanded={expandedSection === "starter-ui"}
          onExpandedChange={(expanded) => {
            handleSectionExpandedChange("starter-ui", expanded);
          }}
          contentClassName="min-h-0 flex-1"
        >
          <div className="flex shrink-0 flex-col gap-1.5">
            <Label htmlFor={routeFieldId} className="text-foreground">
              Route{" "}
              <span className="tool-dialog-field-hint">(optional)</span>
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
              Reference HTML{" "}
              <span className="tool-dialog-field-hint">(optional)</span>
            </Label>
            <PrototypeBriefTextarea
              id={referenceHtmlFieldId}
              value={referenceHtml}
              onChange={(event) => setReferenceHtml(event.target.value)}
              placeholder="Paste rendered HTML from the source app (Inspect → Copy outerHTML)…"
              minHeightClass="min-h-[min(28vh,12rem)]"
              aria-label="Reference HTML"
              spellCheck={false}
              className={cn("flex-1 font-mono text-xs leading-relaxed")}
            />
          </div>
          <div className="flex shrink-0 items-center justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm text-foreground">
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
        </PrototypeToolDialogXylophoneSection>
      </PrototypeToolDialogXylophone>
    </PrototypeToolDialog>
  );
}
