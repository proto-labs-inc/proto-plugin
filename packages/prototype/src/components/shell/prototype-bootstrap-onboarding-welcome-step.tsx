"use client";

import { ProtoLogoMark } from "@prototype/components/brand/proto-logo-mark";
import { Button } from "@prototype/components/ui/button";
import { ArrowRight } from "lucide-react";

type PrototypeBootstrapOnboardingWelcomeStepProps = {
  title: string;
  description: string;
  onContinue?: () => void;
  continueDisabled?: boolean;
  isContinuing?: boolean;
};

export function PrototypeBootstrapOnboardingWelcomeStep({
  title,
  description,
  onContinue,
  continueDisabled = false,
  isContinuing = false,
}: PrototypeBootstrapOnboardingWelcomeStepProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 px-6 py-8 text-center">
      <ProtoLogoMark className="size-9" size={36} />
      <h2 className="text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
        {description}
      </p>
      {onContinue && (
        <Button
          type="button"
          variant="chrome"
          size="sm"
          className="mt-1 h-8 gap-2 px-3"
          disabled={continueDisabled}
          onClick={onContinue}
          aria-label="Get Started"
        >
          {isContinuing ? "Continuing…" : "Get Started"}
          {isContinuing ? null : <ArrowRight size={16} strokeWidth={2} />}
        </Button>
      )}
    </div>
  );
}
