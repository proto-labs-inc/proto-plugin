"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { cn } from "@prototype/lib/utils";
import { usePrototypeComments } from "@prototype/lib/prototypes/use-prototype-comments";
import { useCallback, useState } from "react";

import {
  DEFAULT_INVITE_ANIMATIONS_VARIANT,
  type InviteAnimationsVariant,
} from "./_components/invite-animations-design-exploration-config";
import { InviteAnimationsBlock } from "./_components/invite-animations-block";
import { InviteAnimationsVariantToggle } from "./_components/invite-animations-variant-toggle";
import {
  DEFAULT_INVITE_COPY_VARIANT,
  type InviteCopyVariant,
} from "./_components/invite-copy-design-exploration-config";
import { isInviteCopyOverlayVariant } from "./_components/invite-copy-content";
import { InviteCopyBlock } from "./_components/invite-copy-block";
import { InviteCopyVariantToggle } from "./_components/invite-copy-variant-toggle";
import {
  DEFAULT_MOBILE_PANEL_MOTION_VARIANT,
  type MobilePanelMotionVariant,
} from "./_components/mobile-panel-motion-design-exploration-config";
import { MobilePanelMotionVariantToggle } from "./_components/mobile-panel-motion-variant-toggle";
import {
  DEFAULT_MOBILE_PICKER_LAYOUT_VARIANT,
  type MobilePickerLayoutVariant,
} from "./_components/mobile-picker-layout-design-exploration-config";
import { MobilePickerLayoutVariantToggle } from "./_components/mobile-picker-layout-variant-toggle";
import {
  PartnerPageFlowBlock,
  type PartnerPageId,
} from "./_components/partner-page-flow-block";
import { useCustomizeShapeEntranceReady } from "./_components/partner-page-motion";
import type { ProtoShapeSelection } from "./_components/proto-shape-customizer-block";
import { getProtoShapeCustomizerCanvasInset } from "./_components/proto-shape-content";
import {
  DEFAULT_PROTO_SHAPES_VARIANT,
  defaultProtoShapeSelection,
  type ProtoShapeCustomizerVariant,
} from "./_components/proto-shapes-design-exploration-config";
import { ProtoShapeCustomizerBlock } from "./_components/proto-shape-customizer-block";
import { ProtoShapesVariantToggle } from "./_components/proto-shapes-variant-toggle";
import {
  DEFAULT_SHAPE_COLOR_PICKER_VARIANT,
  type ShapeColorPickerVariant,
} from "./_components/shape-color-picker-content";
import { ShapeColorPickerVariantToggle } from "./_components/shape-color-picker-variant-toggle";
import {
  DEFAULT_SUBMIT_MODAL_VARIANT,
  type SubmitModalVariant,
} from "./_components/submit-modal-design-exploration-config";
import { SubmitModalVariantToggle } from "./_components/submit-modal-variant-toggle";
import { useRegisterPartnerVariantSets } from "./_components/partner-variant-sets";
import { PartnerShapeCanvas } from "./partner-shape-canvas";

type LiveState = Record<string, never>;

export default function ProtoPartnerPage() {
  const liveState: LiveState = {};
  const [activePage, setActivePage] = useState<PartnerPageId>("invite");
  const [inviteCopyVariant, setInviteCopyVariant] = useState<InviteCopyVariant>(
    DEFAULT_INVITE_COPY_VARIANT,
  );
  const [inviteAnimationsVariant, setInviteAnimationsVariant] =
    useState<InviteAnimationsVariant>(DEFAULT_INVITE_ANIMATIONS_VARIANT);
  const [protoShapesVariant, setProtoShapesVariant] =
    useState<ProtoShapeCustomizerVariant>(DEFAULT_PROTO_SHAPES_VARIANT);
  const [shapeColorPickerVariant, setShapeColorPickerVariant] =
    useState<ShapeColorPickerVariant>(DEFAULT_SHAPE_COLOR_PICKER_VARIANT);
  const [mobilePickerLayoutVariant, setMobilePickerLayoutVariant] =
    useState<MobilePickerLayoutVariant>(DEFAULT_MOBILE_PICKER_LAYOUT_VARIANT);
  const [mobilePanelMotionVariant, setMobilePanelMotionVariant] =
    useState<MobilePanelMotionVariant>(DEFAULT_MOBILE_PANEL_MOTION_VARIANT);
  const [submitModalVariant, setSubmitModalVariant] =
    useState<SubmitModalVariant>(DEFAULT_SUBMIT_MODAL_VARIANT);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [shapeSelection, setShapeSelection] = useState<ProtoShapeSelection>(
    defaultProtoShapeSelection(),
  );
  const [customizeMotionEpoch, setCustomizeMotionEpoch] = useState(0);

  const onInvitePage = activePage === "invite";
  const overlayLayout =
    onInvitePage && isInviteCopyOverlayVariant(inviteCopyVariant);
  const animatedInviteLayout =
    onInvitePage && inviteCopyVariant === "open-card";
  const customizeEntranceMotion =
    inviteCopyVariant === "open-card" && inviteAnimationsVariant !== "none";
  const customizeEntranceKey = customizeMotionEpoch;
  const panelMotionReplayKey = `${customizeEntranceKey}-${mobilePanelMotionVariant}`;
  const shapeRenderReady = useCustomizeShapeEntranceReady(
    customizeEntranceMotion,
    customizeEntranceKey,
    mobilePanelMotionVariant,
  );

  const handlePageChange = useCallback((page: PartnerPageId) => {
    if (page === "customize") {
      setCustomizeMotionEpoch((epoch) => epoch + 1);
    }
    setActivePage(page);
  }, []);

  const dockInFlowLayout =
    !onInvitePage && protoShapesVariant === "compact-minimal-dock";

  const canvasBottomInset = onInvitePage
    ? undefined
    : dockInFlowLayout
      ? undefined
      : getProtoShapeCustomizerCanvasInset(protoShapesVariant);

  const onRestore = useCallback((_restored: LiveState) => {}, []);

  usePrototypeComments(liveState, onRestore);
  useRegisterPartnerVariantSets();

  const inviteSection = animatedInviteLayout ? (
    <InviteAnimationsBlock
      variant={inviteAnimationsVariant}
      onContinue={() => handlePageChange("customize")}
      onHome={() => handlePageChange("invite")}
    />
  ) : (
    <>
      <InviteCopyBlock
        variant={inviteCopyVariant}
        onHome={() => handlePageChange("invite")}
      />
      <PartnerPageFlowBlock
        activePage={activePage}
        onPageChange={handlePageChange}
      />
    </>
  );

  const variantSidebarRegistration = (
    <div className="sr-only" aria-hidden>
      <SubmitModalVariantToggle
        variant={submitModalVariant}
        onVariantChange={setSubmitModalVariant}
        selection={shapeSelection}
        registerOnly
      />
      <MobilePanelMotionVariantToggle
        variant={mobilePanelMotionVariant}
        onVariantChange={setMobilePanelMotionVariant}
        selection={shapeSelection}
        onSelectionChange={setShapeSelection}
        registerOnly
      />
      <MobilePickerLayoutVariantToggle
        variant={mobilePickerLayoutVariant}
        onVariantChange={setMobilePickerLayoutVariant}
        selection={shapeSelection}
        onSelectionChange={setShapeSelection}
        registerOnly
      />
      <ShapeColorPickerVariantToggle
        variant={shapeColorPickerVariant}
        onVariantChange={setShapeColorPickerVariant}
        selection={shapeSelection}
        onSelectionChange={setShapeSelection}
        registerOnly
      />
      <ProtoShapesVariantToggle
        variant={protoShapesVariant}
        onVariantChange={setProtoShapesVariant}
        selection={shapeSelection}
        onSelectionChange={setShapeSelection}
        registerOnly
      />
      <InviteCopyVariantToggle
        variant={inviteCopyVariant}
        onVariantChange={setInviteCopyVariant}
        registerOnly
      />
      <InviteAnimationsVariantToggle
        variant={inviteAnimationsVariant}
        onVariantChange={setInviteAnimationsVariant}
        registerOnly
      />
    </div>
  );

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
        {onInvitePage ? (
          overlayLayout ? (
            <>
              <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-center">
                {inviteSection}
              </div>
            </>
          ) : (
            <>
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                <div className="my-auto w-full">{inviteSection}</div>
              </div>
              <div className="relative z-20 flex shrink-0 flex-col gap-2">
                <InviteAnimationsVariantToggle
                  variant={inviteAnimationsVariant}
                  onVariantChange={setInviteAnimationsVariant}
                />
                <InviteCopyVariantToggle
                  variant={inviteCopyVariant}
                  onVariantChange={setInviteCopyVariant}
                />
              </div>
            </>
          )
        ) : (
          <>
            <PartnerPageFlowBlock
              activePage={activePage}
              onPageChange={handlePageChange}
              animateEntrance={customizeEntranceMotion}
              entranceKey={customizeEntranceKey}
              panelMotionVariant={mobilePanelMotionVariant}
              shapeSelection={shapeSelection}
              submitModalVariant={submitModalVariant}
              onSubmitModalOpenChange={setSubmitModalOpen}
            />
            {dockInFlowLayout ? (
              <div className="relative z-10 min-h-0 flex-1">
                {shapeRenderReady && !submitModalOpen ? (
                  <PartnerShapeCanvas
                    shapeId={shapeSelection.shapeId}
                    colorId={shapeSelection.colorId}
                    textureId={shapeSelection.textureId}
                    className="absolute inset-0 min-h-0"
                  />
                ) : (
                  <div
                    className="absolute inset-0 min-h-0 bg-white"
                    aria-hidden
                  />
                )}
              </div>
            ) : shapeRenderReady && !submitModalOpen ? (
              <PartnerShapeCanvas
                shapeId={shapeSelection.shapeId}
                colorId={shapeSelection.colorId}
                textureId={shapeSelection.textureId}
                className={cn(
                  "absolute inset-x-0 top-0 z-10 min-h-0",
                  canvasBottomInset ?? "bottom-0",
                )}
              />
            ) : (
              <div
                className={cn(
                  "absolute inset-x-0 top-0 z-10 min-h-0 bg-white",
                  canvasBottomInset ?? "bottom-0",
                )}
                aria-hidden
              />
            )}
            <ProtoShapeCustomizerBlock
              variant={protoShapesVariant}
              selection={shapeSelection}
              onSelectionChange={setShapeSelection}
              pickerVariant={shapeColorPickerVariant}
              mobileLayoutVariant={mobilePickerLayoutVariant}
              panelMotionVariant={mobilePanelMotionVariant}
              panelMotionReplayKey={panelMotionReplayKey}
              animateEntrance={customizeEntranceMotion}
              entranceKey={customizeEntranceKey}
            />
          </>
        )}
        {variantSidebarRegistration}
      </PrototypeComponent>
    </PrototypeComponent>
  );
}
