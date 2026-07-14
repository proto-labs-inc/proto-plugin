export type PrototypeReviewSidebarPanel =
  | "comments"
  | "variants"
  | "change-log"
  | "spec";

export type PrototypeReviewTab = "tweaks" | "comments";

export const REVIEW_PANEL_PARAM = "reviewPanel";
export const REVIEW_VARIANT_SET_PARAM = "variantSet";
export const REVIEW_TAB_PARAM = "reviewTab";
export const REVIEW_TWEAKS_PARAM = "tweaks";
export const REVIEW_SETTINGS_PARAM = "settings";
export const REVIEW_PROD_REFERENCE_PARAM = "prodReference";

export const REVIEW_URL_PARAM_KEYS = [
  REVIEW_PANEL_PARAM,
  REVIEW_VARIANT_SET_PARAM,
  REVIEW_TAB_PARAM,
  REVIEW_TWEAKS_PARAM,
  REVIEW_SETTINGS_PARAM,
  REVIEW_PROD_REFERENCE_PARAM,
] as const;

const VALID_REVIEW_PANELS = new Set<PrototypeReviewSidebarPanel>([
  "comments",
  "variants",
  "change-log",
  "spec",
]);

const VALID_REVIEW_TABS = new Set<PrototypeReviewTab>(["tweaks", "comments"]);

export type PrototypeReviewUrlState = {
  panel: PrototypeReviewSidebarPanel | null;
  variantSetId: string | null;
  activeTab: PrototypeReviewTab;
  tweaksOpen: boolean;
  settingsOpen: boolean;
  prodReference: boolean;
};

export function hasReviewUrlParams(searchParams: URLSearchParams): boolean {
  return REVIEW_URL_PARAM_KEYS.some((key) => searchParams.has(key));
}

export function parseReviewStateFromSearchParams(
  searchParams: URLSearchParams,
): PrototypeReviewUrlState {
  const panelRaw = searchParams.get(REVIEW_PANEL_PARAM);
  const panel =
    panelRaw && VALID_REVIEW_PANELS.has(panelRaw as PrototypeReviewSidebarPanel)
      ? (panelRaw as PrototypeReviewSidebarPanel)
      : null;

  const variantSetRaw = searchParams.get(REVIEW_VARIANT_SET_PARAM)?.trim();
  const variantSetId = variantSetRaw ? variantSetRaw : null;

  const tabRaw = searchParams.get(REVIEW_TAB_PARAM);
  const activeTab =
    tabRaw && VALID_REVIEW_TABS.has(tabRaw as PrototypeReviewTab)
      ? (tabRaw as PrototypeReviewTab)
      : "tweaks";

  return {
    panel,
    variantSetId,
    activeTab,
    tweaksOpen: searchParams.get(REVIEW_TWEAKS_PARAM) === "1",
    settingsOpen: searchParams.get(REVIEW_SETTINGS_PARAM) === "1",
    prodReference: searchParams.get(REVIEW_PROD_REFERENCE_PARAM) === "1",
  };
}

export function writeReviewStateToSearchParams(
  searchParams: URLSearchParams,
  state: {
    open: boolean;
    sidebarPanel: PrototypeReviewSidebarPanel | null;
    activeVariantSetId: string | null;
    activeTab: PrototypeReviewTab;
    tweaksOpen: boolean;
    settingsOpen: boolean;
    prodReferenceAvailable: boolean;
    showProdReference: boolean;
  },
): void {
  for (const key of REVIEW_URL_PARAM_KEYS) {
    searchParams.delete(key);
  }

  if (state.tweaksOpen) {
    searchParams.set(REVIEW_TWEAKS_PARAM, "1");
  }

  if (state.settingsOpen) {
    searchParams.set(REVIEW_SETTINGS_PARAM, "1");
  }

  if (state.prodReferenceAvailable && state.showProdReference) {
    searchParams.set(REVIEW_PROD_REFERENCE_PARAM, "1");
  }

  if (!state.open || !state.sidebarPanel) {
    return;
  }

  searchParams.set(REVIEW_PANEL_PARAM, state.sidebarPanel);

  if (state.sidebarPanel === "variants" && state.activeVariantSetId) {
    searchParams.set(REVIEW_VARIANT_SET_PARAM, state.activeVariantSetId);
  }

  if (state.sidebarPanel === "comments" && state.activeTab === "comments") {
    searchParams.set(REVIEW_TAB_PARAM, "comments");
  }
}

export function syncReviewStateToUrl(state: {
  open: boolean;
  sidebarPanel: PrototypeReviewSidebarPanel | null;
  activeVariantSetId: string | null;
  activeTab: PrototypeReviewTab;
  tweaksOpen: boolean;
  settingsOpen: boolean;
  prodReferenceAvailable: boolean;
  showProdReference: boolean;
}): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  writeReviewStateToSearchParams(url.searchParams, state);
  window.history.replaceState(null, "", url);
}
