"use client";

import { PrototypeBootstrapPreviewStepper } from "@prototype/components/shell/prototype-bootstrap-preview-stepper";
import type { BootstrapPreviewStep } from "@prototype/lib/prototypes/use-bootstrap-preview";

type PrototypeBootstrapPreviewFloatingStepperProps = {
  activeStep: BootstrapPreviewStep;
  onStepChange: (step: BootstrapPreviewStep) => void;
};

export function PrototypeBootstrapPreviewFloatingStepper({
  activeStep,
  onStepChange,
}: PrototypeBootstrapPreviewFloatingStepperProps) {
  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-[60]"
      data-prototype-bootstrap-floating-stepper=""
    >
      <div className="pointer-events-auto rounded-xl border border-[var(--tool-chrome-border)] bg-[var(--tool-chrome-bg)] px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.24),0_0_0_1px_var(--tool-chrome-border)]">
        <PrototypeBootstrapPreviewStepper
          activeStep={activeStep}
          onStepChange={onStepChange}
          className="px-0 py-0"
        />
      </div>
    </div>
  );
}
