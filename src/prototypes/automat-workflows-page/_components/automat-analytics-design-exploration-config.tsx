"use client";

import {
  buildDesignExplorationRenderers,
  type DesignExplorationConfig,
  type MobbinReference,
} from "proto-plugin";
import type { ReactNode } from "react";

import { AutomatAnalyticsBlock } from "./automat-analytics-block";
import {
  AUTOMAT_ANALYTICS_BASELINE,
  AUTOMAT_ANALYTICS_VARIANT_OPTIONS,
  DEFAULT_AUTOMAT_ANALYTICS_VARIANT,
  type AutomatAnalyticsVariant,
} from "./automat-analytics-content";

export type { AutomatAnalyticsVariant };
export {
  AUTOMAT_ANALYTICS_BASELINE,
  AUTOMAT_ANALYTICS_VARIANT_OPTIONS,
  DEFAULT_AUTOMAT_ANALYTICS_VARIANT,
};

const MOBBIN_REFERENCES: MobbinReference[] = [
  {
    id: "b51f93be-351a-4169-9a82-42795c9b7f23",
    appName: "Front",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/0ac5a090-418d-4fdd-bc49-d7d398473ca2.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/b51f93be-351a-4169-9a82-42795c9b7f23",
    relevance:
      "Workload dashboard with KPI metrics, busiest-times chart, and efficiency panels in one overview.",
    variantHint: "KPI strip",
  },
  {
    id: "21116a93-645c-4d13-922e-13f1748b995b",
    appName: "Amplitude",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/7243431d-e441-4b6e-a7ea-46d16078231f.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/21116a93-645c-4d13-922e-13f1748b995b",
    relevance:
      "Analytics dashboard with engagement metrics and multi-chart panels for scanning trends.",
    variantHint: "Chart hero",
  },
  {
    id: "cbc34cb0-7cc0-4a15-9f14-8388d2ea3ce2",
    appName: "Customer.io",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/9c7efb4e-6e91-4766-a201-158798577c84.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/cbc34cb0-7cc0-4a15-9f14-8388d2ea3ce2",
    relevance:
      "Main dashboard with segmented metric cards, performance charts, and delivery stats grouped together.",
    variantHint: "Unified panel",
  },
  {
    id: "d327779b-97f3-4a2a-b0d2-751cbaba7d9d",
    appName: "Vercel",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/1c223da8-d82f-4fe1-b1b7-ed1261606457.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/d327779b-97f3-4a2a-b0d2-751cbaba7d9d",
    relevance:
      "Line chart for visits over time with compact summary stats above the trend visualization.",
    variantHint: "Chart hero",
  },
  {
    id: "f91d5344-61d9-4ed3-80bf-d9ff0dbd1a22",
    appName: "Dovetail",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/6f697f60-5bb9-44fb-b636-ec52641737b6.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/f91d5344-61d9-4ed3-80bf-d9ff0dbd1a22",
    relevance:
      "Bar graph with category breakdowns beside summary statistics — reference for rail-style splits.",
    variantHint: "Activity rail",
  },
];

const COMPONENT_ID_PREFIX = "automat-analytics-explorer";
const VARIANT_TABS_ID_PREFIX = "automat-analytics-variant-tabs";
const STORAGE_KEY_PREFIX = "automat-workflows-page-analytics";

function renderAnalyticsPreview(variant: AutomatAnalyticsVariant) {
  return (
    <div className="overflow-hidden rounded-md border bg-background">
      <div className="border-b px-4 py-3">
        <p className="text-sm font-semibold">Workflows</p>
        <p className="text-xs text-muted-foreground">Analytics preview</p>
      </div>
      <div className="max-h-[360px] overflow-y-auto p-3">
        <AutomatAnalyticsBlock
          variant={variant}
          projectId="finance-automation"
          embedded
        />
      </div>
    </div>
  );
}

const renderers = buildDesignExplorationRenderers<AutomatAnalyticsVariant>(
  AUTOMAT_ANALYTICS_VARIANT_OPTIONS,
  (variant) => renderAnalyticsPreview(variant),
  AUTOMAT_ANALYTICS_BASELINE,
);

export function buildAutomatAnalyticsDesignExplorationConfig(
  variant: AutomatAnalyticsVariant,
  onVariantChange: (next: AutomatAnalyticsVariant) => void,
): DesignExplorationConfig<AutomatAnalyticsVariant> {
  return {
    componentIdPrefix: COMPONENT_ID_PREFIX,
    variantTabsIdPrefix: VARIANT_TABS_ID_PREFIX,
    storageKeyPrefix: STORAGE_KEY_PREFIX,
    variant,
    onVariantChange,
    options: AUTOMAT_ANALYTICS_VARIANT_OPTIONS,
    baseline: AUTOMAT_ANALYTICS_BASELINE,
    defaultVariant: DEFAULT_AUTOMAT_ANALYTICS_VARIANT,
    renderers,
    brief: {
      titleDefault: "Analytics layout",
      descriptionDefault:
        "Explore new ways to display active workflows, volume over time, and recent activity on the workflows dashboard.",
    },
    variantsSection: {
      title: "Layout directions",
    },
    mobbin: {
      references: MOBBIN_REFERENCES,
      title: "Mobbin references",
      imagePathForReference: (id) => `/prototypes/mobbin-references/${id}.webp`,
    },
    variantTabAriaLabel: "analytics layout",
    briefConfigFilePath:
      "src/prototypes/automat-workflows-page/_components/automat-analytics-design-exploration-config.tsx",
  };
}

export function renderAutomatAnalyticsVariant(variant: AutomatAnalyticsVariant): ReactNode {
  return renderers[variant]();
}
