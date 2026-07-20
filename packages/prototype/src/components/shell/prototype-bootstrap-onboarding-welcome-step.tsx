"use client";

import { ProtoLogoMark } from "@prototype/components/brand/proto-logo-mark";
import { Button } from "@prototype/components/ui/button";
import { ArrowRight } from "lucide-react";

type PrototypeBootstrapOnboardingWelcomeStepProps = {
  title: string;
  description: string;
  onContinue?: () => void;
};

export function PrototypeBootstrapOnboardingWelcomeStep({
  title,
  description,
  onContinue,
}: PrototypeBootstrapOnboardingWelcomeStepProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center px-6 pb-10 pt-24 text-center">
      <ProtoLogoMark className="mb-8 size-12" size={48} />
      <h2 className="text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-3 max-w-sm text-base leading-relaxed text-muted-foreground">
        {description}
      </p>
      {onContinue && (
        <Button
          type="button"
          variant="chrome"
          size="sm"
          className="mt-8 h-8 gap-2 px-3"
          onClick={onContinue}
          aria-label="Continue"
        >
          Continue
          <ArrowRight size={16} strokeWidth={2} />
        </Button>
      )}
    </div>
  );
}
