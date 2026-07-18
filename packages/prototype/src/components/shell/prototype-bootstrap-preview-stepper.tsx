"use client";

import {
  BOOTSTRAP_PREVIEW_STEP_LABELS,
  BOOTSTRAP_PREVIEW_STEPS,
  type BootstrapPreviewStep,
} from "@prototype/lib/prototypes/use-bootstrap-preview";
import { cn } from "@prototype/lib/utils";

type PrototypeBootstrapPreviewStepperProps = {
  activeStep: BootstrapPreviewStep;
  onStepChange: (step: BootstrapPreviewStep) => void;
  className?: string;
};

export function PrototypeBootstrapPreviewStepper({
  activeStep,
  onStepChange,
  className,
}: PrototypeBootstrapPreviewStepperProps) {
  const activeIndex = BOOTSTRAP_PREVIEW_STEPS.indexOf(activeStep);

  return (
    <div className={cn("flex flex-col gap-2 px-3 py-2", className)}>
      <div
        className="flex items-center justify-center gap-2"
        role="tablist"
        aria-label="Bootstrap onboarding preview steps"
      >
        {BOOTSTRAP_PREVIEW_STEPS.map((step, index) => {
          const isActive = step === activeStep;
          const isCompleted = activeIndex > index;

          return (
            <button
              key={step}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? "step" : undefined}
              aria-label={BOOTSTRAP_PREVIEW_STEP_LABELS[step]}
              title={BOOTSTRAP_PREVIEW_STEP_LABELS[step]}
              onClick={(event) => {
                event.stopPropagation();
                onStepChange(step);
              }}
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              className={cn(
                "size-2.5 shrink-0 rounded-full border transition-colors",
                isActive &&
                  "scale-110 border-[var(--tool-chrome-blue)] bg-[var(--tool-chrome-blue)]",
                !isActive &&
                  isCompleted &&
                  "border-[var(--tool-chrome-text-muted)] bg-[var(--tool-chrome-text-muted)]",
                !isActive &&
                  !isCompleted &&
                  "border-[var(--tool-chrome-border)] bg-transparent hover:border-[var(--tool-chrome-text-muted)]",
              )}
            />
          );
        })}
      </div>
      <p className="text-center text-xs font-medium text-[var(--tool-chrome-text-muted)]">
        {BOOTSTRAP_PREVIEW_STEP_LABELS[activeStep]}
      </p>
    </div>
  );
}
