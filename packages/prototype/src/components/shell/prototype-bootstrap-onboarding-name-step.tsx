"use client";

import { PROTOTYPE_BRIEF_FIELD_BORDER_CLASS } from "@prototype/components/prototypes/prototype-brief-field";
import { Input } from "@prototype/components/ui/input";

type PrototypeBootstrapOnboardingNameStepProps = {
  userName: string;
  onUserNameChange: (value: string) => void;
};

export function PrototypeBootstrapOnboardingNameStep({
  userName,
  onUserNameChange,
}: PrototypeBootstrapOnboardingNameStepProps) {
  return (
    <Input
      value={userName}
      onChange={(event) => onUserNameChange(event.target.value)}
      placeholder="Hiro Hamada"
      aria-label="User name"
      className={PROTOTYPE_BRIEF_FIELD_BORDER_CLASS}
    />
  );
}
