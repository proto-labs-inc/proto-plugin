"use client";

import {
  fetchPrototypeBootstrapStatus,
  type PrototypeBootstrapStatus,
} from "@prototype/lib/prototypes/prototype-bootstrap-status";
import {
  clearAwaitingLibrarySync,
  readAwaitingLibrarySync,
} from "@prototype/lib/prototypes/workspace-setup-awaiting-library";
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export const BOOTSTRAP_PREVIEW_URL_PARAM = "bootstrapPreview";

export type BootstrapPreviewStep =
  | "welcome"
  | "source-directory"
  | "name"
  | "agent-context"
  | "component-library"
  | "setup-complete"
  | "normal";

export const BOOTSTRAP_PREVIEW_STEPS = [
  "welcome",
  "source-directory",
  "name",
  "agent-context",
  "setup-complete",
  "component-library",
  "normal",
] as const satisfies readonly BootstrapPreviewStep[];

export const BOOTSTRAP_PREVIEW_STEP_LABELS: Record<
  BootstrapPreviewStep,
  string
> = {
  welcome: "Welcome",
  "source-directory": "Source directory",
  name: "Name",
  "agent-context": "Agent context",
  "setup-complete": "Setup complete",
  "component-library": "Library loading",
  normal: "Normal",
};

const BOOTSTRAP_PREVIEW_STEP_ORDER: BootstrapPreviewStep[] = [
  "welcome",
  "source-directory",
  "name",
  "agent-context",
  "setup-complete",
  "component-library",
  "normal",
];

const MODAL_ONBOARDING_STEPS = new Set<BootstrapPreviewStep>([
  "welcome",
  "source-directory",
  "name",
  "agent-context",
  "setup-complete",
]);

const FIRST_ONBOARDING_STEP: BootstrapPreviewStep = "welcome";

/**
 * Full debug mode: skip auto bootstrap resolution and honor `?bootstrapPreview=`.
 * Opt in with `NEXT_PUBLIC_PROTOTYPE_BOOTSTRAP_DEBUG=true` in `.env.local`.
 */
const isDebugBootstrapPreviewEnabled =
  process.env.NEXT_PUBLIC_PROTOTYPE_BOOTSTRAP_DEBUG === "true";

/** Floating stepper — visible in local dev; production requires the debug env var. */
const isDevelopmentToggleVisible =
  process.env.NODE_ENV === "development" ||
  isDebugBootstrapPreviewEnabled;

function isBootstrapPreviewStep(value: string): value is BootstrapPreviewStep {
  return (BOOTSTRAP_PREVIEW_STEPS as readonly string[]).includes(value);
}

function parseBootstrapPreviewUrlParam(
  param: string,
): BootstrapPreviewStep | null {
  if (param === "1" || param === "true") return "welcome";
  if (param === "0" || param === "false") return "normal";
  if (isBootstrapPreviewStep(param)) return param;
  return null;
}

/** One-shot URL activation for debug — strips the param without persisting a step. */
function readBootstrapPreviewUrlActivation(): BootstrapPreviewStep | null {
  if (!isDebugBootstrapPreviewEnabled || typeof window === "undefined")
    return null;

  const params = new URLSearchParams(window.location.search);
  const param = params.get(BOOTSTRAP_PREVIEW_URL_PARAM);
  if (param == null) return null;

  const parsed = parseBootstrapPreviewUrlParam(param);
  params.delete(BOOTSTRAP_PREVIEW_URL_PARAM);
  const search = params.toString();
  const nextUrl = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", nextUrl);

  return parsed;
}

function getNextBootstrapStep(step: BootstrapPreviewStep): BootstrapPreviewStep {
  const index = BOOTSTRAP_PREVIEW_STEP_ORDER.indexOf(step);
  return BOOTSTRAP_PREVIEW_STEP_ORDER[
    Math.min(index + 1, BOOTSTRAP_PREVIEW_STEP_ORDER.length - 1)
  ];
}

function getPreviousBootstrapStep(
  step: BootstrapPreviewStep,
): BootstrapPreviewStep {
  const index = BOOTSTRAP_PREVIEW_STEP_ORDER.indexOf(step);
  return BOOTSTRAP_PREVIEW_STEP_ORDER[Math.max(index - 1, 0)];
}

function resolveInitialBootstrapStep(
  status: PrototypeBootstrapStatus,
): BootstrapPreviewStep {
  if (status.complete) return "normal";
  if (readAwaitingLibrarySync()) return "component-library";
  if (status.componentLibraryReady) return "component-library";
  return FIRST_ONBOARDING_STEP;
}

/** Loading panel on /component-library until the agent sets `.proto/component-library-loaded`. */
export function shouldShowComponentLibraryLoadingPanel(
  bootstrapStep: BootstrapPreviewStep,
  componentLibraryReady: boolean | null | undefined,
  forcePreview = false,
): boolean {
  if (bootstrapStep !== "component-library") return false;
  if (forcePreview) return true;
  return componentLibraryReady !== true;
}

/** Block new prototype creation until the component library loaded flag is set. */
export function blocksNewPrototypeCreation(
  bootstrapStep: BootstrapPreviewStep,
  componentLibraryReady: boolean | null | undefined,
  forcePreview = false,
): boolean {
  return shouldShowComponentLibraryLoadingPanel(
    bootstrapStep,
    componentLibraryReady,
    forcePreview,
  );
}

const BOOTSTRAP_POLLING_STEPS = new Set<BootstrapPreviewStep>([
  "component-library",
]);

type BootstrapPreviewContextValue = {
  bootstrapStep: BootstrapPreviewStep;
  bootstrapStatus: PrototypeBootstrapStatus | null;
  /** True while /component-library should show the loading panel (not accordion content). */
  isComponentLibraryLoadingPanelVisible: boolean;
  setBootstrapStep: (nextStep: BootstrapPreviewStep) => void;
  openModalForStep: (step: BootstrapPreviewStep) => void;
  advanceBootstrapStep: () => void;
  retreatBootstrapStep: () => void;
  closeBootstrapOnboarding: () => void;
  refreshBootstrapStatus: () => Promise<PrototypeBootstrapStatus | null>;
  /** Temporarily hide the onboarding modal + backdrop so the gallery is browsable. */
  minimizeOnboarding: () => void;
  /** Onboarding is underway (not complete/dismissed) — true even while minimized. */
  isOnboardingInProgress: boolean;
  /** Gallery is browsable while the component library syncs after setup. */
  isComponentLibraryLoadingActive: boolean;
  /** Onboarding is underway but the modal is minimized so examples are browsable. */
  isOnboardingMinimized: boolean;
  isOnboardingBackdropActive: boolean;
  isBootstrapPreviewActive: boolean;
  /** @deprecated Use isBootstrapPreviewActive or isOnboardingBackdropActive */
  isBootstrapPreview: boolean;
  /** @deprecated Use setBootstrapStep */
  setBootstrapPreview: (enabled: boolean) => void;
  isReady: boolean;
  isDevelopmentToggleVisible: boolean;
};

const BootstrapPreviewContext =
  createContext<BootstrapPreviewContextValue | null>(null);

function useBootstrapPreviewState(): BootstrapPreviewContextValue {
  const [bootstrapStep, setBootstrapStepState] =
    useState<BootstrapPreviewStep>("normal");
  const [bootstrapStatus, setBootstrapStatus] =
    useState<PrototypeBootstrapStatus | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isDismissedForSession, setIsDismissedForSession] = useState(false);
  const [isOnboardingMinimized, setIsOnboardingMinimized] = useState(false);
  /** Debug stepper: always preview loading UI on the library-loading step. */
  const [forceLibraryLoadingPreview, setForceLibraryLoadingPreview] =
    useState(false);
  /** Poll bootstrap status after advancing through agent-driven steps — not debug picker jumps. */
  const shouldPollBootstrapRef = useRef(false);

  const applyBootstrapStatus = useCallback(
    (
      status: PrototypeBootstrapStatus,
      source: "initial" | "poll",
    ) => {
      setBootstrapStatus(status);

      const shouldAutoAdvance =
        source === "initial" || shouldPollBootstrapRef.current;

      if (status.componentLibraryReady) {
        clearAwaitingLibrarySync();
      }

      if (status.complete) {
        if (shouldAutoAdvance) {
          setBootstrapStepState("normal");
          setIsDismissedForSession(true);
          shouldPollBootstrapRef.current = false;
          clearAwaitingLibrarySync();
        }
        return;
      }

      setBootstrapStepState((currentStep) => {
        if (currentStep !== "normal") {
          return currentStep;
        }

        return resolveInitialBootstrapStep(status);
      });
    },
    [],
  );

  const refreshBootstrapStatus = useCallback(async () => {
    if (isDebugBootstrapPreviewEnabled) return null;

    try {
      const status = await fetchPrototypeBootstrapStatus();
      applyBootstrapStatus(status, "poll");
      return status;
    } catch {
      return null;
    }
  }, [applyBootstrapStatus]);

  useEffect(() => {
    if (isDebugBootstrapPreviewEnabled) {
      const urlStep = readBootstrapPreviewUrlActivation();
      if (urlStep != null && urlStep !== "normal") {
        setBootstrapStepState(FIRST_ONBOARDING_STEP);
      }
      setIsReady(true);
      return;
    }

    let cancelled = false;

    fetchPrototypeBootstrapStatus()
      .then((status) => {
        if (cancelled) return;
        applyBootstrapStatus(status, "initial");
        setIsReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setBootstrapStepState("normal");
        setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [applyBootstrapStatus]);

  useEffect(() => {
    if (
      isDebugBootstrapPreviewEnabled ||
      !shouldPollBootstrapRef.current ||
      !BOOTSTRAP_POLLING_STEPS.has(bootstrapStep) ||
      !isReady
    ) {
      return;
    }

    void refreshBootstrapStatus();

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState !== "visible") return;
      void refreshBootstrapStatus();
    };

    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
    };
  }, [bootstrapStep, isReady, refreshBootstrapStatus]);

  const setBootstrapStep = useCallback((nextStep: BootstrapPreviewStep) => {
    setBootstrapStepState(nextStep);
    setIsOnboardingMinimized(false);
    if (nextStep !== "component-library") {
      setForceLibraryLoadingPreview(false);
    }
    if (nextStep === "normal") {
      setIsDismissedForSession(true);
      shouldPollBootstrapRef.current = false;
      clearAwaitingLibrarySync();
    }
  }, []);

  const openModalForStep = useCallback(
    (step: BootstrapPreviewStep) => {
      setIsDismissedForSession(false);
      setIsOnboardingMinimized(false);
      shouldPollBootstrapRef.current = false;
      setForceLibraryLoadingPreview(
        isDevelopmentToggleVisible && step === "component-library",
      );
      setBootstrapStep(step);
    },
    [setBootstrapStep],
  );

  const minimizeOnboarding = useCallback(() => {
    setIsOnboardingMinimized(true);
  }, []);

  const advanceBootstrapStep = useCallback(() => {
    setBootstrapStepState((currentStep) => {
      const nextStep = getNextBootstrapStep(currentStep);
      shouldPollBootstrapRef.current = BOOTSTRAP_POLLING_STEPS.has(nextStep);
      if (nextStep === "component-library") {
        setForceLibraryLoadingPreview(false);
      }
      return nextStep;
    });
  }, []);

  const retreatBootstrapStep = useCallback(() => {
    setBootstrapStepState((currentStep) => {
      shouldPollBootstrapRef.current = false;
      return getPreviousBootstrapStep(currentStep);
    });
  }, []);

  const closeBootstrapOnboarding = useCallback(() => {
    setBootstrapStep("normal");
  }, [setBootstrapStep]);

  const isOnboardingInProgress =
    isReady && !isDismissedForSession && bootstrapStep !== "normal";
  const isComponentLibraryLoadingPanelVisible =
    shouldShowComponentLibraryLoadingPanel(
      bootstrapStep,
      bootstrapStatus?.componentLibraryReady,
      forceLibraryLoadingPreview,
    );
  const isComponentLibraryLoadingActive =
    isOnboardingInProgress &&
    bootstrapStep === "component-library";
  const isOnboardingBackdropActive =
    isOnboardingInProgress &&
    !isOnboardingMinimized &&
    MODAL_ONBOARDING_STEPS.has(bootstrapStep);
  const isBootstrapPreviewActive = isOnboardingBackdropActive;

  return useMemo(
    () => ({
      bootstrapStep,
      bootstrapStatus,
      isComponentLibraryLoadingPanelVisible,
      setBootstrapStep,
      openModalForStep,
      advanceBootstrapStep,
      retreatBootstrapStep,
      closeBootstrapOnboarding,
      refreshBootstrapStatus,
      minimizeOnboarding,
      isOnboardingInProgress,
      isComponentLibraryLoadingActive,
      isOnboardingMinimized,
      isOnboardingBackdropActive,
      isBootstrapPreviewActive,
      isBootstrapPreview: isBootstrapPreviewActive,
      setBootstrapPreview: (enabled: boolean) => {
        setBootstrapStep(enabled ? FIRST_ONBOARDING_STEP : "normal");
      },
      isReady,
      isDevelopmentToggleVisible,
    }),
    [
      advanceBootstrapStep,
      bootstrapStatus,
      bootstrapStep,
      closeBootstrapOnboarding,
      forceLibraryLoadingPreview,
      isBootstrapPreviewActive,
      isComponentLibraryLoadingPanelVisible,
      isOnboardingBackdropActive,
      isOnboardingInProgress,
      isComponentLibraryLoadingActive,
      isOnboardingMinimized,
      minimizeOnboarding,
      isReady,
      openModalForStep,
      refreshBootstrapStatus,
      retreatBootstrapStep,
      setBootstrapStep,
    ],
  );
}

export function BootstrapPreviewProvider({ children }: { children: ReactNode }) {
  const value = useBootstrapPreviewState();
  return createElement(BootstrapPreviewContext.Provider, { value }, children);
}

export function useBootstrapPreview(): BootstrapPreviewContextValue {
  const context = useContext(BootstrapPreviewContext);
  if (!context) {
    throw new Error(
      "useBootstrapPreview must be used within BootstrapPreviewProvider",
    );
  }
  return context;
}
