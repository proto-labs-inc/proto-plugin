import {
  DEFAULT_PROTO_COLOR_ID,
  DEFAULT_PROTO_SHAPE_ID,
  DEFAULT_PROTO_TEXTURE_ID,
  PROTO_COLORS,
  PROTO_SHAPES,
} from "./proto-shape-content";

export type SubmitModalVariant =
  | "square-cap"
  | "square-cap-full-bleed"
  | "grey-title-top"
  | "poster-scrim"
  | "split-pane"
  | "orbit-halo"
  | "ticket-notch"
  | "glass-mesh"
  | "wireframe-grid"
  | "block-texture"
  | "fluid-waves"
  | "mosaic-pixels"
  | "vertical-ridges"
  | "proto-tint"
  | "plain-header";

export const SUBMIT_MODAL_TITLE = "Amelie's Proto Shape";
export const SUBMIT_MODAL_TITLE_BOLD_PREFIX = "Amelie's";
export const SUBMIT_MODAL_TITLE_SECOND_LINE = "Proto Shape";

export const SUBMIT_MODAL_CONTEXT = {
  title: SUBMIT_MODAL_TITLE,
  shapes: PROTO_SHAPES.map(({ id, label }) => ({ id, label })),
  colors: PROTO_COLORS.map(({ id, label }) => ({ id, label })),
  defaultShape: DEFAULT_PROTO_SHAPE_ID,
  defaultColor: DEFAULT_PROTO_COLOR_ID,
  defaultTexture: DEFAULT_PROTO_TEXTURE_ID,
} as const;

export const DEFAULT_SUBMIT_MODAL_VARIANT: SubmitModalVariant =
  "square-cap-full-bleed";

export type SubmitModalCardTheme = {
  background: string;
  patternForeground: string;
  titleClass: string;
};

/**
 * Variants rendered as a themed pattern card. The remaining variants are either
 * bespoke layouts (see `SubmitModalLayoutVariant`) or handled ad hoc
 * (`plain-header`, `proto-tint`), so they are intentionally excluded here.
 */
export type SubmitModalCardThemeVariant =
  | "wireframe-grid"
  | "block-texture"
  | "fluid-waves"
  | "mosaic-pixels"
  | "vertical-ridges";

export const SUBMIT_MODAL_CARD_THEMES: Record<
  SubmitModalCardThemeVariant,
  SubmitModalCardTheme
> = {
  "vertical-ridges": {
    background: "#f26522",
    patternForeground: "rgba(255,255,255,0.92)",
    titleClass: "text-white",
  },
  "mosaic-pixels": {
    background: "#f3ede3",
    patternForeground: "rgba(120,100,80,0.55)",
    titleClass: "text-[#3d3830]",
  },
  "fluid-waves": {
    background: "#4ec5f5",
    patternForeground: "rgba(255,255,255,0.88)",
    titleClass: "text-white",
  },
  "block-texture": {
    background: "#5dd9a8",
    patternForeground: "rgba(20,90,60,0.55)",
    titleClass: "text-[#0f4d32]",
  },
  "wireframe-grid": {
    background: "#0a0a0a",
    patternForeground: "rgba(255,255,255,0.22)",
    titleClass: "text-white",
  },
};
