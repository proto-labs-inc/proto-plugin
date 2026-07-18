"use client";

import { fetchPrototypeBootstrapStatus } from "@prototype/lib/prototypes/prototype-bootstrap-status";
import { useCallback, useEffect, useState } from "react";

export const PROTOTYPE_BOOTSTRAP_PREVIEW_STORAGE_KEY =
  "prototype-bootstrap-preview";

export const BOOTSTRAP_PREVIEW_URL_PARAM = "bootstrapPreview";

export type BootstrapPreviewStep =
  | "welcome"
  | "source-directory"
  | "name"
  | "agent-context"
  | "components"
  | "normal";

export const BOOTSTRAP_PREVIEW_STEPS = [
  "welcome",
  "source-directory",
  "name",
  "agent-context",
  "components",
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
  components: "Components",
  normal: "Normal",
};

const BOOTSTRAP_PREVIEW_CHANGE_EVENT = "prototype-bootstrap-preview-change";

const BOOTSTRAP_PREVIEW_STEP_ORDER: BootstrapPreviewStep[] = [
  "welcome",
  "source-directory",
  "name",
  "agent-context",
  "components",
  "normal",
];

/**
 * Debug flag for the bootstrap onboarding preview stepper.
 * Enable it by setting `NEXT_PUBLIC_PROTOTYPE_BOOTSTRAP_DEBUG=true` in `.env.local`.
 * When unset or any value other than "true", the stepper is hidden and auto
 * onboarding resolves from `/api/prototypes/bootstrap-status` instead.
 */
const isDebugBootstrapPreviewEnabled =
  process.env.NEXT_PUBLIC_PROTOTYPE_BOOTSTRAP_DEBUG === "true";

function isBootstrapPreviewStep(value: string): value is BootstrapPreviewStep {
  return (BOOTSTRAP_PREVIEW_STEPS as readonly string[]).includes(value);
}

function migrateStoredStep(raw: string | null): BootstrapPreviewStep {
  if (raw === "true") return "welcome";
  if (raw === "false" || raw == null) return "normal";
  if (isBootstrapPreviewStep(raw)) return raw;
  return "normal";
}

function readBootstrapPreviewStepFromStorage(): BootstrapPreviewStep {
  if (!isDebugBootstrapPreviewEnabled || typeof window === "undefined")
    return "normal";

  try {
    return migrateStoredStep(
      localStorage.getItem(PROTOTYPE_BOOTSTRAP_PREVIEW_STORAGE_KEY),
    );
  } catch {
    return "normal";
  }
}

function writeBootstrapPreviewStep(nextStep: BootstrapPreviewStep): void {
  if (!isDebugBootstrapPreviewEnabled || typeof window === "undefined") return;

  try {
    localStorage.setItem(PROTOTYPE_BOOTSTRAP_PREVIEW_STORAGE_KEY, nextStep);
    window.dispatchEvent(new Event(BOOTSTRAP_PREVIEW_CHANGE_EVENT));
  } catch {
    // Ignore localStorage write failures in prototype preview.
  }
}

function parseBootstrapPreviewUrlParam(
  param: string,
): BootstrapPreviewStep | null {
  if (param === "1" || param === "true") return "welcome";
  if (param === "0" || param === "false") return "normal";
  if (isBootstrapPreviewStep(param)) return param;
  return null;
}

function applyBootstrapPreviewUrlParam(): void {
  if (!isDebugBootstrapPreviewEnabled || typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const param = params.get(BOOTSTRAP_PREVIEW_URL_PARAM);
  if (param == null) return;

  const nextStep = parseBootstrapPreviewUrlParam(param);
  if (nextStep != null) {
    writeBootstrapPreviewStep(nextStep);
  }

  params.delete(BOOTSTRAP_PREVIEW_URL_PARAM);
  const search = params.toString();
  const nextUrl = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", nextUrl);
}

function readInitialBootstrapPreviewStep(): BootstrapPreviewStep {
  applyBootstrapPreviewUrlParam();
  return readBootstrapPreviewStepFromStorage();
}

function getNextBootstrapStep(
  step: BootstrapPreviewStep,
): BootstrapPreviewStep {
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

export function useBootstrapPreview() {
  const [debugStoredStep, setDebugStoredStep] =
    useState<BootstrapPreviewStep>("normal");
  const [isDebugReady, setIsDebugReady] = useState(
    !isDebugBootstrapPreviewEnabled,
  );
  const [autoResolvedStep, setAutoResolvedStep] =
    useState<BootstrapPreviewStep>("normal");
  const [isAutoReady, setIsAutoReady] = useState(false);
  const [isDismissedForSession, setIsDismissedForSession] = useState(false);

  useEffect(() => {
    if (!isDebugBootstrapPreviewEnabled) return;

    setDebugStoredStep(readInitialBootstrapPreviewStep());
    setIsDebugReady(true);

    const handleChange = () => {
      setDebugStoredStep(readBootstrapPreviewStepFromStorage());
    };

    window.addEventListener("storage", handleChange);
    window.addEventListener(BOOTSTRAP_PREVIEW_CHANGE_EVENT, handleChange);
    return () => {
      window.removeEventListener("storage", handleChange);
      window.removeEventListener(BOOTSTRAP_PREVIEW_CHANGE_EVENT, handleChange);
    };
  }, []);

  useEffect(() => {
    if (isDebugBootstrapPreviewEnabled) return;

    let cancelled = false;

    fetchPrototypeBootstrapStatus()
      .then((status) => {
        if (cancelled) return;
        setAutoResolvedStep(status.resolvedStep);
        setIsAutoReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setAutoResolvedStep("normal");
        setIsAutoReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const setBootstrapStep = useCallback((nextStep: BootstrapPreviewStep) => {
    if (isDebugBootstrapPreviewEnabled) {
      setDebugStoredStep(nextStep);
      writeBootstrapPreviewStep(nextStep);
      return;
    }

    setAutoResolvedStep(nextStep);
    if (nextStep === "normal") {
      setIsDismissedForSession(true);
    }
  }, []);

  const openModalForStep = useCallback(
    (step: BootstrapPreviewStep) => {
      setIsDismissedForSession(false);
      setBootstrapStep(step);
    },
    [setBootstrapStep],
  );

  const advanceBootstrapStep = useCallback(() => {
    const currentStep = isDebugBootstrapPreviewEnabled
      ? debugStoredStep
      : autoResolvedStep;
    setBootstrapStep(getNextBootstrapStep(currentStep));
  }, [autoResolvedStep, debugStoredStep, setBootstrapStep]);

  const retreatBootstrapStep = useCallback(() => {
    const currentStep = isDebugBootstrapPreviewEnabled
      ? debugStoredStep
      : autoResolvedStep;
    setBootstrapStep(getPreviousBootstrapStep(currentStep));
  }, [autoResolvedStep, debugStoredStep, setBootstrapStep]);

  const closeBootstrapOnboarding = useCallback(() => {
    setBootstrapStep("normal");
  }, [setBootstrapStep]);

  const bootstrapStep = isDebugBootstrapPreviewEnabled
    ? isDebugReady
      ? debugStoredStep
      : "normal"
    : isAutoReady
      ? autoResolvedStep
      : "normal";

  const isOnboardingBackdropActive = isDebugBootstrapPreviewEnabled
    ? isDebugReady && bootstrapStep !== "normal"
    : isAutoReady &&
      !isDismissedForSession &&
      bootstrapStep !== "normal";
  const isBootstrapPreviewActive = isOnboardingBackdropActive;

  return {
    bootstrapStep,
    setBootstrapStep,
    openModalForStep,
    advanceBootstrapStep,
    retreatBootstrapStep,
    closeBootstrapOnboarding,
    isOnboardingBackdropActive,
    isBootstrapPreviewActive,
    /** @deprecated Use isBootstrapPreviewActive or isOnboardingBackdropActive */
    isBootstrapPreview: isBootstrapPreviewActive,
    /** @deprecated Use setBootstrapStep */
    setBootstrapPreview: (enabled: boolean) => {
      setBootstrapStep(enabled ? "welcome" : "normal");
    },
    isReady: isDebugBootstrapPreviewEnabled ? isDebugReady : isAutoReady,
    isDevelopmentToggleVisible: isDebugBootstrapPreviewEnabled,
  };
}
