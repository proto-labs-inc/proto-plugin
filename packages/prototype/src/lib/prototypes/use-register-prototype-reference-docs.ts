"use client";

import type { PrototypeReferenceDoc } from "@prototype/lib/prototypes/reference-docs";
import { usePrototypeReviewOptional } from "@prototype/lib/prototypes/prototype-review-context";
import { useLayoutEffect } from "react";

export function useRegisterPrototypeReferenceDocs(
  docs: PrototypeReferenceDoc[],
  configFilePath?: string,
) {
  const review = usePrototypeReviewOptional();

  useLayoutEffect(() => {
    review?.registerReferenceDocs(docs, configFilePath);
  }, [review, docs, configFilePath]);
}
