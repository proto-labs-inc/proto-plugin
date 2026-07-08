import { definePrototypeComponentRegistry } from "proto-plugin";

export const PROTO_SHAPES_COMPONENT_IDS = [
  "page",
  "scroll-container",
  "drag-attribution-tooltip-layer",
  "springs-shapes-canvas",
] as const;

export const DYNAMIC_TARGET_PREFIXES = [] as const;

export const protoShapesComponentRegistry = definePrototypeComponentRegistry({
  ids: PROTO_SHAPES_COMPONENT_IDS,
  dynamicPrefixes: DYNAMIC_TARGET_PREFIXES,
});
