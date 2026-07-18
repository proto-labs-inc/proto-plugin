"use client";

import { PrototypeSourceDirectoryPicker } from "@prototype/components/shell/prototype-source-directory-picker";
import type { SourceDirectoryPick } from "@prototype/lib/prototypes/resolve-source-directory-pick";

type PrototypeBootstrapOnboardingSourceStepProps = {
  value: SourceDirectoryPick | null;
  onChange: (value: SourceDirectoryPick | null) => void;
};

export function PrototypeBootstrapOnboardingSourceStep({
  value,
  onChange,
}: PrototypeBootstrapOnboardingSourceStepProps) {
  return (
    <PrototypeSourceDirectoryPicker value={value} onChange={onChange} />
  );
}
