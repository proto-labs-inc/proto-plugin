"use client";

import { cn } from "@prototype/lib/utils";

const WAITING_PANEL_CLASS =
  "flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--tool-chrome-border)] bg-[var(--tool-chrome-surface)] px-5 py-5 text-center text-[var(--tool-chrome-text-heading)]";

type PrototypeBootstrapOnboardingWaitingStepProps = {
  className?: string;
};

export function PrototypeBootstrapOnboardingWaitingStep({
  className,
}: PrototypeBootstrapOnboardingWaitingStepProps) {
  return (
    <div className={cn(WAITING_PANEL_CLASS, className)}>
      <p className="text-2xl font-semibold tracking-tight">
        Run this prompt on a cheap, fast model
      </p>
    </div>
  );
}
