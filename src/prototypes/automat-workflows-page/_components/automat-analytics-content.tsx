import type { DesignExplorationRationale } from "proto-plugin";

export type AutomatAnalyticsVariant =
  | "kpi-strip"
  | "unified-panel"
  | "chart-hero"
  | "activity-rail"
  | "split-grid";

export const AUTOMAT_ANALYTICS_VARIANT_OPTIONS: Array<{
  value: AutomatAnalyticsVariant;
  label: string;
  hint?: string;
  rationale?: DesignExplorationRationale;
}> = [
  {
    value: "kpi-strip",
    label: "KPI strip",
    hint: "Inline metric strip above a full-width chart with activity timeline below",
    rationale: {
      good: "Key numbers scan in one horizontal pass before diving into trends and events.",
      bad: "The strip compresses breakdown labels and can feel crowded on narrow viewports.",
    },
  },
  {
    value: "unified-panel",
    label: "Unified panel",
    hint: "Single analytics card with stats, chart, and activity separated by dividers",
    rationale: {
      good: "One bounded surface groups related metrics and reduces visual card noise.",
      bad: "Shared height constraints make the chart and activity list compete for space.",
    },
  },
  {
    value: "chart-hero",
    label: "Chart hero",
    hint: "Volume chart dominates the top row with compact stats in a side column",
    rationale: {
      good: "Trend data gets primary focus while workflow counts stay visible at a glance.",
      bad: "Stats lose the large headline treatment and feel secondary to the chart.",
    },
  },
  {
    value: "activity-rail",
    label: "Activity rail",
    hint: "Stats and chart stacked on the left with a tall activity feed on the right",
    rationale: {
      good: "Recent events stay visible beside the chart without scrolling past metrics.",
      bad: "The rail narrows the chart and hides activity on smaller breakpoints.",
    },
  },
];

export const AUTOMAT_ANALYTICS_BASELINE = {
  value: "split-grid" as const satisfies AutomatAnalyticsVariant,
  label: "Split grid",
  hint: "Two-column stats and chart with full-width activity below — current layout",
  rationale: {
    good: "Balanced cards give each metric block equal weight and familiar dashboard rhythm.",
    bad: "Three separate cards repeat chrome and push activity below the fold.",
  },
};

export const DEFAULT_AUTOMAT_ANALYTICS_VARIANT: AutomatAnalyticsVariant =
  AUTOMAT_ANALYTICS_VARIANT_OPTIONS[0].value;
