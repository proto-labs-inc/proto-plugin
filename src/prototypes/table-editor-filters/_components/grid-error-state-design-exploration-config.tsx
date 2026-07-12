"use client";

import {
  buildDesignExplorationRenderers,
  DesignExplorationVariantPreviewShell,
  type DesignExplorationConfig,
  type MobbinReference,
} from "proto-plugin";
import type { ReactNode } from "react";

import {
  DEFAULT_GRID_ERROR_STATE_VARIANT,
  GRID_ERROR_STATE_BASELINE,
  GRID_ERROR_STATE_COPY,
  GRID_ERROR_STATE_VARIANT_OPTIONS,
  GridErrorStateBlock,
  type GridErrorStateVariant,
} from "./grid-error-state-content";

export type { GridErrorStateVariant };
export {
  DEFAULT_GRID_ERROR_STATE_VARIANT,
  GRID_ERROR_STATE_BASELINE,
  GRID_ERROR_STATE_VARIANT_OPTIONS,
};

const MOBBIN_REFERENCES: MobbinReference[] = [
  {
    id: "26ca8fec-8d59-45a9-a8ce-a5d485df172a",
    appName: "Proton",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/26ca8fec-8d59-45a9-a8ce-a5d485df172a.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/26ca8fec-8d59-45a9-a8ce-a5d485df172a",
    relevance:
      "Web checkout error with a clear failure headline and recovery guidance above the form.",
    variantHint: "Illustration card",
  },
  {
    id: "bb28593b-c4d2-4d61-9c1c-fbaca4ecbfd6",
    appName: "Krea AI",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/bb28593b-c4d2-4d61-9c1c-fbaca4ecbfd6.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/bb28593b-c4d2-4d61-9c1c-fbaca4ecbfd6",
    relevance:
      "Inline error toast with a failed-request message and an explicit try-again affordance.",
    variantHint: "Inline admonition",
  },
  {
    id: "7b95b36a-b0c9-455e-a3b5-12dbff804fcb",
    appName: "Mint",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/7b95b36a-b0c9-455e-a3b5-12dbff804fcb.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/7b95b36a-b0c9-455e-a3b5-12dbff804fcb",
    relevance:
      "Illustration-led error with a primary retry button centered in the content area.",
    variantHint: "Illustration card",
  },
  {
    id: "ed597478-86fb-441f-b7c5-ef193455411e",
    appName: "Loom",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/ed597478-86fb-441f-b7c5-ef193455411e.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/ed597478-86fb-441f-b7c5-ef193455411e",
    relevance:
      "Contact support modal with issue description fields — reference for explicit support CTAs.",
    variantHint: "Support primary",
  },
  {
    id: "62735cd6-aa2b-428a-b57e-845f227a00dc",
    appName: "Google Meet",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/62735cd6-aa2b-428a-b57e-845f227a00dc.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/62735cd6-aa2b-428a-b57e-845f227a00dc",
    relevance:
      "Troubleshooting modal with diagnostic context and help feedback — maps to diagnostic panel layouts.",
    variantHint: "Diagnostic panel",
  },
];

const COMPONENT_ID_PREFIX = "grid-error-state-explorer";
const VARIANT_TABS_ID_PREFIX = "grid-error-state-variant-tabs";
const STORAGE_KEY_PREFIX = "table-editor-filters-grid-error-state";

function GridErrorStatePreviewFrame({ variant }: { variant: GridErrorStateVariant }) {
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
          <GridErrorStateBlock
            variant={variant}
            onRefresh={() => undefined}
            onContactSupport={() => undefined}
          />
        </div>
      </div>
    </DesignExplorationVariantPreviewShell>
  );
}

const renderers = buildDesignExplorationRenderers<GridErrorStateVariant>(
  GRID_ERROR_STATE_VARIANT_OPTIONS,
  (variant) => <GridErrorStatePreviewFrame variant={variant} />,
  GRID_ERROR_STATE_BASELINE,
);

export function buildGridErrorStateDesignExplorationConfig(
  variant: GridErrorStateVariant,
  onVariantChange: (next: GridErrorStateVariant) => void,
): DesignExplorationConfig<GridErrorStateVariant> {
  return {
    componentIdPrefix: COMPONENT_ID_PREFIX,
    variantTabsIdPrefix: VARIANT_TABS_ID_PREFIX,
    storageKeyPrefix: STORAGE_KEY_PREFIX,
    variant,
    onVariantChange,
    options: GRID_ERROR_STATE_VARIANT_OPTIONS,
    baseline: GRID_ERROR_STATE_BASELINE,
    defaultVariant: DEFAULT_GRID_ERROR_STATE_VARIANT,
    renderers,
    brief: {
      titleDefault: "Grid error state layout",
      descriptionDefault:
        "Explore what to show when table data fails to load — including retry and contact support options over the grid.",
    },
    context: {
      label: "Copy",
      panelId: "grid-error-state-copy",
      defaultExpanded: true,
      data: GRID_ERROR_STATE_COPY,
      render: (data) => {
        const copy = data as typeof GRID_ERROR_STATE_COPY;
        return (
          <div className="flex flex-col gap-3 text-sm leading-relaxed">
            <p>
              <span className="font-medium text-foreground">Title</span>
              <br />
              <span className="text-muted-foreground">{copy.title}</span>
            </p>
            <p>
              <span className="font-medium text-foreground">Error message</span>
              <br />
              <span className="text-muted-foreground">{copy.errorMessage}</span>
            </p>
            <p>
              <span className="font-medium text-foreground">Instructions</span>
              <br />
              <span className="text-muted-foreground">{copy.instructions}</span>
            </p>
          </div>
        );
      },
    },
    variantsSection: {
      title: "Layout directions",
      description:
        "Switch preview state to Error to compare variants on the live grid. Toolbar, headers, and side panels stay unchanged.",
    },
    mobbin: {
      references: MOBBIN_REFERENCES,
      title: "Mobbin references",
      imagePathForReference: (id) => `/prototypes/mobbin-references/${id}.webp`,
    },
    variantTabAriaLabel: "grid error state layout",
    briefConfigFilePath:
      "src/prototypes/table-editor-filters/_components/grid-error-state-design-exploration-config.tsx",
  };
}

export function renderGridErrorStateVariant(variant: GridErrorStateVariant): ReactNode {
  return renderers[variant]();
}
