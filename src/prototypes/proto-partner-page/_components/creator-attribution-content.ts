/** Mock creator metadata for attribution placement explorations. */
export const PROTOTYPE_CREATOR = {
  name: "Maayan Albert",
  firstName: "Maayan",
  initials: "MA",
  role: "Product design",
} as const;

export type CreatorAttributionVariant =
  | "none"
  | "shape-drag-tooltip"
  | "toolbar-inline"
  | "toolbar-avatar-pill"
  | "floating-above-toolbar"
  | "viewport-corner-badge"
  | "viewport-watermark"
  | "overview-sidebar-header";

export const DEFAULT_CREATOR_ATTRIBUTION_VARIANT: CreatorAttributionVariant =
  "shape-drag-tooltip";
