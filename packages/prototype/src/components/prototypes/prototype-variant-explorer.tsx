"use client";

import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { PrototypeControlGroup } from "@prototype/components/prototypes/prototype-control";
import { PrototypeDesignBriefModal } from "@prototype/components/prototypes/prototype-design-brief-modal";
import { PrototypeDesignBriefPanel } from "@prototype/components/prototypes/prototype-design-brief-panel";
import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { PrototypeVariantTabs } from "@prototype/components/prototypes/prototype-variant-tabs";
import {
  buildBriefOverviewCopyText,
  type DesignExplorationConfig,
} from "@prototype/lib/prototypes/design-exploration-types";
import { usePrototypeReviewOptional } from "@prototype/lib/prototypes/prototype-review-context";
import { usePersistedLocalString } from "@prototype/lib/prototypes/use-persisted-local-state";
import { LayoutGrid } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const OVERVIEW_CONTROL_BUTTON_CLASS = "tool-toolbar-button";

const OVERVIEW_TOOLBAR_CLASS = "tool-toolbar pointer-events-auto";

type PrototypeVariantExplorerProps<TVariant extends string> =
  DesignExplorationConfig<TVariant> & {
    /** Stable id for the Mobbin gallery root (registered in component-ids.ts). */
    mobbinGalleryId?: string;
    /** When false, caller wraps with PrototypeComponent id={componentIdPrefix}. */
    wrapRoot?: boolean;
    /**
     * When true, only registers sidebar content — skips rendering the active
     * variant in the page tree. Use for hidden hosts that exist solely to keep
     * design explorations available in the review sidebar.
     */
    registerOnly?: boolean;
    /** When set, registers this exploration in the review sidebar. */
    variantSet?: {
      id: string;
      label: string;
    };
  };

export function PrototypeVariantExplorer<TVariant extends string>({
  componentIdPrefix,
  variantTabsIdPrefix,
  storageKeyPrefix,
  variant,
  onVariantChange,
  options,
  renderers,
  brief,
  context,
  mobbin,
  variantsSection,
  defaultVariant,
  variantTabAriaLabel = "variant",
  mobbinGalleryId = "mobbin-inspiration-gallery",
  wrapRoot = true,
  registerOnly = false,
  briefConfigFilePath,
  variantSet,
}: PrototypeVariantExplorerProps<TVariant>) {
  const review = usePrototypeReviewOptional();
  // Default is stored in the codebase config — not KV. "Make default" copies a
  // prompt to update `defaultVariant` in the exploration config file.
  const effectiveDefault = defaultVariant ?? options[0]?.value;
  const [overviewOpen, setOverviewOpen] = useState(false);
  const { copy: copyOverview, icon: copyIcon } = useCopyToClipboard();
  const { value: overviewTitle } = usePersistedLocalString(
    `${storageKeyPrefix}-overview-title`,
    brief.titleDefault,
  );
  const { value: overviewDescription } = usePersistedLocalString(
    `${storageKeyPrefix}-overview-description`,
    brief.descriptionDefault,
  );

  const fallbackVariant = options[0]?.value;
  const ActiveVariantRenderer =
    renderers[variant] ?? (fallbackVariant ? renderers[fallbackVariant] : null);
  const hideInlineControls = Boolean(review);

  const briefPanelProps = useMemo(
    () => ({
      componentIdPrefix,
      galleryId: mobbinGalleryId,
      storageKeyPrefix,
      brief,
      context,
      mobbin,
      variantsSection,
      variant,
      onVariantChange,
      options,
      renderers,
      defaultVariantValue: effectiveDefault,
      briefConfigFilePath,
      explorationLabel: variantSet?.label ?? brief.titleDefault,
      explorationId: variantSet?.id,
    }),
    [
      brief,
      briefConfigFilePath,
      componentIdPrefix,
      context,
      effectiveDefault,
      mobbin,
      mobbinGalleryId,
      onVariantChange,
      options,
      renderers,
      storageKeyPrefix,
      variant,
      variantSet?.id,
      variantSet?.label,
      variantsSection,
    ],
  );

  const sidebarPanel = useMemo(
    () => (
      <PrototypeDesignBriefPanel
        {...briefPanelProps}
        layout="sidebar"
        className="min-h-0"
      />
    ),
    [briefPanelProps],
  );

  const sidebarRegistrationKey = useMemo(
    () =>
      [
        variant,
        effectiveDefault,
        overviewTitle,
        overviewDescription,
        options.map((option) => option.value).join(","),
      ].join("|"),
    [variant, effectiveDefault, overviewTitle, overviewDescription, options],
  );

  const variantSetId = variantSet?.id ?? null;
  const hasReview = review != null;

  useEffect(() => {
    if (!review) return;

    if (variantSetId) {
      review.registerVariantSidebarContent(variantSetId, sidebarPanel);
      return;
    }

    review.registerLegacyVariantSidebarContent(sidebarPanel);
  }, [hasReview, review, sidebarPanel, variantSetId]);

  useEffect(() => {
    if (!review) return;

    if (variantSetId) {
      review.updateVariantSidebarContent(variantSetId, sidebarPanel);
      return;
    }

    review.updateLegacyVariantSidebarContent(sidebarPanel);
    // Gate this effect on `sidebarRegistrationKey` (a serialized snapshot of the
    // meaningful sidebar content), NOT on `review` or `sidebarPanel`:
    //  - `review` identity changes every time updateVariant*SidebarContent bumps
    //    variantSidebarRevision, and `sidebarPanel` is rebuilt on every render
    //    (its config objects are not referentially stable). Depending on either
    //    re-triggers this effect, which bumps the revision again -> infinite loop.
    //  - The closure still reads the latest `sidebarPanel`, and the key changes
    //    whenever the rendered content actually changes, so fresh content is
    //    always pushed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasReview, variantSetId, sidebarRegistrationKey]);

  useEffect(() => {
    if (!review || variantSetId) return;

    review.setLegacyVariantsAvailable(true);
    return () => review.setLegacyVariantsAvailable(false);
  }, [hasReview, variantSetId]);

  const controls = useMemo(
    () => (
      <div className="relative">
        <PrototypeControlGroup className="flex justify-end">
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <PrototypeVariantTabs
                idPrefix={variantTabsIdPrefix}
                options={options}
                value={variant}
                onValueChange={onVariantChange}
                keyboardScopeActive={!overviewOpen}
                variantTabAriaLabel={variantTabAriaLabel}
                defaultVariantValue={effectiveDefault}
              />

              <div className={OVERVIEW_TOOLBAR_CLASS}>
                <PrototypeComponent id={`${componentIdPrefix}.overview-copy-brief`}>
                  <button
                    type="button"
                    className={OVERVIEW_CONTROL_BUTTON_CLASS}
                    onClick={() =>
                      copyOverview(
                        buildBriefOverviewCopyText(
                          overviewTitle.trim() || brief.titleDefault,
                          overviewDescription.trim() || brief.descriptionDefault,
                        ),
                      )
                    }
                    aria-label="Copy overview"
                  >
                    {copyIcon}
                  </button>
                </PrototypeComponent>

                <PrototypeComponent id={`${componentIdPrefix}.overview-trigger`}>
                  <button
                    type="button"
                    className={OVERVIEW_CONTROL_BUTTON_CLASS}
                    onClick={() => setOverviewOpen(true)}
                    aria-label="View all variants"
                  >
                    <LayoutGrid className="size-3.5" />
                  </button>
                </PrototypeComponent>
              </div>
            </div>
          </div>
        </PrototypeControlGroup>
      </div>
    ),
    [
      brief.descriptionDefault,
      brief.titleDefault,
      componentIdPrefix,
      copyIcon,
      copyOverview,
      effectiveDefault,
      onVariantChange,
      options,
      overviewDescription,
      overviewOpen,
      overviewTitle,
      variant,
      variantTabAriaLabel,
      variantTabsIdPrefix,
    ],
  );

  const inlineControls = wrapRoot ? (
    <PrototypeComponent id={componentIdPrefix}>{controls}</PrototypeComponent>
  ) : (
    controls
  );

  return (
    <div className="relative">
      {!hideInlineControls ? inlineControls : null}

      {!hideInlineControls ? (
        <PrototypeDesignBriefModal
          open={overviewOpen}
          onOpenChange={setOverviewOpen}
          componentIdPrefix={componentIdPrefix}
          galleryId={mobbinGalleryId}
          storageKeyPrefix={storageKeyPrefix}
          brief={brief}
          context={context}
          mobbin={mobbin}
          variantsSection={variantsSection}
          variant={variant}
          onVariantChange={onVariantChange}
          options={options}
          renderers={renderers}
          defaultVariantValue={effectiveDefault}
          briefConfigFilePath={briefConfigFilePath}
        />
      ) : null}

      {!registerOnly && ActiveVariantRenderer ? ActiveVariantRenderer() : null}
    </div>
  );
}
