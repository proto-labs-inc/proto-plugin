import { definePreviewStateRegistry } from "proto-plugin";

import type {
  FrontCoverDashboardTab,
  FrontCoverHeroVariant,
  FrontCoverLiveState,
  FrontCoverNavMenu,
  FrontCoverPreviewStateId,
  FrontCoverScrollTarget,
} from "./front-cover-types";

export type { FrontCoverPreviewStateId };

export const DEFAULT_FRONT_COVER_PREVIEW_STATE: FrontCoverPreviewStateId = "hero";

export const DEFAULT_FRONT_COVER_HERO_VARIANT: FrontCoverHeroVariant = "signal-field";

const BASE_LIVE_FIELDS = {
  navMenu: "none",
  dashboardTab: "table-editor",
  scrollTarget: "hero",
  heroVariant: DEFAULT_FRONT_COVER_HERO_VARIANT,
  frameworkId: "nextjs",
} as const satisfies Omit<FrontCoverLiveState, "previewStateId">;

export function createLiveStateForPreview(
  previewStateId: FrontCoverPreviewStateId = DEFAULT_FRONT_COVER_PREVIEW_STATE,
): FrontCoverLiveState {
  switch (previewStateId) {
    case "products":
      return {
        previewStateId,
        ...BASE_LIVE_FIELDS,
        scrollTarget: "products",
      };
    case "dashboard-table-editor":
      return {
        previewStateId,
        ...BASE_LIVE_FIELDS,
        scrollTarget: "dashboard",
        dashboardTab: "table-editor",
      };
    case "dashboard-sql-editor":
      return {
        previewStateId,
        ...BASE_LIVE_FIELDS,
        scrollTarget: "dashboard",
        dashboardTab: "sql-editor",
      };
    case "dashboard-rls":
      return {
        previewStateId,
        ...BASE_LIVE_FIELDS,
        scrollTarget: "dashboard",
        dashboardTab: "rls",
      };
    case "frameworks":
      return {
        previewStateId,
        ...BASE_LIVE_FIELDS,
        scrollTarget: "frameworks",
      };
    case "nav-product":
      return {
        previewStateId,
        ...BASE_LIVE_FIELDS,
        navMenu: "product",
      };
    case "nav-developers":
      return {
        previewStateId,
        ...BASE_LIVE_FIELDS,
        navMenu: "developers",
      };
    case "nav-solutions":
      return {
        previewStateId,
        ...BASE_LIVE_FIELDS,
        navMenu: "solutions",
      };
    case "mobile-menu":
      return {
        previewStateId,
        ...BASE_LIVE_FIELDS,
        navMenu: "mobile",
      };
    case "hero":
    default:
      return {
        previewStateId: "hero",
        ...BASE_LIVE_FIELDS,
      };
  }
}

export function inferPreviewStateId(
  state: Pick<FrontCoverLiveState, "navMenu" | "dashboardTab" | "scrollTarget">,
): FrontCoverPreviewStateId {
  if (state.navMenu === "product") return "nav-product";
  if (state.navMenu === "developers") return "nav-developers";
  if (state.navMenu === "solutions") return "nav-solutions";
  if (state.navMenu === "mobile") return "mobile-menu";
  if (state.scrollTarget === "products") return "products";
  if (state.scrollTarget === "frameworks") return "frameworks";
  if (state.scrollTarget === "dashboard") {
    if (state.dashboardTab === "sql-editor") return "dashboard-sql-editor";
    if (state.dashboardTab === "rls") return "dashboard-rls";
    return "dashboard-table-editor";
  }
  return "hero";
}

export function normalizeFrontCoverLiveState(
  state: Partial<FrontCoverLiveState> &
    Pick<FrontCoverLiveState, "navMenu" | "dashboardTab" | "scrollTarget">,
): FrontCoverLiveState {
  const previewStateId = state.previewStateId ?? inferPreviewStateId(state);
  const defaults = createLiveStateForPreview(previewStateId);

  return {
    ...defaults,
    ...state,
    previewStateId: inferPreviewStateId({ ...defaults, ...state }),
  };
}

export function withInferredPreviewState(
  current: FrontCoverLiveState,
  patch: Partial<FrontCoverLiveState>,
): FrontCoverLiveState {
  const next = { ...current, ...patch };
  return {
    ...next,
    previewStateId: inferPreviewStateId(next),
  };
}

export function liveStateForNavMenu(
  current: FrontCoverLiveState,
  navMenu: FrontCoverNavMenu,
): FrontCoverLiveState {
  return withInferredPreviewState(current, { navMenu });
}

export function liveStateForDashboardTab(
  current: FrontCoverLiveState,
  dashboardTab: FrontCoverDashboardTab,
): FrontCoverLiveState {
  return withInferredPreviewState(current, {
    dashboardTab,
    scrollTarget: "dashboard" satisfies FrontCoverScrollTarget,
    navMenu: "none",
  });
}

export const FRONT_COVER_PREVIEW_STATE_REGISTRY = definePreviewStateRegistry({
  canvasLayout: {
    options: {
      rowGap: 72,
    },
    rows: [
      {
        section: { label: "Homepage" },
        states: ["hero", { id: "products", column: 1 }, { id: "frameworks", column: 2 }],
      },
      {
        section: { label: "Dashboard" },
        states: [
          "dashboard-table-editor",
          { id: "dashboard-sql-editor", column: 1 },
          { id: "dashboard-rls", column: 2 },
        ],
      },
      {
        section: { label: "Navigation" },
        states: [
          "nav-product",
          { id: "nav-developers", column: 1 },
          { id: "nav-solutions", column: 2 },
          { id: "mobile-menu", column: 3 },
        ],
      },
    ],
  },
  states: [
    {
      id: "hero",
      label: "Hero",
      annotation: "Marketing homepage hero with the selected front-cover treatment.",
    },
    {
      id: "products",
      label: "Products",
      annotation: "Product grid: Postgres, Auth, Functions, Storage, Realtime, Vector, Data APIs.",
    },
    {
      id: "frameworks",
      label: "Frameworks",
      annotation: "Framework tabs with a client snippet for the selected SDK.",
    },
    {
      id: "dashboard-table-editor",
      label: "Table Editor",
      annotation: "Dashboard features section on the Table Editor tab.",
    },
    {
      id: "dashboard-sql-editor",
      label: "SQL Editor",
      annotation: "Dashboard features section on the SQL Editor tab.",
    },
    {
      id: "dashboard-rls",
      label: "RLS Policies",
      annotation: "Dashboard features section on the RLS Policies tab.",
    },
    {
      id: "nav-product",
      label: "Product menu",
      annotation: "Primary nav Product dropdown open.",
    },
    {
      id: "nav-developers",
      label: "Developers menu",
      annotation: "Primary nav Developers dropdown open.",
    },
    {
      id: "nav-solutions",
      label: "Solutions menu",
      annotation: "Primary nav Solutions dropdown open.",
    },
    {
      id: "mobile-menu",
      label: "Mobile menu",
      annotation: "Hamburger navigation overlay for narrow viewports.",
    },
  ],
  edges: [
    { from: "hero", to: "products" },
    { from: "products", to: "dashboard-table-editor" },
    { from: "dashboard-table-editor", to: "dashboard-sql-editor" },
    { from: "dashboard-sql-editor", to: "dashboard-rls" },
    { from: "products", to: "frameworks" },
    { from: "hero", to: "nav-product" },
    { from: "nav-product", to: "nav-developers" },
    { from: "nav-developers", to: "nav-solutions" },
    { from: "hero", to: "mobile-menu" },
    { from: "nav-product", to: "hero" },
    { from: "mobile-menu", to: "hero" },
  ],
});

export const FRONT_COVER_PREVIEW_OPTIONS = FRONT_COVER_PREVIEW_STATE_REGISTRY.pickerOptions;
