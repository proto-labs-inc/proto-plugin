import { looksLikeAbsolutePath } from "@prototype/lib/prototypes/resolve-file-path";
import {
  resolveSourceDirectoryAbsolutePath,
  type SourceDirectoryPick,
} from "@prototype/lib/prototypes/resolve-source-directory-pick";

export type OnboardingSourceForSetup = {
  absolutePath?: string;
  folderName?: string;
};

/** Resolve link-source inputs from onboarding — never from linked SOURCE_PATH display name. */
export function resolveOnboardingSourceForSetup({
  selectedDirectory,
  persistedSourceName,
}: {
  selectedDirectory: SourceDirectoryPick | null;
  persistedSourceName?: string;
}): OnboardingSourceForSetup {
  const absolutePath = resolveSourceDirectoryAbsolutePath(selectedDirectory);
  if (absolutePath) {
    return { absolutePath };
  }

  const folderName =
    selectedDirectory?.name.trim() ||
    persistedSourceName?.trim() ||
    undefined;

  if (!folderName || looksLikeAbsolutePath(folderName)) {
    return {};
  }

  return { folderName };
}
