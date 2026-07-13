"use client";

import { Button } from "@prototype/components/ui/button";
import { Switch } from "@prototype/components/ui/switch";
import {
  PrototypeComponent,
  usePrototypeSlug,
  buildPrototypeTargetId,
  PROTOTYPE_TARGET_ATTR,
} from "@prototype/components/prototypes/prototype-target";
import { PrototypeBriefTextarea } from "@prototype/components/prototypes/prototype-brief-field";
import { PrototypeDesignContextPanel } from "@prototype/components/prototypes/prototype-design-context-panel";
import { PrototypeMobbinGallery } from "@prototype/components/prototypes/prototype-mobbin-gallery";
import {
  buildMoreDesignExplorationVariantsCopyText,
  buildResetBriefDefaultsPrompt,
  buildSetDefaultVariantPrompt,
  getDesignExplorationDisplayOptions,
  getDesignExplorationVariantOptions,
  getMobbinReferencesForVariantLabel,
  resolveDesignExplorationBaselineOption,
  type DesignExplorationBaselineOption,
  type DesignExplorationBrief,
  type DesignExplorationContext,
  type DesignExplorationMobbin,
  type DesignExplorationVariantOption,
  type DesignExplorationVariantsSection,
  type MobbinReference,
} from "@prototype/lib/prototypes/design-exploration-types";
import {
  usePersistedLocalBoolean,
  usePersistedLocalString,
} from "@prototype/lib/prototypes/use-persisted-local-state";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { cn } from "@prototype/lib/utils";
import { useEffect, useState } from "react";

const MODAL_VARIANT_PREVIEW_SCALE = 0.75;
const SIDEBAR_VARIANT_PREVIEW_SCALE = 0.42;

const MODAL_OVERVIEW_TITLE_FIELD_CLASS =
  "tool-heading field-sizing-content w-full min-h-0 resize-none border-0 bg-transparent p-0 shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0";

const MODAL_OVERVIEW_DESCRIPTION_FIELD_CLASS =
  "tool-body field-sizing-content w-full min-h-0 resize-none border-0 bg-transparent p-0 shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0";

const MODAL_GALLERY_SECTION_TITLE_CLASS = "tool-heading";

const MODAL_GALLERY_CARD_TITLE_CLASS = "text-foreground font-medium";

const SIDEBAR_OVERVIEW_TITLE_FIELD_CLASS =
  "text-sm text-foreground field-sizing-content w-full min-h-0 resize-none border-0 bg-transparent p-0 font-medium leading-snug shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0";

const SIDEBAR_OVERVIEW_DESCRIPTION_FIELD_CLASS =
  "text-sm text-muted-foreground field-sizing-content w-full min-h-0 resize-none border-0 bg-transparent p-0 leading-relaxed shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0";

const SIDEBAR_GALLERY_SECTION_TITLE_CLASS = "tool-section-label";

const SIDEBAR_GALLERY_CARD_TITLE_CLASS = "text-sm text-foreground font-medium";

export type PrototypeDesignBriefPanelLayout = "default" | "sidebar";

export type PrototypeDesignBriefPanelProps<TVariant extends string> = {
  componentIdPrefix: string;
  galleryId: string;
  storageKeyPrefix: string;
  brief: DesignExplorationBrief;
  context?: DesignExplorationContext;
  mobbin?: DesignExplorationMobbin;
  variantsSection?: DesignExplorationVariantsSection;
  variant: TVariant;
  onVariantChange: (variant: TVariant) => void;
  options: DesignExplorationVariantOption<TVariant>[];
  renderers: Record<TVariant, () => React.ReactNode>;
  /** Pre-exploration UI — pinned at the bottom of the variant list. */
  baseline: DesignExplorationBaselineOption<TVariant>;
  /**
   * Marked "Default" in the brief — the codebase-stored default variant
   * (`config.defaultVariant`). Non-default options (including Original) offer a "Make default" prompt.
   */
  defaultVariantValue?: TVariant;
  /** Path to design exploration config — included in copy prompts. */
  briefConfigFilePath?: string;
  /** Sidebar prompt copy — label from variant set or brief title. */
  explorationLabel?: string;
  /** Sidebar prompt copy — variant set id when registered. */
  explorationId?: string;
  layout?: PrototypeDesignBriefPanelLayout;
  className?: string;
};

const SIDEBAR_OVERVIEW_COPY_BUTTON_CLASS =
  "cursor-pointer text-[var(--tool-chrome-icon)] hover:text-[var(--tool-chrome-icon-hover)] inline-flex size-7 shrink-0 items-center justify-center rounded-sm border-0 bg-transparent p-0 transition-colors duration-200 ease outline-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0";

function VariantMobbinLinks({
  componentIdPrefix,
  optionIdSuffix,
  references,
}: {
  componentIdPrefix: string;
  optionIdSuffix: string;
  references: MobbinReference[];
}) {
  const slug = usePrototypeSlug();

  if (references.length === 0) return null;

  const scrollToReference = (referenceId: string) => {
    if (!slug) return;

    const targetId = buildPrototypeTargetId(
      slug,
      `${componentIdPrefix}.mobbin-reference.${referenceId}`,
    );
    const element = document.querySelector(
      `[${PROTOTYPE_TARGET_ATTR}="${targetId}"]`,
    );

    if (element instanceof HTMLElement) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <span className="text-sm text-muted-foreground" aria-hidden>
        ·
      </span>
      {references.map((reference, index) => (
        <span key={reference.id} className="inline-flex items-center">
          {index > 0 ? (
            <span className="text-sm text-muted-foreground pr-1.5" aria-hidden>
              ,
            </span>
          ) : null}
          <PrototypeComponent
            id={`${componentIdPrefix}.overview-option.${optionIdSuffix}.mobbin-link.${reference.id}`}
          >
            <button
              type="button"
              className="text-sm text-[var(--text-secondary)] underline underline-offset-2 transition-colors duration-200 ease hover:text-[var(--tool-chrome-text)]"
              onClick={(event) => {
                event.stopPropagation();
                scrollToReference(reference.id);
              }}
              aria-label={`Scroll to ${reference.appName} Mobbin reference`}
            >
              {reference.appName}
            </button>
          </PrototypeComponent>
        </span>
      ))}
    </>
  );
}

function MakeDefaultButton({
  componentId,
  optionLabel,
  optionValue,
  configFilePath,
}: {
  componentId: string;
  optionLabel: string;
  optionValue: string;
  configFilePath?: string;
}) {
  const { copy, isCopied } = useCopyToClipboard();

  return (
    <PrototypeComponent id={componentId}>
      <Button
        type="button"
        variant="chrome"
        size="sm"
        className="h-6 shrink-0 rounded px-2 text-[11px]"
        onClick={(event) => {
          event.stopPropagation();
          copy(
            buildSetDefaultVariantPrompt({
              variantLabel: optionLabel,
              variantValue: optionValue,
              configFilePath,
            }),
          );
        }}
        aria-label={`Copy prompt to make ${optionLabel} the default`}
      >
        {isCopied ? "Copied prompt" : "Make default"}
      </Button>
    </PrototypeComponent>
  );
}

export function PrototypeDesignBriefPanel<TVariant extends string>({
  componentIdPrefix,
  galleryId,
  storageKeyPrefix,
  brief,
  context,
  mobbin,
  variantsSection,
  variant,
  onVariantChange,
  options,
  renderers,
  baseline,
  defaultVariantValue,
  briefConfigFilePath,
  explorationLabel,
  explorationId,
  layout = "default",
  className,
}: PrototypeDesignBriefPanelProps<TVariant>) {
  const isSidebar = layout === "sidebar";
  const slug = usePrototypeSlug();
  const [variantPreviewsReady, setVariantPreviewsReady] = useState(false);

  useEffect(() => {
    setVariantPreviewsReady(true);
  }, []);

  const { copy: copyOverviewDefaultsPrompt, icon: copyOverviewDefaultsIcon } =
    useCopyToClipboard();
  const {
    copy: copyMoreVariantsPrompt,
    icon: copyMoreVariantsIcon,
    isCopied: isMoreVariantsCopied,
  } = useCopyToClipboard();
  const { value: title, updateValue: updateTitle } = usePersistedLocalString(
    `${storageKeyPrefix}-overview-title`,
    brief.titleDefault,
  );
  const { value: description, updateValue: updateDescription } =
    usePersistedLocalString(
      `${storageKeyPrefix}-overview-description`,
      brief.descriptionDefault,
    );
  const {
    value: contextExpanded,
    updateValue: updateContextExpanded,
  } = usePersistedLocalBoolean(
    `${storageKeyPrefix}-context-expanded`,
    context?.defaultExpanded ?? false,
  );
  const { value: moreVariantsBrief, updateValue: updateMoreVariantsBrief } =
    usePersistedLocalString(`${storageKeyPrefix}-more-variants-brief`, "");
  const {
    value: multipleVersions,
    updateValue: updateMultipleVersions,
  } = usePersistedLocalBoolean(
    `${storageKeyPrefix}-more-variants-multiple-versions`,
    true,
  );
  const canCopyMoreVariants = moreVariantsBrief.trim().length > 0 && Boolean(slug);

  const variantsTitle = variantsSection?.title ?? "Design variants";

  const effectiveTitle = title.trim() || brief.titleDefault;
  const effectiveDescription =
    description.trim() || brief.descriptionDefault;
  const overviewMatchesDefaults =
    effectiveTitle === brief.titleDefault &&
    effectiveDescription === brief.descriptionDefault;

  const overviewTitleClass = isSidebar
    ? SIDEBAR_OVERVIEW_TITLE_FIELD_CLASS
    : MODAL_OVERVIEW_TITLE_FIELD_CLASS;
  const overviewDescriptionClass = isSidebar
    ? SIDEBAR_OVERVIEW_DESCRIPTION_FIELD_CLASS
    : MODAL_OVERVIEW_DESCRIPTION_FIELD_CLASS;
  const sectionTitleClass = isSidebar
    ? SIDEBAR_GALLERY_SECTION_TITLE_CLASS
    : MODAL_GALLERY_SECTION_TITLE_CLASS;
  const cardTitleClass = isSidebar
    ? SIDEBAR_GALLERY_CARD_TITLE_CLASS
    : MODAL_GALLERY_CARD_TITLE_CLASS;
  const variantPreviewScale = isSidebar
    ? SIDEBAR_VARIANT_PREVIEW_SCALE
    : MODAL_VARIANT_PREVIEW_SCALE;

  const overviewFields = (
    <div
      className={cn(
        "text-left",
        isSidebar ? "flex flex-col gap-2" : undefined,
      )}
    >
      <PrototypeComponent id={`${componentIdPrefix}.overview-title`}>
        <input
          value={title}
          onChange={(event) => updateTitle(event.target.value)}
          aria-label="Overview title"
          className={overviewTitleClass}
        />
      </PrototypeComponent>
      <PrototypeComponent id={`${componentIdPrefix}.overview-description`}>
        <textarea
          value={description}
          onChange={(event) => updateDescription(event.target.value)}
          rows={isSidebar ? 3 : 1}
          aria-label="Overview description"
          className={cn(overviewDescriptionClass, !isSidebar && "mt-2")}
        />
      </PrototypeComponent>
    </div>
  );

  const contextSection = context ? (
    <PrototypeDesignContextPanel
      componentId={`${componentIdPrefix}.user-stats`}
      context={context}
      expanded={contextExpanded}
      onExpandedChange={updateContextExpanded}
      layout={layout}
    />
  ) : null;

  const overviewHeader = (
    <div
      className={cn(
        "text-left",
        isSidebar ? "flex flex-col gap-2 pt-1" : "px-4 py-4 sm:px-5 sm:py-5",
      )}
    >
      {overviewFields}
      {!isSidebar && contextSection ? (
        <div className="mt-3">{contextSection}</div>
      ) : null}
    </div>
  );

  const mobbinSection = mobbin ? (
    <PrototypeMobbinGallery
      componentIdPrefix={componentIdPrefix}
      galleryId={galleryId}
      references={mobbin.references}
      title={mobbin.title}
      description={mobbin.description}
      imagePathForReference={mobbin.imagePathForReference}
      layout={layout}
    />
  ) : null;

  const resolvedExplorationLabel = explorationLabel ?? brief.titleDefault;

  const handleCopyMoreVariantsPrompt = () => {
    if (!slug || !canCopyMoreVariants) return;

    const origin =
      typeof window !== "undefined" ? window.location.origin : undefined;

    copyMoreVariantsPrompt(
      buildMoreDesignExplorationVariantsCopyText({
        slug,
        explorationLabel: resolvedExplorationLabel,
        explorationId,
        options: explorationOptions,
        brief: {
          titleDefault: effectiveTitle,
          descriptionDefault: effectiveDescription,
        },
        configFilePath: briefConfigFilePath,
        origin,
        briefText: moreVariantsBrief,
        multipleVersions,
      }),
    );
  };

  const moreVariantsPromptSection = isSidebar ? (
    <div className="flex flex-col gap-2">
      <PrototypeComponent id={`${componentIdPrefix}.more-variants-prompt`}>
        <PrototypeBriefTextarea
          value={moreVariantsBrief}
          onChange={(event) => updateMoreVariantsBrief(event.target.value)}
          minHeightClass="min-h-[5rem]"
          placeholder={
            multipleVersions
              ? "Describe more variations to explore…"
              : "Describe one variation to explore…"
          }
          aria-label="More variations brief"
        />
      </PrototypeComponent>
      <div className="flex items-center justify-between gap-4">
        <PrototypeComponent id={`${componentIdPrefix}.more-variants-multiple-versions`}>
          <label className="flex cursor-pointer items-center gap-2">
            <Switch
              checked={multipleVersions}
              onCheckedChange={updateMultipleVersions}
              aria-label="Multiple versions"
              className="data-[state=checked]:bg-foreground"
            />
            <span className="text-sm text-[var(--text-secondary)]">Multiple versions</span>
          </label>
        </PrototypeComponent>
        <PrototypeComponent id={`${componentIdPrefix}.more-variants-copy-prompt`}>
          <Button
            type="button"
            variant="chrome"
            size="sm"
            className="h-8 gap-1.5"
            disabled={!canCopyMoreVariants}
            onClick={handleCopyMoreVariantsPrompt}
            aria-label="Copy more variations prompt"
          >
            {isMoreVariantsCopied ? "Copied prompt" : "Copy prompt"}
            {copyMoreVariantsIcon}
          </Button>
        </PrototypeComponent>
      </div>
    </div>
  ) : null;

  const explorationOptions = getDesignExplorationVariantOptions(options, baseline);
  const resolvedBaseline = resolveDesignExplorationBaselineOption(baseline);

  const renderVariantCard = (
    option: DesignExplorationVariantOption<TVariant>,
    {
      isBaseline = false,
      badgeSuffix,
    }: { isBaseline?: boolean; badgeSuffix?: string } = {},
  ) => {
    const VariantPreview = renderers[option.value];
    const isActive = option.value === variant;
    const isDefaultOption =
      defaultVariantValue !== undefined &&
      option.value === defaultVariantValue;
    const optionIdSuffix = badgeSuffix ?? option.value;
    const mobbinReferences =
      isSidebar && mobbin
        ? getMobbinReferencesForVariantLabel(mobbin.references, option.label)
        : [];

    return (
      <PrototypeComponent
        key={option.value}
        id={`${componentIdPrefix}.overview-option.${optionIdSuffix}`}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2 px-0.5">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <p className={cn(cardTitleClass, "shrink-0")}>{option.label}</p>
              {isBaseline ? (
                <PrototypeComponent
                  id={`${componentIdPrefix}.overview-option.${optionIdSuffix}.baseline`}
                  className="tool-variant-original-badge shrink-0"
                >
                  <span aria-label="Original state before exploration">
                    ORIGINAL
                  </span>
                </PrototypeComponent>
              ) : null}
              <VariantMobbinLinks
                componentIdPrefix={componentIdPrefix}
                optionIdSuffix={optionIdSuffix}
                references={mobbinReferences}
              />
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {isDefaultOption ? (
                <PrototypeComponent
                  id={`${componentIdPrefix}.overview-option.${optionIdSuffix}.default`}
                  className="tool-variant-default-badge shrink-0"
                >
                  <span aria-label="Current default variant">DEFAULT</span>
                </PrototypeComponent>
              ) : null}
              {!isDefaultOption ? (
                <MakeDefaultButton
                  componentId={`${componentIdPrefix}.overview-option.${optionIdSuffix}.set-default`}
                  optionLabel={option.label}
                  optionValue={option.value}
                  configFilePath={briefConfigFilePath}
                />
              ) : null}
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-pressed={isActive}
            aria-label={`Select ${option.label} variant`}
            onClick={() => onVariantChange(option.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onVariantChange(option.value);
              }
            }}
            className={cn(
              "tool-variant-card",
              isActive && "is-active",
            )}
          >
            <div
              style={{ zoom: variantPreviewScale }}
              className="w-full"
              data-prototype-screenshot
            >
              {variantPreviewsReady ? (
                VariantPreview()
              ) : (
                <div
                  className="bg-bg-subtle min-h-32 w-full"
                  aria-hidden
                />
              )}
            </div>
          </div>

          {option.rationale ? (
            <p
              className={cn(
                "px-0.5 leading-relaxed",
                isSidebar
                  ? "text-sm text-[var(--text-secondary)]"
                  : "text-muted-foreground text-xs",
              )}
            >
              {option.rationale.good} {option.rationale.bad}
            </p>
          ) : null}
        </div>
      </PrototypeComponent>
    );
  };

  const variantsSectionContent = (
    <section
      className={cn(
        isSidebar
          ? "flex flex-col gap-3"
          : "border-border border-t px-4 py-6 sm:px-5 sm:py-8",
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-2",
          !isSidebar && "mb-6",
        )}
      >
        <p className={sectionTitleClass}>{variantsTitle}</p>
      </div>

      <div className={cn("flex flex-col", isSidebar ? "gap-6" : "gap-10")}>
        {explorationOptions.map((option) => renderVariantCard(option))}
        {renderVariantCard(resolvedBaseline, {
          isBaseline: true,
          badgeSuffix: "baseline",
        })}
      </div>
    </section>
  );

  return (
    <PrototypeComponent
      id={`${componentIdPrefix}.overview-modal`}
      className={cn(
        "min-h-0 flex-1",
        isSidebar && "flex flex-col gap-4",
        !isSidebar && "overflow-y-auto overscroll-contain",
        className,
      )}
    >
      {isSidebar ? (
        <>
          {moreVariantsPromptSection}
          <hr className="border-border" />
          {variantsSectionContent}
          {mobbinSection ? (
            <>
              <hr className="border-border" />
              {mobbinSection}
            </>
          ) : null}
          {contextSection ? (
            <>
              <hr className="border-border" />
              {contextSection}
            </>
          ) : null}
          <hr className="border-border" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <p className={SIDEBAR_GALLERY_SECTION_TITLE_CLASS}>Overview</p>
              <PrototypeComponent
                id={`${componentIdPrefix}.overview-copy-default-brief-prompt`}
              >
                <button
                  type="button"
                  className={SIDEBAR_OVERVIEW_COPY_BUTTON_CLASS}
                  disabled={overviewMatchesDefaults}
                  onClick={() =>
                    copyOverviewDefaultsPrompt(
                      buildResetBriefDefaultsPrompt({
                        brief: {
                          titleDefault: effectiveTitle,
                          descriptionDefault: effectiveDescription,
                        },
                        configFilePath: briefConfigFilePath,
                      }),
                    )
                  }
                  aria-label="Copy prompt to set overview as default"
                >
                  {copyOverviewDefaultsIcon}
                </button>
              </PrototypeComponent>
            </div>
            {overviewFields}
          </div>
        </>
      ) : (
        <>
          {overviewHeader}
          {mobbinSection}
          {variantsSectionContent}
        </>
      )}
    </PrototypeComponent>
  );
}
