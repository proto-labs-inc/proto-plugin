"use client";

import { filterAnnotationsByChannel } from "@prototype/lib/prototype-comments/core/annotation-channel";
import { useCommentStore } from "@prototype/lib/prototype-comments/react/CommentProvider";
import { useCommentCaptureBridgeOptional } from "@prototype/lib/prototype-comments/react/CommentCaptureToolbar";
import { CommentsGrid } from "@prototype/lib/prototype-comments/ui/CommentsGrid";
import { buildChangelogDescriptionCopyText } from "@prototype/lib/prototypes/changelog-description-prompt";
import { usePrototypeReview } from "@prototype/lib/prototypes/prototype-review-context";
import {
  prototypeReviewPreferenceKey,
  usePersistedLocalString,
} from "@prototype/lib/prototypes/use-persisted-local-state";
import { ToolbarIconButton } from "@prototype/components/platform-ui/toolbar-icon-button";
import { Button } from "@prototype/components/ui/button";
import { Label } from "@prototype/components/ui/label";
import { Switch } from "@prototype/components/ui/switch";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { Plus } from "lucide-react";
import { cn } from "@prototype/lib/utils";
import { useMemo, useState, useEffect } from "react";

import { PrototypeReferenceDocs } from "./prototype-reference-docs";
import { PrototypeCommentStorageEmptyState } from "./prototype-comment-storage-empty-state";

const CHANGELOG_SECTION_TITLE_CLASS = "tool-section-label";

const CHANGELOG_SECTION_DIVIDER_CLASS = "border-t border-[var(--tool-chrome-border)]";

const CHANGELOG_SECTION_CLASS =
  "flex flex-col gap-2 py-4 first:pt-0 first:border-t-0 last:pb-0";

const CHANGELOG_OVERVIEW_FIELD_CLASS =
  "field-sizing-content w-full min-h-0 resize-none rounded-md border border-[var(--tool-chrome-border)] bg-[var(--tool-chrome-surface-muted)] px-2.5 py-2 text-sm text-[var(--tool-chrome-text)] leading-relaxed shadow-none outline-none placeholder:text-[var(--tool-chrome-text-muted)] focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-0 [&::selection]:bg-[var(--tool-chrome-gray-highlight)]";

type PrototypeChangeLogPanelProps = {
  onSelect: (id: string) => void;
  selectedId?: string | null;
};

function AddChangeButton({
  placement = "empty",
}: {
  placement?: "empty" | "header";
}) {
  const bridge = useCommentCaptureBridgeOptional();
  if (!bridge) return null;

  const isActive = bridge.isChangelogModeActive;

  return (
    <ToolbarIconButton
      wrapperClassName={placement === "header" ? undefined : "mt-2"}
      onClick={bridge.onEnterChangelogMode}
      aria-pressed={isActive}
      aria-label={isActive ? "Exit add change mode" : "Add change"}
    >
      <Plus size={16} strokeWidth={2} aria-hidden />
    </ToolbarIconButton>
  );
}

function ProdReferenceSection() {
  const review = usePrototypeReview();

  if (!review.prodReferenceAvailable) return null;

  return (
    <section
      className={cn(CHANGELOG_SECTION_CLASS, CHANGELOG_SECTION_DIVIDER_CLASS)}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={CHANGELOG_SECTION_TITLE_CLASS}>
          Current design in prod
        </span>
        <div className="flex items-center gap-2">
          <Label
            htmlFor="prototype-prod-reference-toggle"
            className="text-muted-foreground sr-only"
          >
            Current design in prod
          </Label>
          <Switch
            id="prototype-prod-reference-toggle"
            checked={review.showProdReference}
            onCheckedChange={review.setShowProdReference}
            className="data-[state=checked]:bg-[var(--tool-chrome-text-heading)]"
            aria-label={
              review.showProdReference
                ? "Show prototype"
                : "Show current design in prod"
            }
          />
        </div>
      </div>
    </section>
  );
}

export function PrototypeChangeLogPanel({
  onSelect,
  selectedId,
}: PrototypeChangeLogPanelProps) {
  const {
    annotations,
    deleteAnnotation,
    updateAnnotation,
    storageError,
    storageReady,
    storageConfigured,
  } = useCommentStore();
  const review = usePrototypeReview();
  const { value: description, updateValue: updateDescription } =
    usePersistedLocalString(
      prototypeReviewPreferenceKey(review.slug, "changelog-description-brief"),
      "",
    );
  const [hasEditedDescription, setHasEditedDescription] = useState(false);
  const {
    copy: copyDescriptionPrompt,
    icon: copyDescriptionIcon,
    isCopied: isDescriptionCopied,
  } = useCopyToClipboard();
  const changelogAnnotations = useMemo(
    () => filterAnnotationsByChannel(annotations, "changelog"),
    [annotations],
  );
  const canCopyDescription = description.trim().length > 0;
  const showCopyDescriptionPrompt = hasEditedDescription && canCopyDescription;

  useEffect(() => {
    setHasEditedDescription(false);
  }, [review.slug]);

  const handleCopyDescriptionPrompt = () => {
    if (!canCopyDescription) return;

    const origin =
      typeof window !== "undefined" ? window.location.origin : undefined;

    copyDescriptionPrompt(
      buildChangelogDescriptionCopyText({
        slug: review.slug,
        description,
        origin,
      }),
    );
  };

  return (
    <div className="flex flex-col">
      <section className={CHANGELOG_SECTION_CLASS}>
        <span className={CHANGELOG_SECTION_TITLE_CLASS}>Description</span>
        <textarea
          id="prototype-changelog-overview"
          value={description}
          onChange={(event) => {
            setHasEditedDescription(true);
            updateDescription(event.target.value);
          }}
          rows={3}
          placeholder="Summarize what changed and why…"
          aria-label="Description"
          className={CHANGELOG_OVERVIEW_FIELD_CLASS}
        />
        {showCopyDescriptionPrompt ? (
          <Button
            type="button"
            variant="chrome"
            size="sm"
            className="h-8 gap-1.5 self-start"
            onClick={handleCopyDescriptionPrompt}
            aria-label="Copy description prompt"
          >
            {isDescriptionCopied ? "Copied prompt" : "Copy prompt"}
            {copyDescriptionIcon}
          </Button>
        ) : null}
      </section>

      <PrototypeReferenceDocs
        className={cn(CHANGELOG_SECTION_CLASS, CHANGELOG_SECTION_DIVIDER_CLASS)}
      />

      <ProdReferenceSection />

      <section
        className={cn(CHANGELOG_SECTION_CLASS, CHANGELOG_SECTION_DIVIDER_CLASS)}
      >
        <div className="flex items-center justify-between gap-2">
          <span className={CHANGELOG_SECTION_TITLE_CLASS}>Changes</span>
          {storageReady && !storageError && changelogAnnotations.length > 0 ? (
            <AddChangeButton placement="header" />
          ) : null}
        </div>
        {!storageReady ? (
          <p className="text-muted-foreground text-xs">Loading changes…</p>
        ) : storageConfigured === false ? (
          <PrototypeCommentStorageEmptyState message={storageError ?? undefined} />
        ) : storageError ? (
          <p className="text-destructive text-xs">{storageError}</p>
        ) : (
          <CommentsGrid
            annotations={changelogAnnotations}
            layout="sidebar"
            sortOrder="oldest"
            expandComment
            onSelect={onSelect}
            onDelete={deleteAnnotation}
            onUpdateComment={updateAnnotation}
            showResolveActions={false}
            showCopyPrompt={false}
            showReplies={false}
            emptyStateTitle="No changes yet"
            emptyStateAction={<AddChangeButton />}
            selectedId={selectedId}
          />
        )}
      </section>
    </div>
  );
}
