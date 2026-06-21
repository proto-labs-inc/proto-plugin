"use client";

import { filterAnnotationsByChannel } from "@prototype/lib/prototype-comments/core/annotation-channel";
import { useCommentStore } from "@prototype/lib/prototype-comments/react/CommentProvider";
import { useCommentCaptureBridgeOptional } from "@prototype/lib/prototype-comments/react/CommentCaptureToolbar";
import { CommentsGrid } from "@prototype/lib/prototype-comments/ui/CommentsGrid";
import { useChangelogMeta } from "@prototype/lib/prototypes/changelog-meta-context";
import { usePrototypeReview } from "@prototype/lib/prototypes/prototype-review-context";
import { ToolbarIconButton } from "@prototype/components/platform-ui/toolbar-icon-button";
import { Label } from "@prototype/components/ui/label";
import { Switch } from "@prototype/components/ui/switch";
import { Plus, Save } from "lucide-react";
import { cn } from "@prototype/lib/utils";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";

import { PrototypeReferenceDocs } from "./prototype-reference-docs";

const CHANGELOG_SECTION_TITLE_CLASS = "tool-section-label";

const CHANGELOG_SECTION_DIVIDER_CLASS = "border-t border-[var(--tool-chrome-border)]";

const CHANGELOG_SECTION_CLASS =
  "flex flex-col gap-2 py-4 first:pt-0 first:border-t-0 last:pb-0";

const CHANGELOG_OVERVIEW_FIELD_CLASS =
  "text-sm text-[var(--tool-chrome-text)] field-sizing-content w-full min-h-0 resize-none border-0 bg-transparent p-0 leading-relaxed shadow-none outline-none placeholder:text-[var(--tool-chrome-text-muted)] focus-visible:ring-0 focus-visible:ring-offset-0 [&::selection]:bg-[var(--tool-chrome-gray-highlight)]";

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
  } = useCommentStore();
  const { overview, ready: metaReady, error: metaError, setOverview } =
    useChangelogMeta();
  const [draftOverview, setDraftOverview] = useState(overview);
  const changelogAnnotations = useMemo(
    () => filterAnnotationsByChannel(annotations, "changelog"),
    [annotations],
  );

  useEffect(() => {
    if (metaReady) {
      setDraftOverview(overview);
    }
  }, [metaReady, overview]);

  const isOverviewDirty = draftOverview !== overview;

  const handleOverviewChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setDraftOverview(event.target.value);
    },
    [],
  );

  const handleSaveOverview = useCallback(() => {
    setOverview(draftOverview);
  }, [draftOverview, setOverview]);

  return (
    <div className="flex flex-col">
      <section className={CHANGELOG_SECTION_CLASS}>
        <div className="flex items-center justify-between gap-2">
          <span className={CHANGELOG_SECTION_TITLE_CLASS}>Description</span>
          {metaReady && !metaError ? (
            <ToolbarIconButton
              onClick={handleSaveOverview}
              disabled={!isOverviewDirty}
              aria-label="Save description"
            >
              <Save size={16} strokeWidth={2} aria-hidden />
            </ToolbarIconButton>
          ) : null}
        </div>
        {!metaReady ? (
          <p className="text-muted-foreground text-xs">Loading description…</p>
        ) : metaError ? (
          <p className="text-destructive text-xs">{metaError}</p>
        ) : (
          <textarea
            id="prototype-changelog-overview"
            value={draftOverview}
            onChange={handleOverviewChange}
            rows={1}
            placeholder="Summarize what changed and why…"
            aria-label="Description"
            className={CHANGELOG_OVERVIEW_FIELD_CLASS}
          />
        )}
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
