export const FRONT_COVER_PREVIEW_STATE_IDS = [
  "hero",
  "products",
  "dashboard-table-editor",
  "dashboard-sql-editor",
  "dashboard-rls",
  "frameworks",
  "nav-product",
  "nav-developers",
  "nav-solutions",
  "mobile-menu",
] as const;

export type FrontCoverPreviewStateId = (typeof FRONT_COVER_PREVIEW_STATE_IDS)[number];

export const FRONT_COVER_NAV_MENUS = [
  "none",
  "product",
  "developers",
  "solutions",
  "mobile",
] as const;

export type FrontCoverNavMenu = (typeof FRONT_COVER_NAV_MENUS)[number];

export const FRONT_COVER_DASHBOARD_TABS = [
  "table-editor",
  "sql-editor",
  "rls",
] as const;

export type FrontCoverDashboardTab = (typeof FRONT_COVER_DASHBOARD_TABS)[number];

export const FRONT_COVER_SCROLL_TARGETS = [
  "hero",
  "products",
  "dashboard",
  "frameworks",
] as const;

export type FrontCoverScrollTarget = (typeof FRONT_COVER_SCROLL_TARGETS)[number];

export const FRONT_COVER_HERO_VARIANTS = [
  "signal-field",
  "orbit-canvas",
  "stack-cutaway",
  "original",
] as const;

export type FrontCoverHeroVariant = (typeof FRONT_COVER_HERO_VARIANTS)[number];

export const FRONT_COVER_FRAMEWORK_IDS = [
  "nextjs",
  "react",
  "flutter",
  "svelte",
  "python",
  "swift",
] as const;

export type FrontCoverFrameworkId = (typeof FRONT_COVER_FRAMEWORK_IDS)[number];

export type FrontCoverLiveState = {
  previewStateId: FrontCoverPreviewStateId;
  navMenu: FrontCoverNavMenu;
  dashboardTab: FrontCoverDashboardTab;
  scrollTarget: FrontCoverScrollTarget;
  heroVariant: FrontCoverHeroVariant;
  frameworkId: FrontCoverFrameworkId;
};
