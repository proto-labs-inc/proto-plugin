"use client";

import {
  fetchPrototypeBootstrapStatus,
  type PrototypeBootstrapStatus,
} from "@prototype/lib/prototypes/prototype-bootstrap-status";
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
  | "library-loading"
  | "normal";

export const BOOTSTRAP_PREVIEW_STEPS = [
  "welcome",
  "source-directory",
  "name",
  "agent-context",
  "setup-complete",
  "component-library",
  "library-loading",
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
  "component-library": "Waiting for setup",
  "library-loading": "Library loading",
  normal: "Normal",
};

const BOOTSTRAP_PREVIEW_STEP_ORDER: BootstrapPreviewStep[] = [
  "welcome",
  "source-directory",
  "name",
  "agent-context",
  "setup-complete",
  "component-library",
  "library-loading",
  "normal",
];

/** Modal + gallery-backdrop steps — not `library-loading` (gallery visible) or `normal`. */
export const BOOTSTRAP_ONBOARDING_MODAL_STEPS = new Set<BootstrapPreviewStep>([
  "welcome",
  "source-directory",
  "name",
  "agent-context",
  "setup-complete",
  "component-library",
]);

export function isBootstrapOnboardingModalStep(
  step: BootstrapPreviewStep,
): boolean {
  return BOOTSTRAP_ONBOARDING_MODAL_STEPS.has(step);
}

const BOOTSTRAP_POLLING_STEPS = new Set<BootstrapPreviewStep>([
  "component-library",
]);

const FIRST_ONBOARDING_STEP: BootstrapPreviewStep = "welcome";

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
function readBootstrapPreviewUrlActivation(
  debugEnabled: boolean,
): BootstrapPreviewStep | null {
  if (!debugEnabled || typeof window === "undefined") return null;

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
  return FIRST_ONBOARDING_STEP;
}

/** Loading panel on /component-library until the library page is populated. */
export function shouldShowComponentLibraryLoadingPanel(
  componentLibraryReady: boolean | null | undefined,
  forcePreview = false,
): boolean {
  if (forcePreview) return true;
  return componentLibraryReady !== true;
}

/** Block new prototype creation until the component library loaded flag is set. */
export function blocksNewPrototypeCreation(
  componentLibraryReady: boolean | null | undefined,
  forcePreview = false,
): boolean {
  return shouldShowComponentLibraryLoadingPanel(
    componentLibraryReady,
    forcePreview,
  );
}

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
  /** Onboarding is underway — gallery routes stay blocked until bootstrap completes. */
  isOnboardingInProgress: boolean;
  /** Gallery is browsable while the component library syncs after setup. */
  isComponentLibraryLoadingActive: boolean;
  /** True while the onboarding modal is open — until bootstrap status reports `complete: true`. */
  isOnboardingModalVisible: boolean;
  /** True while gallery chrome must stay hidden (any in-progress onboarding step). */
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

function useBootstrapPreviewState(
  debug = false,
  workspaceOnboarded = false,
): BootstrapPreviewContextValue {
  const isDevelopmentToggleVisible = debug;
  const [bootstrapStep, setBootstrapStepState] =
    useState<BootstrapPreviewStep>(() =>
      workspaceOnboarded ? "normal" : FIRST_ONBOARDING_STEP,
    );
  const [bootstrapStatus, setBootstrapStatus] =
    useState<PrototypeBootstrapStatus | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isDismissedForSession, setIsDismissedForSession] =
    useState(workspaceOnboarded);
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

      if (status.complete) {
        if (shouldAutoAdvance) {
          setBootstrapStepState("normal");
          setIsDismissedForSession(true);
          shouldPollBootstrapRef.current = false;
        }
        return;
      }

      if (source === "initial") {
        setIsDismissedForSession(false);
      }

      setBootstrapStepState((currentStep) => {
        if (source === "initial") {
          return resolveInitialBootstrapStep(status);
        }

        if (currentStep !== "normal") {
          return currentStep;
        }

        return resolveInitialBootstrapStep(status);
      });
    },
    [],
  );

  const refreshBootstrapStatus = useCallback(async () => {
    if (debug) return null;

    try {
      const status = await fetchPrototypeBootstrapStatus();
      applyBootstrapStatus(status, "poll");
      return status;
    } catch {
      return null;
    }
  }, [applyBootstrapStatus, debug]);

  useEffect(() => {
    let cancelled = false;
    const urlOverride = debug ? readBootstrapPreviewUrlActivation(true) : null;

    fetchPrototypeBootstrapStatus()
      .then((status) => {
        if (cancelled) return;

        if (urlOverride != null) {
          setBootstrapStatus(status);
          if (urlOverride === "normal") {
            setBootstrapStepState("normal");
            setIsDismissedForSession(true);
          } else {
            setIsDismissedForSession(false);
            setBootstrapStepState(urlOverride);
          }
        } else {
          applyBootstrapStatus(status, "initial");
        }

        setIsReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setIsDismissedForSession(false);
        setBootstrapStepState(FIRST_ONBOARDING_STEP);
        setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [applyBootstrapStatus, debug]);

  useEffect(() => {
    if (
      debug ||
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
  }, [bootstrapStep, debug, isReady, refreshBootstrapStatus]);

  const setBootstrapStep = useCallback((nextStep: BootstrapPreviewStep) => {
    setBootstrapStepState(nextStep);
    if (nextStep === "normal") {
      setIsDismissedForSession(true);
      shouldPollBootstrapRef.current = false;
    } else if (nextStep === "library-loading") {
      setIsDismissedForSession(false);
      shouldPollBootstrapRef.current = false;
    }
  }, []);

  const openModalForStep = useCallback(
    (step: BootstrapPreviewStep) => {
      if (!isDevelopmentToggleVisible && step === "normal") {
        return;
      }
      setIsDismissedForSession(step === "normal");
      shouldPollBootstrapRef.current = false;
      setBootstrapStep(step);
    },
    [isDevelopmentToggleVisible, setBootstrapStep],
  );

  const advanceBootstrapStep = useCallback(() => {
    setBootstrapStepState((currentStep) => {
      const nextStep = getNextBootstrapStep(currentStep);
      shouldPollBootstrapRef.current = BOOTSTRAP_POLLING_STEPS.has(nextStep);
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

  const isOnboardingModalStep =
    !isDismissedForSession && isBootstrapOnboardingModalStep(bootstrapStep);
  const isLibraryLoadingPreviewStep = bootstrapStep === "library-loading";
  const isComponentLibraryLoadingPanelVisible =
    shouldShowComponentLibraryLoadingPanel(
      bootstrapStatus?.componentLibraryReady,
      isLibraryLoadingPreviewStep,
    );
  const isComponentLibraryLoadingActive =
    bootstrapStatus?.componentLibraryReady !== true;
  const isOnboardingInProgress = isOnboardingModalStep;
  const isOnboardingModalVisible = isOnboardingModalStep;
  const isOnboardingBackdropActive = isOnboardingModalStep;
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
      isOnboardingInProgress,
      isComponentLibraryLoadingActive,
      isOnboardingModalVisible,
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
      isBootstrapPreviewActive,
      isComponentLibraryLoadingPanelVisible,
      isOnboardingBackdropActive,
      isOnboardingInProgress,
      isComponentLibraryLoadingActive,
      isOnboardingModalVisible,
      isReady,
      openModalForStep,
      refreshBootstrapStatus,
      retreatBootstrapStep,
      setBootstrapStep,
      isDevelopmentToggleVisible,
    ],
  );
}

export function BootstrapPreviewProvider({
  children,
  debug = false,
  workspaceOnboarded = false,
}: {
  children: ReactNode;
  debug?: boolean;
  workspaceOnboarded?: boolean;
}) {
  const value = useBootstrapPreviewState(debug, workspaceOnboarded);
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
