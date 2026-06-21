"use client";

import { usePrototypeReviewOptional } from "@prototype/lib/prototypes/prototype-review-context";
import { useEffect } from "react";

export function PrototypeStateCanvasRegistrar({
  pagePath,
}: {
  pagePath: string;
}) {
  const review = usePrototypeReviewOptional();

  useEffect(() => {
    review?.setStateCanvasPagePath(pagePath);
    return () => review?.setStateCanvasPagePath(null);
  }, [pagePath, review]);

  return null;
}

export { PrototypeStateCanvasView } from "@prototype/components/prototypes/prototype-state-canvas-overlay";

export type { PrototypeStateCanvasConfig } from "@prototype/lib/prototypes/prototype-state-canvas-types";
export {
  buildStateMapHref,
  buildStateMapAnnotationEntries,
  getDefaultPrototypeStateMapPath,
  parseStateMapReturnTo,
  PROTOTYPE_STATE_MAP_RETURN_TO_PARAM,
  stateMapHasAnnotations,
} from "@prototype/lib/prototypes/prototype-state-canvas-types";
export type {
  PrototypeStateCanvasEdge,
  PrototypeStateCanvasNode,
  PrototypeStateCanvasNodeCallout,
  PrototypeStateCanvasSection,
  PrototypeStateMapAnnotationEntry,
} from "@prototype/lib/prototypes/prototype-state-canvas-types";
