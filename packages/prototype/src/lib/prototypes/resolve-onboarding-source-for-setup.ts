import { looksLikeAbsolutePath } from "@prototype/lib/prototypes/resolve-file-path";
import {
  resolveSourceDirectoryAbsolutePath,
  type SourceDirectoryPick,
} from "@prototype/lib/prototypes/resolve-source-directory-pick";

export type OnboardingSourceForSetup = {
  absolutePath?: string;
  folderName?: string;
};

/** Resolve link-source inputs from the in-session directory pick only — not localStorage. */
export function resolveOnboardingSourceForSetup({
  selectedDirectory,
}: {
  selectedDirectory: SourceDirectoryPick | null;
}): OnboardingSourceForSetup {
  const absolutePath = resolveSourceDirectoryAbsolutePath(selectedDirectory);
  if (absolutePath) {
    return { absolutePath };
  }

  const folderName = selectedDirectory?.name.trim();

  if (!folderName || looksLikeAbsolutePath(folderName)) {
    return {};
  }

  return { folderName };
}
