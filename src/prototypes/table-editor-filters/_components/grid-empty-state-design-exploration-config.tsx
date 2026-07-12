"use client";

import {
  buildDesignExplorationRenderers,
  DesignExplorationVariantPreviewShell,
  type DesignExplorationConfig,
  type MobbinReference,
} from "proto-plugin";
import type { ReactNode } from "react";

import { GridEmptyStateBlock } from "./grid-empty-state-content";
import {
  DEFAULT_GRID_EMPTY_STATE_VARIANT,
  GRID_EMPTY_STATE_BASELINE,
  GRID_EMPTY_STATE_COPY,
  GRID_EMPTY_STATE_VARIANT_OPTIONS,
  type GridEmptyStateVariant,
} from "./grid-empty-state-content";

export type { GridEmptyStateVariant };
export {
  DEFAULT_GRID_EMPTY_STATE_VARIANT,
  GRID_EMPTY_STATE_BASELINE,
  GRID_EMPTY_STATE_VARIANT_OPTIONS,
};

const MOBBIN_REFERENCES: MobbinReference[] = [
  {
    id: "667186ac-12ed-4f35-b76d-9eb96d08145a",
    appName: "Postman",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/667186ac-12ed-4f35-b76d-9eb96d08145a.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/667186ac-12ed-4f35-b76d-9eb96d08145a",
    relevance:
      "Illustration-led empty state with headline, body copy, and a primary create action in a card.",
    variantHint: "Illustration card",
  },
  {
    id: "63e614f2-caef-4165-9c84-901b3f9004da",
    appName: "Retool",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/63e614f2-caef-4165-9c84-901b3f9004da.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/63e614f2-caef-4165-9c84-901b3f9004da",
    relevance:
      "Empty table component with instructional copy inside the grid body — maps to upload-first layouts.",
    variantHint: "Drop zone",
  },
  {
    id: "764b3128-3a79-43ca-8815-9a9024832473",
    appName: "Midday",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/764b3128-3a79-43ca-8815-9a9024832473.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/764b3128-3a79-43ca-8815-9a9024832473",
    relevance:
      "No-results screen after search with query context and neutral messaging above the empty list.",
    variantHint: "Filter context",
  },
  {
    id: "c3bfbac6-7570-4596-a7d5-5f69abc6969e",
    appName: "Okta",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/c3bfbac6-7570-4596-a7d5-5f69abc6969e.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/c3bfbac6-7570-4596-a7d5-5f69abc6969e",
    relevance:
      "Dashboard empty state with a create button and instructional copy for first-time setup.",
    variantHint: "Step guide",
  },
  {
    id: "57b2d87b-34ad-4bc7-8b91-36b58f210ffe",
    appName: "Patreon",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/57b2d87b-34ad-4bc7-8b91-36b58f210ffe.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/57b2d87b-34ad-4bc7-8b91-36b58f210ffe",
    relevance:
      "Empty patrons table with persistent headers, filters, and action affordances beside the message.",
    variantHint: "Split actions",
  },
];

const COMPONENT_ID_PREFIX = "grid-empty-state-explorer";
const VARIANT_TABS_ID_PREFIX = "grid-empty-state-variant-tabs";
const STORAGE_KEY_PREFIX = "table-editor-filters-grid-empty-state";

function GridEmptyStatePreviewFrame({
  variant,
  dataMode,
}: {
  variant: GridEmptyStateVariant;
  dataMode: "empty-table" | "filtered-empty";
}) {
  return (
    <DesignExplorationVariantPreviewShell layout="overlay">
      <div className="relative h-[420px] w-full overflow-hidden rounded-lg border border-default bg-dash-sidebar">
        <div className="flex h-10 items-center border-b border-default bg-surface-200 px-3">
          <div className="h-3 w-24 rounded bg-surface-300" />
        </div>
        <div className="grid grid-cols-4 border-b border-default bg-dash-canvas">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-9 border-r border-default px-2 py-2 last:border-r-0"
            >
              <div className="h-2.5 w-3/4 rounded bg-surface-300" />
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 top-[4.5rem] flex items-center justify-center p-4">
          <GridEmptyStateBlock
            variant={variant}
            dataMode={dataMode}
            onRemoveFilters={() => undefined}
            onImportData={() => undefined}
          />
        </div>
      </div>
    </DesignExplorationVariantPreviewShell>
  );
}

const renderers = buildDesignExplorationRenderers<GridEmptyStateVariant>(
  GRID_EMPTY_STATE_VARIANT_OPTIONS,
  (variant) => (
    <GridEmptyStatePreviewFrame variant={variant} dataMode="empty-table" />
  ),
  GRID_EMPTY_STATE_BASELINE,
);

export function buildGridEmptyStateDesignExplorationConfig(
  variant: GridEmptyStateVariant,
  onVariantChange: (next: GridEmptyStateVariant) => void,
): DesignExplorationConfig<GridEmptyStateVariant> {
  return {
    componentIdPrefix: COMPONENT_ID_PREFIX,
    variantTabsIdPrefix: VARIANT_TABS_ID_PREFIX,
    storageKeyPrefix: STORAGE_KEY_PREFIX,
    variant,
    onVariantChange,
    options: GRID_EMPTY_STATE_VARIANT_OPTIONS,
    baseline: GRID_EMPTY_STATE_BASELINE,
    defaultVariant: DEFAULT_GRID_EMPTY_STATE_VARIANT,
    renderers,
    brief: {
      titleDefault: "Grid empty state layout",
      descriptionDefault:
        "Explore alternate content and layouts for the table editor empty overlay — both empty tables and zero filter results.",
    },
    context: {
      label: "Copy",
      panelId: "grid-empty-state-copy",
      defaultExpanded: true,
      data: GRID_EMPTY_STATE_COPY,
      render: (data) => {
        const copy = data as typeof GRID_EMPTY_STATE_COPY;
        return (
          <div className="flex flex-col gap-3 text-sm leading-relaxed">
            <p>
              <span className="font-medium text-foreground">Empty table title</span>
              <br />
              <span className="text-muted-foreground">{copy.empty.title}</span>
            </p>
            <p>
              <span className="font-medium text-foreground">Empty table body</span>
              <br />
              <span className="text-muted-foreground">{copy.empty.body}</span>
            </p>
            <p>
              <span className="font-medium text-foreground">Filtered empty body</span>
              <br />
              <span className="text-muted-foreground">{copy.filtered.body}</span>
            </p>
          </div>
        );
      },
    },
    variantsSection: {
      title: "Layout directions",
      description:
        "Switch preview state to Empty table or Filtered empty to compare variants on the live grid. Each option keeps toolbar, headers, and side panels unchanged.",
    },
    mobbin: {
      references: MOBBIN_REFERENCES,
      title: "Mobbin references",
      imagePathForReference: (id) => `/prototypes/mobbin-references/${id}.webp`,
    },
    variantTabAriaLabel: "grid empty state layout",
    briefConfigFilePath:
      "src/prototypes/table-editor-filters/_components/grid-empty-state-design-exploration-config.tsx",
  };
}

export function renderGridEmptyStateVariant(variant: GridEmptyStateVariant): ReactNode {
  return renderers[variant]();
}
