import {
  decodeShareState,
  encodeShareState,
  SHARE_STATE_PARAM,
  type PrSplitConfig,
  type PrSplitEntry as PrSplitEntryBase,
} from "proto-plugin";

import {
  DEFAULT_AUTOMAT_ANALYTICS_VARIANT,
  type AutomatAnalyticsVariant,
} from "./automat-analytics-content";
import {
  createLiveStateForPreview,
  DEFAULT_AUTOMAT_WORKFLOWS_PAGE_PREVIEW_STATE,
} from "./automat-workflows-page-preview-states";
import type { AutomatLiveState } from "./automat-workflows-page-types";

export type AutomatPrSplitWireframeId =
  | "project-scoped-table"
  | "project-switcher"
  | "analytics-kpi-strip"
  | "table-filters"
  | "empty-search"
  | "responsive-shell";

export type AutomatPrSplitEntry = PrSplitEntryBase<
  AutomatPrSplitWireframeId,
  AutomatLiveState
> & {
  analyticsVariant: AutomatAnalyticsVariant;
};

export const PR_ANALYTICS_PARAM = "prAnalytics";

export const PR_SPLIT_CONFIG: PrSplitConfig<AutomatLiveState> = {
  slug: "automat-workflows-page",
  seriesLabel: "Automat workflows page FE",
  sourceRepo: "calcom/cal.diy",
  sourceWorkPath: "apps/web",
  configFilePath: "src/prototypes/automat-workflows-page/_components/pr-split-config.ts",
  branchName: (entry) => {
    const slug = entry.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return `feat/automat-workflows-fe-${entry.order}-${slug}`;
  },
  writeEntryToSearchParams: (searchParams, entry) => {
    const extended = entry as AutomatPrSplitEntry;
    searchParams.set(SHARE_STATE_PARAM, encodeShareState(entry.liveState));
    searchParams.set(PR_ANALYTICS_PARAM, extended.analyticsVariant);
  },
  defaultPreviewPath: "/workflows",
  vercelProjectName: "cal",
  scopeNote:
    "Ship kpi-strip analytics only. Do not merge split-grid, unified-panel, chart-hero, or activity-rail — those stay in the prototype design brief only.",
};

export const PR_SPLIT_ENTRIES: AutomatPrSplitEntry[] = [
  {
    order: 1,
    title: "Project-scoped workflows data model",
    description:
      "Introduce organization projects in the data layer. Scope workflow list queries and dashboard aggregates (active, agentic, IDP counts) by projectId. Seed Finance Automation and HR Digital Transformation fixtures.",
    size: "Medium",
    targetId: "automat-workflows-table",
    wireframeId: "project-scoped-table",
    analyticsVariant: DEFAULT_AUTOMAT_ANALYTICS_VARIANT,
    liveState: createLiveStateForPreview("hr-project"),
    previewPath: "/workflows",
  },
  {
    order: 2,
    title: "Header project switcher",
    description:
      "Replace the static breadcrumb project label with a dropdown listing projects in the org, descriptions, and a Current badge. Switching projects resets search and status filters and reloads scoped dashboard data.",
    size: "Small",
    targetId: "automat-header",
    wireframeId: "project-switcher",
    analyticsVariant: DEFAULT_AUTOMAT_ANALYTICS_VARIANT,
    liveState: createLiveStateForPreview("hr-project"),
    previewPath: "/workflows",
  },
  {
    order: 3,
    title: "KPI strip analytics layout",
    description:
      "Replace the split-grid dashboard (separate stats, chart, and activity cards) with the KPI strip layout — horizontal active/agentic/IDP metrics, full-width volume chart, and timeline-style recent activity. Stats read from project-scoped aggregates.",
    size: "Large",
    targetId: "automat-analytics-block",
    wireframeId: "analytics-kpi-strip",
    analyticsVariant: DEFAULT_AUTOMAT_ANALYTICS_VARIANT,
    liveState: createLiveStateForPreview(DEFAULT_AUTOMAT_WORKFLOWS_PAGE_PREVIEW_STATE),
    previewPath: "/workflows",
  },
  {
    order: 4,
    title: "Workflow search and status filters",
    description:
      "Wire the workflows table search input and status select to filter the active project's workflow list client-side by name, description, and status. Preserve existing filter UI affordances.",
    size: "Medium",
    targetId: "automat-workflows-table",
    wireframeId: "table-filters",
    analyticsVariant: DEFAULT_AUTOMAT_ANALYTICS_VARIANT,
    liveState: createLiveStateForPreview("valid-text-filter"),
    previewPath: "/workflows",
  },
  {
    order: 5,
    title: "Empty search results state",
    description:
      "When search and status filters yield zero rows, render an empty table body with a dashed-border empty state and query-aware copy matching the prototype empty-search preview states.",
    size: "Small",
    targetId: "automat-workflows-table",
    wireframeId: "empty-search",
    analyticsVariant: DEFAULT_AUTOMAT_ANALYTICS_VARIANT,
    liveState: createLiveStateForPreview("empty-search"),
    previewPath: "/workflows",
  },
  {
    order: 6,
    title: "Responsive sidebar shell",
    description:
      "Remove the fixed demo launcher footer. Add viewport-width-driven sidebar behavior: icon-collapsible above 1024px and offcanvas drawer below. Keep the support chat widget as a page-level overlay.",
    size: "Small",
    targetId: "automat-shell-layout",
    wireframeId: "responsive-shell",
    analyticsVariant: DEFAULT_AUTOMAT_ANALYTICS_VARIANT,
    liveState: createLiveStateForPreview(DEFAULT_AUTOMAT_WORKFLOWS_PAGE_PREVIEW_STATE),
    previewPath: "/workflows",
  },
];

export function findPrSplitEntry(order: number): AutomatPrSplitEntry | undefined {
  return PR_SPLIT_ENTRIES.find((entry) => entry.order === order);
}

export function readLiveStateFromSearchParams(
  searchParams: URLSearchParams,
): AutomatLiveState | null {
  const encoded = searchParams.get(SHARE_STATE_PARAM);
  if (!encoded) return null;

  try {
    return decodeShareState<AutomatLiveState>(encoded);
  } catch {
    return null;
  }
}

export function readAnalyticsVariantFromSearchParams(
  searchParams: URLSearchParams,
): AutomatAnalyticsVariant | null {
  const value = searchParams.get(PR_ANALYTICS_PARAM);
  if (!value) return null;
  return value as AutomatAnalyticsVariant;
}
