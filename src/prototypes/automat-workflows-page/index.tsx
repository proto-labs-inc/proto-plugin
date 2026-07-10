"use client";

import {
  buildPrAgentPrompt,
  PROTOTYPE_PAGE_CLASS,
  PROTOTYPE_SCROLL_CONTAINER_CLASS,
  PrototypeComponent,
  PrototypeSpecPanelContent,
  usePrototypeComments,
  useRegisterPrototypeReferenceDocs,
  usePrototypeReviewOptional,
} from "proto-plugin";
import { cn } from "@coss/ui/lib/utils";
import { useCallback, useEffect, useState } from "react";

import styles from "./automat-workflows-page.module.scss";
import { AutomatAnalyticsVariantToggle } from "./_components/automat-analytics-variant-toggle";
import { DEFAULT_AUTOMAT_ANALYTICS_VARIANT } from "./_components/automat-analytics-content";
import type { AutomatAnalyticsVariant } from "./_components/automat-analytics-content";
import { useRegisterAutomatWorkflowsPageVariantSets } from "./_components/automat-analytics-variant-sets";
import { AutomatShellLayout } from "./_components/automat-shell-layout";
import { AutomatChatWidget } from "./_components/automat-chat-widget";
import { AutomatWorkflowsDashboard } from "./_components/automat-workflows-dashboard";
import {
  createLiveStateForPreview,
  DEFAULT_AUTOMAT_WORKFLOWS_PAGE_PREVIEW_STATE,
  withInferredPreviewState,
  type AutomatWorkflowsPagePreviewStateId,
} from "./_components/automat-workflows-page-preview-states";
import { AutomatWorkflowsPagePreviewStateSelect } from "./_components/automat-workflows-page-preview-state-select";
import { buildAutomatWorkflowsPageStateCanvasConfig } from "./_components/automat-workflows-page-state-canvas-config";
import {
  findPrSplitEntry,
  PR_SPLIT_CONFIG,
  PR_SPLIT_ENTRIES,
  readAnalyticsVariantFromSearchParams,
  readLiveStateFromSearchParams,
  type AutomatPrSplitEntry,
} from "./_components/pr-split-config";
import { PrSplitWireframe } from "./_components/pr-split-wireframes";
import type {
  AutomatLiveState,
  AutomatProjectId,
  AutomatStatusFilter,
} from "./_components/automat-workflows-page-types";
import { REFERENCE_DOCS } from "./reference-docs";

function createDefaultLiveState(): AutomatLiveState {
  return createLiveStateForPreview(DEFAULT_AUTOMAT_WORKFLOWS_PAGE_PREVIEW_STATE);
}

export default function AutomatWorkflowsPage() {
  const [liveState, setLiveState] = useState<AutomatLiveState>(createDefaultLiveState);
  const [analyticsVariant, setAnalyticsVariant] = useState<AutomatAnalyticsVariant>(
    DEFAULT_AUTOMAT_ANALYTICS_VARIANT,
  );
  const [selectedPrOrder, setSelectedPrOrder] = useState<number | null>(null);
  const review = usePrototypeReviewOptional();
  const setSpecContent = review?.setSpecContent;
  const focusShareTarget = review?.focusShareTarget;

  const onRestore = useCallback((restored: AutomatLiveState) => {
    setLiveState(restored);
  }, []);

  usePrototypeComments(liveState, onRestore);
  useRegisterPrototypeReferenceDocs(REFERENCE_DOCS);
  useRegisterAutomatWorkflowsPageVariantSets();

  const setPreviewState = useCallback((previewStateId: AutomatWorkflowsPagePreviewStateId) => {
    setLiveState(createLiveStateForPreview(previewStateId));
  }, []);

  const setSearchQuery = useCallback((searchQuery: string) => {
    setLiveState((current) => withInferredPreviewState(current, { searchQuery }));
  }, []);

  const setStatusFilter = useCallback((statusFilter: AutomatStatusFilter) => {
    setLiveState((current) => withInferredPreviewState(current, { statusFilter }));
  }, []);

  const setChatOpen = useCallback((chatOpen: boolean) => {
    setLiveState((current) => {
      if (chatOpen && current.projectId === "finance-automation") {
        return createLiveStateForPreview("chat-open");
      }

      return withInferredPreviewState(current, { chatOpen });
    });
  }, []);

  const setProjectId = useCallback((projectId: AutomatProjectId) => {
    setLiveState((current) =>
      withInferredPreviewState(current, {
        projectId,
        searchQuery: "",
        statusFilter: "all",
      }),
    );
  }, []);

  const setStateCanvasConfig = review?.setStateCanvasConfig;
  useEffect(() => {
    if (!setStateCanvasConfig) return;

    setStateCanvasConfig(buildAutomatWorkflowsPageStateCanvasConfig(setPreviewState));

    return () => setStateCanvasConfig(null);
  }, [setPreviewState, setStateCanvasConfig]);

  const applyPrSplitEntry = useCallback((entry: AutomatPrSplitEntry) => {
    setLiveState(entry.liveState);
    setAnalyticsVariant(entry.analyticsVariant);
  }, []);

  const syncPrSplitToUrl = useCallback((entry: AutomatPrSplitEntry | null) => {
    const url = new URL(window.location.href);
    if (!entry) {
      url.searchParams.delete("prSplit");
      url.searchParams.delete("prAnalytics");
      url.searchParams.delete("shareState");
    } else {
      PR_SPLIT_CONFIG.writeEntryToSearchParams(url.searchParams, entry);
      url.searchParams.set("prSplit", String(entry.order));
    }
    window.history.replaceState(null, "", url);
  }, []);

  const handlePrNavigate = useCallback(
    (entry: AutomatPrSplitEntry) => {
      setSelectedPrOrder(entry.order);
      applyPrSplitEntry(entry);
      syncPrSplitToUrl(entry);
      focusShareTarget?.(entry.targetId);
    },
    [applyPrSplitEntry, focusShareTarget, syncPrSplitToUrl],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prSplit = params.get("prSplit");
    if (!prSplit) return;

    const order = Number(prSplit);
    const entry = findPrSplitEntry(order);
    if (!entry) return;

    setSelectedPrOrder(order);
    applyPrSplitEntry(entry);

    const restoredLiveState = readLiveStateFromSearchParams(params);
    if (restoredLiveState) {
      setLiveState(restoredLiveState);
    }

    const restoredAnalyticsVariant = readAnalyticsVariantFromSearchParams(params);
    if (restoredAnalyticsVariant) {
      setAnalyticsVariant(restoredAnalyticsVariant);
    }

    const timer = window.setTimeout(() => {
      focusShareTarget?.(entry.targetId);
    }, 150);
    return () => clearTimeout(timer);
  }, [applyPrSplitEntry, focusShareTarget]);

  useEffect(() => {
    if (!setSpecContent) return;

    setSpecContent(
      <PrototypeSpecPanelContent
        entries={PR_SPLIT_ENTRIES}
        renderWireframe={(id) => (
          <PrSplitWireframe id={id as AutomatPrSplitEntry["wireframeId"]} embedded />
        )}
        buildAgentPrompt={(entry, origin) =>
          buildPrAgentPrompt(entry, PR_SPLIT_ENTRIES, PR_SPLIT_CONFIG, origin)
        }
        onPrNavigate={handlePrNavigate}
        selectedPrOrder={selectedPrOrder}
        defaultPreviewPath={PR_SPLIT_CONFIG.defaultPreviewPath}
        vercelProjectName={PR_SPLIT_CONFIG.vercelProjectName}
      />,
    );

    return () => setSpecContent(null);
  }, [handlePrNavigate, selectedPrOrder, setSpecContent]);

  return (
    <PrototypeComponent
      id="scroll-container"
      className={cn(PROTOTYPE_SCROLL_CONTAINER_CLASS, styles.root, "antialiased")}
    >
      <PrototypeComponent id="page" className={cn(PROTOTYPE_PAGE_CLASS, "overflow-hidden")}>
        <div className="sr-only" aria-hidden>
          <AutomatAnalyticsVariantToggle
            variant={analyticsVariant}
            onVariantChange={setAnalyticsVariant}
            registerOnly
          />
        </div>

        <AutomatShellLayout
          projectId={liveState.projectId}
          onProjectIdChange={setProjectId}
        >
          <AutomatWorkflowsDashboard
            projectId={liveState.projectId}
            searchQuery={liveState.searchQuery}
            statusFilter={liveState.statusFilter}
            analyticsVariant={analyticsVariant}
            onSearchQueryChange={setSearchQuery}
            onStatusFilterChange={setStatusFilter}
          />
        </AutomatShellLayout>

        <AutomatChatWidget chatOpen={liveState.chatOpen} onChatOpenChange={setChatOpen} />

        <AutomatWorkflowsPagePreviewStateSelect
          previewStateId={liveState.previewStateId}
          onPreviewStateChange={setPreviewState}
        />
      </PrototypeComponent>
    </PrototypeComponent>
  );
}
