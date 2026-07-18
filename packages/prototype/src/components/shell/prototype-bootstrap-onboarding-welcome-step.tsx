"use client";

import { ProtoLogoMark } from "@prototype/components/brand/proto-logo-mark";

type PrototypeBootstrapOnboardingWelcomeStepProps = {
  title: string;
  description: string;
};

export function PrototypeBootstrapOnboardingWelcomeStep({
  title,
  description,
}: PrototypeBootstrapOnboardingWelcomeStepProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center px-6 py-10 text-center">
      <ProtoLogoMark className="mb-8 size-16" size={64} />
      <h2 className="text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-3 max-w-sm text-base leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
