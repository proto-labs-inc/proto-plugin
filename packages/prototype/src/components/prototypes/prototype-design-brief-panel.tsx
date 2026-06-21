"use client";

import { Button } from "@prototype/components/ui/button";
import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { PrototypeDesignContextPanel } from "@prototype/components/prototypes/prototype-design-context-panel";
import { PrototypeMobbinGallery } from "@prototype/components/prototypes/prototype-mobbin-gallery";
import { PrototypeVariantRationalePanel } from "@prototype/components/prototypes/prototype-variant-rationale-panel";
import {
  buildResetBriefDefaultsPrompt,
  type DesignExplorationBrief,
  type DesignExplorationContext,
  type DesignExplorationMobbin,
  type DesignExplorationRationale,
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

function scrollToMobbinReference(
  componentIdPrefix: string,
  referenceId: string,
) {
  const el = document.querySelector(
    `[data-prototype-target*="${componentIdPrefix}.mobbin-reference.${referenceId}"]`,
  );
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function VariantHint({
  hint,
  references,
  componentIdPrefix,
}: {
  hint: string;
  references: MobbinReference[];
  componentIdPrefix: string;
}) {
  const parts = hint.split(/,\s*/);

  return (
    <>
      {parts.map((part, i) => {
        const trimmed = part.trim();
        const matchedRef = references.find(
          (r) => r.appName.toLowerCase() === trimmed.toLowerCase(),
        );
        const isLast = i === parts.length - 1;

        return (
          <span key={i}>
            {matchedRef ? (
              <button
                type="button"
                onClick={() =>
                  scrollToMobbinReference(componentIdPrefix, matchedRef.id)
                }
                className="cursor-pointer underline decoration-dotted underline-offset-2 transition-colors duration-200 ease hover:text-foreground"
              >
                {trimmed}
              </button>
            ) : (
              trimmed
            )}
            {!isLast ? ", " : ""}
          </span>
        );
      })}
    </>
  );
}

const MODAL_VARIANT_PREVIEW_SCALE = 0.75;
const SIDEBAR_VARIANT_PREVIEW_SCALE = 0.42;

const MODAL_OVERVIEW_TITLE_FIELD_CLASS =
  "tool-heading field-sizing-content w-full min-h-0 resize-none border-0 bg-transparent p-0 shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0";

const MODAL_OVERVIEW_DESCRIPTION_FIELD_CLASS =
  "tool-body field-sizing-content w-full min-h-0 resize-none border-0 bg-transparent p-0 shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0";

const MODAL_GALLERY_SECTION_TITLE_CLASS = "tool-heading";

const MODAL_GALLERY_SECTION_DESC_CLASS = "tool-body max-w-2xl";

const MODAL_GALLERY_CARD_TITLE_CLASS = "text-foreground font-medium";

const MODAL_GALLERY_CARD_BODY_CLASS = "text-sm text-muted-foreground leading-relaxed";

const SIDEBAR_OVERVIEW_TITLE_FIELD_CLASS =
  "text-sm text-foreground field-sizing-content w-full min-h-0 resize-none border-0 bg-transparent p-0 font-medium leading-snug shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0";

const SIDEBAR_OVERVIEW_DESCRIPTION_FIELD_CLASS =
  "text-sm text-muted-foreground field-sizing-content w-full min-h-0 resize-none border-0 bg-transparent p-0 leading-relaxed shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0";

const SIDEBAR_GALLERY_SECTION_TITLE_CLASS = "tool-section-label";

const SIDEBAR_GALLERY_SECTION_DESC_CLASS = "tool-body";

const SIDEBAR_GALLERY_CARD_TITLE_CLASS = "text-sm text-foreground font-medium";

const SIDEBAR_GALLERY_CARD_BODY_CLASS = "text-sm text-muted-foreground leading-relaxed";

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
  rationale: Record<TVariant, DesignExplorationRationale>;
  renderers: Record<TVariant, () => React.ReactNode>;
  /** Shown with a "Default" pill when this option matches the KV default. */
  defaultVariantValue?: TVariant;
  /** Persists the selected default variant to KV storage. */
  onSetDefaultVariant?: (value: TVariant) => void;
  /** Path to design exploration config — included in overview copy prompt. */
  briefConfigFilePath?: string;
  layout?: PrototypeDesignBriefPanelLayout;
  className?: string;
};

const VARIANT_DEFAULT_CONTROL_CLASS =
  "h-6 shrink-0 border border-border-solid bg-bg-top px-2 text-[11px] font-medium text-foreground shadow-xs hover:border-border-medium hover:bg-bg-layered";

const VARIANT_DEFAULT_ACTIVE_CLASS =
  "border-[color-mix(in_srgb,var(--primary)_35%,var(--border-solid))] bg-[var(--tool-chrome-blue-highlight)] text-primary-dark hover:border-[color-mix(in_srgb,var(--primary)_35%,var(--border-solid))] hover:bg-[var(--tool-chrome-blue-highlight)]";

const SIDEBAR_OVERVIEW_COPY_BUTTON_CLASS =
  "text-[var(--tool-chrome-icon)] hover:text-[var(--tool-chrome-icon-hover)] inline-flex size-7 shrink-0 items-center justify-center rounded-sm border-0 bg-transparent p-0 transition-colors duration-200 ease outline-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0";

function VariantRationaleSection<TVariant extends string>({
  componentIdPrefix,
  optionValue,
  storageKeyPrefix,
  rationale,
  layout,
  bodyClassName,
}: {
  componentIdPrefix: string;
  optionValue: TVariant;
  storageKeyPrefix: string;
  rationale: DesignExplorationRationale;
  layout: PrototypeDesignBriefPanelLayout;
  bodyClassName: string;
}) {
  const { value: expanded, updateValue: updateExpanded } =
    usePersistedLocalBoolean(
      `${storageKeyPrefix}-variant-rationale-expanded-${optionValue}`,
      false,
    );

  return (
    <PrototypeVariantRationalePanel
      componentId={`${componentIdPrefix}.overview-option.${optionValue}.rationale`}
      rationale={rationale}
      expanded={expanded}
      onExpandedChange={updateExpanded}
      layout={layout}
      bodyClassName={bodyClassName}
    />
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
  rationale,
  renderers,
  defaultVariantValue,
  onSetDefaultVariant,
  briefConfigFilePath,
  layout = "default",
  className,
}: PrototypeDesignBriefPanelProps<TVariant>) {
  const isSidebar = layout === "sidebar";
  const [variantPreviewsReady, setVariantPreviewsReady] = useState(false);

  useEffect(() => {
    setVariantPreviewsReady(true);
  }, []);

  const { copy: copyOverviewDefaultsPrompt, icon: copyOverviewDefaultsIcon } =
    useCopyToClipboard();
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

  const variantsTitle = variantsSection?.title ?? "Design variants";
  const variantsDescription =
    variantsSection?.description ??
    "Compare layout, copy, and CTAs side by side.";

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
  const sectionDescClass = isSidebar
    ? SIDEBAR_GALLERY_SECTION_DESC_CLASS
    : MODAL_GALLERY_SECTION_DESC_CLASS;
  const cardTitleClass = isSidebar
    ? SIDEBAR_GALLERY_CARD_TITLE_CLASS
    : MODAL_GALLERY_CARD_TITLE_CLASS;
  const cardBodyClass = isSidebar
    ? SIDEBAR_GALLERY_CARD_BODY_CLASS
    : MODAL_GALLERY_CARD_BODY_CLASS;
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
        {!isSidebar && <p className={sectionDescClass}>{variantsDescription}</p>}
      </div>

      <div className={cn("flex flex-col", isSidebar ? "gap-6" : "gap-10")}>
        {options.map((option) => {
          const optionRationale = rationale[option.value];
          const VariantPreview = renderers[option.value];
          const isActive = option.value === variant;
          const isDefaultOption =
            defaultVariantValue !== undefined &&
            option.value === defaultVariantValue;

          return (
            <PrototypeComponent
              key={option.value}
              id={`${componentIdPrefix}.overview-option.${option.value}`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2 px-0.5">
                  <p className={cn(cardBodyClass, "min-w-0 flex-1")}>
                    <span className={cardTitleClass}>{option.label}</span>
                    {option.hint ? (
                      <>
                        {" · "}
                        <VariantHint
                          hint={option.hint}
                          references={mobbin?.references ?? []}
                          componentIdPrefix={componentIdPrefix}
                        />
                      </>
                    ) : null}
                  </p>

                  <div className="flex shrink-0 items-center gap-3">
                    {isDefaultOption ? (
                      <PrototypeComponent
                        id={`${componentIdPrefix}.overview-option.${option.value}.default`}
                      >
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className={cn(
                            VARIANT_DEFAULT_CONTROL_CLASS,
                            VARIANT_DEFAULT_ACTIVE_CLASS,
                            "pointer-events-none disabled:opacity-100",
                          )}
                          disabled
                          aria-label="Current default variant"
                        >
                          Default
                        </Button>
                      </PrototypeComponent>
                    ) : onSetDefaultVariant ? (
                      <PrototypeComponent
                        id={`${componentIdPrefix}.overview-option.${option.value}.set-default`}
                      >
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className={VARIANT_DEFAULT_CONTROL_CLASS}
                          onClick={(event) => {
                            event.stopPropagation();
                            onSetDefaultVariant(option.value);
                          }}
                          aria-label={`Set ${option.label} as default`}
                        >
                          Make default
                        </Button>
                      </PrototypeComponent>
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

                <VariantRationaleSection
                  componentIdPrefix={componentIdPrefix}
                  optionValue={option.value}
                  storageKeyPrefix={storageKeyPrefix}
                  rationale={optionRationale}
                  layout={layout}
                  bodyClassName={cardBodyClass}
                />
              </div>
            </PrototypeComponent>
          );
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
