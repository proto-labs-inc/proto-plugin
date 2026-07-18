"use client";

import { PrototypeBriefTextarea } from "@prototype/components/prototypes/prototype-brief-field";

type PrototypeBootstrapOnboardingAgentContextStepProps = {
  agentContext: string;
  onAgentContextChange: (value: string) => void;
};

export function PrototypeBootstrapOnboardingAgentContextStep({
  agentContext,
  onAgentContextChange,
}: PrototypeBootstrapOnboardingAgentContextStepProps) {
  return (
    <PrototypeBriefTextarea
      value={agentContext}
      onChange={(event) => onAgentContextChange(event.target.value)}
      placeholder="Paste AGENTS.md, Cursor rules, skills notes…"
      aria-label="Agent context"
      minHeightClass="min-h-[min(50vh,18rem)]"
    />
  );
}
