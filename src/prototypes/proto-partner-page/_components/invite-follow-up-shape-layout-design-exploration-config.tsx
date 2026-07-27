"use client";

import { DesignExplorationVariantPreviewShell } from "proto-plugin";
import type { DesignExplorationConfig } from "proto-plugin";
import { buildDesignExplorationRenderers } from "proto-plugin";
import type { ReactNode } from "react";

import { InviteFollowUpShapeExamples } from "./invite-follow-up-shape-examples";
import {
  DEFAULT_INVITE_FOLLOW_UP_SHAPE_LAYOUT_VARIANT,
  type InviteFollowUpShapeLayoutVariant,
} from "./invite-follow-up-shape-layout-content";

export type { InviteFollowUpShapeLayoutVariant };
export { DEFAULT_INVITE_FOLLOW_UP_SHAPE_LAYOUT_VARIANT };

export const INVITE_FOLLOW_UP_SHAPE_LAYOUT_VARIANT_OPTIONS: Array<{
  value: InviteFollowUpShapeLayoutVariant;
  label: string;
  hint?: string;
}> = [
  {
    value: "staggered-shelf",
    label: "Staggered shelf",
    hint: "Diagonal steps from high-left to low-right around the blurb",
  },
  {
    value: "bottom-line",
    label: "Bottom line",
    hint: "Two float above; three share one even shelf below",
  },
  {
    value: "scatter-field",
    label: "Scatter field",
    hint: "Loose placement above and below the copy",
  },
  {
    value: "wave-rise",
    label: "Wave rise",
    hint: "Alternating high and low rests across the width",
  },
  {
    value: "arc-shelf",
    label: "Arc shelf",
    hint: "High edges with the center sitting lowest under the blurb",
  },
  {
    value: "left-cluster",
    label: "Left cluster",
    hint: "Three stacked on the left, two framing the right",
  },
  {
    value: "deep-edge",
    label: "Deep edge",
    hint: "Tight bottom shelf with two small accents above",
  },
  {
    value: "gallery-float",
    label: "Gallery float",
    hint: "Airy default — two above the blurb, three below",
  },
  {
    value: "wide-corners",
    label: "Wide corners",
    hint: "Four corners plus a mid anchor framing the copy",
  },
  {
    value: "stepped-terrace",
    label: "Stepped terrace",
    hint: "Terrace steps ascending from low-left to high-right",
  },
];

export const INVITE_FOLLOW_UP_SHAPE_LAYOUT_BASELINE = {
  value: "staggered-shelf" as const satisfies InviteFollowUpShapeLayoutVariant,
  hint: "Follow-up shape layout before layout exploration",
};

const COMPONENT_ID_PREFIX = "invite-follow-up-shape-layout-explorer";
const VARIANT_TABS_ID_PREFIX = "invite-follow-up-shape-layout-variant-tabs";
const STORAGE_KEY_PREFIX = "proto-partner-page-invite-follow-up-shape-layout";

const renderers = buildDesignExplorationRenderers<InviteFollowUpShapeLayoutVariant>(
  INVITE_FOLLOW_UP_SHAPE_LAYOUT_VARIANT_OPTIONS,
  (variant) => (
    <DesignExplorationVariantPreviewShell layout="overlay">
      <InviteFollowUpShapeExamples layoutVariant={variant} previewKey={variant} />
    </DesignExplorationVariantPreviewShell>
  ),
  INVITE_FOLLOW_UP_SHAPE_LAYOUT_BASELINE,
);

export function buildInviteFollowUpShapeLayoutDesignExplorationConfig(
  variant: InviteFollowUpShapeLayoutVariant,
  onVariantChange: (next: InviteFollowUpShapeLayoutVariant) => void,
): DesignExplorationConfig<InviteFollowUpShapeLayoutVariant> {
  return {
    componentIdPrefix: COMPONENT_ID_PREFIX,
    variantTabsIdPrefix: VARIANT_TABS_ID_PREFIX,
    storageKeyPrefix: STORAGE_KEY_PREFIX,
    variant,
    onVariantChange,
    options: INVITE_FOLLOW_UP_SHAPE_LAYOUT_VARIANT_OPTIONS,
    baseline: INVITE_FOLLOW_UP_SHAPE_LAYOUT_BASELINE,
    defaultVariant: DEFAULT_INVITE_FOLLOW_UP_SHAPE_LAYOUT_VARIANT,
    renderers,
    brief: {
      titleDefault: "Follow-up shape layout",
      descriptionDefault:
        "Explore how the five example proto shapes are arranged on the invite follow-up screen. Shape type, color, and texture stay fixed — only placement changes.",
    },
    variantsSection: {
      title: "Layout directions",
      description:
        "Pick a layout on the live follow-up page via the variant explorer. Each option keeps the same five shapes with unique colors and patterns.",
    },
    variantTabAriaLabel: "invite follow-up shape layout",
    briefConfigFilePath:
      "src/prototypes/proto-partner-page/_components/invite-follow-up-shape-layout-design-exploration-config.tsx",
  };
}

export function renderInviteFollowUpShapeLayoutVariant(
  variant: InviteFollowUpShapeLayoutVariant,
): ReactNode {
  return renderers[variant]();
}
