"use client";

import {
  PROTOTYPE_ONBOARDING_MODAL_MIN_HEIGHT_CLASS,
  PrototypeToolDialog,
} from "@prototype/components/platform-ui/prototype-tool-dialog";
import { PrototypeBootstrapOnboardingAgentContextStep } from "@prototype/components/shell/prototype-bootstrap-onboarding-agent-context-step";
import { PrototypeBootstrapOnboardingNameStep } from "@prototype/components/shell/prototype-bootstrap-onboarding-name-step";
import { PrototypeBootstrapOnboardingSourceStep } from "@prototype/components/shell/prototype-bootstrap-onboarding-source-step";
import { PrototypeBootstrapOnboardingWaitingStep } from "@prototype/components/shell/prototype-bootstrap-onboarding-waiting-step";
import { PrototypeBootstrapOnboardingWelcomeStep } from "@prototype/components/shell/prototype-bootstrap-onboarding-welcome-step";
import { Button } from "@prototype/components/ui/button";
import { buildBootstrapSetupCopyText } from "@prototype/lib/prototypes/bootstrap-setup-prompt";
import { resolveOnboardingSourceForSetup } from "@prototype/lib/prototypes/resolve-onboarding-source-for-setup";
import type { SourceDirectoryPick } from "@prototype/lib/prototypes/resolve-source-directory-pick";
import { usePersistedLocalString } from "@prototype/lib/prototypes/use-persisted-local-state";
import { useTrackEvent } from "@prototype/lib/prototypes/telemetry/prototype-telemetry-context";
import {
  BOOTSTRAP_PREVIEW_STEPS,
  type BootstrapPreviewStep,
  useBootstrapPreview,
} from "@prototype/lib/prototypes/use-bootstrap-preview";
import { useWorkspaceProfile } from "@prototype/lib/prototypes/use-workspace-profile";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { cn } from "@prototype/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const PROFILE_STORAGE_KEYS = {
  sourceName: "prototype-profile:source-name",
  sourceDescription: "prototype-profile:source-description",
  agentContext: "prototype-profile:agent-context",
  agentContextPath: "prototype-profile:agent-context-path",
} as const;

const ONBOARDING_STEP_CONTENT: Record<
  Exclude<BootstrapPreviewStep, "normal">,
  { title: string; description?: string }
> = {
  welcome: {
    title: "Welcome to Proto!",
    description: "Let's set up your workspace",
  },
  "source-directory": {
    title: "Connect your source directory",
    description:
      "Drop your product repo folder. Proto links it and pulls your design system straight from the source — no export step.",
  },
  name: {
    title: "What should we call you?",
    description: "Your name appears on comments you make.",
  },
  "agent-context": {
    title: "Add your agent context",
    description:
      "Paste markdown or select AGENTS.md from disk. Proto includes the file's absolute path in the setup prompt.",
  },
  "setup-complete": {
    title: "Set up your workspace",
    description:
      "Copy the setup prompt into your agent and it will link the source directory and load its design system.",
  },
  "component-library": {
    title: "Waiting for workspace setup",
    description: "Run the copied prompt in your agent to finish linking your workspace.",
  },
  "library-loading": {
    title: "Design system syncing",
    description:
      "New prototypes need styles and base components from the linked source. Browse existing prototypes while setup finishes.",
  },
};

type PrototypeBootstrapOnboardingModalProps = {
  /** Full linked SOURCE_PATH from the host — never the sidebar display name. */
  currentSourcePath?: string;
  syncConfigPath?: string;
  designSystemPagePath?: string;
};

export function PrototypeBootstrapOnboardingModal({
  currentSourcePath,
  syncConfigPath,
  designSystemPagePath,
}: PrototypeBootstrapOnboardingModalProps) {
  const {
    bootstrapStep,
    advanceBootstrapStep,
    retreatBootstrapStep,
    isOnboardingModalVisible,
  } = useBootstrapPreview();

  const [selectedDirectory, setSelectedDirectory] =
    useState<SourceDirectoryPick | null>(null);
  const workspaceProfile = useWorkspaceProfile();
  const [userName, setUserName] = useState(workspaceProfile.userName);
  const [isContinuing, setIsContinuing] = useState(false);
  const [hasCopiedSetupPrompt, setHasCopiedSetupPrompt] = useState(false);
  const { copy, icon, isCopied } = useCopyToClipboard();
  const track = useTrackEvent();

  const { value: sourceName, updateValue: setSourceName } =
    usePersistedLocalString(PROFILE_STORAGE_KEYS.sourceName, "");
  const { updateValue: setSourceDescription } =
    usePersistedLocalString(PROFILE_STORAGE_KEYS.sourceDescription, "");
  const { value: agentContext, updateValue: setAgentContext } =
    usePersistedLocalString(PROFILE_STORAGE_KEYS.agentContext, "");
  const { value: agentContextPath, updateValue: setAgentContextPath } =
    usePersistedLocalString(PROFILE_STORAGE_KEYS.agentContextPath, "");

  useEffect(() => {
    setUserName(workspaceProfile.userName);
  }, [workspaceProfile.userName]);

  const advanceOnboardingStep = useCallback(() => {
    advanceBootstrapStep();
  }, [advanceBootstrapStep]);

  const retreatOnboardingStep = useCallback(() => {
    retreatBootstrapStep();
  }, [retreatBootstrapStep]);

  const onboardingStep =
    bootstrapStep === "normal" || bootstrapStep === "library-loading"
      ? null
      : bootstrapStep;

  useEffect(() => {
    if (onboardingStep) {
      track("modal.opened", { modal: "onboarding", step: onboardingStep });
    }
  }, [onboardingStep, track]);

  const stepIndex = onboardingStep
    ? BOOTSTRAP_PREVIEW_STEPS.indexOf(onboardingStep)
    : -1;
  const canGoBack =
    stepIndex > 0 && onboardingStep !== "component-library";
  const isWaitingForOnboarded = onboardingStep === "component-library";

  const onboardingSource = useMemo(
    () =>
      resolveOnboardingSourceForSetup({
        selectedDirectory,
        persistedSourceName: sourceName,
      }),
    [selectedDirectory, sourceName],
  );

  const handleContinue = useCallback(() => {
    if (!onboardingStep || isContinuing) return;

    setIsContinuing(true);

    try {
      if (onboardingStep === "source-directory") {
        if (!selectedDirectory?.name.trim()) {
          return;
        }

        const nextSourceName = selectedDirectory.name.trim();
        setSourceName(nextSourceName);
        setSourceDescription(
          selectedDirectory.path?.trim()
            ? selectedDirectory.path.trim()
            : `Source folder "${nextSourceName}" selected from this machine.`,
        );
      } else if (onboardingStep === "name") {
        if (!userName.trim()) return;
      }

      track("onboarding.step_advanced", { step: onboardingStep });
      advanceOnboardingStep();
    } finally {
      setIsContinuing(false);
    }
  }, [
    advanceOnboardingStep,
    isContinuing,
    onboardingStep,
    selectedDirectory,
    setSourceDescription,
    setSourceName,
    track,
    userName,
  ]);

  const handleBack = useCallback(() => {
    retreatOnboardingStep();
  }, [retreatOnboardingStep]);

  const hasSourceSelection = Boolean(selectedDirectory?.name.trim());

  const continueDisabled =
    isContinuing ||
    (onboardingStep === "name" && !userName.trim()) ||
    (onboardingStep === "source-directory" && !hasSourceSelection);

  const continueLabel =
    onboardingStep === "setup-complete"
      ? isCopied
        ? "Copied prompt"
        : "Copy setup prompt"
      : onboardingStep === "agent-context"
        ? "Continue"
        : onboardingStep === "welcome"
          ? "Get Started"
          : "Continue";

  const handlePrimaryAction = useCallback(async () => {
    if (onboardingStep === "component-library") {
      if (isContinuing) return;

      setIsContinuing(true);

      try {
        const origin =
          typeof window !== "undefined" ? window.location.origin : undefined;
        await copy(
          buildBootstrapSetupCopyText({
            sourcePath: onboardingSource.absolutePath,
            sourceFolderName: onboardingSource.folderName,
            currentSourcePath,
            userName,
            agentContext,
            agentContextPath: agentContextPath.trim() || undefined,
            syncConfigPath,
            designSystemPagePath,
            origin,
            workspaceProfile,
          }),
        );
        setHasCopiedSetupPrompt(true);
        track("modal.prompt_copied", { modal: "onboarding-setup-waiting" });
      } catch {
        toast.error("Copy error", {
          description: "Failed to copy the setup prompt",
        });
      } finally {
        setIsContinuing(false);
      }
      return;
    }

    if (onboardingStep === "setup-complete") {
      if (isContinuing) return;

      setIsContinuing(true);

      try {
        const origin =
          typeof window !== "undefined" ? window.location.origin : undefined;
        await copy(
          buildBootstrapSetupCopyText({
            sourcePath: onboardingSource.absolutePath,
            sourceFolderName: onboardingSource.folderName,
            currentSourcePath,
            userName,
            agentContext,
            agentContextPath: agentContextPath.trim() || undefined,
            syncConfigPath,
            designSystemPagePath,
            origin,
            workspaceProfile,
          }),
        );
        setHasCopiedSetupPrompt(true);
        track("modal.prompt_copied", { modal: "onboarding-setup-complete" });
        advanceOnboardingStep();
      } catch {
        toast.error("Copy error", {
          description: "Failed to copy the setup prompt",
        });
      } finally {
        setIsContinuing(false);
      }
      return;
    }

    handleContinue();
  }, [
    advanceOnboardingStep,
    agentContext,
    agentContextPath,
    designSystemPagePath,
    copy,
    currentSourcePath,
    handleContinue,
    isContinuing,
    onboardingSource,
    onboardingStep,
    syncConfigPath,
    track,
    userName,
    workspaceProfile,
  ]);

  if (!isOnboardingModalVisible || !onboardingStep) {
    return null;
  }

  const stepContent = ONBOARDING_STEP_CONTENT[onboardingStep];
  const title = stepContent.title;
  const description = stepContent.description;

  const isWelcomeStep = onboardingStep === "welcome";
  const dialogDescription =
    isWelcomeStep || !description ? undefined : description;

  return (
    <PrototypeToolDialog
      open
      onOpenChange={() => {}}
      dismissible={false}
      overlayClassName="tool-dialog-overlay-opaque"
      className={PROTOTYPE_ONBOARDING_MODAL_MIN_HEIGHT_CLASS}
      title={title}
      description={dialogDescription}
      hideHeader={isWelcomeStep}
      bodyClassName={cn(
        "gap-4",
        isWelcomeStep && "flex flex-1 items-center justify-center px-0 py-0",
        isWaitingForOnboarded && "flex flex-1",
      )}
      footerClassName={
        canGoBack ? "justify-between" : "justify-end"
      }
      footer={isWelcomeStep ? undefined : (
        <>
          {canGoBack ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={isContinuing}
              onClick={handleBack}
              aria-label="Back"
            >
              <ArrowLeft size={16} strokeWidth={2} />
            </Button>
          ) : null}
          <Button
            type="button"
            variant="chrome"
            size="sm"
            className="h-8 gap-2 px-3"
            disabled={continueDisabled}
            onClick={() => {
              void handlePrimaryAction();
            }}
            aria-label={
              isWaitingForOnboarded
                ? hasCopiedSetupPrompt
                  ? "Copy setup prompt again"
                  : "Copy setup prompt"
                : onboardingStep === "setup-complete"
                  ? "Copy setup prompt"
                  : "Continue"
            }
          >
            {isWaitingForOnboarded
              ? isCopied
                ? "Copied prompt"
                : isContinuing
                  ? "Copying…"
                  : hasCopiedSetupPrompt
                    ? "Copy setup prompt again"
                    : "Copy setup prompt"
              : isContinuing
                ? onboardingStep === "setup-complete"
                  ? "Copying…"
                  : "Continuing…"
                : continueLabel}
            {isWaitingForOnboarded || onboardingStep === "setup-complete" ? (
              icon
            ) : isContinuing ? null : (
              <ArrowRight size={16} strokeWidth={2} />
            )}
          </Button>
        </>
      )}
    >
      {onboardingStep === "welcome" ? (
        <PrototypeBootstrapOnboardingWelcomeStep
          title={title}
          description={description ?? ""}
          onContinue={() => {
            void handlePrimaryAction();
          }}
          continueDisabled={continueDisabled}
          isContinuing={isContinuing}
        />
      ) : null}

      {onboardingStep === "source-directory" ? (
        <PrototypeBootstrapOnboardingSourceStep
          value={selectedDirectory}
          onChange={setSelectedDirectory}
        />
      ) : null}

      {onboardingStep === "name" ? (
        <PrototypeBootstrapOnboardingNameStep
          userName={userName}
          onUserNameChange={setUserName}
        />
      ) : null}

      {onboardingStep === "agent-context" ? (
        <PrototypeBootstrapOnboardingAgentContextStep
          agentContext={agentContext}
          onAgentContextChange={setAgentContext}
          agentContextPath={agentContextPath}
          onAgentContextPathChange={setAgentContextPath}
        />
      ) : null}

      {isWaitingForOnboarded ? (
        <PrototypeBootstrapOnboardingWaitingStep />
      ) : null}
    </PrototypeToolDialog>
  );
}
