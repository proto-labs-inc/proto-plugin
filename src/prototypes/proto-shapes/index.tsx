"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { usePrototypeComments } from "@prototype/lib/prototypes/use-prototype-comments";
import { useCallback } from "react";

import { SpringsShapesCanvas } from "./springs-shapes-canvas";

type LiveState = Record<string, never>;

export default function ProtoShapesPage() {
  const liveState: LiveState = {};

  const onRestore = useCallback((_restored: LiveState) => {}, []);

  usePrototypeComments(liveState, onRestore);

  return (
    <PrototypeComponent
      id="scroll-container"
      className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white"
    >
      <PrototypeComponent
        id="page"
        className="flex min-h-0 flex-1 flex-col bg-white"
      >
        <SpringsShapesCanvas />
      </PrototypeComponent>
    </PrototypeComponent>
  );
}
