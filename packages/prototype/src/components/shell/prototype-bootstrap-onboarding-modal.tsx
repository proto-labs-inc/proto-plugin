"use client";

import { PrototypeToolDialog } from "@prototype/components/platform-ui/prototype-tool-dialog";
import { PrototypeBootstrapOnboardingAgentContextStep } from "@prototype/components/shell/prototype-bootstrap-onboarding-agent-context-step";
import { PrototypeBootstrapOnboardingComponentsStep } from "@prototype/components/shell/prototype-bootstrap-onboarding-components-step";
import { PrototypeBootstrapOnboardingNameStep } from "@prototype/components/shell/prototype-bootstrap-onboarding-name-step";
import { PrototypeBootstrapOnboardingSourceStep } from "@prototype/components/shell/prototype-bootstrap-onboarding-source-step";
import { PrototypeBootstrapOnboardingWelcomeStep } from "@prototype/components/shell/prototype-bootstrap-onboarding-welcome-step";
import { Button } from "@prototype/components/ui/button";
import { buildAgentContextCopyText } from "@prototype/lib/prototypes/agent-context-prompt";
import { buildLinkSourceCopyText } from "@prototype/lib/prototypes/link-source-prompt";
import { buildPopulateComponentLibraryCopyText } from "@prototype/lib/prototypes/populate-component-library-prompt";
import { buildWorkspaceProfileCopyText } from "@prototype/lib/prototypes/profile-prompt";
import type { SourceDirectoryPick } from "@prototype/lib/prototypes/resolve-source-directory-pick";
import { usePersistedLocalString } from "@prototype/lib/prototypes/use-persisted-local-state";
import { useTrackEvent } from "@prototype/lib/prototypes/telemetry/prototype-telemetry-context";
import {
  BOOTSTRAP_PREVIEW_STEPS,
  BOOTSTRAP_PREVIEW_STEP_LABELS,
  type BootstrapPreviewStep,
  useBootstrapPreview,
} from "@prototype/lib/prototypes/use-bootstrap-preview";
import { useWorkspaceProfile } from "@prototype/lib/prototypes/use-workspace-profile";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { cn } from "@prototype/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const PROFILE_STORAGE_KEYS = {
  sourceName: "prototype-profile:source-name",
  sourceDescription: "prototype-profile:source-description",
  agentContext: "prototype-profile:agent-context",
} as const;

const ONBOARDING_STEP_CONTENT: Record<
  Exclude<BootstrapPreviewStep, "normal">,
  { title: string; description: string }
> = {
  welcome: {
    title: "Welcome to Proto!",
    description: "Let's set up your workspace",
  },
  "source-directory": {
    title: "Connect your source directory",
    description:
      "Proto reads your product codebase to build prototypes and sync components.",
  },
  name: {
    title: "What should we call you?",
    description: "Your name appears on comments you make.",
  },
  "agent-context": {
    title: "Add your agent context",
    description:
      "Paste markdown from AGENTS.md, Cursor rules, or skills. Proto saves it in your repo for agents to read.",
  },
  components: {
    title: "Populate your component library",
    description:
      "Copy this prompt into your agent to sync base styles and UI primitives from source.",
  },
};

type PrototypeBootstrapOnboardingModalProps = {
  sourcePath?: string;
  currentSourcePath?: string;
  syncConfigPath?: string;
  componentLibraryPagePath?: string;
};

export function PrototypeBootstrapOnboardingModal({
  sourcePath,
  currentSourcePath,
  syncConfigPath,
  componentLibraryPagePath,
}: PrototypeBootstrapOnboardingModalProps) {
  const {
    bootstrapStep,
    advanceBootstrapStep,
    retreatBootstrapStep,
    closeBootstrapOnboarding,
    isOnboardingBackdropActive,
  } = useBootstrapPreview();

  const [selectedDirectory, setSelectedDirectory] =
    useState<SourceDirectoryPick | null>(null);
  const workspaceProfile = useWorkspaceProfile();
  const [userName, setUserName] = useState(workspaceProfile.userName);
  const [isContinuing, setIsContinuing] = useState(false);
  const { copy, icon, isCopied } = useCopyToClipboard();
  const track = useTrackEvent();

  const { value: sourceName, updateValue: setSourceName } =
    usePersistedLocalString(PROFILE_STORAGE_KEYS.sourceName, "");
  const { value: sourceDescription, updateValue: setSourceDescription } =
    usePersistedLocalString(PROFILE_STORAGE_KEYS.sourceDescription, "");
  const { value: agentContext, updateValue: setAgentContext } =
    usePersistedLocalString(PROFILE_STORAGE_KEYS.agentContext, "");

  useEffect(() => {
    setUserName(workspaceProfile.userName);
  }, [workspaceProfile.userName]);

  const onboardingStep =
    bootstrapStep === "normal" ? null : bootstrapStep;

  useEffect(() => {
    if (onboardingStep) {
      track("modal.opened", { modal: "onboarding", step: onboardingStep });
    }
  }, [onboardingStep, track]);

  const stepIndex = onboardingStep
    ? BOOTSTRAP_PREVIEW_STEPS.indexOf(onboardingStep)
    : -1;
  const canGoBack = stepIndex > 0;

  const handleContinue = useCallback(async () => {
    if (!onboardingStep || isContinuing) return;

    setIsContinuing(true);

    try {
      if (onboardingStep === "source-directory") {
        if (!selectedDirectory?.name.trim()) return;

        const nextSourceName = selectedDirectory.name.trim();
        const nextSourceDescription =
          selectedDirectory.path?.trim() ||
          "Product codebase directory selected from this machine.";

        setSourceName(nextSourceName);
        setSourceDescription(nextSourceDescription);

        await copy(
          buildLinkSourceCopyText({
            sourcePath: selectedDirectory.path?.trim() || nextSourceName,
            description: selectedDirectory.path
              ? undefined
              : nextSourceDescription,
            currentSourcePath,
          }),
        );
      } else if (onboardingStep === "name") {
        if (!userName.trim()) return;

        await copy(
          buildWorkspaceProfileCopyText({
            userName,
          }),
        );
      } else if (onboardingStep === "agent-context") {
        const trimmedAgentContext = agentContext.trim();
        if (trimmedAgentContext) {
          await copy(
            buildAgentContextCopyText({
              content: trimmedAgentContext,
            }),
          );
          track("modal.prompt_copied", { modal: "onboarding-agent-context" });
        }
      }

      track("onboarding.step_advanced", { step: onboardingStep });
      advanceBootstrapStep();
    } catch {
      toast.error("Copy error", {
        description: "Failed to copy the setup prompt",
      });
    } finally {
      setIsContinuing(false);
    }
  }, [
    advanceBootstrapStep,
    agentContext,
    copy,
    currentSourcePath,
    isContinuing,
    onboardingStep,
    selectedDirectory,
    setSourceDescription,
    setSourceName,
    track,
    userName,
  ]);

  const handleBack = useCallback(() => {
    retreatBootstrapStep();
  }, [retreatBootstrapStep]);

  const continueDisabled =
    isContinuing ||
    (onboardingStep === "source-directory" &&
      !selectedDirectory?.name.trim()) ||
    (onboardingStep === "name" && !userName.trim());

  const continueLabel =
    onboardingStep === "components"
      ? isCopied
        ? "Copied prompt"
        : "Copy setup prompt"
      : onboardingStep === "agent-context"
        ? agentContext.trim()
          ? isCopied
            ? "Copied prompt"
            : "Copy setup prompt"
          : "Skip"
        : "Continue";

  const handlePrimaryAction = useCallback(async () => {
    if (onboardingStep === "components") {
      if (isContinuing) return;

      setIsContinuing(true);

      try {
        const origin =
          typeof window !== "undefined" ? window.location.origin : undefined;
        const resolvedSourcePath =
          sourcePath?.trim() ||
          selectedDirectory?.path?.trim() ||
          sourceName.trim() ||
          undefined;

        await copy(
          buildPopulateComponentLibraryCopyText({
            sourcePath: resolvedSourcePath,
            syncConfigPath,
            componentLibraryPagePath,
            origin,
            workspaceProfile,
          }),
        );
        track("modal.prompt_copied", { modal: "onboarding-components" });
        track("onboarding.step_advanced", { step: "components", completed: true });
        closeBootstrapOnboarding();
      } catch {
        toast.error("Copy error", {
          description: "Failed to copy the setup prompt",
        });
      } finally {
        setIsContinuing(false);
      }
      return;
    }

    void handleContinue();
  }, [
    closeBootstrapOnboarding,
    componentLibraryPagePath,
    copy,
    handleContinue,
    isContinuing,
    onboardingStep,
    selectedDirectory,
    sourceName,
    sourcePath,
    syncConfigPath,
    track,
    workspaceProfile,
  ]);

  if (!isOnboardingBackdropActive || !onboardingStep) {
    return null;
  }

  const { title, description } = ONBOARDING_STEP_CONTENT[onboardingStep];
  const resolvedSourcePath =
    sourcePath?.trim() ||
    selectedDirectory?.path?.trim() ||
    sourceName.trim() ||
    undefined;

  const isWelcomeStep = onboardingStep === "welcome";

  return (
    <PrototypeToolDialog
      open
      onOpenChange={() => {}}
      dismissible={false}
      overlayClassName="tool-dialog-overlay-opaque"
      title={title}
      description={isWelcomeStep ? undefined : description}
      hideHeader={isWelcomeStep}
      bodyClassName={cn(
        "gap-4",
        isWelcomeStep && "flex flex-1 items-center justify-center px-0 py-0",
      )}
      footerClassName={canGoBack ? "justify-between" : "justify-end"}
      headerActions={
        <span className="sr-only">
          Step {stepIndex + 1} of {BOOTSTRAP_PREVIEW_STEPS.length}:{" "}
          {BOOTSTRAP_PREVIEW_STEP_LABELS[onboardingStep]}
        </span>
      }
      footer={
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
            className="h-8 gap-1.5 px-3"
            disabled={continueDisabled}
            onClick={() => {
              void handlePrimaryAction();
            }}
            aria-label={
              onboardingStep === "components" ||
              (onboardingStep === "agent-context" && agentContext.trim())
                ? "Copy setup prompt"
                : onboardingStep === "agent-context"
                  ? "Skip agent context"
                  : undefined
            }
          >
            {isContinuing
              ? onboardingStep === "components" ||
                (onboardingStep === "agent-context" && agentContext.trim())
                ? "Copying…"
                : "Continuing…"
              : continueLabel}
            {onboardingStep === "components" ||
            (onboardingStep === "agent-context" && agentContext.trim()) ? (
              icon
            ) : isContinuing ? null : onboardingStep === "agent-context" ? null : (
              <ArrowRight size={16} strokeWidth={2} />
            )}
          </Button>
        </>
      }
    >
      {onboardingStep === "welcome" ? (
        <PrototypeBootstrapOnboardingWelcomeStep
          title={title}
          description={description}
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
        />
      ) : null}

      {onboardingStep === "components" ? (
        <PrototypeBootstrapOnboardingComponentsStep
          sourcePath={resolvedSourcePath}
          syncConfigPath={syncConfigPath}
          componentLibraryPagePath={componentLibraryPagePath}
        />
      ) : null}
    </PrototypeToolDialog>
  );
}
