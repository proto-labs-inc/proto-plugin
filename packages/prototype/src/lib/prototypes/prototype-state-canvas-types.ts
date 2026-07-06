import type { ReactNode } from "react";

export type PrototypeStateCanvasNodeCallout<T extends string = string> = {
  id: T;
  label: string;
  hint?: string;
  /** Planning note — what this variant should do or communicate. */
  annotation?: string;
  /** Maps bullet index (or @suffix id) to wireframe highlight region keys. */
  highlightRegions?: readonly string[];
};

export type PrototypeStateCanvasNode<T extends string = string> = {
  id: T;
  label: string;
  /** Canvas coordinates in px from the flowchart origin. */
  x: number;
  y: number;
  /** Nested options rendered below the node — not separate canvas nodes. */
  callouts?: PrototypeStateCanvasNodeCallout<T>[];
  /** Planning note — what this screen should do, triggers, open questions. */
  annotation?: string;
  /** Maps bullet index (or @suffix id) to wireframe highlight region keys. */
  highlightRegions?: readonly string[];
};

export type PrototypeStateCanvasEdge<T extends string = string> = {
  from: T;
  to: T;
  /** Dashed lines for alternate / empty-state branches. */
  dashed?: boolean;
};

export type PrototypeStateCanvasSection = {
  label: string;
  /** Top offset of the section label in canvas px. */
  y: number;
  /** Group-level planning note for this region of the map. */
  annotation?: string;
};

export const PROTOTYPE_STATE_MAP_RETURN_TO_PARAM = "returnTo";

export function getDefaultPrototypeStateMapPath(slug: string): string {
  return `/prototypes/${slug}/states`;
}

/** Relative path (including query) to restore when leaving the map without picking a state. */
export function parseStateMapReturnTo(
  searchParams: URLSearchParams,
): string | null {
  const returnTo = searchParams.get(PROTOTYPE_STATE_MAP_RETURN_TO_PARAM);
  if (!returnTo?.startsWith("/") || returnTo.startsWith("//")) {
    return null;
  }
  return returnTo;
}

export function buildStateMapHref(
  pagePath: string,
  returnTo: string,
  searchParams?: URLSearchParams,
): string {
  const params = new URLSearchParams(searchParams?.toString() ?? "");
  params.set(PROTOTYPE_STATE_MAP_RETURN_TO_PARAM, returnTo);
  const query = params.toString();
  return query ? `${pagePath}?${query}` : pagePath;
}

export type StateMapHighlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type PrototypeStateCanvasConfig<T extends string = string> = {
  onStateSelect: (id: T) => void;
  nodes: PrototypeStateCanvasNode<T>[];
  edges: PrototypeStateCanvasEdge<T>[];
  sections?: PrototypeStateCanvasSection[];
  renderWireframe: (nodeId: T) => ReactNode;
  /** Percent-based overlay regions for screenshot previews (0–100). */
  getHighlightRegions?: (
    nodeId: T,
  ) => Partial<Record<string, StateMapHighlightRect>> | undefined;
  /** Route for the full-page state map (toolbar link target). */
  pagePath?: string;
  /** Total scrollable canvas size. Defaults derived from node bounds. */
  canvasWidth?: number;
  canvasHeight?: number;
};

export type PrototypeStateMapAnnotationEntry = {
  id: string;
  label: string;
  annotation: string;
  kind: "section" | "state" | "variant";
  parentLabel?: string;
};

export function stateMapHasAnnotations<T extends string>(
  config: Pick<PrototypeStateCanvasConfig<T>, "nodes" | "sections">,
): boolean {
  if (config.sections?.some((section) => section.annotation?.trim())) {
    return true;
  }

  return config.nodes.some((node) => {
    if (node.annotation?.trim()) return true;
    return node.callouts?.some((callout) => callout.annotation?.trim()) ?? false;
  });
}

export function buildStateMapAnnotationEntries<T extends string>(
  nodes: readonly PrototypeStateCanvasNode<T>[],
  sections?: readonly PrototypeStateCanvasSection[],
): PrototypeStateMapAnnotationEntry[] {
  const entries: PrototypeStateMapAnnotationEntry[] = [];

  for (const section of sections ?? []) {
    const annotation = section.annotation?.trim();
    if (!annotation) continue;
    entries.push({
      id: `section:${section.label}`,
      label: section.label,
      annotation,
      kind: "section",
    });
  }

  for (const node of nodes) {
    const nodeAnnotation = node.annotation?.trim();
    if (nodeAnnotation) {
      entries.push({
        id: node.id,
        label: node.label,
        annotation: nodeAnnotation,
        kind: "state",
      });
    }

    for (const callout of node.callouts ?? []) {
      const calloutAnnotation = callout.annotation?.trim();
      if (!calloutAnnotation) continue;
      entries.push({
        id: callout.id,
        label: callout.label,
        annotation: calloutAnnotation,
        kind: "variant",
        parentLabel: node.label,
      });
    }
  }

  return entries;
}
