"use client";

import {
  PROTOTYPE_PAGE_CLASS,
  PROTOTYPE_SCROLL_CONTAINER_CLASS,
  PrototypeComponent,
  usePrototypeComments,
  usePrototypeReviewOptional,
  useSyncPrototypePreviewStateToUrl,
} from "proto-plugin";
import { cn } from "ui";
import { useCallback, useEffect, useState } from "react";

import { FrontCoverPreviewStateSelect } from "./_components/front-cover-preview-state-select";
import {
  createLiveStateForPreview,
  DEFAULT_FRONT_COVER_PREVIEW_STATE,
  normalizeFrontCoverLiveState,
  withInferredPreviewState,
} from "./_components/front-cover-preview-states";
import { buildFrontCoverStateCanvasConfig } from "./_components/front-cover-state-canvas-config";
import type {
  FrontCoverDashboardTab,
  FrontCoverFrameworkId,
  FrontCoverHeroVariant,
  FrontCoverLiveState,
  FrontCoverNavMenu,
  FrontCoverPreviewStateId,
} from "./_components/front-cover-types";
import { FRONT_COVER_PREVIEW_STATE_IDS } from "./_components/front-cover-types";
import { HomePage } from "./_components/home-page";

const THEME_CLASS = "front-cover-theme";

function createDefaultLiveState(): FrontCoverLiveState {
  return createLiveStateForPreview(DEFAULT_FRONT_COVER_PREVIEW_STATE);
}

export default function FrontCover() {
  const [liveState, setLiveState] = useState<FrontCoverLiveState>(createDefaultLiveState);
  const review = usePrototypeReviewOptional();
  const setStateCanvasConfig = review?.setStateCanvasConfig;

  const onRestore = useCallback((restored: FrontCoverLiveState) => {
    setLiveState(normalizeFrontCoverLiveState(restored));
  }, []);

  usePrototypeComments(liveState, onRestore);

  const setPreviewState = useCallback((previewStateId: FrontCoverPreviewStateId) => {
    setLiveState((current) => ({
      ...createLiveStateForPreview(previewStateId),
      heroVariant: current.heroVariant,
    }));
  }, []);

  useSyncPrototypePreviewStateToUrl(liveState.previewStateId, setPreviewState, {
    validStateIds: FRONT_COVER_PREVIEW_STATE_IDS,
  });

  useEffect(() => {
    if (!setStateCanvasConfig) return;
    setStateCanvasConfig(buildFrontCoverStateCanvasConfig(setPreviewState));
    return () => setStateCanvasConfig(null);
  }, [setPreviewState, setStateCanvasConfig]);

  const handleNavMenuChange = useCallback((navMenu: FrontCoverNavMenu) => {
    setLiveState((current) => withInferredPreviewState(current, { navMenu }));
  }, []);

  const handleDashboardTabChange = useCallback((dashboardTab: FrontCoverDashboardTab) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        dashboardTab,
        scrollTarget: "dashboard",
        navMenu: "none",
      }),
    );
  }, []);

  const handleFrameworkChange = useCallback((frameworkId: FrontCoverFrameworkId) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        frameworkId,
        scrollTarget: "frameworks",
        navMenu: "none",
      }),
    );
  }, []);

  const handleHeroVariantChange = useCallback((heroVariant: FrontCoverHeroVariant) => {
    setLiveState((current) => ({
      ...current,
      heroVariant,
    }));
  }, []);

  return (
    <PrototypeComponent
      id="scroll-container"
      className={cn(PROTOTYPE_SCROLL_CONTAINER_CLASS, "bg-background", THEME_CLASS)}
    >
      <PrototypeComponent id="page" className={cn(PROTOTYPE_PAGE_CLASS, "bg-background")}>
        <HomePage
          liveState={liveState}
          onNavMenuChange={handleNavMenuChange}
          onDashboardTabChange={handleDashboardTabChange}
          onFrameworkChange={handleFrameworkChange}
          onHeroVariantChange={handleHeroVariantChange}
        />
        <FrontCoverPreviewStateSelect
          previewStateId={liveState.previewStateId}
          onPreviewStateChange={setPreviewState}
        />
      </PrototypeComponent>
    </PrototypeComponent>
  );
}
