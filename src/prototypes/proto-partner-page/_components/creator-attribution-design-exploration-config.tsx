"use client";

import { DesignExplorationVariantPreviewShell } from "proto-plugin";
import type { DesignExplorationConfig } from "proto-plugin";
import { buildDesignExplorationRenderers } from "proto-plugin";
import type { ReactNode } from "react";

import { CreatorAttributionBlock } from "./creator-attribution-block";
import {
  DEFAULT_CREATOR_ATTRIBUTION_VARIANT,
  PROTOTYPE_CREATOR,
  type CreatorAttributionVariant,
} from "./creator-attribution-content";
import { DRAG_ATTRIBUTION_TOOLTIP_CLASS } from "../../proto-shapes/springs-drag-attribution-tooltip";

export type { CreatorAttributionVariant };
export { DEFAULT_CREATOR_ATTRIBUTION_VARIANT };

export const CREATOR_ATTRIBUTION_VARIANT_OPTIONS: Array<{
  value: CreatorAttributionVariant;
  label: string;
  hint?: string;
}> = [
  {
    value: "shape-drag-tooltip",
    label: "Shape drag tooltip",
    hint: "Dark pill follows the shape centroid while you drag it",
  },
  {
    value: "overview-sidebar-header",
    label: "Overview sidebar",
    hint: "Creator name and role in the Overview panel header",
  },
  {
    value: "floating-above-toolbar",
    label: "Floating pill",
    hint: "Centered pill floating just above the review toolbar",
  },
  {
    value: "toolbar-avatar-pill",
    label: "Toolbar avatar pill",
    hint: "Avatar + name pill in the toolbar’s leading group",
  },
  {
    value: "toolbar-inline",
    label: "Toolbar inline",
    hint: "Quiet “by Name” text beside the back button",
  },
  {
    value: "viewport-corner-badge",
    label: "Viewport badge",
    hint: "Light badge pinned to the top-left of the prototype frame",
  },
  {
    value: "viewport-watermark",
    label: "Viewport watermark",
    hint: "Subtle uppercase name in the bottom-right of the content",
  },
];

export const CREATOR_ATTRIBUTION_BASELINE = {
  value: "none" as const satisfies CreatorAttributionVariant,
  label: "None",
  hint: "No creator attribution — current behavior",
};

const COMPONENT_ID_PREFIX = "creator-attribution-explorer";
const VARIANT_TABS_ID_PREFIX = "creator-attribution-variant-tabs";
const STORAGE_KEY_PREFIX = "proto-partner-page-creator-attribution";

const renderers = buildDesignExplorationRenderers<CreatorAttributionVariant>(
  CREATOR_ATTRIBUTION_VARIANT_OPTIONS,
  (variant) => (
    <DesignExplorationVariantPreviewShell layout="overlay">
      <div className="relative h-[420px] w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
        <div className="absolute inset-x-0 top-0 h-8 border-b border-neutral-200 bg-white" />
        <div className="absolute inset-x-6 top-14 space-y-2">
          <div className="h-3 w-2/5 rounded bg-neutral-200" />
          <div className="h-3 w-3/4 rounded bg-neutral-100" />
        </div>
        {variant === "shape-drag-tooltip" ? (
          <div
            className={`${DRAG_ATTRIBUTION_TOOLTIP_CLASS.replace("hidden ", "")} left-1/2 top-[58%] -translate-x-1/2 -translate-y-full`}
          >
            Created by {PROTOTYPE_CREATOR.firstName}
          </div>
        ) : (
          <CreatorAttributionBlock variant={variant} />
        )}
        <div className="absolute inset-x-0 bottom-0 h-10 border-t border-neutral-200 bg-[#111]" />
      </div>
    </DesignExplorationVariantPreviewShell>
  ),
  CREATOR_ATTRIBUTION_BASELINE,
);

export function buildCreatorAttributionDesignExplorationConfig(
  variant: CreatorAttributionVariant,
  onVariantChange: (next: CreatorAttributionVariant) => void,
): DesignExplorationConfig<CreatorAttributionVariant> {
  return {
    componentIdPrefix: COMPONENT_ID_PREFIX,
    variantTabsIdPrefix: VARIANT_TABS_ID_PREFIX,
    storageKeyPrefix: STORAGE_KEY_PREFIX,
    variant,
    onVariantChange,
    options: CREATOR_ATTRIBUTION_VARIANT_OPTIONS,
    baseline: CREATOR_ATTRIBUTION_BASELINE,
    defaultVariant: DEFAULT_CREATOR_ATTRIBUTION_VARIANT,
    renderers,
    brief: {
      titleDefault: "Creator attribution",
      descriptionDefault:
        "Explore where to show the prototype creator’s name while someone reviews or interacts with the prototype. Drag a shape on the follow-up screen to try the localized tooltip.",
    },
    variantsSection: {
      title: "Placement directions",
      description:
        "Pick a placement on the live page via Explorations → Creator attribution. Each option keeps the invite follow-up content unchanged — only attribution chrome moves.",
    },
    variantTabAriaLabel: "creator attribution placement",
    briefConfigFilePath:
      "src/prototypes/proto-partner-page/_components/creator-attribution-design-exploration-config.tsx",
  };
}

export function renderCreatorAttributionVariant(
  variant: CreatorAttributionVariant,
): ReactNode {
  return renderers[variant]();
}
