"use client";

import { filterAnnotationsByChannel } from "@prototype/lib/prototype-comments/core/annotation-channel";
import { countUnresolvedAnnotations } from "@prototype/lib/prototype-comments/core/annotation-status";
import { getRootAnnotations } from "@prototype/lib/prototype-comments/core/comment-threads";
import { useCommentStore } from "@prototype/lib/prototype-comments/react/CommentProvider";
import { CommentHeaderCount } from "@prototype/lib/prototype-comments/ui/CommentHeaderCount";
import { CommentModeToggleButton } from "@prototype/lib/prototype-comments/ui/CommentModeToggleButton";
import { CommentsGrid } from "@prototype/lib/prototype-comments/ui/CommentsGrid";
import {
  usePrototypeReview,
  type PrototypeVariantSet,
} from "@prototype/lib/prototypes/prototype-review-context";
import { VariantSetLucideIcon } from "@prototype/lib/prototypes/variant-set-lucide-icon";
import { usePrototypeToolTheme } from "@prototype/lib/prototypes/use-prototype-tool-theme";
import { cn } from "@prototype/lib/utils";
import {
  Sidebar,
  SIDEBAR_TITLE_CLASS,
} from "@prototype/components/platform-ui/sidebar";
import { EmptyState } from "@prototype/components/platform-ui/empty-state";
import { PrototypeChangeLogPanel } from "@prototype/components/prototypes/prototype-change-log-panel";
import { PrototypeCommentStorageEmptyState } from "@prototype/components/prototypes/prototype-comment-storage-empty-state";
import { PrototypeSpecPanelEmptyState } from "@prototype/components/prototypes/prototype-spec-panel-empty-state";
import { miniPillTextFromLabel } from "@prototype/components/prototypes/mini-pill-label";
import pillStyles from "@prototype/components/prototypes/prototype-floating-pill.module.scss";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@prototype/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useMemo, type ReactNode } from "react";

type PrototypeReviewSidebarProps = {
  onSelect: (id: string) => void;
  selectedId?: string | null;
  onClose: () => void;
  isCommentModeActive?: boolean;
  onToggleCommentMode?: () => void;
};

const SIDEBAR_HEADER_TRIGGER_CLASS = cn(
  SIDEBAR_TITLE_CLASS,
  "inline-flex min-w-0 max-w-full cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-0.5 -mx-1.5",
  "hover:bg-[var(--tool-chrome-gray-highlight)]",
  "focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
  "data-[state=open]:bg-[var(--tool-chrome-gray-highlight)]",
);

const SIDEBAR_HEADER_MENU_CONTENT_CLASS = cn(
  pillStyles.dropdownContent,
  pillStyles.dropdownContentFooterMenu,
  "z-[1051] border-0 bg-transparent p-0 text-foreground shadow-none ring-0",
  "data-[state=open]:animate-none data-[state=closed]:animate-none",
);

type HandoffSidebarPanel = "change-log" | "spec";

const HANDOFF_PANEL_OPTIONS: { id: HandoffSidebarPanel; label: string }[] = [
  { id: "change-log", label: "Overview" },
  { id: "spec", label: "PRs" },
];

function SidebarHeaderDropdown({
  label,
  ariaLabel,
  labelAddon,
  children,
}: {
  label: string;
  ariaLabel: string;
  labelAddon?: ReactNode;
  children: ReactNode;
}) {
  const { commentTheme } = usePrototypeToolTheme();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={SIDEBAR_HEADER_TRIGGER_CLASS}
          aria-label={ariaLabel}
        >
          {labelAddon}
          <span className="truncate">{label}</span>
          <ChevronDown
            className="size-3.5 shrink-0 opacity-60"
            strokeWidth={2}
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={6}
        collisionPadding={8}
        className={SIDEBAR_HEADER_MENU_CONTENT_CLASS}
        data-prototype-comment-theme={commentTheme}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div className={pillStyles.controlsPanelFooterMenu}>{children}</div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function HandoffPanelHeaderSwitcher({
  activePanel,
  onSelect,
}: {
  activePanel: HandoffSidebarPanel;
  onSelect: (panel: HandoffSidebarPanel) => void;
}) {
  const activeLabel =
    HANDOFF_PANEL_OPTIONS.find((option) => option.id === activePanel)?.label ??
    "Overview";

  return (
    <SidebarHeaderDropdown
      label={activeLabel}
      ariaLabel="Switch handoff panel"
    >
      {HANDOFF_PANEL_OPTIONS.map((option) => {
        const selected = activePanel === option.id;

        return (
          <DropdownMenuItem
            key={option.id}
            className={cn(
              pillStyles.dropdownMenuItem,
              pillStyles.dropdownItemExploration,
              selected && pillStyles.dropdownMenuItemSelected,
            )}
            onSelect={() => onSelect(option.id)}
          >
            <span>{option.label}</span>
          </DropdownMenuItem>
        );
      })}
    </SidebarHeaderDropdown>
  );
}

function VariantSetHeaderSwitcher({
  label,
  variantSets,
  activeVariantSetId,
  onSelect,
}: {
  label: string;
  variantSets: PrototypeVariantSet[];
  activeVariantSetId: string | null;
  onSelect: (id: string) => void;
}) {
  const activeVariantSet =
    variantSets.find((set) => set.id === activeVariantSetId) ?? variantSets[0];
  const titleIcon = activeVariantSet ? (
    <VariantSetLucideIcon
      variantSetId={activeVariantSet.id}
      variantSetLabel={activeVariantSet.label}
      size={14}
      strokeWidth={2}
      className="shrink-0 text-[var(--tool-chrome-icon)]"
      aria-hidden
    />
  ) : null;

  if (variantSets.length <= 1) {
    return (
      <span className={cn(SIDEBAR_TITLE_CLASS, "inline-flex min-w-0 items-center gap-1.5")}>
        {titleIcon}
        <span className="truncate">{label}</span>
      </span>
    );
  }

  return (
    <SidebarHeaderDropdown
      label={label}
      labelAddon={titleIcon}
      ariaLabel="Switch design exploration"
    >
      {variantSets.map((variantSet) => {
        const selected = activeVariantSetId === variantSet.id;

        return (
          <DropdownMenuItem
            key={variantSet.id}
            className={cn(
              pillStyles.dropdownMenuItem,
              "!justify-start gap-2 text-left",
              selected && pillStyles.dropdownMenuItemSelected,
            )}
            onSelect={() => onSelect(variantSet.id)}
          >
            <VariantSetLucideIcon
              variantSetId={variantSet.id}
              variantSetLabel={variantSet.label}
              size={12}
              strokeWidth={2}
              className={pillStyles.dropdownItemIcon}
              aria-hidden
            />
            <span className="truncate">{miniPillTextFromLabel(variantSet.label)}</span>
          </DropdownMenuItem>
        );
      })}
    </SidebarHeaderDropdown>
  );
}

export function PrototypeReviewSidebar({
  onSelect,
  selectedId,
  onClose,
  isCommentModeActive = false,
  onToggleCommentMode,
}: PrototypeReviewSidebarProps) {
  const review = usePrototypeReview();
  const { annotations, deleteAnnotation, updateAnnotation, resolveAnnotation, storageError, storageReady, storageConfigured } = useCommentStore();
  const isVariantsPanel = review.sidebarPanel === "variants";
  const isChangeLogPanel = review.sidebarPanel === "change-log";
  const isSpecPanel = review.sidebarPanel === "spec";

  const activeVariantLabel = useMemo(() => {
    if (!review.activeVariantSetId) return "Variants";
    const label = review.variantSets.find(
      (set) => set.id === review.activeVariantSetId,
    )?.label;
    return label ? miniPillTextFromLabel(label) : "Variants";
  }, [review.activeVariantSetId, review.variantSets]);

  const variantsContent = useMemo(() => {
    if (!isVariantsPanel) return null;
    if (review.activeVariantSetId) {
      return review.getVariantSidebarContent(review.activeVariantSetId);
    }
    return review.getLegacyVariantSidebarContent();
  }, [
    isVariantsPanel,
    review.activeVariantSetId,
    review.variantSidebarRevision,
    review.getVariantSidebarContent,
    review.getLegacyVariantSidebarContent,
  ]);

  const commentAnnotations = useMemo(
    () => filterAnnotationsByChannel(annotations, "comment"),
    [annotations],
  );
  const unresolvedCount = countUnresolvedAnnotations(commentAnnotations);
  const totalCount = getRootAnnotations(commentAnnotations).length;

  const specContent = isSpecPanel ? review.specContentRef.current : null;

  const isCommentsPanel =
    !isVariantsPanel && !isChangeLogPanel && !isSpecPanel;

  const isHandoffPanel = isChangeLogPanel || isSpecPanel;

  const sidebarText: ReactNode = isVariantsPanel
    ? (
        <VariantSetHeaderSwitcher
          label={activeVariantLabel}
          variantSets={review.variantSets}
          activeVariantSetId={review.activeVariantSetId}
          onSelect={review.openVariantSet}
        />
      )
    : isHandoffPanel
      ? (
          <HandoffPanelHeaderSwitcher
            activePanel={isSpecPanel ? "spec" : "change-log"}
            onSelect={(panel) => review.openSidebar(panel)}
          />
        )
      : "Comments";

  return (
    <Sidebar
      open={review.open}
      text={sidebarText}
      titleAddon={
        isCommentsPanel ? (
          <CommentHeaderCount
            unresolved={unresolvedCount}
            total={totalCount}
          />
        ) : undefined
      }
      headerActions={
        isCommentsPanel && onToggleCommentMode ? (
          <CommentModeToggleButton
            isActive={isCommentModeActive}
            onClick={onToggleCommentMode}
          />
        ) : undefined
      }
      onClose={
        isVariantsPanel
          ? review.closeVariants
          : isSpecPanel
            ? review.closeSidebar
            : isChangeLogPanel
              ? review.closeSidebar
              : onClose
      }
      ariaLabel={
        isVariantsPanel
          ? "Variants panel"
          : isChangeLogPanel
            ? "Overview panel"
            : isSpecPanel
              ? "PRs panel"
              : "Review panel"
      }
      dataAttribute="data-prototype-review-sidebar"
      widthCssVar="--comments-sidebar-width"
    >
      {isSpecPanel ? (
        specContent ?? <PrototypeSpecPanelEmptyState />
      ) : isVariantsPanel ? (
        variantsContent ?? (
          <EmptyState>No variant overview available.</EmptyState>
        )
      ) : isChangeLogPanel ? (
        <PrototypeChangeLogPanel onSelect={onSelect} selectedId={selectedId} />
      ) : !storageReady ? (
        <EmptyState>Loading comments…</EmptyState>
      ) : storageConfigured === false ? (
        <PrototypeCommentStorageEmptyState message={storageError ?? undefined} />
      ) : storageError ? (
        <EmptyState>{storageError}</EmptyState>
      ) : (
        <CommentsGrid
          annotations={commentAnnotations}
          layout="sidebar"
          onSelect={onSelect}
          onDelete={deleteAnnotation}
          onUpdateComment={updateAnnotation}
          onResolve={resolveAnnotation}
          selectedId={selectedId}
        />
      )}
    </Sidebar>
  );
}
