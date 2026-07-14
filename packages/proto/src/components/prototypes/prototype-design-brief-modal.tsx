"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { PrototypeDesignBriefPanel } from "@prototype/components/prototypes/prototype-design-brief-panel";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@prototype/components/ui/dialog";
import { PROTOTYPE_TOOL_MODAL_CLOSE_CLASS } from "@prototype/components/platform-ui/prototype-tool-dialog";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { buildBriefOverviewCopyText } from "@prototype/lib/prototypes/design-exploration-types";
import type {
  DesignExplorationBaselineOption,
  DesignExplorationBrief,
  DesignExplorationContext,
  DesignExplorationMobbin,
  DesignExplorationVariantOption,
  DesignExplorationVariantsSection,
} from "@prototype/lib/prototypes/design-exploration-types";
import { usePersistedLocalString } from "@prototype/lib/prototypes/use-persisted-local-state";
import type { ReactNode } from "react";
import { X } from "lucide-react";

const MODAL_CHROME_BUTTON_CLASS = PROTOTYPE_TOOL_MODAL_CLOSE_CLASS;

type PrototypeDesignBriefModalProps<TVariant extends string> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  renderers: Record<TVariant, () => ReactNode>;
  baseline: DesignExplorationBaselineOption<TVariant>;
  defaultVariantValue?: TVariant;
  briefConfigFilePath?: string;
};

export function PrototypeDesignBriefModal<TVariant extends string>({
  open,
  onOpenChange,
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
}: PrototypeDesignBriefModalProps<TVariant>) {
  const { copy: copyOverview, icon: copyIcon } = useCopyToClipboard();
  const { value: title } = usePersistedLocalString(
    `${storageKeyPrefix}-overview-title`,
    brief.titleDefault,
  );
  const { value: description } = usePersistedLocalString(
    `${storageKeyPrefix}-overview-description`,
    brief.descriptionDefault,
  );

  const effectiveTitle = title.trim() || brief.titleDefault;
  const effectiveDescription =
    description.trim() || brief.descriptionDefault;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        portalScope="tool"
        className="tool-dialog-surface flex h-[min(92svh,calc(100%-2rem))] max-h-[min(92svh,calc(100%-2rem))] w-[min(96rem,calc(100vw-2rem))] max-w-[min(96rem,calc(100vw-2rem))] flex-col gap-0 overflow-hidden border-0 p-0 sm:max-w-[min(96rem,calc(100vw-2rem))]"
      >
        <div className="absolute top-4 right-4 z-10 flex items-center gap-0.5">
          <PrototypeComponent id={`${componentIdPrefix}.overview-copy-brief`}>
            <button
              type="button"
              className={MODAL_CHROME_BUTTON_CLASS}
              onClick={() =>
                copyOverview(
                  buildBriefOverviewCopyText(effectiveTitle, effectiveDescription),
                )
              }
              aria-label="Copy overview"
            >
              {copyIcon}
            </button>
          </PrototypeComponent>
          <DialogClose className={MODAL_CHROME_BUTTON_CLASS}>
            <X />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <DialogTitle className="sr-only">{effectiveTitle}</DialogTitle>

        <PrototypeDesignBriefPanel
          componentIdPrefix={componentIdPrefix}
          galleryId={galleryId}
          storageKeyPrefix={storageKeyPrefix}
          brief={brief}
          context={context}
          mobbin={mobbin}
          variantsSection={variantsSection}
          variant={variant}
          onVariantChange={onVariantChange}
          options={options}
          renderers={renderers}
          baseline={baseline}
          defaultVariantValue={defaultVariantValue}
          briefConfigFilePath={briefConfigFilePath}
          className="overflow-y-auto overscroll-contain"
        />
      </DialogContent>
    </Dialog>
  );
}
