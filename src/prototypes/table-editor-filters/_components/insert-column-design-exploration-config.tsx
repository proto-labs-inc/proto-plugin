"use client";

import {
  buildDesignExplorationRenderers,
  DesignExplorationVariantPreviewShell,
  type DesignExplorationConfig,
  type MobbinReference,
} from "proto-plugin";
import type { ReactNode } from "react";

import {
  DEFAULT_INSERT_COLUMN_VARIANT,
  INSERT_COLUMN_BASELINE,
  INSERT_COLUMN_FIELD_GROUPS,
  INSERT_COLUMN_VARIANT_OPTIONS,
  InsertColumnFormContent,
  type InsertColumnVariant,
} from "./insert-column-content";

export type { InsertColumnVariant };
export {
  DEFAULT_INSERT_COLUMN_VARIANT,
  INSERT_COLUMN_BASELINE,
  INSERT_COLUMN_VARIANT_OPTIONS,
};

const MOBBIN_REFERENCES: MobbinReference[] = [
  {
    id: "63e614f2-caef-4165-9c84-901b3f9004da",
    appName: "Retool",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/63e614f2-caef-4165-9c84-901b3f9004da.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/63e614f2-caef-4165-9c84-901b3f9004da",
    relevance:
      "Database table editor with side drawer forms — useful reference for field density in schema panels.",
    variantHint: "Side drawer",
  },
  {
    id: "667186ac-12ed-4f35-b76d-9eb96d08145a",
    appName: "Postman",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/667186ac-12ed-4f35-b76d-9eb96d08145a.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/667186ac-12ed-4f35-b76d-9eb96d08145a",
    relevance:
      "Structured form with grouped sections and progressive disclosure in a side panel.",
    variantHint: "Grouped form",
  },
];

const COMPONENT_ID_PREFIX = "insert-column-explorer";
const VARIANT_TABS_ID_PREFIX = "insert-column-variant-tabs";
const STORAGE_KEY_PREFIX = "table-editor-filters-insert-column";

function InsertColumnPreviewFrame({ variant }: { variant: InsertColumnVariant }) {
  return (
    <DesignExplorationVariantPreviewShell layout="inline">
      <div className="relative mx-auto h-[480px] w-full max-w-[360px] overflow-hidden rounded-lg border border-default bg-dash-sidebar shadow-sm">
        <div className="flex h-11 items-center border-b border-default px-4">
          <p className="truncate text-sm text-foreground">
            Add new column to <code className="text-code-inline text-xs">employees</code>
          </p>
        </div>
        <div className="h-[calc(100%-5.75rem)] overflow-y-auto bg-dash-sidebar">
          <InsertColumnFormContent variant={variant} />
        </div>
        <div className="flex h-[2.75rem] items-center justify-end gap-2 border-t border-default px-3">
          <div className="h-7 w-14 rounded bg-surface-200" />
          <div className="h-7 w-16 rounded bg-brand-400/30" />
        </div>
      </div>
    </DesignExplorationVariantPreviewShell>
  );
}

const renderers = buildDesignExplorationRenderers<InsertColumnVariant>(
  INSERT_COLUMN_VARIANT_OPTIONS,
  (variant) => <InsertColumnPreviewFrame variant={variant} />,
  INSERT_COLUMN_BASELINE,
);

export function buildInsertColumnDesignExplorationConfig(
  variant: InsertColumnVariant,
  onVariantChange: (next: InsertColumnVariant) => void,
): DesignExplorationConfig<InsertColumnVariant> {
  return {
    componentIdPrefix: COMPONENT_ID_PREFIX,
    variantTabsIdPrefix: VARIANT_TABS_ID_PREFIX,
    storageKeyPrefix: STORAGE_KEY_PREFIX,
    variant,
    onVariantChange,
    options: INSERT_COLUMN_VARIANT_OPTIONS,
    baseline: INSERT_COLUMN_BASELINE,
    defaultVariant: DEFAULT_INSERT_COLUMN_VARIANT,
    renderers,
    brief: {
      titleDefault: "Add column panel layout",
      descriptionDefault:
        "Explore how to organize and prioritize name, type, constraints, and advanced schema fields in the insert-column side panel.",
    },
    context: {
      label: "Field groups",
      panelId: "insert-column-field-groups",
      defaultExpanded: true,
      data: INSERT_COLUMN_FIELD_GROUPS,
      render: (data) => {
        const groups = data as typeof INSERT_COLUMN_FIELD_GROUPS;
        return (
          <div className="flex flex-col gap-3 text-sm leading-relaxed">
            {Object.entries(groups).map(([key, fields]) => (
              <p key={key}>
                <span className="font-medium capitalize text-foreground">{key.replace(/_/g, " ")}</span>
                <br />
                <span className="text-muted-foreground">{fields.join(" · ")}</span>
              </p>
            ))}
          </div>
        );
      },
    },
    variantsSection: {
      title: "Layout directions",
      description:
        "Switch preview state to Insert column to compare variants on the live side panel. Each option keeps the same fields — only organization and priority change.",
    },
    mobbin: {
      references: MOBBIN_REFERENCES,
      title: "Mobbin references",
      imagePathForReference: (id) => `/prototypes/mobbin-references/${id}.webp`,
    },
    variantTabAriaLabel: "insert column panel layout",
    briefConfigFilePath:
      "src/prototypes/table-editor-filters/_components/insert-column-design-exploration-config.tsx",
  };
}

export function renderInsertColumnVariant(variant: InsertColumnVariant): ReactNode {
  return renderers[variant]();
}
