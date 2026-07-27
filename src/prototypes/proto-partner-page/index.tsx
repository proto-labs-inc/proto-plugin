"use client";

import {
  PREVIEW_STATE_PARAM,
  PrototypeComponent,
  usePrototypeComments,
  usePrototypeReviewOptional,
  useSyncPrototypePreviewStateToUrl,
} from "proto-plugin";
import { cn } from "@/lib/cn";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

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
import { InviteFollowUpShapeExamples } from "./_components/invite-follow-up-shape-examples";
import {
  DEFAULT_INVITE_FOLLOW_UP_SHAPE_LAYOUT_VARIANT,
  type InviteFollowUpShapeLayoutVariant,
} from "./_components/invite-follow-up-shape-layout-content";
import { InviteFollowUpShapeLayoutVariantToggle } from "./_components/invite-follow-up-shape-layout-variant-toggle";
import { InviteCopyVariantToggle } from "./_components/invite-copy-variant-toggle";
import { DEFAULT_MOBILE_PANEL_MOTION_VARIANT } from "./_components/mobile-panel-motion-content";
import { DEFAULT_MOBILE_PICKER_LAYOUT_VARIANT } from "./_components/mobile-picker-layout-content";
import {
  PartnerPageFlowBlock,
  type PartnerPageId,
} from "./_components/partner-page-flow-block";
import { PartnerPageBackButton } from "./_components/partner-page-nav-button";
import {
  useCustomizeShapeEntranceReady,
  useInviteFollowUpShapeEntranceReady,
} from "./_components/partner-page-motion";
import type { ProtoShapeSelection } from "./_components/proto-shape-customizer-block";
import {
  DEFAULT_PROTO_SHAPES_VARIANT,
  defaultProtoShapeSelection,
  getProtoShapeCustomizerCanvasInset,
} from "./_components/proto-shape-content";
import { ProtoShapeCustomizerBlock } from "./_components/proto-shape-customizer-block";
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
import {
  PARTNER_VARIANT_SET_PREVIEW_STATE,
  useRegisterPartnerVariantSets,
  type PartnerPageVariantSetId,
} from "./_components/partner-variant-sets";
import {
  createLiveStateForPreview,
  DEFAULT_PROTO_PARTNER_PAGE_PREVIEW_STATE,
  normalizeProtoPartnerPageLiveState,
  PROTO_PARTNER_PAGE_PREVIEW_STATE_IDS,
  withInferredPreviewState,
  type ProtoPartnerPageLiveState,
  type ProtoPartnerPagePreviewStateId,
} from "./_components/proto-partner-page-preview-states";
import { ProtoPartnerPagePreviewStateSelect } from "./_components/proto-partner-page-preview-state-select";
import { buildProtoPartnerPageStateCanvasConfig } from "./_components/proto-partner-page-state-canvas-config";
import { PartnerShapeCanvas } from "./partner-shape-canvas";
import {
  getPartnerPageFromPathname,
  getPartnerPagePath,
} from "./partner-page-routes";

function createDefaultLiveState(
  pageId: PartnerPageId,
): ProtoPartnerPageLiveState {
  const previewStateId: ProtoPartnerPagePreviewStateId =
    pageId === "invite-follow-up"
      ? "invite-follow-up"
      : pageId === "customize"
        ? "customize"
        : DEFAULT_PROTO_PARTNER_PAGE_PREVIEW_STATE;
  return createLiveStateForPreview(previewStateId);
}

export default function ProtoPartnerPage() {
  const pathname = usePathname();
  const router = useRouter();
  const pathPage = getPartnerPageFromPathname(pathname);
  const pendingPageIdRef = useRef<PartnerPageId | null>(null);
  const [liveState, setLiveState] = useState<ProtoPartnerPageLiveState>(() =>
    createDefaultLiveState(pathPage),
  );
  // Prefer liveState so state-map / States menu clicks update UI immediately
  // while the Next route catches up. Pathname still drives shareable URLs.
  const activePage = liveState.pageId;
  const [inviteCopyVariant, setInviteCopyVariant] = useState<InviteCopyVariant>(
    DEFAULT_INVITE_COPY_VARIANT,
  );
  const [inviteAnimationsVariant, setInviteAnimationsVariant] =
    useState<InviteAnimationsVariant>(DEFAULT_INVITE_ANIMATIONS_VARIANT);
  const [
    inviteFollowUpShapeLayoutVariant,
    setInviteFollowUpShapeLayoutVariant,
  ] = useState<InviteFollowUpShapeLayoutVariant>(
    DEFAULT_INVITE_FOLLOW_UP_SHAPE_LAYOUT_VARIANT,
  );
  const protoShapesVariant = DEFAULT_PROTO_SHAPES_VARIANT;
  const mobilePickerLayoutVariant = DEFAULT_MOBILE_PICKER_LAYOUT_VARIANT;
  const mobilePanelMotionVariant = DEFAULT_MOBILE_PANEL_MOTION_VARIANT;
  const [shapeColorPickerVariant, setShapeColorPickerVariant] =
    useState<ShapeColorPickerVariant>(DEFAULT_SHAPE_COLOR_PICKER_VARIANT);
  const [submitModalVariant, setSubmitModalVariant] =
    useState<SubmitModalVariant>(DEFAULT_SUBMIT_MODAL_VARIANT);
  const [shapeSelection, setShapeSelection] = useState<ProtoShapeSelection>(
    defaultProtoShapeSelection(),
  );
  const [customizeMotionEpoch, setCustomizeMotionEpoch] = useState(0);
  const [inviteFollowUpMotionEpoch, setInviteFollowUpMotionEpoch] = useState(0);

  const review = usePrototypeReviewOptional();
  const setStateCanvasConfig = review?.setStateCanvasConfig;

  const onInvitePage =
    activePage === "invite" || activePage === "invite-follow-up";
  const inviteStep = activePage === "invite-follow-up" ? "follow-up" : "intro";
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
  const inviteFollowUpShapeRenderReady = useInviteFollowUpShapeEntranceReady(
    activePage === "invite-follow-up" &&
      animatedInviteLayout &&
      inviteAnimationsVariant !== "none",
    `${inviteFollowUpMotionEpoch}-${inviteAnimationsVariant}`,
  );

  const bumpMotionForPage = useCallback((page: PartnerPageId) => {
    if (page === "customize") {
      setCustomizeMotionEpoch((epoch) => epoch + 1);
    }
    if (page === "invite-follow-up") {
      setInviteFollowUpMotionEpoch((epoch) => epoch + 1);
    }
  }, []);

  const navigateToPage = useCallback(
    (page: PartnerPageId, previewStateId: ProtoPartnerPagePreviewStateId) => {
      pendingPageIdRef.current = page;
      const path = getPartnerPagePath(page);
      const url = new URL(path, window.location.origin);
      url.searchParams.set(PREVIEW_STATE_PARAM, previewStateId);
      router.push(`${url.pathname}${url.search}`);
    },
    [router],
  );

  const handlePageChange = useCallback(
    (page: PartnerPageId) => {
      bumpMotionForPage(page);
      const next = createLiveStateForPreview(
        page === "invite-follow-up"
          ? "invite-follow-up"
          : page === "customize"
            ? "customize"
            : "invite",
      );
      setLiveState(next);
      navigateToPage(page, next.previewStateId);
    },
    [bumpMotionForPage, navigateToPage],
  );

  const setPreviewState = useCallback(
    (previewStateId: ProtoPartnerPagePreviewStateId) => {
      const next = createLiveStateForPreview(previewStateId);
      bumpMotionForPage(next.pageId);
      setLiveState(next);

      const currentStateParam =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get(PREVIEW_STATE_PARAM)
          : null;
      // Always push when path or ?state= is wrong so map clicks land on the
      // matching partner route (not only rewrite search on the current page).
      if (pathPage !== next.pageId || currentStateParam !== previewStateId) {
        navigateToPage(next.pageId, previewStateId);
      }
    },
    [bumpMotionForPage, navigateToPage, pathPage],
  );

  const exploringSubmitModal = review?.activeVariantSetId === "submit-modal";
  const exploringSubmitModalRef = useRef(exploringSubmitModal);
  exploringSubmitModalRef.current = exploringSubmitModal;

  const handleSubmitModalOpenChange = useCallback((open: boolean) => {
    // Keep the live modal up while flipping submit-modal design options.
    if (!open && exploringSubmitModalRef.current) return;
    setLiveState((current) =>
      withInferredPreviewState(current, {
        pageId: "customize",
        submitModalOpen: open,
      }),
    );
  }, []);

  const onRestore = useCallback(
    (restored: ProtoPartnerPageLiveState) => {
      const next = normalizeProtoPartnerPageLiveState(restored);
      bumpMotionForPage(next.pageId);
      setLiveState(next);
      if (pathPage !== next.pageId) {
        navigateToPage(next.pageId, next.previewStateId);
      }
    },
    [bumpMotionForPage, navigateToPage, pathPage],
  );

  usePrototypeComments(liveState, onRestore);
  useSyncPrototypePreviewStateToUrl(
    liveState.previewStateId,
    setPreviewState,
    { validStateIds: PROTO_PARTNER_PAGE_PREVIEW_STATE_IDS },
  );

  const handleVariantSetActivate = useCallback(
    (setId: PartnerPageVariantSetId) => {
      setPreviewState(PARTNER_VARIANT_SET_PREVIEW_STATE[setId]);
    },
    [setPreviewState],
  );
  useRegisterPartnerVariantSets({ onActivate: handleVariantSetActivate });

  // While the submit-modal exploration is open, pin the live preview to the
  // open modal on customize — including when the URL still points at an
  // invite-* route (common when opening the exploration from follow-up).
  useEffect(() => {
    if (!exploringSubmitModal) return;

    setLiveState((current) => {
      if (
        current.pageId === "customize" &&
        current.submitModalOpen &&
        current.previewStateId === "submit-modal"
      ) {
        return current;
      }
      return createLiveStateForPreview("submit-modal");
    });

    if (pathPage !== "customize") {
      navigateToPage("customize", "submit-modal");
    }
  }, [exploringSubmitModal, navigateToPage, pathPage]);

  // Sync browser back/forward into liveState. Skip while a programmatic
  // navigation is in flight so we don't clobber the selected preview state.
  useEffect(() => {
    if (pendingPageIdRef.current != null) {
      if (pathPage === pendingPageIdRef.current) {
        pendingPageIdRef.current = null;
      }
      return;
    }

    // Don't let a stale invite-* path clobber submit-modal while that
    // exploration is open (path can lag behind liveState during navigation).
    if (exploringSubmitModalRef.current && pathPage !== "customize") {
      return;
    }

    setLiveState((current) => {
      if (current.pageId === pathPage) return current;
      return withInferredPreviewState(current, {
        pageId: pathPage,
        submitModalOpen:
          pathPage === "customize" ? current.submitModalOpen : false,
      });
    });
  }, [pathPage]);

  useEffect(() => {
    if (!setStateCanvasConfig) return;
    setStateCanvasConfig(
      buildProtoPartnerPageStateCanvasConfig(setPreviewState),
    );
    return () => setStateCanvasConfig(null);
  }, [setPreviewState, setStateCanvasConfig]);

  const dockInFlowLayout =
    !onInvitePage && protoShapesVariant === "compact-minimal-dock";

  const canvasBottomInset = onInvitePage
    ? undefined
    : dockInFlowLayout
      ? undefined
      : getProtoShapeCustomizerCanvasInset(protoShapesVariant);

  const submitModalOpen =
    (liveState.submitModalOpen || exploringSubmitModal) &&
    activePage === "customize";

  const inviteFollowUpNav =
    activePage === "invite-follow-up" ? (
      <PrototypeComponent
        id="invite-follow-up-nav"
        className="pointer-events-none absolute inset-x-0 top-0 z-30 px-4 pt-3 pb-1 font-[family-name:var(--font-dm-sans)]! sm:px-5"
      >
        <div className="mx-auto flex w-full max-w-md items-center md:max-w-none">
          <PartnerPageBackButton onClick={() => handlePageChange("invite")} />
        </div>
      </PrototypeComponent>
    ) : null;

  const inviteSection = animatedInviteLayout ? (
    <InviteAnimationsBlock
      variant={inviteAnimationsVariant}
      step={inviteStep}
      onContinue={() =>
        handlePageChange(
          inviteStep === "intro" ? "invite-follow-up" : "customize",
        )
      }
    />
  ) : (
    <>
      <InviteCopyBlock variant={inviteCopyVariant} step={inviteStep} />
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
      <ShapeColorPickerVariantToggle
        variant={shapeColorPickerVariant}
        onVariantChange={setShapeColorPickerVariant}
        selection={shapeSelection}
        onSelectionChange={setShapeSelection}
        registerOnly
      />
      <InviteFollowUpShapeLayoutVariantToggle
        variant={inviteFollowUpShapeLayoutVariant}
        onVariantChange={setInviteFollowUpShapeLayoutVariant}
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
        className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white"
      >
        <ProtoPartnerPagePreviewStateSelect
          previewStateId={liveState.previewStateId}
          onPreviewStateChange={setPreviewState}
        />
        {onInvitePage ? (
          overlayLayout ? (
            <>
              {activePage === "invite-follow-up" &&
              inviteFollowUpShapeRenderReady ? (
                <InviteFollowUpShapeExamples
                  layoutVariant={inviteFollowUpShapeLayoutVariant}
                  previewKey={`${inviteFollowUpMotionEpoch}-${inviteFollowUpShapeLayoutVariant}`}
                />
              ) : null}
              {inviteFollowUpNav}
              <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-center">
                {inviteSection}
              </div>
            </>
          ) : (
            <>
              {activePage === "invite-follow-up" &&
              inviteFollowUpShapeRenderReady ? (
                <InviteFollowUpShapeExamples
                  layoutVariant={inviteFollowUpShapeLayoutVariant}
                  previewKey={`${inviteFollowUpMotionEpoch}-${inviteFollowUpShapeLayoutVariant}`}
                />
              ) : null}
              {inviteFollowUpNav}
              <div className="pointer-events-none flex min-h-0 flex-1 flex-col overflow-y-auto">
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
              submitModalOpen={submitModalOpen}
              onSubmitModalOpenChange={handleSubmitModalOpenChange}
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
