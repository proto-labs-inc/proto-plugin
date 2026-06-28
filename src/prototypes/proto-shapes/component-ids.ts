import { definePrototypeComponentRegistry } from "@prototype/lib/prototypes/prototype-component-registry";

export const PROTO_SHAPES_COMPONENT_IDS = [
  "page",
  "scroll-container",
  "springs-shapes-canvas",
] as const;

export const DYNAMIC_TARGET_PREFIXES = [] as const;

export const protoShapesComponentRegistry = definePrototypeComponentRegistry({
  ids: PROTO_SHAPES_COMPONENT_IDS,
  dynamicPrefixes: DYNAMIC_TARGET_PREFIXES,
});
