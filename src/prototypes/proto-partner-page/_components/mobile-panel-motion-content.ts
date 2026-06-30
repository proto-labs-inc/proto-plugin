export type MobilePanelMotionVariant =
  | "none"
  | "spring-sheet-whole-panel"
  | "slide-up"
  | "spring-sheet"
  | "stagger-inside"
  | "blur-fade"
  | "scale-reveal"
  | "curtain-expand";

export function isUnifiedPanelMotionVariant(
  variant: MobilePanelMotionVariant,
): boolean {
  return variant === "spring-sheet-whole-panel" || variant === "slide-up";
}

export const DEFAULT_MOBILE_PANEL_MOTION_VARIANT: MobilePanelMotionVariant =
  "slide-up";

export const MOBILE_PANEL_MOTION_CONTEXT = {
  trigger: "Entering the customize page on a mobile viewport",
  panel: "Bottom dock with shape, color, and texture pickers",
  note: "Panel motion is independent of per-tile entrance stagger on the invite → customize flow.",
} as const;
