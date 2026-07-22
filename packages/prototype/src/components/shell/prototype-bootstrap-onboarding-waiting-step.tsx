"use client";

import { cn } from "@prototype/lib/utils";
import { Loader2 } from "lucide-react";

const WAITING_PANEL_CLASS =
  "rounded-xl border border-dashed border-[var(--tool-chrome-border)] bg-[var(--tool-chrome-surface)] px-5 py-5 text-[var(--tool-chrome-text-heading)]";

const SETUP_CHECKPOINTS = [
  "Link source directory",
  "Set workspace profile",
  "Sync design system from source",
] as const;

type PrototypeBootstrapOnboardingWaitingStepProps = {
  className?: string;
};

export function PrototypeBootstrapOnboardingWaitingStep({
  className,
}: PrototypeBootstrapOnboardingWaitingStepProps) {
  return (
    <div className={cn(WAITING_PANEL_CLASS, className)}>
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--tool-chrome-border)] bg-[var(--tool-chrome-surface-muted)]">
          <Loader2
            className="size-4 animate-spin text-[var(--tool-chrome-text-heading)]"
            aria-hidden
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Running setup in your agent</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--tool-chrome-text-muted)]">
            Paste the copied prompt into your agent and let it work through each
            checkpoint. This screen updates automatically when your workspace is
            linked and your profile is saved.
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2 border-t border-[var(--tool-chrome-border)] pt-4">
        {SETUP_CHECKPOINTS.map((label) => (
          <li
            key={label}
            className="flex items-center gap-2 text-sm text-[var(--tool-chrome-text-muted)]"
          >
            <span
              className="size-1.5 shrink-0 rounded-full bg-[var(--tool-chrome-border)]"
              aria-hidden
            />
            {label}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm leading-relaxed text-[var(--tool-chrome-text-muted)]">
        If something fails, copy the setup prompt again from the button below
        and paste it into a fresh agent session.
      </p>
    </div>
  );
}
