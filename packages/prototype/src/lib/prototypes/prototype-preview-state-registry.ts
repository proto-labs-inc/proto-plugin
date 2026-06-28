import type { ControlsPanelSelectEntry } from "@prototype/components/platform-ui/controls-panel-select";
import {
  getStateCanvasNodeHeight,
  PROTOTYPE_STATE_CANVAS_PADDING,
  PROTOTYPE_STATE_NODE_ROW_GAP,
  PROTOTYPE_STATE_NODE_WIDTH,
  PROTOTYPE_STATE_SECTION_TO_NODES,
  stateCanvasColumnX,
} from "@prototype/lib/prototypes/prototype-state-canvas-constants";
import type {
  PrototypeStateCanvasEdge,
  PrototypeStateCanvasNode,
  PrototypeStateCanvasSection,
} from "@prototype/lib/prototypes/prototype-state-canvas-types";

export type PrototypePreviewStateVariant = {
  id: string;
  label: string;
  hint?: string;
  /** Planning note for this variant (shown on the state map). */
  annotation?: string;
  /** Maps bullet index to wireframe highlight region keys. */
  highlightRegions?: readonly string[];
};

/** State entry in a preview-state registry — layout is computed from `canvasLayout`. */
export type PrototypePreviewStateDefinition<T extends string = string> = {
  id: T;
  label: string;
  variants?: readonly PrototypePreviewStateVariant[];
  separatorBefore?: boolean;
  /** Planning note — what this screen should do, triggers, open questions. */
  annotation?: string;
  /** Maps bullet index to wireframe highlight region keys. */
  highlightRegions?: readonly string[];
};

/** Resolved state with computed canvas coordinates (output of `definePreviewStateRegistry`). */
export type ResolvedPrototypePreviewStateDefinition<T extends string = string> =
  PrototypePreviewStateDefinition<T> & {
    layout: {
      x: number;
      y: number;
    };
  };

export type PrototypePreviewStateSection = PrototypeStateCanvasSection;

export type PrototypePreviewStateEdge<T extends string = string> = {
  from: T;
  to: T;
  /** Dashed lines for alternate / empty-state branches. */
  dashed?: boolean;
};

/** State id, or `{ id, column }` when a row skips leading columns. */
export type PreviewStateCanvasRowStatePlacement<T extends string = string> =
  | T
  | {
      id: T;
      column: number;
    };

export type PreviewStateCanvasRowPlacement<T extends string = string> = {
  section?: {
    label: string;
    annotation?: string;
  };
  /** First column index when `states` is a list of ids (default `0`). */
  startColumn?: number;
  states: readonly PreviewStateCanvasRowStatePlacement<T>[];
};

/**
 * Grid placement for state map nodes. Layout is computed from `rows`; do not set x/y manually.
 *
 * **Edge routing:** Connectors draw straight or elbow paths between node anchors and do not
 * route around intervening nodes. When two states are linked by an `edges` entry, place them
 * so no other state sits on the path between them — e.g. adjacent columns on the same row, or
 * offset columns so vertical edges do not pass through unrelated cards in the same column.
 */
export type PrototypePreviewStateCanvasLayoutSpec<
  T extends string = string,
> = {
  rows: readonly PreviewStateCanvasRowPlacement<T>[];
  options?: {
    sectionToNodes?: number;
    rowGap?: number;
    canvasPadding?: number;
    bottomPadding?: number;
    sectionLabelOffset?: number;
  };
};

export type PreviewStateCanvasLayout = {
  layouts: Map<string, { x: number; y: number }>;
  sections: PrototypeStateCanvasSection[];
  canvasWidth: number;
  canvasHeight: number;
};

export type PrototypePreviewStateRegistry<
  TPrimary extends string = string,
  TVariant extends string = never,
> = {
  canvasLayout: PrototypePreviewStateCanvasLayoutSpec<TPrimary>;
  states: readonly PrototypePreviewStateDefinition<TPrimary>[];
  edges?: readonly PrototypePreviewStateEdge<TPrimary | TVariant>[];
};

export type DefinedPreviewStateRegistry<
  TPrimary extends string,
  TVariant extends string = never,
> = Omit<PrototypePreviewStateRegistry<TPrimary, TVariant>, "states"> & {
  states: readonly ResolvedPrototypePreviewStateDefinition<TPrimary>[];
  pickerOptions: ControlsPanelSelectEntry<TPrimary>[];
  canvasNodes: PrototypeStateCanvasNode<TPrimary | TVariant>[];
  canvasEdges: PrototypeStateCanvasEdge<TPrimary | TVariant>[];
  canvasSections: PrototypeStateCanvasSection[];
  canvasSize: { width: number; height: number };
  previewStates: Array<{ id: string; label: string }>;
};

export function normalizePreviewStateCanvasRowStates<T extends string>(
  states: readonly PreviewStateCanvasRowStatePlacement<T>[],
  startColumn = 0,
): Array<{ id: T; column: number }> {
  return states.map((entry, index) =>
    typeof entry === "string"
      ? { id: entry, column: startColumn + index }
      : entry,
  );
}

export function getPreviewStateNodeHeight(
  state: Pick<PrototypePreviewStateDefinition, "variants">,
): number {
  return getStateCanvasNodeHeight(state.variants);
}

/** Stack canvas rows using each row's tallest node (including nested states). */
export function buildPreviewStateCanvasLayout<T extends string>(
  rows: readonly PreviewStateCanvasRowPlacement<T>[],
  stateDefinitions: ReadonlyArray<
    Pick<PrototypePreviewStateDefinition<T>, "id" | "variants">
  >,
  options?: PrototypePreviewStateCanvasLayoutSpec<T>["options"],
): PreviewStateCanvasLayout {
  const sectionToNodes =
    options?.sectionToNodes ?? PROTOTYPE_STATE_SECTION_TO_NODES;
  const rowGap = options?.rowGap ?? PROTOTYPE_STATE_NODE_ROW_GAP;
  const canvasPadding = options?.canvasPadding ?? PROTOTYPE_STATE_CANVAS_PADDING;
  const bottomPadding = options?.bottomPadding ?? canvasPadding;
  const sectionLabelOffset = options?.sectionLabelOffset ?? 8;

  const stateById = new Map(
    stateDefinitions.map((state) => [state.id, state]),
  );
  const layouts = new Map<string, { x: number; y: number }>();
  const sections: PrototypeStateCanvasSection[] = [];

  let cursorY = canvasPadding - sectionLabelOffset;
  let maxColumn = 0;
  let maxBottom = 0;

  for (const row of rows) {
    let nodesY = cursorY;
    const rowStates = normalizePreviewStateCanvasRowStates(
      row.states,
      row.startColumn ?? 0,
    );

    if (row.section) {
      sections.push({
        label: row.section.label,
        y: cursorY,
        annotation: row.section.annotation,
      });
      nodesY = cursorY + sectionToNodes;
    }

    let rowMaxHeight = 0;

    for (const placement of rowStates) {
      const state = stateById.get(placement.id);
      if (!state) {
        throw new Error(
          `Preview state canvas layout: unknown state id "${placement.id}".`,
        );
      }

      const height = getPreviewStateNodeHeight(state);
      rowMaxHeight = Math.max(rowMaxHeight, height);
      maxColumn = Math.max(maxColumn, placement.column);
      layouts.set(placement.id, {
        x: stateCanvasColumnX(placement.column),
        y: nodesY,
      });
    }

    const rowBottom = nodesY + rowMaxHeight;
    maxBottom = Math.max(maxBottom, rowBottom);
    cursorY = rowBottom + rowGap;
  }

  return {
    layouts,
    sections,
    canvasWidth:
      stateCanvasColumnX(maxColumn) + PROTOTYPE_STATE_NODE_WIDTH + canvasPadding,
    canvasHeight: maxBottom + bottomPadding,
  };
}

function resolvePreviewStateRegistryLayout<
  TPrimary extends string,
  TVariant extends string = never,
>(
  registry: PrototypePreviewStateRegistry<TPrimary, TVariant>,
): {
  states: ResolvedPrototypePreviewStateDefinition<TPrimary>[];
  sections: PrototypeStateCanvasSection[];
  canvasSize: { width: number; height: number };
} {
  const layout = buildPreviewStateCanvasLayout(
    registry.canvasLayout.rows,
    registry.states,
    registry.canvasLayout.options,
  );

  const placedIds = new Set(layout.layouts.keys());

  for (const state of registry.states) {
    if (!placedIds.has(state.id)) {
      throw new Error(
        `Preview state registry: state "${state.id}" is missing from canvasLayout.`,
      );
    }
  }

  for (const placedId of placedIds) {
    if (!registry.states.some((state) => state.id === placedId)) {
      throw new Error(
        `Preview state registry: canvasLayout references unknown state "${placedId}".`,
      );
    }
  }

  return {
    states: registry.states.map((state) => ({
      ...state,
      layout: layout.layouts.get(state.id)!,
    })),
    sections: layout.sections,
    canvasSize: {
      width: layout.canvasWidth,
      height: layout.canvasHeight,
    },
  };
}

export function definePreviewStateRegistry<
  TPrimary extends string,
  TVariant extends string = never,
>(
  registry: PrototypePreviewStateRegistry<TPrimary, TVariant>,
): DefinedPreviewStateRegistry<TPrimary, TVariant> {
  const resolved = resolvePreviewStateRegistryLayout(registry);

  const pickerOptions = buildPreviewStatePickerOptions(registry);
  const canvasNodes = buildPreviewStateCanvasNodes(resolved.states);
  const canvasEdges = buildPreviewStateCanvasEdges(registry);
  const previewStates = flattenPreviewStateLabels(registry);

  assertPreviewStateRegistryParity(registry, resolved.states, {
    pickerOptions,
    canvasNodes,
  });

  return {
    ...registry,
    states: resolved.states,
    pickerOptions,
    canvasNodes,
    canvasEdges,
    canvasSections: resolved.sections,
    canvasSize: resolved.canvasSize,
    previewStates,
  };
}

export function buildPreviewStatePickerOptions<TPrimary extends string>(
  registry: Pick<PrototypePreviewStateRegistry<TPrimary>, "states">,
): ControlsPanelSelectEntry<TPrimary>[] {
  const options: ControlsPanelSelectEntry<TPrimary>[] = [];

  for (const state of registry.states) {
    if (state.separatorBefore) {
      options.push({ type: "separator" });
    }

    if (state.variants && state.variants.length > 0) {
      options.push({
        type: "submenu",
        value: state.id,
        label: state.label,
        options: state.variants.map((variant) => ({
          value: variant.id,
          label: variant.label,
        })),
      });
      continue;
    }

    options.push({
      value: state.id,
      label: state.label,
    });
  }

  return options;
}

export function buildPreviewStateCanvasNodes<
  TPrimary extends string,
  TVariant extends string = never,
>(
  states: readonly ResolvedPrototypePreviewStateDefinition<TPrimary>[],
): PrototypeStateCanvasNode<TPrimary | TVariant>[] {
  return states.map((state) => ({
    id: state.id,
    label: state.label,
    x: state.layout.x,
    y: state.layout.y,
    annotation: state.annotation,
    highlightRegions: state.highlightRegions,
    callouts: state.variants?.map((variant) => ({
      id: variant.id as TPrimary | TVariant,
      label: variant.label,
      hint: variant.hint,
      annotation: variant.annotation,
      highlightRegions: variant.highlightRegions,
    })),
  }));
}

export function buildPreviewStateCanvasEdges<
  TPrimary extends string,
  TVariant extends string = never,
>(
  registry: Pick<PrototypePreviewStateRegistry<TPrimary, TVariant>, "edges">,
): PrototypeStateCanvasEdge<TPrimary | TVariant>[] {
  return [...(registry.edges ?? [])];
}

export function flattenPreviewStateLabels<TPrimary extends string>(
  registry: Pick<PrototypePreviewStateRegistry<TPrimary>, "states">,
): Array<{ id: string; label: string }> {
  const states: Array<{ id: string; label: string }> = [];

  for (const state of registry.states) {
    states.push({ id: state.id, label: state.label });
    for (const variant of state.variants ?? []) {
      states.push({ id: variant.id, label: variant.label });
    }
  }

  return states;
}

function assertPreviewStateRegistryParity<TPrimary extends string>(
  registry: Pick<PrototypePreviewStateRegistry<TPrimary>, "states">,
  resolvedStates: readonly ResolvedPrototypePreviewStateDefinition<TPrimary>[],
  derived: {
    pickerOptions: ControlsPanelSelectEntry<TPrimary>[];
    canvasNodes: PrototypeStateCanvasNode<TPrimary>[];
  },
): void {
  if (registry.states.length !== derived.canvasNodes.length) {
    throw new Error(
      `Preview state registry mismatch: ${registry.states.length} definitions but ${derived.canvasNodes.length} canvas nodes.`,
    );
  }

  for (let index = 0; index < registry.states.length; index += 1) {
    const state = registry.states[index]!;
    const node = derived.canvasNodes[index]!;
    const resolved = resolvedStates[index]!;

    if (state.id !== node.id) {
      throw new Error(
        `Preview state registry mismatch at index ${index}: definition id "${state.id}" !== canvas node id "${node.id}".`,
      );
    }

    if (state.label !== node.label) {
      throw new Error(
        `Preview state registry mismatch for "${state.id}": picker label "${state.label}" !== canvas label "${node.label}".`,
      );
    }

    if (
      resolved.layout.x !== node.x ||
      resolved.layout.y !== node.y
    ) {
      throw new Error(
        `Preview state registry mismatch for "${state.id}": resolved layout does not match canvas node position.`,
      );
    }

    const variantCount = state.variants?.length ?? 0;
    const calloutCount = node.callouts?.length ?? 0;
    if (variantCount !== calloutCount) {
      throw new Error(
        `Preview state registry mismatch for "${state.id}": ${variantCount} picker variants !== ${calloutCount} canvas callouts.`,
      );
    }

    for (let variantIndex = 0; variantIndex < variantCount; variantIndex += 1) {
      const variant = state.variants![variantIndex]!;
      const callout = node.callouts![variantIndex]!;

      if (variant.id !== callout.id) {
        throw new Error(
          `Preview state registry mismatch for "${state.id}" variant ${variantIndex}: picker id "${variant.id}" !== canvas callout id "${callout.id}".`,
        );
      }

      if (variant.label !== callout.label) {
        throw new Error(
          `Preview state registry mismatch for "${state.id}" variant "${variant.id}": picker label "${variant.label}" !== canvas callout label "${callout.label}".`,
        );
      }
    }
  }

  const pickerStateCount = derived.pickerOptions.filter(
    (entry) => !("type" in entry && entry.type === "separator"),
  ).length;

  if (pickerStateCount !== registry.states.length) {
    throw new Error(
      `Preview state registry mismatch: ${registry.states.length} definitions but ${pickerStateCount} picker entries.`,
    );
  }
}
