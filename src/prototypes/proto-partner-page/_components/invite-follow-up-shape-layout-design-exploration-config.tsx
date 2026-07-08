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
    hint: "Diagonal height steps along the bottom edge",
  },
  {
    value: "bottom-line",
    label: "Bottom line",
    hint: "All five shapes share one floor, spaced evenly",
  },
  {
    value: "scatter-field",
    label: "Scatter field",
    hint: "Looser placement across the lower two-thirds",
  },
  {
    value: "wave-rise",
    label: "Wave rise",
    hint: "Alternating low and high rests in a wave",
  },
  {
    value: "arc-shelf",
    label: "Arc shelf",
    hint: "Center shape sits lowest; edges rise like a shelf",
  },
  {
    value: "left-cluster",
    label: "Left cluster",
    hint: "Three shapes grouped bottom-left, two on the right",
  },
  {
    value: "deep-edge",
    label: "Deep edge",
    hint: "Everything pinned tight to the bottom edge",
  },
  {
    value: "gallery-float",
    label: "Gallery float",
    hint: "Taller vertical spread for an airy gallery feel",
  },
  {
    value: "wide-corners",
    label: "Wide corners",
    hint: "Shapes pushed to the lower corners with one center anchor",
  },
  {
    value: "stepped-terrace",
    label: "Stepped terrace",
    hint: "Clear left-to-right terrace steps ascending toward the right",
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
