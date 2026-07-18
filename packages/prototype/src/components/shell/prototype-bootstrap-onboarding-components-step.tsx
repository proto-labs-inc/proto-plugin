"use client";

import { Button } from "@prototype/components/ui/button";
import { buildPopulateComponentLibraryCopyText } from "@prototype/lib/prototypes/populate-component-library-prompt";
import {
  fetchPrototypeBootstrapStatus,
  type BootstrapRequirementId,
  type PrototypeBootstrapStatus,
} from "@prototype/lib/prototypes/prototype-bootstrap-status";
import { useWorkspaceProfile } from "@prototype/lib/prototypes/use-workspace-profile";
import useCopyToClipboard from "@prototype/lib/use-copy-to-clipboard";
import { cn } from "@prototype/lib/utils";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

type PrototypeBootstrapOnboardingComponentsStepProps = {
  sourcePath?: string;
  syncConfigPath?: string;
  componentLibraryPagePath?: string;
};

const COMPONENT_LIBRARY_REQUIREMENT_IDS = [
  "designTokens",
  "uiPrimitives",
  "sharedBlocks",
] as const satisfies readonly BootstrapRequirementId[];

const COMPONENT_LIBRARY_BULLETS: Record<
  (typeof COMPONENT_LIBRARY_REQUIREMENT_IDS)[number],
  string
> = {
  designTokens: "Design tokens and global styles",
  uiPrimitives: "Base `ui/` primitives from source",
  sharedBlocks: "Shared building blocks and utilities",
};

function readComponentLibraryRequirements(
  status: PrototypeBootstrapStatus | null,
) {
  if (!status) return null;

  return COMPONENT_LIBRARY_REQUIREMENT_IDS.map((id) => {
    const requirement = status.requirements.find((entry) => entry.id === id);
    return {
      id,
      label: COMPONENT_LIBRARY_BULLETS[id],
      satisfied: requirement?.satisfied ?? false,
    };
  });
}

export function PrototypeBootstrapOnboardingComponentsStep({
  sourcePath,
  syncConfigPath,
  componentLibraryPagePath,
}: PrototypeBootstrapOnboardingComponentsStepProps) {
  const { copy, icon, isCopied } = useCopyToClipboard();
  const workspaceProfile = useWorkspaceProfile();
  const [bootstrapStatus, setBootstrapStatus] =
    useState<PrototypeBootstrapStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchPrototypeBootstrapStatus()
      .then((status) => {
        if (!cancelled) setBootstrapStatus(status);
      })
      .catch(() => {
        if (!cancelled) setBootstrapStatus(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const bullets = readComponentLibraryRequirements(bootstrapStatus);

  const handleCopy = () => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : undefined;

    copy(
      buildPopulateComponentLibraryCopyText({
        sourcePath,
        syncConfigPath,
        componentLibraryPagePath,
        origin,
        workspaceProfile,
      }),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <ul className="list-none space-y-1.5 pl-0 text-sm leading-relaxed text-muted-foreground">
        {(bullets ??
          COMPONENT_LIBRARY_REQUIREMENT_IDS.map((id) => ({
            id,
            label: COMPONENT_LIBRARY_BULLETS[id],
            satisfied: false,
          }))).map(({ id, label, satisfied }) => (
          <li key={id} className="flex items-start gap-2">
            <span
              className={cn(
                "mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full border",
                satisfied
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                  : "border-[var(--tool-chrome-border)] text-transparent",
              )}
              aria-hidden
            >
              <Check className="size-3" strokeWidth={2.5} />
            </span>
            <span
              className={cn(satisfied && "text-muted-foreground/70 line-through")}
            >
              {label}
            </span>
          </li>
        ))}
      </ul>
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          onClick={handleCopy}
          aria-label="Copy component library population prompt"
        >
          {isCopied ? "Copied prompt" : "Copy prompt"}
          {icon}
        </Button>
      </div>
    </div>
  );
}
