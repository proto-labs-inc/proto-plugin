"use client";

import { PrototypeToolDialog } from "@prototype/components/platform-ui/prototype-tool-dialog";
import { PrototypeBootstrapOnboardingAgentContextStep } from "@prototype/components/shell/prototype-bootstrap-onboarding-agent-context-step";
import { PrototypeBootstrapOnboardingNameStep } from "@prototype/components/shell/prototype-bootstrap-onboarding-name-step";
import { PrototypeBootstrapOnboardingSetupCompleteStep } from "@prototype/components/shell/prototype-bootstrap-onboarding-setup-complete-step";
import { PrototypeBootstrapOnboardingSourceStep } from "@prototype/components/shell/prototype-bootstrap-onboarding-source-step";
import { PrototypeBootstrapOnboardingWelcomeStep } from "@prototype/components/shell/prototype-bootstrap-onboarding-welcome-step";
import { Button } from "@prototype/components/ui/button";
import { buildAgentContextCopyText, buildAgentContextFromPathCopyText } from "@prototype/lib/prototypes/agent-context-prompt";
import { buildBootstrapSetupCopyText } from "@prototype/lib/prototypes/bootstrap-setup-prompt";
import { buildLinkSourceCopyText } from "@prototype/lib/prototypes/link-source-prompt";
import { buildWorkspaceProfileCopyText } from "@prototype/lib/prototypes/profile-prompt";
import { markAwaitingLibrarySync } from "@prototype/lib/prototypes/workspace-setup-awaiting-library";
import { resolveOnboardingSourceForSetup } from "@prototype/lib/prototypes/resolve-onboarding-source-for-setup";
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const PROFILE_STORAGE_KEYS = {
  sourceName: "prototype-profile:source-name",
  sourceDescription: "prototype-profile:source-description",
  agentContext: "prototype-profile:agent-context",
  agentContextPath: "prototype-profile:agent-context-path",
} as const;

const ONBOARDING_STEP_CONTENT: Record<
  Exclude<BootstrapPreviewStep, "normal" | "component-library">,
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
    title: "Run setup in your agent",
  },
};

type PrototypeBootstrapOnboardingModalProps = {
  /** Full linked SOURCE_PATH from the host — never the sidebar display name. */
  currentSourcePath?: string;
  syncConfigPath?: string;
  componentLibraryPagePath?: string;
};

export function PrototypeBootstrapOnboardingModal({
  currentSourcePath,
  syncConfigPath,
  componentLibraryPagePath,
}: PrototypeBootstrapOnboardingModalProps) {
  const {
    bootstrapStep,
    advanceBootstrapStep,
    retreatBootstrapStep,
    minimizeOnboarding,
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
    bootstrapStep === "normal" || bootstrapStep === "component-library"
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
  const canGoBack = stepIndex > 0;

  const onboardingSource = useMemo(
    () =>
      resolveOnboardingSourceForSetup({
        selectedDirectory,
        persistedSourceName: sourceName,
      }),
    [selectedDirectory, sourceName],
  );

  const handleContinue = useCallback(async () => {
    if (!onboardingStep || isContinuing) return;

    setIsContinuing(true);

    try {
      if (onboardingStep === "source-directory") {
        if (!selectedDirectory?.name.trim()) {
          track("onboarding.step_advanced", { step: onboardingStep, skipped: true });
          advanceOnboardingStep();
          return;
        }

        const nextSourceName = selectedDirectory.name.trim();
        setSourceName(nextSourceName);
        setSourceDescription(
          selectedDirectory.path?.trim()
            ? selectedDirectory.path.trim()
            : `Source folder "${nextSourceName}" selected from this machine.`,
        );

        const linkSource = resolveOnboardingSourceForSetup({
          selectedDirectory,
          persistedSourceName: nextSourceName,
        });

        await copy(
          buildLinkSourceCopyText({
            sourcePath: linkSource.absolutePath,
            selectedFolderName: linkSource.folderName,
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
        const trimmedAgentContextPath = agentContextPath.trim();
        const trimmedAgentContext = agentContext.trim();
        if (trimmedAgentContextPath) {
          await copy(
            buildAgentContextFromPathCopyText({
              contextFilePath: trimmedAgentContextPath,
            }),
          );
          track("modal.prompt_copied", { modal: "onboarding-agent-context" });
        } else if (trimmedAgentContext) {
          await copy(
            buildAgentContextCopyText({
              content: trimmedAgentContext,
            }),
          );
          track("modal.prompt_copied", { modal: "onboarding-agent-context" });
        } else {
          track("onboarding.step_advanced", {
            step: onboardingStep,
            skipped: true,
          });
        }
      }

      track("onboarding.step_advanced", { step: onboardingStep });
      advanceOnboardingStep();
    } catch {
      toast.error("Copy error", {
        description: "Failed to copy the setup prompt",
      });
    } finally {
      setIsContinuing(false);
    }
  }, [
    advanceOnboardingStep,
    agentContext,
    agentContextPath,
    componentLibraryPagePath,
    copy,
    currentSourcePath,
    isContinuing,
    onboardingStep,
    selectedDirectory,
    setSourceDescription,
    setSourceName,
    syncConfigPath,
    track,
    userName,
  ]);

  const handleBack = useCallback(() => {
    retreatOnboardingStep();
  }, [retreatOnboardingStep]);

  const hasSourceSelection = Boolean(selectedDirectory?.name.trim());
  const hasAgentContext = Boolean(agentContext.trim());

  const continueDisabled =
    isContinuing || (onboardingStep === "name" && !userName.trim());

  const continueLabel =
    onboardingStep === "setup-complete"
      ? isCopied
        ? "Copied prompt"
        : "Copy setup prompt"
      : onboardingStep === "agent-context"
        ? hasAgentContext
          ? "Continue"
          : "Skip"
        : onboardingStep === "source-directory"
          ? hasSourceSelection
            ? "Continue"
            : "Skip"
          : "Continue";

  const handlePrimaryAction = useCallback(async () => {
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
            agentContextPath: agentContextPath.trim() || undefined,
            syncConfigPath,
            componentLibraryPagePath,
            origin,
            workspaceProfile,
          }),
        );
        track("modal.prompt_copied", { modal: "onboarding-setup-complete" });
        markAwaitingLibrarySync();
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

    void handleContinue();
  }, [
    advanceOnboardingStep,
    agentContextPath,
    componentLibraryPagePath,
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

  if (!isOnboardingBackdropActive || !onboardingStep) {
    return null;
  }

  const { title, description } = ONBOARDING_STEP_CONTENT[onboardingStep];

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
      footerClassName="justify-between"
      headerActions={
        <span className="sr-only">
          Step {stepIndex + 1} of {BOOTSTRAP_PREVIEW_STEPS.length}:{" "}
          {BOOTSTRAP_PREVIEW_STEP_LABELS[onboardingStep]}
        </span>
      }
      footer={
        <>
          <div className="flex items-center gap-1">
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
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-[var(--tool-chrome-text-muted)]"
              onClick={minimizeOnboarding}
            >
              Browse examples
            </Button>
          </div>
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
              onboardingStep === "setup-complete"
                ? "Copy setup prompt"
                : onboardingStep === "agent-context"
                  ? hasAgentContext
                    ? "Continue"
                    : "Skip agent context"
                  : onboardingStep === "source-directory"
                    ? hasSourceSelection
                      ? "Continue"
                      : "Skip source directory"
                    : undefined
            }
          >
            {isContinuing
              ? onboardingStep === "setup-complete"
                ? "Copying…"
                : "Continuing…"
              : continueLabel}
            {onboardingStep === "setup-complete" ? (
              icon
            ) : isContinuing ? null : (
              <ArrowRight size={16} strokeWidth={2} />
            )}
          </Button>
        </>
      }
    >
      {onboardingStep === "welcome" ? (
        <PrototypeBootstrapOnboardingWelcomeStep
          title={title}
          description={description ?? ""}
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

      {onboardingStep === "setup-complete" ? (
        <PrototypeBootstrapOnboardingSetupCompleteStep />
      ) : null}
    </PrototypeToolDialog>
  );
}
