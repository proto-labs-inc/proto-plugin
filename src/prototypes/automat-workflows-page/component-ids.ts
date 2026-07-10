import { definePrototypeComponentRegistry } from "proto-plugin";

export const AUTOMAT_WORKFLOWS_PAGE_COMPONENT_IDS = [
  "page",
  "scroll-container",
  "automat-workflows-page-preview-state-select",
  "automat-shell-layout",
  "automat-sidebar",
  "automat-header",
  "automat-workflows-dashboard",
  "automat-workflows-overview",
  "automat-analytics-block",
  "automat-analytics-kpi-strip",
  "automat-stats-cards",
  "automat-volume-chart",
  "automat-recent-activity",
  "automat-workflows-table",
  "automat-chat-widget",
  "automat-analytics-variant-toggle",
  "automat-analytics-explorer",
  "automat-analytics-variant-tabs",
  "automat-analytics-mobbin-inspiration-gallery",
  "mobbin-inspiration-gallery",
  "spec-panel-content",
  "pr-split-wireframes.pr-split-wireframe",
] as const;

export const AUTOMAT_WORKFLOWS_PAGE_DYNAMIC_TARGET_PREFIXES = [
  "workflow-row.",
  "activity-item.",
  "chat-thread.",
  "automat-analytics-explorer.",
  "automat-analytics-variant-tabs.",
  "automat-analytics-mobbin-inspiration-gallery.",
  "mobbin-inspiration-gallery.",
] as const;

export const automatWorkflowsPageComponentRegistry = definePrototypeComponentRegistry({
  ids: AUTOMAT_WORKFLOWS_PAGE_COMPONENT_IDS,
  dynamicPrefixes: AUTOMAT_WORKFLOWS_PAGE_DYNAMIC_TARGET_PREFIXES,
});
