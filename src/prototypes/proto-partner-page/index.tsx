"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { cn } from "@prototype/lib/utils";
import { usePrototypeComments } from "@prototype/lib/prototypes/use-prototype-comments";
import { useCallback, useState } from "react";

import {
  DEFAULT_INVITE_COPY_VARIANT,
  type InviteCopyVariant,
} from "./_components/invite-copy-design-exploration-config";
import { isInviteCopyOverlayVariant } from "./_components/invite-copy-content";
import { InviteCopyBlock } from "./_components/invite-copy-block";
import { InviteCopyVariantToggle } from "./_components/invite-copy-variant-toggle";
import type { ProtoShapeSelection } from "./_components/proto-shape-customizer-block";
import {
  getProtoShapeCustomizerCanvasInset,
  isOverlayProtoShapeCustomizerVariant,
} from "./_components/proto-shape-content";
import {
  DEFAULT_PROTO_SHAPES_VARIANT,
  defaultProtoShapeSelection,
  type ProtoShapeCustomizerVariant,
} from "./_components/proto-shapes-design-exploration-config";
import { ProtoShapeCustomizerBlock } from "./_components/proto-shape-customizer-block";
import { ProtoShapesVariantToggle } from "./_components/proto-shapes-variant-toggle";
import { useRegisterPartnerVariantSets } from "./_components/partner-variant-sets";
import { PartnerShapeCanvas } from "./partner-shape-canvas";

type LiveState = Record<string, never>;

export default function ProtoPartnerPage() {
  const liveState: LiveState = {};
  const [inviteCopyVariant, setInviteCopyVariant] = useState<InviteCopyVariant>(
    DEFAULT_INVITE_COPY_VARIANT,
  );
  const [protoShapesVariant, setProtoShapesVariant] =
    useState<ProtoShapeCustomizerVariant>(DEFAULT_PROTO_SHAPES_VARIANT);
  const [shapeSelection, setShapeSelection] = useState<ProtoShapeSelection>(
    defaultProtoShapeSelection(),
  );

  const overlayLayout = isInviteCopyOverlayVariant(inviteCopyVariant);
  const overlayCustomizer =
    isOverlayProtoShapeCustomizerVariant(protoShapesVariant);
  const canvasBottomInset = getProtoShapeCustomizerCanvasInset(
    protoShapesVariant,
    overlayLayout ? "absolute" : "padding",
  );

  const onRestore = useCallback((_restored: LiveState) => {}, []);

  usePrototypeComments(liveState, onRestore);
  useRegisterPartnerVariantSets();

  return (
    <PrototypeComponent
      id="scroll-container"
      className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white"
    >
      <PrototypeComponent
        id="page"
        className={
          overlayLayout
            ? "relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white"
            : "relative flex min-h-0 flex-1 flex-col bg-white"
        }
      >
        {overlayLayout ? (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 z-0">
              <InviteCopyBlock variant={inviteCopyVariant} />
            </div>
            <PartnerShapeCanvas
              key={overlayCustomizer ? "overlay" : "stack"}
              className={cn(
                "absolute inset-x-0 top-0 z-10 min-h-0",
                canvasBottomInset,
              )}
              shapeId={shapeSelection.shapeId}
              colorId={shapeSelection.colorId}
              transparentBackground
            />
            {overlayCustomizer ? (
              <ProtoShapeCustomizerBlock
                variant={protoShapesVariant}
                selection={shapeSelection}
                onSelectionChange={setShapeSelection}
              />
            ) : null}
            <div className="relative z-30 mt-auto flex shrink-0 flex-col gap-2">
              <ProtoShapesVariantToggle
                variant={protoShapesVariant}
                onVariantChange={setProtoShapesVariant}
                selection={shapeSelection}
                onSelectionChange={setShapeSelection}
              />
              <InviteCopyVariantToggle
                variant={inviteCopyVariant}
                onVariantChange={setInviteCopyVariant}
                overlayLayout
                registerOnly
              />
            </div>
          </>
        ) : (
          <>
            <PartnerShapeCanvas
              shapeId={shapeSelection.shapeId}
              colorId={shapeSelection.colorId}
              className={cn(
                overlayCustomizer ? "min-h-0 flex-1" : undefined,
                canvasBottomInset,
              )}
            />
            {overlayCustomizer ? (
              <ProtoShapeCustomizerBlock
                variant={protoShapesVariant}
                selection={shapeSelection}
                onSelectionChange={setShapeSelection}
              />
            ) : null}
            <div className="relative z-20 flex shrink-0 flex-col gap-2">
              <ProtoShapesVariantToggle
                variant={protoShapesVariant}
                onVariantChange={setProtoShapesVariant}
                selection={shapeSelection}
                onSelectionChange={setShapeSelection}
              />
              <InviteCopyVariantToggle
                variant={inviteCopyVariant}
                onVariantChange={setInviteCopyVariant}
              />
            </div>
          </>
        )}
      </PrototypeComponent>
    </PrototypeComponent>
  );
}
