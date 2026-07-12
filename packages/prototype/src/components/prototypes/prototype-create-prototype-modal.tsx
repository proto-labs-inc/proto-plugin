"use client";

import { PrototypeToolDialog } from "@prototype/components/platform-ui/prototype-tool-dialog";
import { PROTOTYPE_GALLERY_GRID_GAP_CLASS } from "@prototype/components/shell/prototype-gallery-shell";
import {
  PROTOTYPE_BRIEF_FIELD_BORDER_CLASS,
  PrototypeBriefTextarea,
} from "@prototype/components/prototypes/prototype-brief-field";
import { Button } from "@prototype/components/ui/button";
import { Input } from "@prototype/components/ui/input";
import { Label } from "@prototype/components/ui/label";
import { Switch } from "@prototype/components/ui/switch";
import { buildCreatePrototypeCopyText } from "@prototype/lib/prototypes/create-prototype-prompt";
import type { StarterScreenMetadata } from "@prototype/lib/prototypes/starter-screen-config-types";
import { screenshotSrc } from "@prototype/lib/prototypes/screenshot-src";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { cn } from "@prototype/lib/utils";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useState } from "react";

type DocLinkField = {
  id: string;
  link: string;
};

const starterScreenTileTitleClassName =
  "mt-1.5 truncate text-xs text-[var(--tool-chrome-text-muted)] transition-colors duration-200 group-hover:text-[var(--tool-chrome-text-heading)]";

const EMPTY_DOC_LINK = (): DocLinkField => ({
  id: crypto.randomUUID(),
  link: "",
});

export type PrototypeCreatePrototypeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  starterScreens?: StarterScreenMetadata[];
  screenshotVersions?: Record<string, number>;
};

function DocLinkFields({
  docLinks,
  onChange,
}: {
  docLinks: DocLinkField[];
  onChange: (docLinks: DocLinkField[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {docLinks.map((doc, index) => {
        const linkFieldId = `${doc.id}-link`;

        return (
          <div key={doc.id} className="flex items-center gap-2">
            <Input
              id={linkFieldId}
              value={doc.link}
              onChange={(event) =>
                onChange(
                  docLinks.map((entry) =>
                    entry.id === doc.id
                      ? { ...entry, link: event.target.value }
                      : entry,
                  ),
                )
              }
              placeholder="https://docs.google.com/..."
              className={cn("min-w-0 flex-1", PROTOTYPE_BRIEF_FIELD_BORDER_CLASS)}
              spellCheck={false}
              aria-label={docLinks.length > 1 ? `Doc link ${index + 1}` : "Doc link"}
            />
            {docLinks.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground"
                aria-label={`Remove doc link ${index + 1}`}
                onClick={() =>
                  onChange(docLinks.filter((entry) => entry.id !== doc.id))
                }
              >
                <Minus size={16} strokeWidth={2} aria-hidden />
              </Button>
            ) : null}
          </div>
        );
      })}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-fit gap-1.5 px-2 text-muted-foreground"
        onClick={() => onChange([...docLinks, EMPTY_DOC_LINK()])}
      >
        <Plus size={14} strokeWidth={2} aria-hidden />
        Add doc link
      </Button>
    </div>
  );
}

function StarterScreenPicker({
  starterScreens,
  selectedSlug,
  onSelect,
  screenshotVersions,
}: {
  starterScreens: StarterScreenMetadata[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
  screenshotVersions: Record<string, number>;
}) {
  const noneSelected = selectedSlug === "";

  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3",
        PROTOTYPE_GALLERY_GRID_GAP_CLASS,
      )}
    >
      <button
        type="button"
        aria-pressed={noneSelected}
        aria-label={`None${noneSelected ? " (selected)" : ""}`}
        onClick={() => onSelect("")}
        className="group cursor-pointer text-left"
      >
        <div
          className={cn(
            "rounded-[var(--tool-review-card-radius)] shadow-[var(--tool-review-card-shadow)] transition-[translate,box-shadow,outline-color] duration-200 ease-out",
            "group-hover:-translate-y-0.5 group-hover:shadow-[var(--tool-review-card-shadow-hover)]",
            noneSelected &&
              "outline outline-2 outline-offset-2 outline-[var(--tool-chrome-text-heading)]",
          )}
        >
          <div className="relative aspect-video overflow-hidden rounded-[var(--tool-review-card-radius)] border border-dashed border-[var(--tool-chrome-border)] bg-[var(--tool-chrome-surface)] transition-colors duration-200 ease-out group-hover:border-[var(--tool-chrome-text-muted)]" />
        </div>
        <p
          className={cn(
            starterScreenTileTitleClassName,
            noneSelected && "text-[var(--tool-chrome-text-heading)]",
          )}
        >
          None
        </p>
      </button>
      {starterScreens.map((screen) => {
        const selected = selectedSlug === screen.slug;

        return (
          <button
            key={screen.slug}
            type="button"
            aria-pressed={selected}
            aria-label={`${screen.title}${selected ? " (selected)" : ""}`}
            onClick={() => onSelect(screen.slug)}
            className="group cursor-pointer text-left"
          >
            <div
              className={cn(
                "rounded-[var(--tool-review-card-radius)] shadow-[var(--tool-review-card-shadow)] transition-[translate,box-shadow,outline-color] duration-200 ease-out",
                "group-hover:-translate-y-0.5 group-hover:shadow-[var(--tool-review-card-shadow-hover)]",
                selected &&
                  "outline outline-2 outline-offset-2 outline-[var(--tool-chrome-text-heading)]",
              )}
            >
              <div className="relative aspect-video overflow-hidden rounded-[var(--tool-review-card-radius)] border border-[var(--tool-chrome-border)] bg-[var(--tool-chrome-surface)]">
                <Image
                  src={screenshotSrc(
                    screen.screenshot,
                    screenshotVersions[screen.slug],
                  )}
                  alt=""
                  width={1600}
                  height={900}
                  quality={90}
                  sizes="(min-width: 42rem) 12rem, 10rem"
                  className="h-full w-full object-cover object-top"
                />
              </div>
            </div>
            <p
              className={cn(
                starterScreenTileTitleClassName,
                selected && "text-[var(--tool-chrome-text-heading)]",
              )}
            >
              {screen.title}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export function PrototypeCreatePrototypeModal({
  open,
  onOpenChange,
  starterScreens = [],
  screenshotVersions = {},
}: PrototypeCreatePrototypeModalProps) {
  const titleFieldId = useId();
  const descriptionFieldId = useId();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [docLinks, setDocLinks] = useState<DocLinkField[]>([EMPTY_DOC_LINK()]);
  const [useRealData, setUseRealData] = useState(false);
  const [starterScreenSlug, setStarterScreenSlug] = useState("");
  const { copy, icon, isCopied } = useCopyToClipboard();
  const canCopy = title.trim().length > 0;

  const selectedStarterScreen = starterScreens.find(
    (screen) => screen.slug === starterScreenSlug,
  );

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setDocLinks([EMPTY_DOC_LINK()]);
      setUseRealData(false);
      setStarterScreenSlug("");
    }
  }, [open]);

  const handleCopy = () => {
    if (!canCopy) return;

    const origin =
      typeof window !== "undefined" ? window.location.origin : undefined;

    copy(
      buildCreatePrototypeCopyText({
        title,
        description,
        origin,
        docLinks: docLinks.map((doc) => doc.link),
        useRealData,
        starterScreen: selectedStarterScreen
          ? {
              slug: selectedStarterScreen.slug,
              title: selectedStarterScreen.title,
            }
          : undefined,
      }),
    );
  };

  return (
    <PrototypeToolDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New prototype"
      description="Describe what to build, then copy the prompt into your agent."
      bodyClassName="gap-4"
      footerClassName="justify-end"
      footer={
        <Button
          type="button"
          variant="chrome"
          size="sm"
          className="h-8 gap-1.5"
          disabled={!canCopy}
          onClick={handleCopy}
          aria-label="Copy prototype brief and prompt"
        >
          {isCopied ? "Copied prompt" : "Copy prompt"}
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
          placeholder="ex. Team settings — members list, invite flow, role badges."
          minHeightClass="min-h-[5rem]"
          aria-label="Prototype description"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-foreground">Docs</Label>
        <DocLinkFields docLinks={docLinks} onChange={setDocLinks} />
      </div>
      <label className="flex cursor-pointer items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm text-foreground">Hook up real data</span>
          <span className="text-xs text-muted-foreground">
            Use live API/database env from the source app instead of mock
            constants.
          </span>
        </div>
        <Switch
          checked={useRealData}
          onCheckedChange={setUseRealData}
          aria-label="Hook up real data"
          className="data-[state=checked]:bg-foreground"
        />
      </label>
      {starterScreens.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <Label className="text-foreground">Starter screen</Label>
          <StarterScreenPicker
            starterScreens={starterScreens}
            selectedSlug={starterScreenSlug}
            onSelect={setStarterScreenSlug}
            screenshotVersions={screenshotVersions}
          />
        </div>
      ) : null}
    </PrototypeToolDialog>
  );
}
